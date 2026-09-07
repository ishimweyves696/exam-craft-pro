/**
 * REB / CBC CURRICULUM MAP  (Rwanda Basic Education Board, competence-based curriculum)
 *
 * This is the curriculum-alignment layer of the app. It answers one question:
 * "for THIS subject at THIS level, what units may an examiner legitimately
 * examine, and what competences must the paper assess?"
 *
 * The AI never chooses the syllabus. It is handed the units from here, so an
 * S2 Biology paper can never contain S6 content, and every item traces back to
 * a named curriculum unit — exactly how NESA/REB papers are built.
 *
 * Unit titles follow the REB syllabus unit headings (O-Level S1-S3,
 * A-Level S4-S6). Keep them short: they are fed to the model as topic labels
 * and shown to the teacher as selectable coverage.
 */

export interface CurriculumEntry {
  /** Competences the paper must assess (CBC "key competences"). */
  competences: string[];
  /** Syllabus units for the level, in teaching order. */
  units: string[];
}

const K = (subjectId: string, level: string) => `${subjectId}:${level}`;

export const REB_CURRICULUM: Record<string, CurriculumEntry> = {
  /* ------------------------------ BIOLOGY ------------------------------ */
  [K('biology', 'S1')]: {
    competences: [
      'use a hand lens and microscope to observe living things',
      'classify living organisms found in the local environment',
      'relate structure of cells and organs to their functions',
    ],
    units: [
      'Introduction to biology and laboratory safety',
      'Cell structure and the microscope',
      'Classification of living things',
      'Diversity of plants and animals',
      'Nutrition in plants: photosynthesis',
      'Nutrition in animals and human digestion',
      'Environment and interdependence of organisms',
    ],
  },
  [K('biology', 'S2')]: {
    competences: [
      'explain transport and gas exchange in plants and animals',
      'investigate the effect of variables on biological processes',
      'apply knowledge of health to real Rwandan communities',
    ],
    units: [
      'Cell division: mitosis',
      'Transport in plants: xylem and phloem',
      'Transport in animals: blood and circulation',
      'Gas exchange and respiration',
      'Excretion and homeostasis',
      'Support and movement',
      'Communicable diseases and immunity',
    ],
  },
  [K('biology', 'S3')]: {
    competences: [
      'explain reproduction, inheritance and variation',
      'analyse the impact of human activity on ecosystems',
      'design and interpret simple biological investigations',
    ],
    units: [
      'Coordination: nervous and endocrine systems',
      'Reproduction in plants',
      'Reproduction in humans and reproductive health',
      'Growth and development',
      'Genetics: inheritance and variation',
      'Evolution and natural selection',
      'Ecology, energy flow and conservation in Rwanda',
    ],
  },
  [K('biology', 'S4')]: {
    competences: [
      'relate cell biochemistry to physiological function',
      'use scientific methods to test biological hypotheses',
      'interpret biological data, tables and graphs',
    ],
    units: [
      'Biological molecules: carbohydrates, lipids, proteins',
      'Enzymes and factors affecting enzyme activity',
      'Cell structure, ultrastructure and organelles',
      'Cell membranes and transport (osmosis, diffusion, active transport)',
      'Cell division: mitosis and meiosis',
      'Gas exchange systems in plants, insects and mammals',
      'Transport in plants: transpiration and translocation',
      'Mammalian transport system and the heart',
    ],
  },
  [K('biology', 'S5')]: {
    competences: [
      'explain energy transfer in respiration and photosynthesis',
      'apply genetic principles to solve inheritance problems',
      'evaluate ecological data from Rwandan ecosystems',
    ],
    units: [
      'Photosynthesis: light-dependent and light-independent reactions',
      'Respiration: glycolysis, Krebs cycle, oxidative phosphorylation',
      'Nutrition and digestion in mammals',
      'Homeostasis: kidney, liver and temperature regulation',
      'Coordination: nervous impulses and hormones',
      'Genetics: Mendelian inheritance and linkage',
      'Ecology: energy flow, nutrient cycles and population dynamics',
      'Microorganisms and biotechnology',
    ],
  },
  [K('biology', 'S6')]: {
    competences: [
      'apply molecular genetics to modern biotechnology',
      'evaluate evidence for evolution and biodiversity conservation',
      'analyse and communicate experimental biological data',
    ],
    units: [
      'Molecular genetics: DNA replication, transcription, translation',
      'Gene technology and genetic engineering',
      'Variation, selection and speciation',
      'Evolution: evidence and mechanisms',
      'Immunity, disease and public health',
      'Reproduction, fertility and population control',
      'Plant and animal responses and growth regulators',
      'Conservation of biodiversity and sustainable development in Rwanda',
    ],
  },

  /* ----------------------------- CHEMISTRY ----------------------------- */
  [K('chemistry', 'S1')]: {
    competences: [
      'work safely with apparatus and chemicals',
      'classify matter and separate mixtures',
      'write and interpret simple chemical symbols',
    ],
    units: [
      'Introduction to chemistry and laboratory safety',
      'Matter: states, properties and changes',
      'Mixtures and separation techniques',
      'Elements, compounds and mixtures',
      'Atomic structure and symbols of elements',
      'Air, water and combustion',
      'Acids, bases and indicators',
    ],
  },
  [K('chemistry', 'S2')]: {
    competences: [
      'use the periodic table to predict properties',
      'write balanced chemical equations',
      'perform simple quantitative chemistry',
    ],
    units: [
      'Atomic structure and electron arrangement',
      'The periodic table and periodicity',
      'Chemical bonding: ionic and covalent',
      'Chemical formulae and balanced equations',
      'Acids, bases, salts and neutralisation',
      'Metals and non-metals and their compounds',
      'Water treatment and hardness of water',
    ],
  },
  [K('chemistry', 'S3')]: {
    competences: [
      'apply the mole concept in calculations',
      'explain redox and electrochemical processes',
      'relate chemistry to Rwandan industry and environment',
    ],
    units: [
      'The mole concept and stoichiometry',
      'Solutions, solubility and concentration',
      'Rates of reaction and factors affecting them',
      'Energy changes in reactions',
      'Oxidation and reduction; electrolysis',
      'Extraction and uses of metals',
      'Introduction to organic chemistry: hydrocarbons',
      'Industrial chemistry and environmental pollution',
    ],
  },
  [K('chemistry', 'S4')]: {
    competences: [
      'apply the mole concept to accurate quantitative work',
      'relate atomic structure and bonding to properties',
      'carry out and interpret volumetric analysis',
    ],
    units: [
      'Atomic structure, isotopes and mass spectrometry',
      'Chemical bonding and molecular shapes',
      'The mole concept, empirical formulae and stoichiometry',
      'Gas laws and the ideal gas equation',
      'Volumetric analysis: acid-base titration',
      'Energetics and enthalpy changes',
      'Periodicity of the s- and p-block elements',
      'Organic chemistry: alkanes, alkenes and alkynes',
    ],
  },
  [K('chemistry', 'S5')]: {
    competences: [
      'apply equilibrium and kinetics to industrial processes',
      'predict and explain reaction mechanisms',
      'analyse quantitative data from experiments',
    ],
    units: [
      'Chemical kinetics and reaction mechanisms',
      'Chemical equilibrium and Le Chatelier principle',
      'Acid-base equilibria, pH and buffers',
      'Solubility product and ionic equilibria',
      'Electrochemistry: electrode potentials and cells',
      'Transition metals and complex ions',
      'Alcohols, halogenoalkanes and carbonyl compounds',
      'Industrial processes: Haber and Contact processes',
    ],
  },
  [K('chemistry', 'S6')]: {
    competences: [
      'design a valid chemical investigation',
      'apply thermodynamics to predict feasibility',
      'identify organic compounds from analytical evidence',
    ],
    units: [
      'Thermodynamics: entropy and free energy',
      'Further organic chemistry: carboxylic acids and derivatives',
      'Aromatic chemistry and benzene',
      'Amines, amino acids, proteins and polymers',
      'Organic synthesis and reaction pathways',
      'Instrumental analysis and qualitative organic analysis',
      'Environmental and green chemistry',
      'Chemistry of selected industrial products in Rwanda',
    ],
  },

  /* ------------------------------ PHYSICS ------------------------------ */
  [K('physics', 'S1')]: {
    competences: [
      'measure physical quantities accurately',
      'explain everyday phenomena using physical principles',
      'use apparatus safely to investigate simple relationships',
    ],
    units: [
      'Physical quantities, units and measurement',
      'Density and pressure',
      'Forces and their effects',
      'Motion in a straight line',
      'Heat, temperature and thermal expansion',
      'Sources and forms of energy',
      'Magnetism and simple electric circuits',
    ],
  },
  [K('physics', 'S2')]: {
    competences: [
      'apply Newton laws to practical situations',
      'analyse energy transfer in machines',
      'construct and test simple electric circuits',
    ],
    units: [
      'Newton laws of motion',
      'Work, energy, power and machines',
      'Turning effect of forces and equilibrium',
      'Heat transfer and specific heat capacity',
      'Waves, sound and light',
      'Reflection and refraction of light',
      'Current electricity: Ohm law and circuits',
    ],
  },
  [K('physics', 'S3')]: {
    competences: [
      'solve quantitative problems on motion and electricity',
      'explain electromagnetic and nuclear phenomena',
      'relate physics to technology used in Rwanda',
    ],
    units: [
      'Linear motion, projectiles and circular motion',
      'Momentum and impulse',
      'Pressure in fluids and Archimedes principle',
      'Optical instruments and the eye',
      'Electromagnetism and electromagnetic induction',
      'Electrical energy, power and domestic wiring',
      'Electronics and semiconductors',
      'Radioactivity and nuclear energy',
    ],
  },
  [K('physics', 'S4')]: {
    competences: [
      'apply kinematics and dynamics to solve problems',
      'take and analyse experimental measurements with uncertainties',
      'apply thermal physics to real systems',
    ],
    units: [
      'Measurement, errors and uncertainties',
      'Kinematics: linear and projectile motion',
      'Newton laws, friction and dynamics',
      'Work, energy, power and momentum conservation',
      'Circular motion and gravitation',
      'Mechanical properties of matter',
      'Thermal physics: heat capacity and change of state',
      'Waves and wave properties',
    ],
  },
  [K('physics', 'S5')]: {
    competences: [
      'model electric and magnetic fields quantitatively',
      'analyse oscillations and wave behaviour',
      'apply the gas laws and thermodynamic principles',
    ],
    units: [
      'Simple harmonic motion and oscillations',
      'Sound waves, interference and diffraction',
      'Geometrical and physical optics',
      'Electrostatics and electric fields',
      'Capacitors and capacitance',
      'Direct current circuits and network analysis',
      'Magnetic fields and electromagnetic induction',
      'Kinetic theory of gases and thermodynamics',
    ],
  },
  [K('physics', 'S6')]: {
    competences: [
      'apply modern physics to explain atomic behaviour',
      'analyse alternating current and electronic systems',
      'evaluate energy technologies for Rwanda',
    ],
    units: [
      'Alternating current circuits and transformers',
      'Electromagnetic waves and communication systems',
      'Electronics: diodes, transistors and logic gates',
      'Photoelectric effect and quantum physics',
      'Atomic structure and energy levels',
      'Nuclear physics, fission and fusion',
      'Particle physics and radiation safety',
      'Energy sources, generation and transmission in Rwanda',
    ],
  },

  /* ---------------------------- MATHEMATICS ---------------------------- */
  [K('mathematics', 'S1')]: {
    competences: [
      'compute accurately with numbers and units',
      'model simple real-life problems with equations',
      'interpret data presented in tables and charts',
    ],
    units: [
      'Sets and number systems',
      'Operations on integers, fractions and decimals',
      'Ratio, proportion, percentage and financial mathematics',
      'Algebraic expressions and linear equations',
      'Plane geometry: angles, triangles and polygons',
      'Perimeter, area and volume',
      'Statistics: collection and representation of data',
    ],
  },
  [K('mathematics', 'S2')]: {
    competences: [
      'solve linear and simultaneous equations',
      'apply geometry and trigonometry to measurement',
      'summarise data using averages',
    ],
    units: [
      'Indices and standard form',
      'Simultaneous linear equations and inequalities',
      'Algebraic factorisation and formulae',
      'Similarity, congruence and Pythagoras theorem',
      'Introduction to trigonometric ratios',
      'Coordinate geometry: straight lines',
      'Measures of central tendency and dispersion',
      'Probability of simple events',
    ],
  },
  [K('mathematics', 'S3')]: {
    competences: [
      'solve quadratic and simultaneous problems',
      'apply trigonometry and vectors to practical tasks',
      'analyse statistical data and probability',
    ],
    units: [
      'Quadratic equations and functions',
      'Sequences and series',
      'Trigonometry: sine and cosine rules',
      'Circle geometry and theorems',
      'Vectors and transformations in the plane',
      'Matrices and their applications',
      'Statistics: grouped data, histograms and cumulative frequency',
      'Probability: combined and conditional events',
    ],
  },
  [K('mathematics', 'S4')]: {
    competences: [
      'reason logically and construct mathematical proofs',
      'work confidently with functions and their graphs',
      'apply mathematics to solve real problems',
    ],
    units: [
      'Sets, logic and proof',
      'Number theory, surds, indices and logarithms',
      'Polynomial, rational and quadratic functions',
      'Sequences, series and mathematical induction',
      'Trigonometric functions and identities',
      'Coordinate geometry: lines and circles',
      'Vectors in two and three dimensions',
      'Statistics: measures and correlation',
    ],
  },
  [K('mathematics', 'S5')]: {
    competences: [
      'differentiate and integrate to solve problems',
      'model growth and change with functions',
      'use probability distributions in decision making',
    ],
    units: [
      'Limits and continuity',
      'Differentiation and applications (rates, maxima, minima)',
      'Integration and applications (area, volume)',
      'Exponential and logarithmic functions',
      'Complex numbers',
      'Matrices, determinants and systems of equations',
      'Probability distributions: binomial and Poisson',
      'Kinematics and dynamics applications of calculus',
    ],
  },
  [K('mathematics', 'S6')]: {
    competences: [
      'solve advanced calculus and differential equations',
      'model three-dimensional geometry problems',
      'interpret statistical inference results',
    ],
    units: [
      'Advanced techniques of integration',
      'Differential equations and modelling',
      'Maclaurin and Taylor series approximations',
      'Three-dimensional geometry: lines and planes',
      'Conic sections and parametric equations',
      'Linear programming and optimisation',
      'Normal distribution and statistical inference',
      'Numerical methods and approximation',
    ],
  },

  /* ------------------------------ ENGLISH ------------------------------ */
  [K('english', 'S1')]: {
    competences: [
      'read short texts for literal and inferential meaning',
      'use basic tenses and sentence patterns accurately',
      'write short guided compositions',
    ],
    units: [
      'Reading comprehension of short narrative texts',
      'Vocabulary in context: synonyms and antonyms',
      'Present, past and future tenses',
      'Nouns, pronouns, articles and adjectives',
      'Sentence types and punctuation',
      'Guided writing: personal letters and descriptions',
      'Listening and speaking: introductions and daily routines',
    ],
  },
  [K('english', 'S2')]: {
    competences: [
      'summarise texts in own words',
      'transform sentence structures correctly',
      'write informal and formal letters',
    ],
    units: [
      'Reading comprehension and summary writing',
      'Word formation: prefixes, suffixes and collocations',
      'Perfect and continuous tenses',
      'Active and passive voice',
      'Direct and indirect speech',
      'Conjunctions, relative clauses and connectors',
      'Composition: narrative and descriptive writing',
      'Formal and informal letters',
    ],
  },
  [K('english', 'S3')]: {
    competences: [
      'analyse texts for purpose, tone and audience',
      'use complex structures and register appropriately',
      'produce coherent argumentative writing',
    ],
    units: [
      'Comprehension of expository and argumentative texts',
      'Summary and note-making',
      'Sentence transformation and conditionals',
      'Reported speech and modal verbs',
      'Figures of speech and literary appreciation',
      'Idiomatic expressions and proverbs',
      'Argumentative and expository composition',
      'Functional writing: reports, notices and CVs',
    ],
  },
  [K('english', 'S4')]: {
    competences: [
      'read critically for argument and evidence',
      'control grammar, register and cohesion in writing',
      'appreciate literary texts',
    ],
    units: [
      'Advanced reading comprehension and inference',
      'Summary writing and paraphrase',
      'Grammar: tense consistency, agreement and voice',
      'Sentence transformation and clause analysis',
      'Vocabulary development and figurative language',
      'Literature: prose, poetry and drama appreciation',
      'Composition: argumentative and discursive essays',
      'Functional writing: formal letters, reports and speeches',
    ],
  },
  [K('english', 'S5')]: {
    competences: [
      'evaluate texts and arguments critically',
      'write sustained coherent essays',
      'analyse literary devices and themes',
    ],
    units: [
      'Critical reading and text analysis',
      'Summary, précis and synthesis of sources',
      'Advanced grammar and error correction',
      'Style, register and rhetorical devices',
      'Literature: themes, characterisation and style',
      'Debate, discussion and oral presentation',
      'Essay writing: argumentative, expository, narrative',
      'Media literacy and report writing',
    ],
  },
  [K('english', 'S6')]: {
    competences: [
      'synthesise information from multiple texts',
      'write for defined purposes and audiences with accuracy',
      'produce reasoned literary criticism',
    ],
    units: [
      'Comprehension and critical evaluation of complex texts',
      'Summary and synthesis under time constraints',
      'Error correction and language accuracy',
      'Sentence transformation and advanced structures',
      'Literary criticism: prose, poetry and drama',
      'Rhetoric, persuasion and public speaking',
      'Extended essay and creative writing',
      'Professional writing: applications, proposals and reports',
    ],
  },

  /* -------------------------- ENTREPRENEURSHIP ------------------------- */
  [K('entrepreneurship', 'S1')]: {
    competences: [
      'identify business opportunities in the local community',
      'distinguish needs from wants in economic decisions',
      'demonstrate basic entrepreneurial attitudes',
    ],
    units: [
      'Introduction to entrepreneurship and the entrepreneur',
      'Business and economic environment in Rwanda',
      'Needs, wants and scarcity',
      'Forms of business ownership',
      'Business opportunities and ideas generation',
      'Basic marketing: the product and the customer',
      'Personal savings and financial discipline',
    ],
  },
  [K('entrepreneurship', 'S2')]: {
    competences: [
      'generate and screen business ideas',
      'prepare simple business records',
      'apply marketing principles to a small business',
    ],
    units: [
      'Business idea generation and feasibility',
      'Business plan components',
      'Marketing mix: product, price, place, promotion',
      'Book-keeping: source documents and cash book',
      'Cost, revenue and profit',
      'Business communication and customer care',
      'Cooperatives and savings groups in Rwanda',
    ],
  },
  [K('entrepreneurship', 'S3')]: {
    competences: [
      'draft a viable business plan',
      'interpret basic financial statements',
      'evaluate risks facing small businesses',
    ],
    units: [
      'Entrepreneurial competences and creativity',
      'Business plan preparation and presentation',
      'Financial statements: trading, profit and loss, balance sheet',
      'Sources of business finance and credit',
      'Business risks, insurance and mitigation',
      'Taxation and business regulation in Rwanda',
      'Business ethics and social responsibility',
      'Trade: local, regional and international',
    ],
  },
  [K('entrepreneurship', 'S4')]: {
    competences: [
      'analyse markets and competition',
      'manage business resources effectively',
      'prepare and interpret financial records',
    ],
    units: [
      'Entrepreneurship, innovation and creativity',
      'Business environment analysis (SWOT, PESTLE)',
      'Market research and market segmentation',
      'Business organisation and management functions',
      'Human resource management in small business',
      'Book-keeping and final accounts',
      'Costing, pricing and break-even analysis',
      'Business support institutions in Rwanda',
    ],
  },
  [K('entrepreneurship', 'S5')]: {
    competences: [
      'appraise business projects financially',
      'develop a marketing strategy',
      'apply management principles to operations',
    ],
    units: [
      'Business planning and project appraisal',
      'Sources and management of business finance',
      'Working capital and cash flow management',
      'Marketing strategy and branding',
      'Production, operations and quality management',
      'Financial ratios and performance analysis',
      'Business law, contracts and insurance',
      'Entrepreneurship and national development',
    ],
  },
  [K('entrepreneurship', 'S6')]: {
    competences: [
      'evaluate business performance and growth strategies',
      'manage risk, tax and compliance obligations',
      'defend an investment decision with evidence',
    ],
    units: [
      'Business growth strategies and expansion',
      'Investment appraisal and decision making',
      'Financial management and budgeting',
      'Taxation, compliance and business records',
      'International trade, EAC and AfCFTA opportunities',
      'Digital business, e-commerce and technology',
      'Corporate governance, ethics and sustainability',
      'Case analysis of Rwandan enterprises',
    ],
  },
};

