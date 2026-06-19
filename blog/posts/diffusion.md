# Mathematical Unsolved Problems in Diffusion Models

# Basic Diffusion-Model Setup

Let $p_0 = p_{\mathrm{data}}$ be the data distribution on $\mathbb{R}^d$. A forward noising process transforms $p_0$ into a tractable noise distribution. In the continuous-time score-based formulation, one considers an SDE $$\begin{equation}
,\mathrm{d}X_t = f(X_t,t),\mathrm{d}t + g(t),\mathrm{d}W_t,
\qquad t \in [0,T],
\end{equation}$$ where $X_0 \sim p_{\mathrm{data}}$ and $X_T$ is close to a simple prior, often approximately Gaussian. The reverse-time SDE has the form $$\begin{equation}
,\mathrm{d}X_t =
\left[
f(X_t,t) - g(t)^2 \nabla_x \log p_t(X_t)
\right],\mathrm{d}t
+ g(t),\mathrm{d}\overline{W}_t,
\end{equation}$$ where $p_t$ is the marginal density of $X_t$ and $$\begin{equation}
s_t^\star(x) := \nabla_x \log p_t(x)
\end{equation}$$ is the score.

In practice one trains a neural network $\widehat{s}_\theta(x,t)$ to approximate $s_t^\star(x)$ by denoising score matching or related objectives. Generation then consists of simulating a reverse-time SDE or probability-flow ODE.

The mathematical bottleneck is therefore: $$\begin{equation}
\text{learn the score accurately}
\quad \Longrightarrow \quad
\text{simulate the reverse dynamics accurately}
\quad \Longrightarrow \quad
\text{sample from } p_{\mathrm{data}}.
\end{equation}$$

Each arrow hides serious unresolved mathematical questions.

# Problem 1: From Score Error to Distributional Error

::: problem
**Problem 1** (Score-to-sample stability). *Let $\widehat{s}_t$ approximate the true score $s_t^\star = \nabla \log p_t$. Prove sharp bounds of the form $$\begin{equation}
\int_0^T \mathbb{E}_{p_t}
\left[
|\widehat{s}_t(X_t)-s_t^\star(X_t)|^2
\right]\,\mathrm{d}t
\leq \varepsilon
\quad \Longrightarrow \quad
d(\widehat{p}_0,p_0) \leq F(\varepsilon,d,T),
\end{equation}$$ where $d$ may be $\mathrm{KL}$, $\mathrm{TV}$, Wasserstein distance, or another meaningful probability metric.*
:::

The empirical success of diffusion models depends on the assumption that small score error leads to small sampling error. However, this implication is delicate. Errors in the score field are accumulated along a reverse-time stochastic or deterministic flow. In high dimension, local errors may amplify, especially near low-density regions.

A complete theory would answer:

- Which score norm is the right one: Fisher divergence, $L^2(p_t)$, weighted Sobolev norms, or uniform control?

- How does the error scale with dimension?

- Which parts of the time interval matter most?

- Are low-noise times intrinsically harder because the score becomes singular or high-curvature?

Relevant tools include stochastic analysis, Fokker--Planck equations, Girsanov theory, log-Sobolev inequalities, transportation inequalities, and non-asymptotic statistics.

# Problem 2: Diffusion Models for Singular and Manifold-Supported Data

A common informal assumption in generative modeling is that natural data lie near a low-dimensional manifold $$\begin{equation}
\mathcal{M} \subset \mathbb{R}^D,
\qquad
\dim \mathcal{M} \ll D.
\end{equation}$$ If $p_0$ is supported on $\mathcal{M}$, then $p_0$ is singular with respect to Lebesgue measure on $\mathbb{R}^D$. Hence the ambient score $$\begin{equation}
\nabla \log p_0(x)
\end{equation}$$ may not exist.

However, after Gaussian noising, $$\begin{equation}
p_t = p_0 * \mathcal{N}(0,\sigma_t^2 I),
\end{equation}$$ the smoothed distribution has a density on $\mathbb{R}^D$. The mathematical question is how the score $$\begin{equation}
\nabla \log p_t(x)
\end{equation}$$ encodes the geometry of $\mathcal{M}$ as $t \downarrow 0$.

