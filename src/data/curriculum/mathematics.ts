import type { SubjectCurriculum } from './types';

/** REB/CBC Mathematics — units in teaching order, with term placement and topics. */
export const MATHEMATICS: SubjectCurriculum = {
  sources: {
    O: [
      { label: "REB Mathematics syllabus (Ordinary Level, S1–S3)", url: 'https://elearning.reb.rw/mod/resource/view.php?id=10573', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
    A: [
      { label: 'REB Mathematics Core syllabus (Advanced Level)', url: 'https://elearning.reb.rw/mod/resource/view.php?id=4737', kind: 'syllabus' },
      { label: 'REB Subsidiary Mathematics syllabus S4–S6', url: 'https://elearning.reb.rw/mod/resource/view.php?id=10467', kind: 'course' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'perform operations with whole numbers, fractions and decimals',
        'solve simple equations and interpret basic statistics',
        'construct and measure basic geometrical figures',
      ],
      units: [
        { title: 'Sets and number systems', term: 1, topics: ['Set notation and Venn diagrams', 'Natural numbers and integers', 'Operations on integers', 'Number patterns and sequences'] },
        { title: 'Fractions, decimals and percentages', term: 1, topics: ['Equivalent fractions and ordering', 'Operations with fractions and decimals', 'Percentage of a quantity', 'Percentage increase and decrease'] },
        { title: 'Ratio, proportion and everyday arithmetic', term: 1, topics: ['Ratio and sharing in a given ratio', 'Direct and inverse proportion', 'Profit, loss and discount', 'Simple interest and currency exchange'] },
        { title: 'Algebraic expressions and linear equations', term: 2, topics: ['Forming and simplifying expressions', 'Expansion and factorisation', 'Solving linear equations', 'Word problems as equations'] },
        { title: 'Plane geometry: points, lines and angles', term: 2, topics: ['Types of angles', 'Angles on parallel lines', 'Triangles and their properties', 'Quadrilaterals and polygons'] },
        { title: 'Perimeter, area and volume', term: 3, topics: ['Perimeter and area of plane figures', 'Circumference and area of a circle', 'Volume of prisms and cylinders', 'Units and conversions'] },
        { title: 'Statistics: collecting and displaying data', term: 3, topics: ['Data collection and tally tables', 'Bar charts and pictograms', 'Pie charts', 'Mean, mode and median of ungrouped data'] },
      ],
    },
    S2: {
      competences: [
        'manipulate algebraic expressions confidently',
        'apply Pythagoras and trigonometric ratios',
        'interpret and represent data graphically',
      ],
      units: [
        { title: 'Indices, roots and standard form', term: 1, topics: ['Laws of indices', 'Square and cube roots', 'Standard form calculations', 'Approximation and significant figures'] },
        { title: 'Algebraic fractions and formulae', term: 1, topics: ['Simplifying algebraic fractions', 'Operations with algebraic fractions', 'Changing the subject of a formula', 'Substitution in formulae'] },
        { title: 'Simultaneous linear equations and inequalities', term: 1, topics: ['Substitution and elimination methods', 'Graphical solution', 'Linear inequalities on a number line', 'Word problems'] },
        { title: 'Cartesian plane and linear graphs', term: 2, topics: ['Coordinates and plotting points', 'Gradient and intercept', 'Equation of a straight line', 'Parallel and perpendicular lines'] },
        { title: 'Pythagoras theorem and trigonometric ratios', term: 2, topics: ['Pythagoras theorem and its converse', 'Sine, cosine and tangent ratios', 'Angles of elevation and depression', 'Solving right-angled triangles'] },
        { title: 'Transformations and symmetry', term: 3, topics: ['Reflection and rotation', 'Translation and enlargement', 'Line and rotational symmetry', 'Congruence and similarity'] },
        { title: 'Statistics and elementary probability', term: 3, topics: ['Grouped frequency tables', 'Histograms and frequency polygons', 'Measures of central tendency', 'Simple probability of single events'] },
      ],
    },
    S3: {
      competences: [
        'solve quadratic equations and model with functions',
        'apply circle geometry and mensuration',
        'analyse grouped data and probability of combined events',
      ],
      units: [
        { title: 'Quadratic expressions and equations', term: 1, topics: ['Factorising quadratics', 'Completing the square', 'The quadratic formula', 'Quadratic graphs and roots'] },
        { title: 'Relations, functions and mappings', term: 1, topics: ['Domain and range', 'Function notation', 'Composite and inverse functions', 'Graphs of linear and quadratic functions'] },
        { title: 'Sequences and series', term: 2, topics: ['Arithmetic progressions', 'Geometric progressions', 'Sum of AP and GP', 'Applications to savings and loans'] },
        { title: 'Circle geometry', term: 2, topics: ['Parts of a circle', 'Angle properties of circles', 'Cyclic quadrilaterals', 'Tangent properties'] },
        { title: 'Mensuration of solids', term: 2, topics: ['Surface area of solids', 'Volume of pyramids, cones and spheres', 'Compound solids', 'Real-life measurement problems'] },
        { title: 'Vectors and matrices', term: 3, topics: ['Vector notation and operations', 'Magnitude and direction', 'Matrix operations', 'Determinant, inverse and solving equations'] },
        { title: 'Statistics and probability', term: 3, topics: ['Cumulative frequency and ogives', 'Quartiles and interquartile range', 'Standard deviation', 'Probability of combined events and tree diagrams'] },
      ],
    },
    S4: {
      competences: [
        'reason logically and use set theory and algebra of numbers',
        'apply trigonometry and analytic geometry to solve problems',
        'differentiate simple functions and interpret results',
      ],
      units: [
        { title: 'Logic, sets and problems on sets', term: 1, topics: ['Propositional logic and truth tables', 'Set operations and Venn diagrams', 'Cardinality problems', 'Applications to real situations'] },
        { title: 'Numbers: real, surds and indices', term: 1, topics: ['Properties of real numbers', 'Operations with surds', 'Laws of indices', 'Absolute value and inequalities'] },
        { title: 'Polynomials, equations and inequalities', term: 1, topics: ['Polynomial division and factor theorem', 'Quadratic and cubic equations', 'Rational inequalities', 'Systems of equations'] },
        { title: 'Trigonometry: functions and identities', term: 2, topics: ['Radian measure and unit circle', 'Trigonometric identities', 'Sine and cosine rules', 'Trigonometric equations'] },
        { title: 'Analytic geometry of the straight line and circle', term: 2, topics: ['Distance, midpoint and gradient', 'Equations of lines', 'Equation of a circle', 'Intersections and tangents'] },
        { title: 'Sequences, series and logarithms', term: 2, topics: ['Arithmetic and geometric series', 'Sum to infinity', 'Exponential and logarithmic functions', 'Laws of logarithms and equations'] },
        { title: 'Limits, continuity and differentiation', term: 3, topics: ['Limits of functions', 'Continuity', 'Derivative from first principles', 'Rules of differentiation'] },
        { title: 'Descriptive statistics', term: 3, topics: ['Measures of central tendency for grouped data', 'Measures of dispersion', 'Coefficient of variation', 'Interpreting statistical diagrams'] },
      ],
    },
    S5: {
      competences: [
        'apply differentiation and integration to real problems',
        'work with vectors, matrices and transformations in 2D and 3D',
        'model situations with probability distributions',
      ],
      units: [
        { title: 'Applications of differentiation', term: 1, topics: ['Tangents, normals and rates of change', 'Stationary points and curve sketching', 'Maxima and minima problems', 'Related rates'] },
        { title: 'Integration and its applications', term: 1, topics: ['Indefinite and definite integrals', 'Integration by substitution and by parts', 'Area under a curve', 'Volumes of revolution'] },
        { title: 'Trigonometric and inverse functions', term: 2, topics: ['Compound and double angle formulae', 'Inverse trigonometric functions', 'Derivatives of trigonometric functions', 'Trigonometric integrals'] },
        { title: 'Vectors in two and three dimensions', term: 2, topics: ['Position and unit vectors', 'Scalar (dot) product', 'Vector (cross) product', 'Lines and planes in space'] },
        { title: 'Matrices, determinants and linear transformations', term: 2, topics: ['Matrix algebra', 'Determinants and inverses of 3x3 matrices', 'Solving systems by matrix methods', 'Transformations of the plane'] },
        { title: 'Complex numbers', term: 3, topics: ['Algebra of complex numbers', 'Argand diagram and modulus-argument form', 'De Moivre theorem', 'Roots of complex numbers'] },
        { title: 'Probability and probability distributions', term: 3, topics: ['Permutations and combinations', 'Conditional probability and Bayes theorem', 'Binomial distribution', 'Poisson distribution'] },
      ],
    },
    S6: {
      competences: [
        'solve differential equations and advanced calculus problems',
        'analyse bivariate data and make statistical inferences',
        'construct rigorous mathematical arguments and proofs',
      ],
      units: [
        { title: 'Advanced differentiation and Maclaurin series', term: 1, topics: ['Implicit and parametric differentiation', 'Higher derivatives', 'Taylor and Maclaurin expansions', "L'Hopital rule"] },
        { title: 'Advanced integration techniques', term: 1, topics: ['Partial fractions', 'Trigonometric substitution', 'Improper integrals', 'Applications: area, volume, arc length'] },
        { title: 'Ordinary differential equations', term: 1, topics: ['First order separable equations', 'Linear first order equations', 'Second order linear equations', 'Modelling growth and decay'] },
        { title: 'Numerical methods', term: 2, topics: ['Root finding: bisection and Newton-Raphson', 'Trapezium and Simpson rules', 'Iterative methods and convergence', 'Error estimation'] },
        { title: 'Conic sections and coordinate geometry in 3D', term: 2, topics: ['Parabola, ellipse and hyperbola', 'Parametric equations of conics', 'Planes and lines in space', 'Distance and angle in 3D'] },
        { title: 'Bivariate statistics and correlation', term: 3, topics: ['Scatter diagrams', 'Product-moment and rank correlation', 'Least squares regression lines', 'Interpretation and prediction'] },
        { title: 'Normal distribution and inference', term: 3, topics: ['Properties of the normal distribution', 'Standardisation and z-scores', 'Normal approximation to the binomial', 'Confidence intervals and hypothesis testing'] },
      ],
    },
  },
};