/** Generic fallback so an unmapped subject/level never breaks the pipeline. */
const FALLBACK: CurriculumEntry = {
  competences: [
    'apply subject knowledge to familiar Rwandan contexts',
    'interpret information presented in text, tables and diagrams',
    'communicate reasoning clearly and accurately',
  ],
  units: [
    'core concepts and definitions',
    'processes and mechanisms',
    'classification and structure',
    'applications in everyday Rwandan life',
    'problem solving and interpretation of data',
    'practical work and investigation',
  ],
};

export function curriculumFor(subjectId: string, level: string): CurriculumEntry {
  return REB_CURRICULUM[K(subjectId, level)] ?? FALLBACK;
}

/** Units for a subject/level — the selectable coverage shown to the teacher. */
export function unitsFor(subjectId: string, level: string): string[] {
  return curriculumFor(subjectId, level).units;
}

/**
 * Resolve the units a paper should cover: the teacher's selection filtered to
 * the level's syllabus, or the whole syllabus when nothing is selected.
 */
export function resolveUnits(
  subjectId: string,
  level: string,
  selected: string[] | undefined,
): string[] {
  const all = unitsFor(subjectId, level);
  if (!selected?.length) return all;
  const picked = all.filter((u) => selected.includes(u));
  return picked.length ? picked : all;
}