::: problem
**Problem 2** (Small-noise score asymptotics near a data manifold). *Assume $p_0$ is supported on a smooth submanifold $\mathcal{M} \subset \mathbb{R}^D$. Derive asymptotic expansions for $$\begin{equation}
\nabla \log (p_0 * \mathcal{N}(0,\sigma^2 I))(x)
\end{equation}$$ as $\sigma \downarrow 0$, including the roles of curvature, reach, second fundamental form, and intrinsic density on $\mathcal{M}$.*
:::

A heuristic leading term is that the score points toward the manifold: $$\begin{equation}
\nabla \log p_\sigma(x)
\approx
-\frac{x-\Pi_{\mathcal{M}}(x)}{\sigma^2}
+
\text{intrinsic score on } \mathcal{M}
+
\text{curvature corrections}.
\end{equation}$$ Here $\Pi_{\mathcal{M}}(x)$ denotes projection onto the manifold.

This problem is highly relevant because it could explain why diffusion models work in high-dimensional ambient spaces: the score field may implicitly learn projection onto a lower-dimensional geometric structure.

Relevant tools include heat-kernel asymptotics, geometric measure theory, stochastic analysis on manifolds, tubular-neighborhood expansions, spectral geometry, and microlocal analysis.

# Problem 3: Fast Sampling with Rigorous Guarantees

Diffusion models often require many network evaluations. Practical samplers reduce this number using deterministic ODE solvers, stochastic predictor-corrector schemes, distillation, consistency models, or specialized discretizations. However, the mathematical understanding of fast sampling remains incomplete.

::: problem
**Problem 3** (Few-step diffusion sampling). *Given a trained score field $\widehat{s}_t$, construct a sampler requiring $N$ network evaluations such that $$\begin{equation}
d(\widehat{p}_0^{(N)},p_0) \leq \varepsilon
\end{equation}$$ with $N$ as small as possible. Determine the optimal dependence of $N$ on dimension, score regularity, noise schedule, and target accuracy.*
:::

The problem contains two distinct errors: $$\begin{equation}
\text{total error}
=
\text{score-estimation error}
+
\text{time-discretization error}.
\end{equation}$$ Even with the exact score, discretizing the reverse SDE or ODE introduces numerical error. With an approximate score, these errors interact.

Relevant mathematical tools include numerical SDE analysis, backward error analysis, adaptive time-stepping, stability theory, operator splitting, probability-flow ODEs, Schrödinger bridges, and optimal transport.

A useful theorem would have the form: $$\begin{equation}
N \geq C(d,\varepsilon,\mathcal{R})
\end{equation}$$ where $\mathcal{R}$ is a class of regularity assumptions on the score field. Such a result would directly guide practical sampler design.

# Problem 4: Noise Schedules as Mathematical Objects

A diffusion model depends strongly on the noising schedule $\sigma(t)$ or, equivalently, on the drift and diffusion coefficients in the forward SDE. Empirically, schedule design is crucial, but the theory is not yet complete.

::: problem
**Problem 4** (Optimal noise schedules). *Find noise schedules that optimize a mathematically meaningful tradeoff between: $$\begin{equation}
\text{training difficulty}, \quad
\text{score regularity}, \quad
\text{sampling stability}, \quad
\text{sample quality}.
\end{equation}$$*
:::

At low noise, the score field may be singular or highly oscillatory. At high noise, the distribution is simple but contains little data-specific information. A good schedule should allocate time resolution where the reverse dynamics are most sensitive.

Relevant tools include calculus of variations, control theory, numerical analysis, information geometry, Fisher information, and entropy dissipation.

# Problem 5: Conditional Diffusion and Guidance

Conditional diffusion models generate samples from $$\begin{equation}
p(x\mid y),
\end{equation}$$ where $y$ may be a class label, text prompt, measurement, or another modality. Guidance methods modify the score field using classifier gradients, classifier-free guidance, or measurement-consistency terms.

A common guided score has the informal form $$\begin{equation}
s_{\mathrm{guided}}(x,t)
=
s_{\mathrm{uncond}}(x,t)
+
\gamma \, \nabla_x \log p(y\mid x_t),
\end{equation}$$ where $\gamma$ controls guidance strength.

