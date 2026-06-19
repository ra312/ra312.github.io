# Can Tropical Geometry Certify Quantisation?

*A research proposal and experiment specification for using the Euler characteristic of a ReLU network's tropical hypersurface as a formal certificate for post-training quantisation.*

---

# Motivation: the gap in PTQ verification

When a network $f_\theta : \mathbb{R}^d \to \mathbb{R}^k$ is quantised to $f_{\hat\theta}$ with weights rounded to $b$-bit integers, the standard guarantee is: $$\begin{equation}
\sup_{x \in \mathcal{X}} \|f_\theta(x) - f_{\hat\theta}(x)\|_\infty \leq \varepsilon.
\label{eq:output-bound}
\end{equation}$$ This is a *pointwise* guarantee. It says nothing about whether the decision regions---the connected components and loops of the classification boundary---are preserved. A quantised network can satisfy [\[eq:output-bound\]](#eq:output-bound){reference-type="eqref" reference="eq:output-bound"} while:

- Merging two decision regions into one (loss of a connected component).

- Introducing a spurious loop in the boundary (gain of a topological cycle).

- Splitting a simply-connected region (change in the number of holes).

These failures are invisible to output-bound checkers. We propose to detect them via a topological invariant derived from tropical geometry.

# Theoretical foundation

## ReLU networks as tropical rational maps

::: theorem
**Theorem 1** (Zhang, Naitzat, Lim 2018). *Every feedforward ReLU network $f : \mathbb{R}^d \to \mathbb{R}$ is a tropical rational map: $$\begin{equation}
f(x) = p(x) \oslash q(x)
:= p(x) - q(x)
\quad \text{in the max-plus semiring,}
\label{eq:tropical-rational}
\end{equation}$$ where $p, q$ are tropical polynomials (finite max-plus combinations of linear forms).*
:::

In the max-plus semiring $(\mathbb{R}\cup \{-\infty\}, \oplus, \otimes)$: $$\begin{equation}
a \oplus b := \max(a,b), \qquad a \otimes b := a + b.
\end{equation}$$ A tropical polynomial in $x \in \mathbb{R}^d$ has the form $$\begin{equation}
p(x) = \bigoplus_{\alpha \in A} c_\alpha \otimes x^\alpha
= \max_{\alpha \in A} \bigl(c_\alpha + \langle \alpha, x \rangle\bigr),
\end{equation}$$ where $A \subset \mathbb{Z}^d$ is a finite exponent set and $c_\alpha \in \mathbb{R}$.

## Decision boundaries as tropical hypersurfaces

::: proposition
**Proposition 1** (Zhang et al. 2018, Proposition 6.1). *Let $f = p \oslash q$ be the tropical rational representation of a ReLU network, and let $c \in \mathbb{R}$ be the decision threshold. The decision boundary $$\begin{equation}
\mathcal{B} := \{x \in \mathbb{R}^d : f(x) = c\}
\end{equation}$$ satisfies $$\begin{equation}
\mathcal{B} \subseteq \mathcal{T}\!\left(c \otimes q \oplus p\right)
= \bigl\{x \in \mathbb{R}^d :
\max\{p(x),\, q(x) + c\} \text{ is attained at least twice}\bigr\}.
\label{eq:tropical-hypersurface}
\end{equation}$$*
:::

The right-hand side of [\[eq:tropical-hypersurface\]](#eq:tropical-hypersurface){reference-type="eqref" reference="eq:tropical-hypersurface"} is a *tropical hypersurface*: the locus where the maximum in a tropical polynomial is attained simultaneously by two or more monomials. For $d = 2$ it is a piecewise-linear graph.

## Linear regions as vertices of the canonical polyhedral complex

::: definition
**Definition 1** (Canonical polyhedral complex). *For a ReLU network $f$ with $n$ neurons, the *canonical polyhedral complex* $\mathcal{C}(f)$ is the cell decomposition of $\mathbb{R}^d$ induced by the $n$ hyperplanes $\{x : W^{(\ell)} x + b^{(\ell)} = 0\}$ arising from the ReLU boundaries at each layer. Each cell of $\mathcal{C}(f)$ is a convex polytope on which $f$ is affine-linear.*
:::

The vertices of $\mathcal{C}(f)$ are the points where the maximum number of ReLU boundaries intersect. Masden (2022) showed that the face poset of $\mathcal{C}(f)$ is completely determined by the *sign sequences* $\sigma(x) \in \{-1, 0, 1\}^n$ of the neurons at each vertex $x$.

## The certificate: Euler characteristic of the decision boundary

For the 1D decision boundary graph $\mathcal{B}$ in $\mathbb{R}^2$, the Betti numbers are: $$\begin{equation}
\beta_0(\mathcal{B}) = \text{number of connected components},\quad
\beta_1(\mathcal{B}) = \text{number of independent cycles},
\end{equation}$$ and the Euler characteristic is $$\begin{equation}
\chi(\mathcal{B}) = \beta_0(\mathcal{B}) - \beta_1(\mathcal{B}).
\label{eq:euler}
\end{equation}$$

::: definition
**Definition 2** (Tropical PTQ certificate). *Let $f_\theta$ (float32) and $f_{\hat\theta}$ (quantised) be two ReLU networks with decision boundaries $\mathcal{B}_\theta$ and $\mathcal{B}_{\hat\theta}$. We say the *tropical PTQ certificate holds* if $$\begin{equation}
\chi(\mathcal{B}_\theta) = \chi(\mathcal{B}_{\hat\theta}),
\label{eq:certificate}
\end{equation}$$ and the *strong certificate holds* if additionally $\beta_0(\mathcal{B}_\theta) = \beta_0(\mathcal{B}_{\hat\theta})$ and $\beta_1(\mathcal{B}_\theta) = \beta_1(\mathcal{B}_{\hat\theta})$.*
:::

The weak certificate [\[eq:certificate\]](#eq:certificate){reference-type="eqref" reference="eq:certificate"} could hold by cancellation (equal gains and losses in $\beta_0$ and $\beta_1$) even when the strong certificate fails. The experiment tests both.

# Quantisation schemes

## Symmetric INT8

For a weight matrix $W \in \mathbb{R}^{m \times n}$, symmetric per-tensor INT8 quantisation rounds each weight to the nearest integer multiple of the scale $s$: $$\begin{equation}
s = \frac{\|W\|_\infty}{127}, \qquad
\hat{W} = s \cdot \operatorname{clamp}\!\left(\operatorname{round}\!\left(\frac{W}{s}\right),\, -127,\, 127\right).
\label{eq:int8}
\end{equation}$$ The rounding error satisfies $\|W - \hat{W}\|_\infty \leq s/2$.

## Power-of-two (PoT) quantisation

For ASIC and FPGA deployment, weights are often restricted to powers of two so that multiplication reduces to a bit-shift: $$\begin{equation}
s_{\mathrm{PoT}} = 2^{\lfloor \log_2 \|W\|_\infty \rfloor - (b-1)},
\qquad
\hat{W}_{\mathrm{PoT}} = s_{\mathrm{PoT}} \cdot
\operatorname{clamp}\!\left(\operatorname{round}\!\left(\frac{W}{s_{\mathrm{PoT}}}\right),\,
-(2^{b-1}),\, 2^{b-1}-1\right).
\label{eq:pot}
\end{equation}$$ PoT introduces larger rounding errors for small weights, so we hypothesise that it will cause more topological change than INT8.

# Experiment pipeline

The pipeline has six steps. Each step is a standalone script; the full sweep is orchestrated by a shell script.

## Step 0 --- Environment

``` {.bash language="bash"}
conda create -n tropical-ptq python=3.10 -y
conda activate tropical-ptq
conda install -c conda-forge sage=10.3 -y   # ~20 min
pip install torch numpy scipy matplotlib sklearn
git clone https://github.com/mmasden/canonicalpoly
cd canonicalpoly && pip install -e . && cd ..
```

Smoke test: construct the simplicial complex $\{\{0,1\},\{1,2\},\{0,2\}\}$ (a triangle) and verify $H_1 \cong \mathbb{Z}$.

## Step 1 --- Train baseline network

Architecture: $\mathbb{R}^2 \xrightarrow{\mathrm{Linear}_{12}} \mathrm{ReLU}
\xrightarrow{\mathrm{Linear}_{12}} \mathrm{ReLU}
\xrightarrow{\mathrm{Linear}_1} \mathbb{R}$.

Dataset: `make_moons`$(n=500, \text{noise}=0.1)$. Trained with Adam for 500 epochs. Required test accuracy $\geq 95\%$.

The Montufar et al. (2014) upper bound on the number of linear regions is $$\begin{equation}
R(f) \leq \prod_{\ell=1}^{L} \left\lfloor \frac{n_\ell}{n_0} \right\rfloor^{n_0}
\binom{n_0}{0} + \cdots
\end{equation}$$ For $(n_0, n_1, n_2) = (2, 12, 12)$ this gives approximately $1{,}352$. In practice we observe 100--400 regions per random seed.

## Step 2 --- Quantise

Apply [\[eq:int8\]](#eq:int8){reference-type="eqref" reference="eq:int8"} and [\[eq:pot\]](#eq:pot){reference-type="eqref" reference="eq:pot"} to produce $\hat{W}_{\mathrm{int8}}$ and $\hat{W}_{\mathrm{PoT}}$. Both yield a standard float32 PyTorch model with rounded weights---required because `canonicalpoly` operates on float linear layers, not PyTorch's packed quantised format.

## Step 3 --- Enumerate the canonical polyhedral complex

`canonicalpoly` enumerates all vertices of $\mathcal{C}(f)$ and stores their coordinates $x^{(v)} \in \mathbb{R}^2$ and sign sequences $\sigma^{(v)} \in \{-1,0,1\}^{24}$. Two vertices are adjacent in the decision boundary graph iff their sign sequences differ in exactly one coordinate.

## Step 4 --- Compute Betti numbers

From the vertex adjacency graph, SageMath computes: $$\begin{equation}
H_\bullet(\mathcal{B}) \implies (\beta_0, \beta_1) \implies
\chi = \beta_0 - \beta_1.
\end{equation}$$

For a typical well-fitted moon network we expect $\beta_0 = 1$ (one connected curve) and $\beta_1 \in \{1, 2, 3\}$ (a few loops where the boundary wraps around the moons).

## Step 5 --- Certificate comparison

For each of 10 random seeds, compute: $$\begin{equation}
\Delta\chi_{\mathrm{int8}} := \chi(\mathcal{B}_\theta) - \chi(\mathcal{B}_{\hat\theta}^{\mathrm{int8}}),
\qquad
\Delta\chi_{\mathrm{PoT}} := \chi(\mathcal{B}_\theta) - \chi(\mathcal{B}_{\hat\theta}^{\mathrm{PoT}}).
\end{equation}$$ Certificate holds iff $\Delta\chi = 0$. The experiment reports the empirical rate and correlates $|\Delta\chi|$ with accuracy drop $\Delta\mathrm{acc}$.

## Step 6 --- Plots

::: description
Decision boundary before/after PTQ on a $500 \times 500$ grid, with enumerated vertices overlaid. Qualitative.

Scatter: $\beta_1(f_\theta)$ vs $\beta_1(f_{\hat\theta})$, one point per seed, coloured by $\Delta\mathrm{acc}$. Points on the diagonal = certificate holds.

Scatter: $|\Delta\chi|$ vs $\Delta\mathrm{acc}$. Pearson $r > 0.5$: certificate is useful. Pearson $r < 0.1$: $\chi$ is insufficient; negative result.

Repeat B and C for PoT to test the coarser-rounding hypothesis.
:::

# Expected outcomes and their meaning

::: center
  -------------------------------------------------------------------------------------------------------------------------------
  $\chi$ match   $(\beta_0,\beta_1)$ match   Interpretation
  -------------- --------------------------- ------------------------------------------------------------------------------------
  Yes            Yes                         Full topological preservation. Strong certificate holds.

  Yes            No                          $\Delta\beta_0 = \Delta\beta_1 \neq 0$: cancellation. Weak certificate misleading.

  No             ---                         PTQ changed topology. Certificate correctly flags failure.
  -------------------------------------------------------------------------------------------------------------------------------
:::

::: remark
**Remark 1**. *Both positive and negative outcomes are publishable. If $\chi$ mismatch correlates with accuracy drop, the certificate is a viable lightweight alternative to SMT-based verification for small networks. If it does not, the experiment identifies what a stronger topological certificate would need to capture (e.g. persistent homology rather than singular homology, or a metric rather than a binary pass/fail).*
:::

# Extensions

1.  **Higher-dimensional input via random slicing.** For $x \in \mathbb{R}^d$ with $d > 2$, sample random 2D affine planes $\Pi_1, \ldots, \Pi_K \subset \mathbb{R}^d$, compute $\chi(\mathcal{B} \cap \Pi_i)$ for each, and use the average as an approximation to the full invariant. This avoids the NP-hard full enumeration.

2.  **Persistent homology certificate.** Replace the single-threshold $\chi$ with the persistence diagram $\mathrm{dgm}(\mathcal{B})$, which tracks how topological features appear and disappear as a filter parameter varies. The bottleneck distance $d_B(\mathrm{dgm}(f_\theta), \mathrm{dgm}(f_{\hat\theta}))$ is a continuous certificate.

3.  **Hardware deployment after certificate.** After the certificate passes, deploy to an INT8 accelerator (Jetson Nano via TensorRT, or a custom FPGA datapath). The certificate then guarantees that the hardware-deployed model has the same decision boundary topology as the original floating-point model.

4.  **`tropical-verify` CLI tool.** Package Steps 3--5 as a single command: `tropical-verify --model model.pt --quantized model_int8.pt`. Returns a structured JSON report with $(\beta_0, \beta_1, \chi)$ for both models and a pass/fail certificate.

# Timeline

::: center
  Day     Task                                            Acceptance criterion
  ------- ----------------------------------------------- ---------------------------------------
  1       Environment: conda + SageMath + canonicalpoly   Smoke test passes
  2       Understand canonicalpoly output format          $\chi$ computed for 1 trivial network
  3       Train baseline, verify $\geq 95\%$ accuracy     Visual boundary check
  4--5    Adapt canonicalpoly to quantised weights        Betti numbers for INT8 model
  6       Sweep 10 seeds, collect all Betti numbers       Results table populated
  7--8    Debug unexpected results                        Root cause identified
  9--10   Plots and write-up                              Draft complete
:::

## References

L. Zhang, G. Naitzat, L.-H. Lim. Tropical Geometry of Deep Neural Networks. *ICML*, 2018. arXiv:1805.07091.

M. Masden. Algorithmic Determination of the Combinatorial Structure of the Linear Regions of ReLU Neural Networks. *OpenReview*, 2022. <https://github.com/mmasden/canonicalpoly>

G. Montufar, R. Pascanu, K. Cho, Y. Bengio. On the Number of Linear Regions of Deep Neural Networks. *NeurIPS*, 2014.

K. Fotopoulos, P. Maragos, P. Misiakos. TropNNC: Structured Neural Network Compression Using Tropical Geometry. *Greeks in AI*, 2025. arXiv:2409.03945.

K. Xu et al. Automatic Perturbation Analysis for Scalable Certified Robustness and Beyond ($\alpha$,$\beta$-CROWN). *NeurIPS*, 2021.

G. Katz et al. The Marabou Framework for Verification and Analysis of Deep Neural Networks. *CAV*, 2019.

Z. Izhakian, L. Rowen. Supertropical Algebra. *Advances in Mathematics*, 225(4), 2010.
