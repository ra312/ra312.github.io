## Sparse Autoencoders: Finding Interpretable Features in Neural Networks

Transformer models process text by moving information through a series of layers, each performing a specific computation. The deeper layers in the MLP (multi-layer perceptron) blocks contain rich, dense representations of concepts—but these representations are *entangled*. Many neurons fire simultaneously, making it hard to understand what individual neurons represent.

**Sparse Autoencoders (SAEs)** solve this by learning an *overcomplete* dictionary of features, allowing us to disentangle and interpret what the network has learned.

---

### The Setup: Transformer MLP Activations

Consider a transformer MLP layer at depth $l$. As a sequence of tokens flows through:

```
Input tokens → Embedding layer → Layers 1, 2, ... → MLP at layer l
                                                      ↓
                                                Activation: φ^(l)_t
                                                (d neurons, T positions)
```

At each position $t$ in the sequence, the MLP receives a residual stream vector $x_t$ and produces an activation:

$$
\phi^{(l)}_t = \sigma(W_{\text{in}} x_t + b) \in \mathbb{R}^d
$$

where:
- $x_t \in \mathbb{R}^{d_{\text{model}}}$ is the residual stream (e.g., 768-dimensional)
- $\sigma$ is an elementwise activation (usually ReLU or GELU)
- $\phi^{(l)}_t$ captures how strongly each of the $d$ neurons fires for token $t$

**Problem:** With $d$ neurons, we have only $d$ basis directions. If each neuron represents a mixture of concepts (superposition), interpretation becomes nearly impossible.

---

### The Sparse Autoencoder Solution

A Sparse Autoencoder expands this $d$-dimensional space into an overcomplete dictionary with $n \gg d$ dimensions—each corresponding to a potential interpretable feature.

**Architecture:**

```
φ^(l)_t (d dims)  →  [Encoder: W_e]  →  z_t (n dims, sparse)  →  [Decoder: W_d]  →  φ̂^(l)_t (d dims)
  Dense input            Linear layer        Sparse latent         Linear layer       Dense output
   (entangled)          + ReLU activation     (disentangled)      (learned dictionary) (reconstruction)
```

**Encoder:** Compresses the activation nonlinearly into a sparse code:
$$
z_t = \mathrm{ReLU}(W_e \, \phi^{(l)}_t + b_e) \in \mathbb{R}^n
$$

**Decoder:** Reconstructs using an overcomplete dictionary:
$$
\phi^{(l)}_t \approx W_d z_t
$$

where $W_d \in \mathbb{R}^{d \times n}$ has $n$ columns, each a **feature direction** in the original $d$-dimensional space.

---

### Training Objective

The SAE learns to minimize reconstruction error while keeping activations sparse:

$$
\mathcal{L} = \underbrace{\left\|\phi^{(l)}_t - W_d z_t\right\|_2^2}_{\text{reconstruction}} + \underbrace{\lambda \|z_t\|_1}_{\text{sparsity penalty}}
$$

The $\ell_1$ penalty on $z_t$ encourages most entries to be zero. Only a small subset of features should be active for any given token—this is the "sparse" part.

**Result:** At inference, only a handful of features activate per token, making it possible to read off what concepts the network is representing.

---

### Intuition: From Superposition to Interpretability

In dense representations, a neuron might fire for:
- "The word is a name" AND
- "The context suggests a person" AND  
- "The next token is a verb"

These three concepts are *superposed* into one neuron's activation.

With an SAE, these become separate features:
- Feature 42: "Proper noun / name"
- Feature 157: "Person-related entity"
- Feature 289: "Precedes verb"

A single token activates perhaps 3–10 features total, making the representation **human-readable**.

---

### Why Overcomplete?

Why use $n > d$ dimensions? Because concepts in language may not align with the natural basis of the model. The residual stream operates in a fixed $d_{\text{model}}$-dimensional space, but the concepts the network learns might span a different, higher-dimensional space of "true" features. An overcomplete dictionary can approximate this latent structure.

---

### Applications & Impact

Sparse autoencoders enable:

1. **Mechanistic interpretability**: Which features does a layer activate? Which features drive the model's predictions?
2. **Feature steering**: Artificially amplify or suppress features to test causal effects.
3. **Finding circuits**: Trace how specific features flow between layers.
4. **Adversarial robustness**: Understand which learned features the model relies on.

---

### Example Workflow

1. **Train SAE** on a dataset of activations from layer $l$.
2. **Inspect top features** by checking which words maximally activate each feature.
3. **Verify interpretability** by testing whether features align with human concepts.
4. **Ablate features** to see how model outputs change.
5. **Compose interventions** to steer model behavior.

---

### References

- **Elhage et al.** (2022), *Toy Models of Superposition*, Anthropic — theoretical foundation for why superposition occurs
- **Cunningham et al.** (2024), *Sparse Autoencoders Find Highly Interpretable Features in Language Models*, arXiv:2309.08600 — large-scale empirical study
- **Bricken et al.** (2023), *Towards Monosemanticity: Decomposing Language Models With Dictionary Learning*, Anthropic — state-of-the-art SAE methods
- **Templeton et al.** (2024), *Scaling Monosemantic Representations with Dictionary Learning*, Anthropic — scaling SAEs to larger models

---

**Further Reading:** To apply this yourself, the Anthropic Interp team has released a SAE training library. Start with a small model and dataset to build intuition before scaling.
