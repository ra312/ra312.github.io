# Spec: Tropical Poincaré–Hopf Certificate for Post-Training Quantisation

**Goal:** Empirically demonstrate that the Euler characteristic χ of a ReLU network's
decision boundary, computed via tropical geometry, can serve as a formal certificate
that PTQ (INT8) has preserved the network's topological expressivity.

**Novel contribution:** No existing PTQ verification tool (α,β-CROWN, Marabou, Venus)
checks topological invariants. This experiment is the first empirical test of whether
the tropical Poincaré–Hopf invariant is a useful certificate in practice.

---

## Theoretical chain

```
ReLU network f: R² → R
    ↓  (Zhang et al. 2018, Prop 6.1)
f = p/q  where p,q are tropical polynomials
    ↓
decision boundary B ⊆ T(s⁻¹(c)·q ⊕ p)   (tropical hypersurface)
    ↓
B is a 1D piecewise-linear graph in R²
    ↓
canonical polyhedral complex C(f) encodes all linear regions
    ↓
Betti numbers β₀, β₁ of B  →  χ(B) = β₀ - β₁
    ↓
if χ(f_float) = χ(f_int8):  topology of boundary preserved under PTQ
```

---

## Repository layout

```
tropical-ptq-certificate/
├── README.md
├── requirements.txt
├── environment.yml           # conda env with SageMath + PyTorch
├── src/
│   ├── train.py              # Step 1: train baseline network
│   ├── quantize.py           # Step 2: INT8 PTQ + weight extraction
│   ├── enumerate_regions.py  # Step 3: canonical polyhedral complex
│   ├── compute_betti.sage    # Step 4: Betti numbers via SageMath
│   ├── certificate.py        # Step 5: compare χ before/after
│   └── plot.py               # Step 6: visualise results
├── experiments/
│   └── sweep.sh              # run all seeds end to end
└── results/
    └── .gitkeep
```

---

## Step 0 — Environment

### 0a. Conda environment (do this first — SageMath takes ~20 min to install)

```bash
conda create -n tropical-ptq python=3.10 -y
conda activate tropical-ptq
conda install -c conda-forge sage=10.3 -y      # ~2 GB, slow
pip install torch torchvision numpy scipy matplotlib
git clone https://github.com/mmasden/canonicalpoly
cd canonicalpoly && pip install -e . && cd ..
```

### 0b. Verify the install

```python
# smoke_test.py
import torch, numpy as np
from sage.all import SimplicialComplex

# check sage homology works
sc = SimplicialComplex([[0,1],[1,2],[0,2]])
print(sc.homology())   # expect {0: 0, 1: Z}

# check canonicalpoly imports
from canonicalpoly import compute_complex
print("all good")
```

**Expected output:** `{0: 0, 1: Z}  all good`
**If SageMath fails:** common fix is `conda install -c conda-forge pari -y` then retry.

---

## Step 1 — Train baseline network

**File:** `src/train.py`

### Network architecture

```
Input: R²   (2D so we can enumerate all linear regions exactly)
Layer 1: Linear(2 → 12), ReLU
Layer 2: Linear(12 → 12), ReLU
Layer 3: Linear(12 → 1), no activation
```

Total neurons: 24. Maximum possible linear regions: ~1,352 (Montufar et al. 2014 bound).
Actual typical count: 100–400 for random initialisation.

### Dataset

2D three-class spiral (sklearn.datasets.make_classification variant):

```python
from sklearn.datasets import make_moons
X, y = make_moons(n_samples=500, noise=0.1, random_state=seed)
```

Use make_moons because:
- Decision boundary is a single connected curve (β₀ = 1 expected)
- Contains one loop (β₁ ≥ 1 expected for a well-fitted network)
- Easy to verify by eye

### Training

