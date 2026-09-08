import type { SubjectCurriculum } from './types';

/** REB/CBC Entrepreneurship — units in teaching order, with term placement and topics. */
export const ENTREPRENEURSHIP: SubjectCurriculum = {
  sources: {
    O: [
      { label: 'REB e-learning: secondary syllabi (Entrepreneurship, O-Level)', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'syllabus' },
      { label: 'Rwanda Basic Education Board (REB)', url: 'https://www.reb.gov.rw/', kind: 'portal' },
    ],
    A: [
      { label: 'REB Entrepreneurship syllabus S4–S6', url: 'https://elearning.reb.rw/mod/resource/view.php?id=10458', kind: 'syllabus' },
      { label: 'REB upper secondary Entrepreneurship syllabus', url: 'https://elearning.reb.rw/mod/resource/view.php?id=4743', kind: 'course' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'identify business activities in the local community',
        'explain the role of an entrepreneur in development',
        'demonstrate basic saving and record-keeping habits',
      ],
      units: [
        { title: 'Introduction to entrepreneurship', term: 1, topics: ['Meaning of entrepreneurship', 'Who is an entrepreneur', 'Importance of entrepreneurship in Rwanda', 'Myths about entrepreneurship'] },
        { title: 'Characteristics of a successful entrepreneur', term: 1, topics: ['Personal qualities and attitudes', 'Self-assessment of entrepreneurial traits', 'Role models in Rwanda', 'Developing entrepreneurial behaviour'] },
        { title: 'Business activities in the community', term: 1, topics: ['Types of business activities', 'Goods and services', 'Formal and informal businesses', 'Business survey of the local area'] },
        { title: 'Needs, wants and business opportunities', term: 2, topics: ['Human needs and wants', 'Identifying unmet needs', 'Sources of business ideas', 'Screening business ideas'] },
        { title: 'Saving and personal money management', term: 2, topics: ['Importance of saving', 'Saving methods and SACCOs', 'Personal budgeting', 'Wise spending decisions'] },
        { title: 'Basic business records', term: 3, topics: ['Why records are kept', 'Sales and purchases records', 'Simple cash book', 'Receipts and invoices'] },
        { title: 'Business ethics and responsibility', term: 3, topics: ['Honesty and fair dealing', 'Customer care', 'Responsibility to the community', 'Consequences of unethical practices'] },
      ],
    },
    S2: {
      competences: [
        'generate and evaluate viable business ideas',
        'apply basic marketing concepts to a small business',
        'prepare simple business records and budgets',
      ],
      units: [
        { title: 'Business ideas and opportunity identification', term: 1, topics: ['Creativity and innovation', 'Techniques for generating ideas', 'Feasibility of an idea', 'SWOT analysis of an idea'] },
        { title: 'Forms of business ownership', term: 1, topics: ['Sole proprietorship', 'Partnership', 'Cooperatives', 'Companies and their features'] },
        { title: 'Production and the production process', term: 1, topics: ['Factors of production', 'Types of production', 'Productivity and efficiency', 'Quality of products'] },
        { title: 'Marketing and the marketing mix', term: 2, topics: ['Meaning of marketing', 'Product, price, place and promotion', 'Market research basics', 'Customer needs and satisfaction'] },
        { title: 'Costs, revenue and profit', term: 2, topics: ['Fixed and variable costs', 'Calculating total cost and revenue', 'Profit and loss', 'Pricing decisions'] },
        { title: 'Business records and simple accounts', term: 3, topics: ['Cash book entries', 'Stock records', 'Simple trading account', 'Interpreting business records'] },
        { title: 'Business support services in Rwanda', term: 3, topics: ['Banks and microfinance', 'RDB and business registration', 'Business development services', 'Insurance for small business'] },
      ],
    },
    S3: {
      competences: [
        'prepare a simple business plan',
        'analyse financial performance of a small business',
        'explain legal and tax obligations of a business',
      ],
      units: [
        { title: 'Business planning', term: 1, topics: ['Purpose of a business plan', 'Components of a business plan', 'Setting business objectives', 'Writing a simple plan'] },
        { title: 'Sources of business finance', term: 1, topics: ['Own savings and family finance', 'Loans and credit', 'Grants and equity', 'Cost of finance and repayment'] },
        { title: 'Financial statements for a small business', term: 2, topics: ['Trading, profit and loss account', 'Balance sheet items', 'Cash flow statement', 'Interpreting simple statements'] },
        { title: 'Business law, registration and taxation', term: 2, topics: ['Business registration in Rwanda', 'Contracts and agreements', 'Types of taxes: VAT, income tax', 'Consumer protection'] },
        { title: 'Human resource management in small business', term: 2, topics: ['Recruiting and training workers', 'Motivation and productivity', 'Employment contracts', 'Workplace health and safety'] },
        { title: 'Risk management and insurance', term: 3, topics: ['Types of business risk', 'Risk reduction strategies', 'Principles of insurance', 'Insurance products for business'] },
        { title: 'Business growth and community impact', term: 3, topics: ['Signs of business growth', 'Expansion strategies', 'Job creation and community benefits', 'Environmental responsibility'] },
      ],
    },
    S4: {
      competences: [
        'analyse the business environment and its influence on enterprise',
        'apply management functions to a business',
        'record and interpret business transactions',
      ],
      units: [
        { title: 'Entrepreneurship and economic development', term: 1, topics: ['Role of entrepreneurship in the economy', 'Vision 2050 and NST priorities', 'Entrepreneurial culture', 'Enterprise and employment creation'] },
        { title: 'The business environment', term: 1, topics: ['Internal and external environment', 'PESTLE analysis', 'Competition and market structure', 'Adapting to environmental change'] },
        { title: 'Business organisation and management functions', term: 1, topics: ['Planning, organising, leading, controlling', 'Organisation structures', 'Delegation and span of control', 'Decision making'] },
        { title: 'Business opportunity analysis and feasibility study', term: 2, topics: ['Market feasibility', 'Technical feasibility', 'Financial feasibility', 'Writing a feasibility report'] },
        { title: 'Marketing management', term: 2, topics: ['Market segmentation and targeting', 'Product life cycle', 'Pricing strategies', 'Promotion and distribution channels'] },
        { title: 'Book-keeping and the accounting cycle', term: 2, topics: ['Double entry principles', 'Journals and ledgers', 'Trial balance', 'Correction of errors'] },
        { title: 'Costing and pricing decisions', term: 3, topics: ['Cost classification', 'Break-even analysis', 'Contribution and margin', 'Cost control'] },
        { title: 'Business communication and negotiation', term: 3, topics: ['Business correspondence', 'Meetings and minutes', 'Negotiation skills', 'Presentation of business proposals'] },
      ],
    },
    S5: {
      competences: [
        'develop a complete and bankable business plan',
        'analyse financial statements and manage working capital',
        'apply human resource and operations management principles',
      ],
      units: [
        { title: 'Comprehensive business plan development', term: 1, topics: ['Executive summary', 'Market and competitor analysis', 'Operations and management plan', 'Financial projections'] },
        { title: 'Financial statements and analysis', term: 1, topics: ['Income statement and balance sheet', 'Cash flow forecasting', 'Ratio analysis: profitability and liquidity', 'Interpreting financial performance'] },
        { title: 'Working capital and cash management', term: 2, topics: ['Components of working capital', 'Debtors and creditors management', 'Inventory control', 'Cash budgeting'] },
        { title: 'Operations and production management', term: 2, topics: ['Production planning', 'Quality management', 'Supply chain and procurement', 'Productivity improvement'] },
        { title: 'Human resource management', term: 2, topics: ['Recruitment and selection', 'Training and development', 'Performance appraisal', 'Labour law in Rwanda'] },
        { title: 'Sources of capital and investment appraisal', term: 3, topics: ['Debt versus equity financing', 'Payback period', 'Net present value basics', 'Selecting a financing option'] },
        { title: 'Entrepreneurial project management', term: 3, topics: ['Project cycle', 'Resource scheduling', 'Monitoring and evaluation', 'Risk in projects'] },
      ],
    },
    S6: {
      competences: [
        'evaluate business performance and growth strategies',
        'manage risk, tax and compliance obligations',
        'defend an investment decision with evidence',
      ],
      units: [
        { title: 'Business growth strategies and expansion', term: 1, topics: ['Organic and inorganic growth', 'Diversification and franchising', 'Mergers and acquisitions', 'Managing growth challenges'] },
        { title: 'Investment appraisal and decision making', term: 1, topics: ['Payback and accounting rate of return', 'Net present value and IRR', 'Risk and sensitivity analysis', 'Choosing between projects'] },
        { title: 'Financial management and budgeting', term: 1, topics: ['Budget preparation and control', 'Variance analysis', 'Cost of capital', 'Financial planning for growth'] },
        { title: 'Taxation, compliance and business records', term: 2, topics: ['RRA obligations and tax types', 'Filing and compliance procedures', 'Statutory records', 'Consequences of non-compliance'] },
        { title: 'International trade, EAC and AfCFTA opportunities', term: 2, topics: ['Exporting and importing procedures', 'Regional integration benefits', 'Trade barriers and documentation', 'Competing in regional markets'] },
        { title: 'Digital business, e-commerce and technology', term: 2, topics: ['Digital payment systems', 'E-commerce models', 'Digital marketing', 'Data and cyber security for business'] },
        { title: 'Corporate governance, ethics and sustainability', term: 3, topics: ['Governance structures', 'Business ethics and integrity', 'Corporate social responsibility', 'Environmental sustainability'] },
        { title: 'Case analysis of Rwandan enterprises', term: 3, topics: ['Analysing a business case', 'Identifying problems and causes', 'Proposing and justifying solutions', 'Presenting recommendations'] },
      ],
    },
  },
};
