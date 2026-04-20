## Sparse Autoencoders on Transformer MLP Activations

Consider a transformer MLP layer \(l\) receiving a sequence of \(T\) token representations.  
The layer processes each position \(t \in \{1, \ldots, T\}\) independently, producing an activation vector:

$$
\phi^{(l)}_t = \sigma(W_{\text{in}} x_t + b) \in \mathbb{R}^d
$$

where \(x_t \in \mathbb{R}^{d_{\text{model}}}\) is the residual stream at position \(t\), and \(\sigma\) is an elementwise nonlinearity.  
This vector records how strongly each of the \(d\) neurons in the MLP fires for token \(t\).

---

### Sparse Autoencoder (SAE)

A Sparse Autoencoder takes \(\phi^{(l)}_t\) as input and learns an overcomplete dictionary  
\(W_d \in \mathbb{R}^{d \times n}\), with \(n \gg d\), such that:

$$
\phi^{(l)}_t \approx W_d z_t
$$

$$
z_t = \mathrm{ReLU}(W_e \, \phi^{(l)}_t + b_e)
$$

where \(z_t \in \mathbb{R}^n\) is sparse.

The training objective is:

$$
\|\phi^{(l)}_t - W_d z_t\|_2^2 + \lambda \|z_t\|_1
$$

Each column of \(W_d\) corresponds to a **feature direction**.

---

### References

- Elhage et al., *Toy Models of Superposition*, Anthropic (2022) — superposition and feature geometry  
- Cunningham et al., *Sparse Autoencoders Find Highly Interpretable Features in Language Models*, arXiv:2309.08600  
- Bricken et al., *Towards Monosemanticity*, Anthropic (2023)