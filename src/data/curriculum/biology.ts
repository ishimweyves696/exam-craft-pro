import type { SubjectCurriculum } from './types';

/** REB/CBC Biology — units in teaching order, with term placement and topics. */
export const BIOLOGY: SubjectCurriculum = {
  sources: {
    O: [
      { label: 'REB Biology syllabus (Ordinary Level, S1–S3)', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'syllabus' },
      { label: 'REB e-learning: S2 Biology resources', url: 'https://elearning.reb.rw/mod/folder/view.php?id=2934', kind: 'course' },
    ],
    A: [
      { label: 'REB Biology syllabus S4–S6 (PDF)', url: 'https://elearning.reb.rw/pluginfile.php/84792/mod_resource/content/1/ANP-Biology-S4-SYLLABUS.pdf', kind: 'syllabus' },
      { label: 'REB Biology S4 student book (PDF)', url: 'https://elearning.reb.rw/pluginfile.php/10666/mod_resource/content/1/Biology%20S4%20%20SB.pdf', kind: 'course' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'use a hand lens and microscope to observe living things',
        'classify living organisms found in the local environment',
        'relate structure of cells and organs to their functions',
      ],
      units: [
        { title: 'Introduction to biology and laboratory safety', term: 1, topics: ['Branches and importance of biology', 'Laboratory apparatus and their uses', 'Safety rules and first aid', 'Scientific method and recording observations'] },
        { title: 'Cell structure and the microscope', term: 1, topics: ['Parts and use of the light microscope', 'Plant and animal cell structure', 'Functions of cell organelles', 'Preparing and drawing slides'] },
        { title: 'Classification of living things', term: 1, topics: ['Characteristics of living things', 'Kingdoms of living organisms', 'Use of dichotomous keys', 'Binomial nomenclature'] },
        { title: 'Diversity of plants and animals', term: 2, topics: ['Groups of plants: mosses, ferns, seed plants', 'Invertebrate groups', 'Vertebrate classes', 'Adaptations to habitats in Rwanda'] },
        { title: 'Nutrition in plants: photosynthesis', term: 2, topics: ['Leaf structure and adaptation', 'Requirements and products of photosynthesis', 'Testing a leaf for starch', 'Importance of photosynthesis'] },
        { title: 'Nutrition in animals and human digestion', term: 3, topics: ['Classes of food and balanced diet', 'Food tests', 'Human alimentary canal and enzymes', 'Deficiency diseases and malnutrition'] },
        { title: 'Environment and interdependence of organisms', term: 3, topics: ['Habitat, population and community', 'Food chains and food webs', 'Human impact on the local environment', 'Conservation practices'] },
      ],
    },
    S2: {
      competences: [
        'explain transport and gas exchange in plants and animals',
        'investigate the effect of variables on biological processes',
        'apply knowledge of health to real Rwandan communities',
      ],
      units: [
        { title: 'Cell division: mitosis', term: 1, topics: ['Chromosomes and the cell cycle', 'Stages of mitosis', 'Importance of mitosis in growth and repair', 'Observing mitosis in root tips'] },
        { title: 'Transport in plants: xylem and phloem', term: 1, topics: ['Root hair and water uptake', 'Structure of xylem and phloem', 'Transpiration and factors affecting it', 'Translocation of food'] },
        { title: 'Transport in animals: blood and circulation', term: 1, topics: ['Composition and functions of blood', 'Blood groups and transfusion', 'Structure of the heart and blood vessels', 'Circulation pathways'] },
        { title: 'Gas exchange and respiration', term: 2, topics: ['Gas exchange surfaces in plants and animals', 'The human breathing system', 'Aerobic and anaerobic respiration', 'Effects of smoking and air pollution'] },
        { title: 'Excretion and homeostasis', term: 2, topics: ['Excretory organs and products', 'Structure of the kidney and nephron', 'Skin and temperature regulation', 'Water balance'] },
        { title: 'Support and movement', term: 3, topics: ['Support in plants', 'The human skeleton and joints', 'Muscles and antagonistic action', 'Locomotion in animals'] },
        { title: 'Communicable diseases and immunity', term: 3, topics: ['Pathogens and transmission', 'Malaria, tuberculosis and HIV/AIDS in Rwanda', 'Body defences and immunity', 'Vaccination and prevention'] },
      ],
    },
    S3: {
      competences: [
        'explain reproduction, inheritance and variation',
        'analyse the impact of human activity on ecosystems',
        'design and interpret simple biological investigations',
      ],
      units: [
        { title: 'Coordination: nervous and endocrine systems', term: 1, topics: ['Neurones and the reflex arc', 'Central and peripheral nervous system', 'The eye and the ear', 'Hormones and their effects'] },
        { title: 'Reproduction in plants', term: 1, topics: ['Structure of a flower', 'Pollination and fertilisation', 'Seed and fruit formation', 'Germination and its conditions'] },
        { title: 'Reproduction in humans and reproductive health', term: 1, topics: ['Male and female reproductive systems', 'Menstrual cycle and fertilisation', 'Pregnancy and birth', 'Family planning and sexually transmitted infections'] },
        { title: 'Growth and development', term: 2, topics: ['Measuring growth', 'Growth curves and patterns', 'Metamorphosis in insects', 'Factors affecting growth'] },
        { title: 'Genetics: inheritance and variation', term: 2, topics: ['DNA, genes and chromosomes', 'Monohybrid inheritance and Punnett squares', 'Sex determination and sex-linked traits', 'Continuous and discontinuous variation'] },
        { title: 'Evolution and natural selection', term: 3, topics: ['Evidence for evolution', 'Natural selection and adaptation', 'Selective breeding', 'Antibiotic and pesticide resistance'] },
        { title: 'Ecology, energy flow and conservation in Rwanda', term: 3, topics: ['Ecosystem structure and energy flow', 'Nutrient cycles', 'Pollution and land degradation', 'National parks and biodiversity conservation'] },
      ],
    },
    S4: {
      competences: [
        'relate cell biochemistry to physiological function',
        'use scientific methods to test biological hypotheses',
        'interpret biological data, tables and graphs',
      ],
      units: [
        { title: 'Biological molecules: carbohydrates, lipids, proteins', term: 1, topics: ['Monosaccharides, disaccharides and polysaccharides', 'Lipid structure and roles', 'Amino acids and protein structure', 'Biochemical tests for food substances'] },
        { title: 'Enzymes and factors affecting enzyme activity', term: 1, topics: ['Enzyme structure and specificity', 'Lock-and-key and induced fit models', 'Effect of temperature, pH and concentration', 'Enzyme inhibitors and industrial uses'] },
        { title: 'Cell structure, ultrastructure and organelles', term: 1, topics: ['Prokaryotic and eukaryotic cells', 'Organelle structure and function', 'Electron microscopy and magnification calculations', 'Cell specialisation'] },
        { title: 'Cell membranes and transport (osmosis, diffusion, active transport)', term: 2, topics: ['Fluid mosaic model', 'Diffusion, facilitated diffusion and osmosis', 'Water potential calculations', 'Active transport, endocytosis and exocytosis'] },
        { title: 'Cell division: mitosis and meiosis', term: 2, topics: ['The cell cycle and its control', 'Stages of mitosis', 'Stages of meiosis and crossing over', 'Significance of meiosis in variation'] },
        { title: 'Gas exchange systems in plants, insects and mammals', term: 2, topics: ['Features of efficient exchange surfaces', 'Stomata and leaf gas exchange', 'Tracheal system in insects', 'Mammalian lungs and ventilation'] },
        { title: 'Transport in plants: transpiration and translocation', term: 3, topics: ['Structure of xylem and phloem', 'Cohesion-tension theory', 'Factors affecting transpiration rate', 'Mass flow hypothesis'] },
        { title: 'Mammalian transport system and the heart', term: 3, topics: ['Cardiac structure and the cardiac cycle', 'Control of heartbeat', 'Blood vessels and blood pressure', 'Haemoglobin and oxygen dissociation curves'] },
      ],
    },
    S5: {
      competences: [
        'explain energy transfer in respiration and photosynthesis',
        'apply genetic principles to solve inheritance problems',
        'evaluate ecological data from Rwandan ecosystems',
      ],
      units: [
        { title: 'Photosynthesis: light-dependent and light-independent reactions', term: 1, topics: ['Chloroplast structure and pigments', 'Light-dependent reactions and photophosphorylation', 'The Calvin cycle', 'Limiting factors and crop yield'] },
        { title: 'Respiration: glycolysis, Krebs cycle, oxidative phosphorylation', term: 1, topics: ['Glycolysis', 'Link reaction and Krebs cycle', 'Electron transport chain and ATP yield', 'Anaerobic respiration and respiratory quotient'] },
        { title: 'Nutrition and digestion in mammals', term: 1, topics: ['Digestive enzymes and their sites of action', 'Absorption in the ileum', 'Role of the liver', 'Diet-related disorders'] },
        { title: 'Homeostasis: kidney, liver and temperature regulation', term: 2, topics: ['Ultrafiltration and selective reabsorption', 'Osmoregulation and ADH', 'Liver functions and deamination', 'Thermoregulation and negative feedback'] },
        { title: 'Coordination: nervous impulses and hormones', term: 2, topics: ['Resting and action potentials', 'Synaptic transmission', 'Endocrine glands and hormone action', 'Blood glucose regulation'] },
        { title: 'Genetics: Mendelian inheritance and linkage', term: 2, topics: ['Monohybrid and dihybrid crosses', 'Test crosses and probability', 'Linkage and crossing over', 'Multiple alleles and blood groups'] },
        { title: 'Ecology: energy flow, nutrient cycles and population dynamics', term: 3, topics: ['Trophic levels and ecological pyramids', 'Carbon and nitrogen cycles', 'Population growth curves and sampling', 'Succession and human impact'] },
        { title: 'Microorganisms and biotechnology', term: 3, topics: ['Structure of bacteria, fungi and viruses', 'Culturing microorganisms aseptically', 'Fermentation and food production', 'Biotechnology in agriculture and medicine'] },
      ],
    },
    S6: {
      competences: [
        'apply molecular genetics to modern biotechnology',
        'evaluate evidence for evolution and biodiversity conservation',
        'analyse and communicate experimental biological data',
      ],
      units: [
        { title: 'Molecular genetics: DNA replication, transcription, translation', term: 1, topics: ['DNA and RNA structure', 'Semi-conservative replication', 'Transcription and the genetic code', 'Translation and protein synthesis'] },
        { title: 'Gene technology and genetic engineering', term: 1, topics: ['Restriction enzymes, plasmids and vectors', 'PCR and gel electrophoresis', 'Genetically modified organisms', 'Ethical issues in gene technology'] },
        { title: 'Variation, selection and speciation', term: 1, topics: ['Sources of variation', 'Hardy-Weinberg principle', 'Types of natural selection', 'Isolation mechanisms and speciation'] },
        { title: 'Evolution: evidence and mechanisms', term: 2, topics: ['Fossil, anatomical and molecular evidence', 'Darwinian and modern synthesis', 'Artificial selection', 'Human evolution'] },
        { title: 'Immunity, disease and public health', term: 2, topics: ['Non-specific and specific defences', 'Humoral and cell-mediated immunity', 'Vaccination programmes in Rwanda', 'Antibiotics and emerging diseases'] },
        { title: 'Reproduction, fertility and population control', term: 2, topics: ['Gametogenesis', 'Hormonal control of reproduction', 'Infertility and assisted reproduction', 'Population structure and family planning'] },
        { title: 'Plant and animal responses and growth regulators', term: 3, topics: ['Tropisms and plant hormones', 'Auxins, gibberellins and commercial use', 'Animal behaviour and responses', 'Control of flowering and germination'] },
        { title: 'Conservation of biodiversity and sustainable development in Rwanda', term: 3, topics: ['Measuring biodiversity and indices', 'Threats to Rwandan ecosystems', 'Conservation strategies and protected areas', 'Sustainable agriculture and ecotourism'] },
      ],
    },
  },
};