::: problem
**Problem 5** (Validity of guided reverse dynamics). *When does a guided score field correspond to the score of a valid conditional distribution? When does guidance improve conditioning, and when does it distort the target distribution?*
:::

This is mathematically difficult because guidance often trades diversity for fidelity. Large guidance may produce visually sharp samples but reduce support coverage or introduce artifacts.

Relevant tools include Bayesian inference, conditional score matching, perturbation theory, optimal control, information geometry, and stability theory.

# Problem 6: Diffusion Priors for Inverse Problems

In inverse problems one observes $$\begin{equation}
y = A x + \eta,
\end{equation}$$ where $A$ is a forward operator and $\eta$ is noise. A diffusion model can be used as a learned prior for $x$.

The Bayesian target is $$\begin{equation}
p(x\mid y) \propto p(y\mid x)p_{\mathrm{prior}}(x).
\end{equation}$$

::: problem
**Problem 6** (Stability of learned diffusion priors). *Let $\widehat{p}_{\mathrm{prior}}$ be an approximate diffusion prior. Bound the error between the true posterior and the learned posterior: $$\begin{equation}
d\left(
p(x\mid y),
\widehat{p}(x\mid y)
\right)
\end{equation}$$ in terms of prior error, observation noise, forward-operator stability, and measurement dimension.*
:::

This problem is important for medical imaging, microscopy, remote sensing, compressed sensing, astronomy, and PDE-constrained reconstruction.

The central danger is hallucination. A diffusion prior may produce a plausible-looking reconstruction that is inconsistent with the true object. Thus one needs mathematical conditions ensuring that the posterior remains data-faithful.

Relevant tools include Bayesian inverse problems, regularization theory, posterior contraction, uncertainty quantification, concentration of measure, and operator theory.

# Problem 7: Hallucination and Data Consistency

Diffusion models can generate highly plausible samples. In inverse problems and scientific applications, plausibility is not enough. One needs truthfulness relative to constraints.

Suppose the measurement equation is $$\begin{equation}
y = A x.
\end{equation}$$ A generated reconstruction $\widehat{x}$ should satisfy $$\begin{equation}
|A\widehat{x}-y| \leq \delta.
\end{equation}$$ However, it should also lie near the data manifold.

::: problem
**Problem 7** (Plausibility versus consistency). *Develop diffusion algorithms and certificates that guarantee both: $$\begin{equation}
\widehat{x} \approx \mathcal{M}_{\mathrm{data}},
\qquad
A\widehat{x} \approx y.
\end{equation}$$ When these two goals conflict, quantify the uncertainty rather than hallucinating a single plausible solution.*
:::

This problem is mathematically close to constrained sampling: $$\begin{equation}
x \sim p_{\mathrm{data}}(x)
\quad \text{subject to} \quad
A x \approx y.
\end{equation}$$

Relevant tools include constrained stochastic processes, projected Langevin dynamics, posterior sampling, convex and nonconvex regularization, uncertainty quantification, and variational inequalities.

# Problem 8: Symmetry-Aware Diffusion Models

Many scientific data domains possess symmetries. For example:

- molecules are invariant or equivariant under translations, rotations, and atom permutations;

- physical fields may obey gauge symmetries;

- graphs are invariant under node relabeling;

- robotics problems may be equivariant under $SE(3)$ transformations.

Let a group $G$ act on a space $X$. A score field should be equivariant: $$\begin{equation}
s_t(gx) = g_\ast s_t(x),
\qquad g \in G.
\end{equation}$$

::: problem
**Problem 8** (Equivariant score matching). *Construct score-based diffusion models whose learned scores exactly respect a group action: $$\begin{equation}
\widehat{s}_t(gx) = g_\ast \widehat{s}_t(x).
\end{equation}$$ Prove that the reverse-time sampler preserves the corresponding equivariance or invariance of the target distribution.*
:::

This problem is a direct mathematical analogue of the role convolution played in CNNs. The symmetry reduces the effective hypothesis space and improves sample efficiency.

Relevant tools include Lie groups, representation theory, harmonic analysis, equivariant neural networks, gauge theory, geometric deep learning, and stochastic processes on homogeneous spaces.

