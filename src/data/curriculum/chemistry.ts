import type { SubjectCurriculum } from './types';

/** REB/CBC Chemistry — units in teaching order, with term placement and topics. */
export const CHEMISTRY: SubjectCurriculum = {
  sources: {
    O: [
      { label: "REB Chemistry syllabus (Ordinary Level, S1–S3)", url: 'https://elearning.reb.rw/mod/resource/view.php?id=11339', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
    A: [
      { label: "REB Chemistry syllabus (Advanced Level, S4–S6)", url: 'https://elearning.reb.rw/mod/resource/view.php?id=11340', kind: 'syllabus' },
      { label: 'REB Chemistry syllabus S4–S6 (ANP)', url: 'https://elearning.reb.rw/mod/resource/view.php?id=10346', kind: 'course' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'handle laboratory apparatus and chemicals safely',
        'classify matter and describe its particulate nature',
        'record and interpret simple experimental observations',
      ],
      units: [
        { title: 'Introduction to chemistry and laboratory safety', term: 1, topics: ['Importance of chemistry in daily life', 'Common laboratory apparatus and uses', 'Hazard symbols and safety rules', 'Recording observations and simple reports'] },
        { title: 'Matter and its states', term: 1, topics: ['Solids, liquids and gases', 'Particulate nature of matter', 'Changes of state and heating curves', 'Diffusion and Brownian motion'] },
        { title: 'Pure substances, mixtures and separation techniques', term: 1, topics: ['Elements, compounds and mixtures', 'Filtration, evaporation and crystallisation', 'Distillation and chromatography', 'Purifying local water samples'] },
        { title: 'Physical and chemical changes', term: 2, topics: ['Features of physical changes', 'Features of chemical changes', 'Signs of a chemical reaction', 'Reversible and irreversible changes'] },
        { title: 'Air, combustion and rusting', term: 2, topics: ['Composition of air', 'Preparation and properties of oxygen', 'Combustion and burning of fuels', 'Rusting and its prevention'] },
        { title: 'Water and its treatment', term: 3, topics: ['Sources and uses of water', 'Hard and soft water', 'Water treatment steps', 'Water pollution in Rwanda'] },
        { title: 'Common materials in the environment', term: 3, topics: ['Metals and non-metals around us', 'Soil composition and testing', 'Fuels used in Rwandan homes', 'Waste management and recycling'] },
      ],
    },
    S2: {
      competences: [
        'use symbols, formulae and equations to represent reactions',
        'relate atomic structure to the periodic table',
        'carry out and interpret simple quantitative experiments',
      ],
      units: [
        { title: 'Atomic structure', term: 1, topics: ['Sub-atomic particles', 'Atomic number and mass number', 'Electron arrangement', 'Isotopes and their uses'] },
        { title: 'The periodic table', term: 1, topics: ['Arrangement of elements in periods and groups', 'Group I, II and VII properties', 'Trends across a period', 'Metals, non-metals and metalloids'] },
        { title: 'Chemical bonding', term: 1, topics: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding', 'Properties linked to bond type'] },
        { title: 'Chemical formulae and equations', term: 2, topics: ['Valency and writing formulae', 'Word and symbol equations', 'Balancing chemical equations', 'State symbols'] },
        { title: 'Acids, bases and salts', term: 2, topics: ['Properties of acids and bases', 'The pH scale and indicators', 'Neutralisation reactions', 'Preparation of soluble and insoluble salts'] },
        { title: 'Types of chemical reactions', term: 3, topics: ['Combination and decomposition', 'Displacement reactions', 'Precipitation reactions', 'Reactivity series of metals'] },
        { title: 'Chemistry of everyday products', term: 3, topics: ['Soaps and detergents', 'Fertilisers and soil pH', 'Food preservation', 'Safe handling of household chemicals'] },
      ],
    },
    S3: {
      competences: [
        'perform mole and concentration calculations',
        'explain electrolysis and energy changes in reactions',
        'link industrial chemistry to Rwandan development',
      ],
      units: [
        { title: 'The mole concept and stoichiometry', term: 1, topics: ['Relative atomic and molecular mass', 'The mole and Avogadro constant', 'Molar volume of gases', 'Reacting mass calculations'] },
        { title: 'Solutions and concentration', term: 1, topics: ['Solubility and saturated solutions', 'Concentration in g/dm3 and mol/dm3', 'Preparing standard solutions', 'Acid-base titration and calculations'] },
        { title: 'Electrochemistry and electrolysis', term: 2, topics: ['Electrolytes and non-electrolytes', 'Electrolysis of molten and aqueous compounds', 'Electrode reactions', 'Electroplating and extraction of metals'] },
        { title: 'Energy changes in reactions', term: 2, topics: ['Exothermic and endothermic reactions', 'Energy level diagrams', 'Fuels and calorific value', 'Simple enthalpy calculations'] },
        { title: 'Rates of reaction', term: 2, topics: ['Measuring rate of reaction', 'Effect of concentration and temperature', 'Effect of surface area and catalysts', 'Collision theory'] },
        { title: 'Organic chemistry: hydrocarbons', term: 3, topics: ['Alkanes, alkenes and alkynes', 'Homologous series and naming', 'Combustion of hydrocarbons', 'Alcohols and fermentation'] },
        { title: 'Industrial chemistry and the environment', term: 3, topics: ['Extraction of metals', 'Manufacture of sulphuric acid and ammonia', 'Air and water pollution control', 'Chemical industries in Rwanda'] },
      ],
    },
    S4: {
      competences: [
        'relate atomic and molecular structure to physical properties',
        'apply the mole concept to quantitative analysis',
        'plan and evaluate chemical investigations',
      ],
      units: [
        { title: 'Atomic structure and electron configuration', term: 1, topics: ['Bohr and quantum models', 's, p and d orbitals', 'Electron configuration rules', 'Ionisation energy trends'] },
        { title: 'Periodicity and periodic trends', term: 1, topics: ['Atomic and ionic radii', 'Electronegativity and electron affinity', 'Trends in oxides and chlorides', 'Anomalous properties of period 2'] },
        { title: 'Chemical bonding and molecular structure', term: 1, topics: ['Lewis structures', 'VSEPR and molecular shapes', 'Polarity and dipole moments', 'Intermolecular forces and hydrogen bonding'] },
        { title: 'Stoichiometry and quantitative chemistry', term: 2, topics: ['Empirical and molecular formulae', 'Limiting reagent and percentage yield', 'Gas laws and molar volume', 'Volumetric analysis calculations'] },
        { title: 'States of matter and gas laws', term: 2, topics: ['Kinetic theory of gases', 'Boyle, Charles and ideal gas equation', 'Real gases and deviations', 'Structure of solids and liquids'] },
        { title: 'Acids, bases and salt hydrolysis', term: 2, topics: ['Arrhenius, Bronsted-Lowry and Lewis theories', 'Strong and weak acids', 'pH, Ka and Kb calculations', 'Salt hydrolysis and buffer solutions'] },
        { title: 'Redox reactions and oxidation numbers', term: 3, topics: ['Oxidation numbers', 'Balancing redox half-equations', 'Redox titrations', 'Oxidising and reducing agents'] },
        { title: 'Introduction to organic chemistry', term: 3, topics: ['Functional groups and homologous series', 'IUPAC nomenclature', 'Isomerism', 'Reactions of alkanes and alkenes'] },
      ],
    },
    S5: {
      competences: [
        'apply equilibrium, kinetics and thermochemistry to real systems',
        'predict and explain reactions of organic functional groups',
        'analyse experimental data and calculate uncertainties',
      ],
      units: [
        { title: 'Chemical energetics and thermochemistry', term: 1, topics: ['Enthalpy changes and standard conditions', "Hess's law and enthalpy cycles", 'Bond enthalpy calculations', 'Calorimetry experiments'] },
        { title: 'Chemical kinetics', term: 1, topics: ['Rate equations and rate constants', 'Order of reaction and half-life', 'Activation energy and Arrhenius equation', 'Catalysis and reaction mechanisms'] },
        { title: 'Chemical equilibrium', term: 1, topics: ['Dynamic equilibrium', 'Kc and Kp expressions', "Le Chatelier's principle", 'Industrial equilibria: Haber and Contact processes'] },
        { title: 'Ionic equilibria and buffers', term: 2, topics: ['Solubility product and common ion effect', 'Buffer action and calculations', 'Titration curves and indicators', 'Importance of buffers in blood and soil'] },
        { title: 'Electrochemistry: cells and electrode potentials', term: 2, topics: ['Standard electrode potentials', 'Electrochemical cells and EMF', 'Faraday laws of electrolysis', 'Batteries, fuel cells and corrosion'] },
        { title: 'Alcohols, aldehydes, ketones and carboxylic acids', term: 3, topics: ['Preparation and reactions of alcohols', 'Oxidation to carbonyl compounds', 'Tests for aldehydes and ketones', 'Carboxylic acids, esters and saponification'] },
        { title: 'Halogenoalkanes and reaction mechanisms', term: 3, topics: ['Nucleophilic substitution SN1 and SN2', 'Elimination reactions', 'Uses and environmental impact of halogenoalkanes', 'Mechanism diagrams'] },
      ],
    },
    S6: {
      competences: [
        'analyse transition metal and organic chemistry in depth',
        'identify unknown substances through systematic analysis',
        'evaluate chemical processes and their impact on society',
      ],
      units: [
        { title: 'Transition metals and complex ions', term: 1, topics: ['Characteristic properties of d-block elements', 'Variable oxidation states', 'Ligands, complex ions and colour', 'Catalysis by transition metals'] },
        { title: 'Aromatic chemistry', term: 1, topics: ['Structure and stability of benzene', 'Electrophilic substitution reactions', 'Phenols and their reactions', 'Uses of aromatic compounds'] },
        { title: 'Nitrogen compounds: amines, amides and amino acids', term: 1, topics: ['Preparation and basicity of amines', 'Amides and hydrolysis', 'Amino acids and zwitterions', 'Peptides and proteins'] },
        { title: 'Polymers and macromolecules', term: 2, topics: ['Addition polymerisation', 'Condensation polymerisation', 'Properties and uses of polymers', 'Plastic waste and recycling in Rwanda'] },
        { title: 'Qualitative and quantitative analysis', term: 2, topics: ['Tests for cations and anions', 'Tests for organic functional groups', 'Gravimetric and volumetric analysis', 'Chromatography and spectroscopy basics'] },
        { title: 'Industrial and environmental chemistry', term: 3, topics: ['Extraction and refining of metals', 'Fertiliser and cement production', 'Green chemistry principles', 'Climate change and pollution control'] },
        { title: 'Practical chemistry and data analysis', term: 3, topics: ['Planning a valid investigation', 'Errors, accuracy and precision', 'Interpreting graphs and results', 'Writing conclusions and evaluations'] },
      ],
    },
  },
};