```python
model = nn.Sequential(
    nn.Linear(2, 12), nn.ReLU(),
    nn.Linear(12, 12), nn.ReLU(),
    nn.Linear(12, 1)
)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.BCEWithLogitsLoss()
# train for 500 epochs, target accuracy > 95%
```

### Acceptance criteria

- Test accuracy ≥ 95%
- Visual inspection: decision boundary separates the two moons cleanly
- Save weights to `results/model_seed{N}_float32.pt`

---

## Step 2 — INT8 Post-Training Quantisation

**File:** `src/quantize.py`

### Two quantisation schemes to compare

```python
# Scheme A: symmetric per-tensor INT8 (most common in practice)
def quantize_symmetric_int8(model):
    q_model = copy.deepcopy(model)
    for layer in q_model.modules():
        if isinstance(layer, nn.Linear):
            W = layer.weight.data
            scale = W.abs().max() / 127.0
            layer.weight.data = (W / scale).round().clamp(-127, 127) * scale
    return q_model

# Scheme B: power-of-two (PoT) bit-shift (relevant for ASIC/FPGA)
def quantize_pot(model, bits=8):
    q_model = copy.deepcopy(model)
    for layer in q_model.modules():
        if isinstance(layer, nn.Linear):
            W = layer.weight.data
            log2_scale = torch.log2(W.abs().max()).floor()
            scale = 2 ** (log2_scale - (bits - 1))
            layer.weight.data = (W / scale).round().clamp(-(2**(bits-1)), 2**(bits-1)-1) * scale
    return q_model
```

**Why write our own instead of `torch.quantize_dynamic`:**
`quantize_dynamic` packs weights into a custom format that is hard to unpack back into
float linear layers. The above gives a float32 model with quantized-rounded weights —
exactly what `canonicalpoly` needs.

### Acceptance criteria

- Quantised model accuracy within 2% of float32 baseline
- Weight difference `‖W_float - W_int8‖_∞ ≤ scale/2` (correct rounding)
- Save to `results/model_seed{N}_int8.pt` and `results/model_seed{N}_pot.pt`

---

## Step 3 — Enumerate the canonical polyhedral complex

**File:** `src/enumerate_regions.py`

### What canonicalpoly computes

For a ReLU network f with input dimension n₀ = 2, it enumerates all vertices of the
canonical polyhedral complex C(f). Each vertex is a point x ∈ R² where the maximum
number of ReLU boundaries intersect. The sign sequence at each vertex encodes which
neurons are active/inactive/on-boundary.

### Running it

```python
from canonicalpoly import compute_complex
import numpy as np

def get_complex(model, input_bounds=(-3.0, 3.0)):
    """
    Returns dict with:
      'vertices':      array of shape (V, 2) — vertex coordinates
      'sign_seqs':     array of shape (V, 24) — {-1,0,1} activation sign at each vertex
      'n_regions':     int — number of linear regions
    """
    # canonicalpoly expects weights as list of (W, b) tuples
    layers = []
    for module in model.modules():
        if isinstance(module, nn.Linear):
            layers.append((
                module.weight.detach().numpy(),
                module.bias.detach().numpy()
            ))
    return compute_complex(layers, bounds=input_bounds)
```

### Expected runtime

| Network | Vertices (typical) | Runtime (CPU) |
|---|---|---|
| (2,12,12,1) float32 | 50–400 | 2–15 min |
| (2,12,12,1) INT8 | 50–400 | 2–15 min |

Save output to `results/complex_seed{N}_{precision}.npz`.

### Acceptance criteria

- `n_regions` > 10 (network is non-trivial)
- Vertices are within `input_bounds`
- Float32 and INT8 complexes have a similar vertex count (large discrepancy is a bug signal)

---

## Step 4 — Compute Betti numbers via SageMath

**File:** `src/compute_betti.sage`

### What we compute

From the vertices and sign sequences, we construct the decision boundary as a
1D simplicial complex (graph) in R². Its Betti numbers are:

- **β₀**: number of connected components of the decision boundary
- **β₁**: number of independent loops
- **χ = β₀ - β₁**: the Euler characteristic (our certificate)

### Code

```python
# compute_betti.sage  — run with: sage compute_betti.sage results/complex_seed0_float32.npz
import sys, numpy as np
from sage.all import SimplicialComplex

data = np.load(sys.argv[1], allow_pickle=True)
sign_seqs = data['sign_seqs']   # shape (V, n_neurons)
vertices  = data['vertices']    # shape (V, 2)

# Two vertices are connected by an edge of the decision boundary iff
# their sign sequences differ in exactly one coordinate (one neuron flips sign)
# AND that coordinate goes 0→nonzero or vice versa (i.e., the flip crosses a boundary)
V = len(sign_seqs)
edges = []
for i in range(V):
    for j in range(i+1, V):
        diff = sign_seqs[i] != sign_seqs[j]
        if diff.sum() == 1:
            edges.append((i, j))

# Build simplicial complex from edges
faces = [[i] for i in range(V)] + edges
sc = SimplicialComplex(faces)
H = sc.homology()

beta0 = H[0].rank() + 1          # free part + torsion correction for connected components
beta1 = H[1].rank()
chi   = beta0 - beta1

print(f"β₀={beta0}  β₁={beta1}  χ={chi}")
np.save(sys.argv[1].replace('.npz', '_betti.npy'), [beta0, beta1, chi])
```

### Acceptance criteria

- β₀ ≥ 1 (at least one connected component)
- χ is an integer
- For a simple 2-class boundary: β₀ = 1, β₁ ≈ 1–5 is reasonable

---

## Step 5 — The certificate comparison

**File:** `src/certificate.py`

### The core check

```python
import numpy as np

def load_betti(path):
    return np.load(path)   # [β₀, β₁, χ]

def certificate(seed, precision_a='float32', precision_b='int8'):
    b_a = load_betti(f'results/complex_seed{seed}_{precision_a}_betti.npy')
    b_b = load_betti(f'results/complex_seed{seed}_{precision_b}_betti.npy')

    chi_match = b_a[2] == b_b[2]
    full_match = np.array_equal(b_a, b_b)

    return {
        'seed': seed,
        'beta_float':  b_a.tolist(),
        'beta_int8':   b_b.tolist(),
        'chi_match':   bool(chi_match),
        'full_match':  bool(full_match),
    }
```

### What outcomes mean

| χ match | β₀ match | β₁ match | Interpretation |
|---|---|---|---|
| ✓ | ✓ | ✓ | PTQ preserved full topology — certificate holds |
| ✓ | ✗ | ✗ | χ matches by cancellation — certificate misleading |
| ✗ | — | — | PTQ changed topology — certificate correctly flags failure |
| ✗ | ✗ | ✓ | New connected components appeared — boundary fragmented |

### Sweep over seeds

```bash
# experiments/sweep.sh
for SEED in 0 1 2 3 4 5 6 7 8 9; do
  python src/train.py          --seed $SEED
  python src/quantize.py       --seed $SEED
  python src/enumerate_regions.py --seed $SEED --precision float32
  python src/enumerate_regions.py --seed $SEED --precision int8
  python src/enumerate_regions.py --seed $SEED --precision pot
  sage src/compute_betti.sage  results/complex_seed${SEED}_float32.npz
  sage src/compute_betti.sage  results/complex_seed${SEED}_int8.npz
  sage src/compute_betti.sage  results/complex_seed${SEED}_pot.npz
  python src/certificate.py    --seed $SEED
done
python src/plot.py  # aggregate results
```

Total estimated wall time for 10 seeds: 2–4 hours on a modern CPU.

---

## Step 6 — Measurements and plots

**File:** `src/plot.py`

### Plot A — Decision boundary before/after PTQ (qualitative)

