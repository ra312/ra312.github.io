-- Complete CV data

import Profile.Data

namespace Profile

def cv : CV := {
  header := {
    firstName := "Dr Rauan"
    lastName := "Akylzhanov"
    taglines := [
      "Noncommutative harmonic analysis & spectral theory",
      "Mathematics of deep learning",
      "Almaty, Kazakhstan"
    ]
    email := "akylzhanov.r@gmail.com"
    scholar := {text := "Google Scholar", href := "https://scholar.google.com/citations?user=BAxsRYkAAAAJ&hl=en"}
    website := {text := "ra312.github.io", href := "https://ra312.github.io"}
    github := {text := "github/ra312", href := "https://github.com/ra312"}
    phone := "+7 701 211 4844"
  }

  research := {
    coreQuestion := "How far can the spectral decay of a single Dirac-type operator carry analysis, on groups, quantum groups and von Neumann algebras, and in the geometry of neural-network training?"

    leads := [
      "My research is about how the spectrum of an operator controls analysis where classical Fourier analysis is not available: non-abelian and non-unimodular groups, compact quantum groups, and general von Neumann algebras. Multipliers are the operators affiliated with the algebra, and the decay of the spectral projections of one Dirac- or Laplace-type operator is enough to prove sharp Lp–Lq estimates, Hardy–Littlewood–Paley inequalities and Hörmander–Mikhlin multiplier theorems.",

      "I am developing two linked programmes, set out in grant proposals prepared with Michael Ruzhansky: (i) regularity of spectral and Fourier multipliers in affiliated von Neumann algebras, with heat and Klein–Gordon decay estimates governed by an intrinsic spectral dimension; and (ii) a global pseudo-differential calculus directly on von Neumann algebras, combining compatible Fourier structures, quantum Riemannian geometry and Safarov's connection-based calculus, with Lp regularity, Gårding-type inequalities and applications to nonlinear evolution equations. The test cases are quantum tori, quantum Euclidean spaces, quantum groups and symmetric spaces.",

      "A second strand applies the same spectral and geometric toolkit to the mathematics of deep learning: the geometry of loss landscapes, degenerate minima and the training dynamics of neural networks, and the structure of learned representations. As one probe, I use log-signature representations of sequences to study how transformers compress and organise contextual information.",

      "Alongside research I work in industry. I am currently at Kaspi Bank (AI strategy and statistical modelling), and before that worked on tabular foundation models and LLM evaluation at HighSky (2024–2026)."
    ]

    noteLink := some {text := "Note: Log-signatures as structured compression and probes of representation geometry (March 2026)", href := "log-signature-attention.html"}
  }

  pubs := [
    {num := 1, title := "Hörmander–Mikhlin type theorem on non-commutative spaces", authors := "R. Akylzhanov, M. Ruzhansky, K. Tulenov",
      venue := "arXiv preprint arXiv:2503.01240", link := some {text := "Hörmander–Mikhlin type theorem on non-commutative spaces", href := "https://arxiv.org/abs/2503.01240"}, year := 2025},

    {num := 2, title := "Norms of certain functions of a distinguished Laplacian on the ax+b groups",
      authors := "R. Akylzhanov, Y. Kuznetsova, M. Ruzhansky, H. Zhang",
      venue := "Mathematische Zeitschrift, 302(4):2327–2352",
      link := some {text := "Norms of certain functions of a distinguished Laplacian on the ax+b groups", href := "https://doi.org/10.1007/s00209-022-03143-z"}, year := 2022},

    {num := 3, title := "Contractions of group representations via geometric quantization",
      authors := "R. Akylzhanov, A. Arnaudon",
      venue := "Letters in Mathematical Physics, 110(1):43–59",
      link := some {text := "Contractions of group representations via geometric quantization", href := "https://doi.org/10.1007/s11005-019-01212-9"}, year := 2020},

    {num := 4, title := "Lp–Lq multipliers on locally compact groups",
      authors := "R. Akylzhanov, M. Ruzhansky",
      venue := "Journal of Functional Analysis, 278(3):108324",
      link := some {text := "Lp–Lq multipliers on locally compact groups", href := "https://doi.org/10.1016/j.jfa.2019.108324"}, year := 2020},

    {num := 5, title := "Re-expansions on compact Lie groups",
      authors := "R. Akylzhanov, E. Liflyand, M. Ruzhansky",
      venue := "Analysis and Mathematical Physics, 10(3):33",
      link := some {text := "Re-expansions on compact Lie groups", href := "https://doi.org/10.1007/s13324-020-00376-1"}, year := 2020},

    {num := 6, title := "Hardy–Littlewood, Hausdorff–Young–Paley inequalities, and Lp–Lq Fourier multipliers on compact homogeneous manifolds",
      authors := "R. Akylzhanov, M. Ruzhansky, E. Nursultanov",
      venue := "Journal of Mathematical Analysis and Applications, 479(2):1519–1548",
      link := some {text := "Hardy–Littlewood, Hausdorff–Young–Paley inequalities, and Lp–Lq Fourier multipliers on compact homogeneous manifolds", href := "https://doi.org/10.1016/j.jmaa.2019.07.010"}, year := 2019},

    {num := 7, title := "Smooth dense subalgebras and Fourier multipliers on compact quantum groups",
      authors := "R. Akylzhanov, S. Majid, M. Ruzhansky",
      venue := "Communications in Mathematical Physics, 362(3):761–799",
      link := some {text := "Smooth dense subalgebras and Fourier multipliers on compact quantum groups", href := "https://doi.org/10.1007/s00220-018-3219-4"}, year := 2018},

    {num := 8, title := "Net spaces on lattices, Hardy–Littlewood type inequalities, and their converses",
      authors := "R. Akylzhanov, M. Ruzhansky",
      venue := "Eurasian Mathematical Journal, 8(3):10–27",
      link := some {text := "Net spaces on lattices, Hardy–Littlewood type inequalities, and their converses", href := "https://www.mathnet.ru/eng/emj262"}, year := 2017},

    {num := 9, title := "Hausdorff–Young–Paley inequalities and Lp–Lq Fourier multipliers on locally compact groups",
      authors := "R. Akylzhanov, M. Ruzhansky",
      venue := "arXiv preprint arXiv:1510.06321",
      link := some {text := "Hausdorff–Young–Paley inequalities and Lp–Lq Fourier multipliers on locally compact groups", href := "https://arxiv.org/abs/1510.06321"}, year := 2016},

    {num := 10, title := "Fourier multipliers and group von Neumann algebras",
      authors := "R. Akylzhanov, M. Ruzhansky",
      venue := "Comptes Rendus Mathématique, 354(8):766–770",
      link := some {text := "Fourier multipliers and group von Neumann algebras", href := "https://doi.org/10.1016/j.crma.2016.05.010"}, year := 2016},

    {num := 11, title := "Hardy–Littlewood–Paley-type inequalities on compact Lie groups",
      authors := "R. Akylzhanov, E. D. Nursultanov, M. V. Ruzhanskii",
      venue := "Matematicheskie Zametki, 100(2):287–290",
      link := some {text := "Hardy–Littlewood–Paley-type inequalities on compact Lie groups", href := "https://doi.org/10.1134/S0001434616070269"}, year := 2016},

    {num := 12, title := "Hardy–Littlewood–Paley inequalities and Fourier multipliers on SU(2)",
      authors := "R. Akylzhanov, E. Nursultanov, M. Ruzhansky",
      venue := "Studia Mathematica, 234(1):1–29",
      link := some {text := "Hardy–Littlewood–Paley inequalities and Fourier multipliers on SU(2)", href := "https://doi.org/10.4064/sm8106-4-2016"}, year := 2016},

    {num := 13, title := "Well-posed solvability of functional-differential equations with unbounded operator coefficients",
      authors := "R. Akylzhanov, V. V. Vlasov",
      venue := "Differential Equations, 50(9):1161–1172",
      link := some {text := "Well-posed solvability of functional-differential equations with unbounded operator coefficients", href := "https://doi.org/10.1134/S0012266114090043"}, year := 2014},

    {num := 14, title := "On an inequality for the non-increasing rearrangement of a function",
      authors := "R. Akylzhanov",
      venue := "Eurasian Mathematical Journal, no. 3, 34–36",
      link := none, year := 2008}
  ]

  experience := [
    {startYear := 2026, endYear := none, title := "Managing AI Strategy Expert", subtitle := "Kaspi.kz (Kaspi Bank), Data Factory, Almaty",
      description := "AI strategy and hands-on statistical modelling: hypothesis-testing library and prediction pipelines for IT-monitoring alerts."},

    {startYear := 2024, endYear := some 2026, title := "Senior Research Engineer", subtitle := "HighSky (highsky.io)",
      description := "Tabular foundation models; per-feature transformer architecture with novel attention mechanisms for mixed-type data; synthetic data generation from structural causal graphs with diverse Bayesian priors; LLM evaluation (MMLU, GSM8K, HellaSwag, HumanEval); agentic multi-step reasoning systems."},

    {startYear := 2022, endYear := some 2024, title := "Senior Machine Learning Engineer", subtitle := "Delivery Hero SE",
      description := "Transformer-based representation learning for structured product data; retrieval-augmented generation (RAG) for natural language interfaces over large-scale product catalogues. Awarded \"Most Advanced Project\" at Global Search Domain Project Week, January 2023."},

    {startYear := 2019, endYear := some 2022, title := "Machine Learning Engineer", subtitle := "KCell JSC",
      description := "Sequential modelling of behavioural time series at population scale (15M+ users); RNN/LSTM architectures for socio-economic forecasting; representation learning for heterogeneous customer data; churn prediction and lifetime value estimation."},

    {startYear := 2020, endYear := some 2021, title := "Associate Professor, Computer Science", subtitle := "Suleyman Demirel University, Almaty",
      description := "Taught data science and machine learning."},

    {startYear := 2018, endYear := some 2019, title := "Postdoctoral Research Associate (EPSRC EP/R003025/1)", subtitle := "Queen Mary University of London",
      description := "Harmonic analysis for Dirac-like operators affiliated with semi-finite von Neumann algebras. Established Paley-type inequalities yielding a proof of the Hörmander multiplier theorem via quantum group Pontryagin duality."},

    {startYear := 2017, endYear := some 2018, title := "Research Associate (EPSRC EP/R003025/1)", subtitle := "Imperial College London",
      description := "Characterised Connes spectral triples on compact quantum matrix groups; established Schwartz kernel theorems and global pseudo-differential calculus on compact quantum groups."}
  ]

  education := [
    {startYear := 2014, endYear := 2018, title := "PhD in Pure Mathematics", subtitle := "Imperial College London",
      description := some "Thesis: Lp–Lq Fourier multipliers on locally compact groups (awarded 1 July 2018). Advisor: Prof. Michael Ruzhansky. Examiners: Prof. Fulvio Ricci, Prof. Ari Laptev. Novel analytical frameworks bridging Connes' noncommutative geometry with Drinfeld's quantum group theory. Funded by an EPSRC Doctoral Studentship."},

    {startYear := 2012, endYear := 2014, title := "MSc in Mathematics", subtitle := "Eurasian National University", description := none},

    {startYear := 2007, endYear := 2012, title := "Specialist in Mathematics & Computer Science — With Honours", subtitle := "Lomonosov Moscow State University",
      description := some "Diploma: Well-posed solvability of functional-differential equations with unbounded operator coefficients."}
  ]

  talks := [
    {month := "Jul", year := 2025, title := "Hörmander–Mikhlin type theorem on non-commutative spaces", subtitle := "15th ISAAC Congress, Nazarbayev University, Astana"},
    {month := "Nov", year := 2018, title := "Hörmander–Mikhlin multiplier theorems on noncommutative spaces", subtitle := "Quantum Algebras Seminar, Queen Mary University of London"},
    {month := "Apr", year := 2018, title := "Smooth dense subalgebras and Fourier multipliers on compact quantum groups", subtitle := "Laboratoire de Mathématiques de Besançon"},
    {month := "May", year := 2017, title := "Multipliers on locally compact groups", subtitle := "Recent Developments in Harmonic Analysis, MSRI (now SLMath), Berkeley"},
    {month := "Sep", year := 2016, title := "Lp–Lq bounds for pseudo-differential operators on quantum groups", subtitle := "Analysis and PDE seminar, Imperial College London"},
    {month := "Apr", year := 2015, title := "Hardy–Littlewood, Hausdorff–Young–Paley inequalities and Lp–Lq Fourier multipliers", subtitle := "10th ISAAC Congress, University of Macau"},
    {month := "Sep", year := 2014, title := "Hardy–Littlewood inequalities and Fourier multipliers", subtitle := "International Conference on Generalized Functions, University of Southampton"}
  ]

  funding := [
    {startYear := 2026, endYear := some 2028, title := "Kazakhstan Ministry of Science Grant — Principal Investigator (under review)", subtitle := "£175K · 36 months",
      description := "Fourier multipliers on non-commutative spaces and applications. Hörmander-type multiplier theorems on general von Neumann algebras, extending the Paley, Hausdorff–Young and Hardy–Littlewood inequalities to noncommutative spaces, with applications to heat semigroups and abstract Klein–Gordon equations. Planned visits to Oxford and London."},

    {startYear := 2017, endYear := some 2020, title := "EPSRC Research Grant EP/R003025/1 — PI: M. Ruzhansky", subtitle := "£500K",
      description := "I wrote the research proposal, which Prof. Ruzhansky submitted as PI. The grant funded my postdoctoral positions at Imperial College London and Queen Mary University of London (harmonic analysis in semi-finite von Neumann algebras and quantum groups)."},

    {startYear := 2017, endYear := none, title := "Doris Chen Merit Award", subtitle := "Department of Mathematics, Imperial College London",
      description := "Awarded for exceptional early promise and achievement in mathematical research."},

    {startYear := 2014, endYear := some 2018, title := "EPSRC Doctoral Studentship", subtitle := "Imperial College London", description := ""}
  ]

  teaching := [
    {startYear := 2019, endYear := none, title := "LTCC Intensive Course Lecturer", subtitle := "Methods of Noncommutative Analysis · UCL, London",
      description := "8-hour graduate course covering semi-finite von Neumann algebras, noncommutative geometry, Hörmander multiplier theorems via quantum group duality."},

    {startYear := 2020, endYear := some 2021, title := "Associate Professor, Computer Science", subtitle := "Suleyman Demirel University",
      description := "Data science and machine learning courses."},

    {startYear := 2015, endYear := some 2018, title := "Graduate Teaching Assistant", subtitle := "Imperial College London",
      description := "High Performance Computing (M3C), Data Science (M3A50), Multivariable Calculus, Analysis I & II, Algebra, Real Analysis. Joint Maths & Computing Tutor."},

    {startYear := 2018, endYear := none, title := "Reviewer", subtitle := "zbMATH Open · Junior Member, Newton Institute, Cambridge", description := ""}
  ]

  collaborators := "Prof. Michael Ruzhansky (Imperial / Ghent); Prof. Shahn Majid (QMUL); Prof. Yulia Kuznetsova (Franche-Comté); Prof. Terry Lyons FRS (Oxford); Dr Alexis Arnaudon (Imperial); Prof. Fedor Sukochev (UNSW, planned)."
}

end Profile