# Problem 9: Diffusion on Non-Euclidean Spaces

Many objects are not naturally elements of $\mathbb{R}^d$. They may live on: $$\begin{equation}
\text{manifolds}, \quad
\text{graphs}, \quad
\text{Lie groups}, \quad
\text{quotient spaces}, \quad
\text{stratified spaces}.
\end{equation}$$

Examples include rotations in $SO(3)$, rigid motions in $SE(3)$, molecular conformations modulo symmetries, and shapes modulo reparameterization.

::: problem
**Problem 9** (Intrinsic diffusion generative modeling). *Develop diffusion models intrinsically on a space $X$ with geometric structure, replacing the Euclidean heat operator by a suitable intrinsic operator: $$\begin{equation}
\partial_t p_t = \mathcal{L}^\ast p_t,
\end{equation}$$ where $\mathcal{L}$ is a Laplace--Beltrami operator, sub-Laplacian, graph Laplacian, or hypoelliptic operator.*
:::

This problem asks for a theory of scores of the form $$\begin{equation}
\nabla_X \log p_t,
\end{equation}$$ where $\nabla_X$ is an intrinsic gradient.

Relevant tools include Riemannian geometry, sub-Riemannian geometry, heat kernels, hypoelliptic operators, Markov semigroups, spectral theory, and stochastic differential geometry.

# Problem 10: Generalization Theory for Diffusion Models

A trained diffusion model sees finitely many samples $$\begin{equation}
X_1,\dots,X_n \sim p_0.
\end{equation}$$ It learns a score network from this finite dataset. The central statistical question is: $$\begin{equation}
\widehat{s}_t \approx s_t^\star
\quad \Longrightarrow \quad
\widehat{p}_0 \approx p_0.
\end{equation}$$

::: problem
**Problem 10** (Finite-sample generalization). *Establish non-vacuous finite-sample bounds for diffusion models: $$\begin{equation}
d(\widehat{p}_0,p_0)
\leq
F(n,d,\mathcal{F},T,\sigma),
\end{equation}$$ where $\mathcal{F}$ is the score-network class and $\sigma$ is the noise schedule.*
:::

This is difficult because the training loss is not directly a sample-quality metric. The model may fit denoising objectives well while still missing rare modes or producing artifacts.

Relevant tools include empirical process theory, metric entropy, Rademacher complexity, PAC-Bayes theory, minimax statistics, concentration of measure, and high-dimensional probability.

# Problem 11: Rare Modes and Distributional Coverage

Diffusion models often produce high-quality samples, but evaluation of rare modes remains difficult. Let $$\begin{equation}
p_0 = \sum_{k=1}^K \pi_k p_k
\end{equation}$$ be a mixture distribution with rare components where some $\pi_k$ are small.

::: problem
**Problem 11** (Rare-mode preservation). *Determine when diffusion training and sampling preserve rare components of the data distribution. Prove lower bounds on the number of samples or score accuracy required to recover modes with probability mass $\pi_k \ll 1$.*
:::

This matters in safety-critical settings. Rare events may be precisely the most important: medical abnormalities, rare molecules, fraud cases, edge-case driving scenarios, or unusual physical configurations.

Relevant tools include mixture models, minimax lower bounds, large deviations, hypothesis testing, optimal transport, and distributional robustness.

# Problem 12: Evaluation Metrics for Diffusion Models

A diffusion model can be good in one metric and bad in another. Likelihood, FID, precision-recall, human preference, diversity, and downstream utility do not always agree.

::: problem
**Problem 12** (Principled evaluation). *Develop mathematically principled metrics $D(p_0,\widehat{p}_0)$ that capture: $$\begin{equation}
\text{sample quality},
\quad
\text{diversity},
\quad
\text{rare-mode coverage},
\quad
\text{semantic fidelity},
\quad
\text{downstream usefulness}.
\end{equation}$$*
:::

A useful metric should have finite-sample guarantees and should not be easily fooled by memorization, mode dropping, or superficial perceptual similarity.

Relevant tools include integral probability metrics, kernel methods, optimal transport, representation geometry, statistical testing, information geometry, and high-dimensional statistics.

# Problem 13: Memorization and Privacy