Grid evaluation of `sign(model(x))` across `[-3,3]²` at 500×500 resolution.
Overlay the enumerated vertices from `canonicalpoly`.
Show float32 and INT8 side by side for 3 representative seeds.

### Plot B — Betti numbers scatter (quantitative)

Scatter plot: x-axis = β₁(float32), y-axis = β₁(INT8), one point per seed.
Points on the diagonal = certificate holds.
Points off diagonal = topology changed.
Colour by accuracy drop under PTQ.

### Plot C — Accuracy drop vs χ mismatch

x-axis: |χ(float) - χ(int8)|
y-axis: accuracy(float) - accuracy(int8)
If they correlate: χ mismatch predicts accuracy degradation → certificate is useful.
If they don't: χ is not a reliable predictor → negative result, also publishable.

### Plot D — Same for PoT quantisation

Repeat B and C for PoT weights. Hypothesis: PoT causes more topology change than
symmetric INT8 because weight rounding is coarser for small weights.

---

## Acceptance criteria for the full experiment

| Criterion | Pass threshold |
|---|---|
| Pipeline runs end-to-end for all 10 seeds | 100% |
| Float32 Betti numbers are non-trivial (β₁ ≥ 1) | ≥ 8/10 seeds |
| INT8 accuracy within 2% of float32 | ≥ 8/10 seeds |
| χ match rate for INT8 | empirical — any outcome is a finding |
| Plot C shows Pearson r > 0.5 or < 0.1 | either direction is publishable |

---

## Known failure modes and mitigations

| Failure | Cause | Mitigation |
|---|---|---|
| SageMath homology hangs | Too many vertices | Reduce to (2,8,8,1) network |
| canonicalpoly gives 0 vertices | PyTorch API mismatch | Pin to torch==2.0.0 |
| INT8 weight extraction is wrong | Scale computation error | Check `‖W_q - round(W/s)*s‖ < s/2` |
| β₁ = 0 for all float models | Network not complex enough | Use deeper spiral, increase neurons to 16 |
| Results all show χ match | INT8 rounding too fine to matter | Add 4-bit experiment |

---

## Extensions (post-MVP)

1. **Scale to 3D input:** use random 2D slices through R³ and average χ over slices —
   approximates the invariant for higher-dimensional inputs without NP-hard enumeration.

2. **CNN layers:** tropical geometry of conv layers is less developed; recent TropNNC
   (2025) uses zonotopes — their Euler characteristic is computable via inclusion-exclusion.

3. **Correlation with other PTQ metrics:** compare χ mismatch against SQNR
   (signal-to-quantisation-noise ratio) and cosine similarity of weight vectors.

4. **Hardware deployment:** after certificate passes, deploy the INT8 model to
   a Raspberry Pi 5 or Jetson Nano via TensorRT INT8 mode. Measure inference latency.
   Certificate then means: "this hardware-deployed model has the same decision boundary
   topology as the original."

5. **Publish the pipeline as a tool:** wrap Steps 3–5 into a single `tropical-verify`
   CLI that takes a PyTorch model and returns a pass/fail certificate with a report.

---

## References

- Zhang, Naitzat, Lim. *Tropical Geometry of Deep Neural Networks.* ICML 2018.
  https://arxiv.org/abs/1805.07091
- Masden. *Algorithmic Determination of the Combinatorial Structure of the Linear
  Regions of ReLU Neural Networks.* OpenReview 2022.
  https://github.com/mmasden/canonicalpoly
- Izhakian, Rowen. *Supertropical Algebra.* Advances in Mathematics, 2010.
- Montufar et al. *On the Number of Linear Regions of Deep Neural Networks.* NeurIPS 2014.
- TropNNC: Structured Neural Network Compression Using Tropical Geometry. Greeks in AI 2025.
  https://arxiv.org/abs/2409.03945
- DNNFusion: Accelerating Deep Neural Networks Execution with Advanced Operator Fusion.
  PLDI 2021.
