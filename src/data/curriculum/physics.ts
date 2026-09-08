import type { SubjectCurriculum } from './types';

/** REB/CBC Physics — units in teaching order, with term placement and topics. */
export const PHYSICS: SubjectCurriculum = {
  sources: {
    O: [
      { label: "REB Physics syllabus (Ordinary Level, S1–S3)", url: 'https://elearning.reb.rw/mod/resource/view.php?id=11028', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
    A: [
      { label: 'REB Physics syllabus S4–S6', url: 'https://elearning.reb.rw/mod/resource/view.php?id=10345', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'measure physical quantities accurately with suitable instruments',
        'describe forces and simple machines in daily life',
        'record and present experimental results',
      ],
      units: [
        { title: 'Introduction to physics and measurement', term: 1, topics: ['Branches and importance of physics', 'SI units and prefixes', 'Measuring length, mass, time and volume', 'Errors and accuracy in measurement'] },
        { title: 'Density and states of matter', term: 1, topics: ['Particle arrangement in solids, liquids and gases', 'Determining density of regular and irregular objects', 'Relative density', 'Applications of density'] },
        { title: 'Forces and their effects', term: 1, topics: ['Types of forces', 'Measuring force with a spring balance', 'Weight and mass', 'Friction and its effects'] },
        { title: 'Simple machines', term: 2, topics: ['Levers and classes of levers', 'Pulleys and inclined planes', 'Mechanical advantage and velocity ratio', 'Efficiency of machines'] },
        { title: 'Heat and temperature', term: 2, topics: ['Difference between heat and temperature', 'Thermometers and temperature scales', 'Expansion of solids, liquids and gases', 'Conduction, convection and radiation'] },
        { title: 'Light and reflection', term: 3, topics: ['Sources and propagation of light', 'Shadows and eclipses', 'Reflection at plane mirrors', 'Image formation and uses of mirrors'] },
        { title: 'Sources of energy in Rwanda', term: 3, topics: ['Forms of energy', 'Renewable and non-renewable sources', 'Energy transformations', 'Energy conservation at home and school'] },
      ],
    },
    S2: {
      competences: [
        'apply the laws of motion and energy to solve problems',
        'construct and analyse simple electric circuits',
        'explain wave behaviour in sound and light',
      ],
      units: [
        { title: 'Motion in a straight line', term: 1, topics: ['Distance, displacement, speed and velocity', 'Acceleration', 'Distance-time and velocity-time graphs', 'Equations of uniformly accelerated motion'] },
        { title: 'Force, work, energy and power', term: 1, topics: ["Newton's laws of motion", 'Work done and energy transfer', 'Kinetic and potential energy', 'Power and efficiency calculations'] },
        { title: 'Pressure in solids, liquids and gases', term: 2, topics: ['Pressure in solids', 'Pressure in liquids and manometers', 'Atmospheric pressure and barometers', 'Hydraulic machines and Pascal principle'] },
        { title: 'Thermal physics: heat transfer and expansion', term: 2, topics: ['Specific heat capacity', 'Latent heat and change of state', 'Thermal expansion applications', 'Evaporation and cooling'] },
        { title: 'Waves and sound', term: 2, topics: ['Transverse and longitudinal waves', 'Wave properties: frequency, wavelength, speed', 'Production and transmission of sound', 'Echoes and speed of sound'] },
        { title: 'Refraction and lenses', term: 3, topics: ['Refraction of light and refractive index', 'Total internal reflection', 'Converging and diverging lenses', 'The human eye and optical instruments'] },
        { title: 'Current electricity and simple circuits', term: 3, topics: ['Current, voltage and resistance', "Ohm's law", 'Series and parallel circuits', 'Electrical safety in the home'] },
      ],
    },
    S3: {
      competences: [
        'analyse electrical and magnetic phenomena quantitatively',
        'apply physics principles to technology used in Rwanda',
        'design and evaluate experiments with control of variables',
      ],
      units: [
        { title: 'Electric circuits and electrical energy', term: 1, topics: ['Resistors in series and parallel', 'Electromotive force and internal resistance', 'Electrical power and energy cost', 'Fuses, earthing and circuit breakers'] },
        { title: 'Magnetism and electromagnetism', term: 1, topics: ['Magnetic fields and field lines', 'Magnetic effect of an electric current', 'Electromagnets and their uses', 'The motor effect'] },
        { title: 'Electromagnetic induction and transformers', term: 2, topics: ["Faraday's and Lenz's laws", 'AC generators', 'Transformers and turns ratio', 'Transmission of electricity in Rwanda'] },
        { title: 'Static electricity', term: 2, topics: ['Charging by friction and induction', 'Electric fields', 'The gold-leaf electroscope', 'Lightning and lightning conductors'] },
        { title: 'Momentum and circular motion', term: 2, topics: ['Linear momentum and impulse', 'Conservation of momentum', 'Collisions', 'Uniform circular motion'] },
        { title: 'Modern physics: atoms and radioactivity', term: 3, topics: ['Structure of the atom', 'Types of radiation and their properties', 'Half-life and decay', 'Uses and hazards of radioactivity'] },
        { title: 'Electronics and communication', term: 3, topics: ['Conductors, insulators and semiconductors', 'Diodes and rectification', 'Logic gates', 'Radio, mobile and satellite communication'] },
      ],
    },
    S4: {
      competences: [
        'solve mechanics problems using vectors and Newtonian laws',
        'apply thermodynamic principles to physical systems',
        'measure, tabulate and graph experimental data correctly',
      ],
      units: [
        { title: 'Physical quantities, units and dimensional analysis', term: 1, topics: ['Base and derived units', 'Dimensional analysis and homogeneity', 'Significant figures and uncertainties', 'Scalars and vectors'] },
        { title: 'Kinematics and projectile motion', term: 1, topics: ['Equations of motion', 'Relative velocity', 'Projectile motion equations', 'Graphical analysis of motion'] },
        { title: 'Newtonian mechanics and dynamics', term: 1, topics: ["Newton's laws applied to connected bodies", 'Friction and inclined planes', 'Momentum and impulse', 'Conservation laws in collisions'] },
        { title: 'Work, energy, power and machines', term: 2, topics: ['Work-energy theorem', 'Conservation of mechanical energy', 'Power and efficiency', 'Energy in real machines'] },
        { title: 'Equilibrium of forces and moments', term: 2, topics: ['Moment of a force and couples', 'Conditions for equilibrium', 'Centre of gravity and stability', 'Structures and frameworks'] },
        { title: 'Circular motion and gravitation', term: 2, topics: ['Angular velocity and centripetal force', 'Banked tracks and conical pendulum', 'Newton law of universal gravitation', 'Satellites and orbital motion'] },
        { title: 'Thermal physics and gas laws', term: 3, topics: ['Kinetic theory of gases', 'Ideal gas equation', 'Heat capacity and latent heat', 'First law of thermodynamics'] },
        { title: 'Properties of matter: elasticity and fluids', term: 3, topics: ["Hooke's law and Young modulus", 'Surface tension and capillarity', 'Viscosity and terminal velocity', 'Fluid flow and Bernoulli principle'] },
      ],
    },
    S5: {
      competences: [
        'analyse oscillations, waves and optical systems mathematically',
        'apply circuit theory to DC and AC networks',
        'evaluate the accuracy and validity of experimental results',
      ],
      units: [
        { title: 'Simple harmonic motion and oscillations', term: 1, topics: ['SHM equations and graphs', 'Pendulum and mass-spring systems', 'Energy in SHM', 'Damping, forced oscillation and resonance'] },
        { title: 'Wave motion and superposition', term: 1, topics: ['Progressive and stationary waves', 'Interference and path difference', 'Diffraction and the diffraction grating', 'Polarisation of light'] },
        { title: 'Sound waves and acoustics', term: 1, topics: ['Speed of sound in media', 'Beats and the Doppler effect', 'Resonance in pipes and strings', 'Intensity and the decibel scale'] },
        { title: 'Geometrical optics and optical instruments', term: 2, topics: ['Refraction and total internal reflection', 'Thin lens and mirror formulae', 'Optical instruments and magnification', 'Defects of vision and their correction'] },
        { title: 'Electrostatics and capacitance', term: 2, topics: ["Coulomb's law and electric fields", 'Electric potential and potential energy', 'Capacitors in series and parallel', 'Energy stored in a capacitor'] },
        { title: 'Direct current circuits and network analysis', term: 3, topics: ["Kirchhoff's laws", 'Potential dividers and the potentiometer', 'Wheatstone bridge', 'Internal resistance measurements'] },
        { title: 'Magnetic fields and electromagnetic induction', term: 3, topics: ['Force on a current-carrying conductor', 'Magnetic flux density and flux linkage', 'Induced EMF and eddy currents', 'Self and mutual inductance'] },
      ],
    },
    S6: {
      competences: [
        'apply modern physics concepts to atomic and nuclear phenomena',
        'analyse AC circuits and electronic components',
        'design investigations and evaluate uncertainty rigorously',
      ],
      units: [
        { title: 'Alternating current circuits', term: 1, topics: ['RMS and peak values', 'Reactance of capacitors and inductors', 'RLC series circuits and resonance', 'Power factor and transformers'] },
        { title: 'Electromagnetic waves and communication systems', term: 1, topics: ['The electromagnetic spectrum', 'Production and detection of EM waves', 'Modulation: AM and FM', 'Optical fibre and satellite communication'] },
        { title: 'Photoelectric effect and quantum physics', term: 1, topics: ['Photon energy and work function', 'Einstein photoelectric equation', 'Wave-particle duality and de Broglie', 'X-ray production and uses'] },
        { title: 'Atomic structure and spectra', term: 2, topics: ['Rutherford and Bohr models', 'Energy levels and line spectra', 'Excitation and ionisation', 'Lasers and their applications'] },
        { title: 'Nuclear physics and radioactivity', term: 2, topics: ['Nuclear binding energy and mass defect', 'Radioactive decay law and half-life', 'Fission and fusion', 'Radiation safety and medical uses'] },
        { title: 'Electronics and semiconductors', term: 3, topics: ['Intrinsic and extrinsic semiconductors', 'p-n junction diodes and rectifiers', 'Transistors as switches and amplifiers', 'Logic gates and digital circuits'] },
        { title: 'Experimental physics and data analysis', term: 3, topics: ['Planning and controlling variables', 'Graph plotting and gradient analysis', 'Uncertainty propagation', 'Drawing valid conclusions'] },
      ],
    },
  },
};