Diffusion models may memorize training examples, especially in low-data or high-capacity regimes.

::: problem
**Problem 13** (Memorization certificates). *Quantify when a diffusion model generates genuinely new samples versus near-copies of training data. Develop mathematical tests that distinguish interpolation, memorization, and distributional generalization.*
:::

This is especially important for medical, legal, personal, or copyrighted data.

Relevant tools include nearest-neighbor statistics, information theory, differential privacy, algorithmic stability, generalization bounds, and membership-inference analysis.

# Problem 14: Uncertainty Quantification

Diffusion models generate samples, but in scientific and inverse-problem settings one often needs calibrated uncertainty.

::: problem
**Problem 14** (Calibrated generative uncertainty). *When does the empirical sample distribution produced by a diffusion model represent a calibrated posterior or predictive distribution?*
:::

For inverse problems, one wants: $$\begin{equation}
\mathbb{P}(x_{\mathrm{true}} \in C(y)\mid y) \approx 1-\alpha,
\end{equation}$$ where $C(y)$ is a credible set computed from diffusion samples.

Relevant tools include Bayesian statistics, posterior contraction, conformal prediction, calibration theory, stochastic processes, and uncertainty quantification.

# Research Programme

The most promising route for a mathematician is to convert structural theory into computational mechanisms. A possible programme is:

1.  **Geometric score asymptotics.** Prove heat-kernel expansions for scores near data manifolds.

2.  **Geometry-aware noise schedules.** Use curvature or intrinsic dimension estimates to adapt the noising schedule.

3.  **Equivariant score networks.** Enforce group symmetries exactly in the score model.

4.  **Certified inverse-problem samplers.** Combine diffusion priors with data-consistency guarantees.

5.  **Rare-mode evaluation.** Design metrics that detect missing low-probability components.

The ideal bridge has the form: $$\begin{equation}
\text{mathematical structure}
\quad \Longrightarrow \quad
\text{computable inductive bias}
\quad \Longrightarrow \quad
\text{measurable empirical gain}.
\end{equation}$$

# Conclusion

Diffusion models are a rich meeting point between empirical AI and mathematics. Their success depends on stochastic processes, score estimation, numerical simulation, geometry, and high-dimensional statistics. The most important open problems are no longer simply architectural. They concern whether the learned score field is accurate enough, whether the sampler preserves the target distribution, whether singular or manifold-supported data are handled correctly, whether conditional generation is faithful, and whether uncertainty can be trusted.

For a mathematically trained researcher, the most promising directions are: $$\begin{equation}
\boxed{
\text{diffusion on manifolds,}
\quad
\text{score-error theory,}
\quad
\text{fast samplers,}
\quad
\text{inverse problems,}
\quad
\text{symmetry-aware diffusion.}
}
\end{equation}$$

These problems are both mathematically deep and empirically relevant. A breakthrough would likely come from turning geometric or analytic structure into a concrete computational object: a sampler, loss, architecture, evaluation metric, or certificate.

## References

J. Sohl-Dickstein, E. Weiss, N. Maheswaranathan, and S. Ganguli. Deep Unsupervised Learning using Nonequilibrium Thermodynamics. *International Conference on Machine Learning*, 2015.

J. Ho, A. Jain, and P. Abbeel. Denoising Diffusion Probabilistic Models. *Advances in Neural Information Processing Systems*, 2020.

Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-Based Generative Modeling through Stochastic Differential Equations. *International Conference on Learning Representations*, 2021.

P. Dhariwal and A. Nichol. Diffusion Models Beat GANs on Image Synthesis. *Advances in Neural Information Processing Systems*, 2021.

T. Karras, M. Aittala, T. Aila, and S. Laine. Elucidating the Design Space of Diffusion-Based Generative Models. *Advances in Neural Information Processing Systems*, 2022.

B. D. O. Anderson. Reverse-Time Diffusion Equation Models. *Stochastic Processes and their Applications*, 1982.

A. Hyvärinen. Estimation of Non-Normalized Statistical Models by Score Matching. *Journal of Machine Learning Research*, 2005.

P. Vincent. A Connection Between Score Matching and Denoising Autoencoders. *Neural Computation*, 2011.
