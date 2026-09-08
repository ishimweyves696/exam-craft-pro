import type { SubjectCurriculum } from './types';

/** REB/CBC English — units in teaching order, with term placement and topics. */
export const ENGLISH: SubjectCurriculum = {
  sources: {
    O: [
      { label: "REB English syllabus (Ordinary Level, S1–S3)", url: 'https://elearning.reb.rw/mod/resource/view.php?id=11411', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
    A: [
      { label: 'REB English syllabus S4–S6', url: 'https://elearning.reb.rw/mod/resource/view.php?id=10354', kind: 'syllabus' },
      { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
    ],
  },
  levels: {
    S1: {
      competences: [
        'communicate simple information about self and surroundings',
        'read short texts for main ideas and details',
        'write correct simple sentences and short paragraphs',
      ],
      units: [
        { title: 'Personal identification and social interaction', term: 1, topics: ['Greetings and introductions', 'Personal information questions', 'Subject pronouns and the verb to be', 'Polite expressions'] },
        { title: 'Family, home and daily routine', term: 1, topics: ['Family vocabulary', 'Present simple tense', 'Adverbs of frequency', 'Describing a daily routine'] },
        { title: 'School life and classroom language', term: 1, topics: ['School objects and places', 'There is / there are', 'Prepositions of place', 'Giving and following instructions'] },
        { title: 'Describing people, places and things', term: 2, topics: ['Adjectives and word order', 'Comparatives and superlatives', 'Descriptive paragraphs', 'Reading for detail'] },
        { title: 'Food, health and hygiene', term: 2, topics: ['Countable and uncountable nouns', 'Quantifiers: some, any, much, many', 'Giving advice with should', 'Health vocabulary'] },
        { title: 'Narrating past events', term: 3, topics: ['Past simple of regular and irregular verbs', 'Sequencing words', 'Reading short narratives', 'Writing a short story'] },
        { title: 'Reading, listening and short compositions', term: 3, topics: ['Comprehension of short passages', 'Summary of main ideas', 'Punctuation and capitalisation', 'Writing a short informal letter'] },
      ],
    },
    S2: {
      competences: [
        'use a range of tenses accurately in speech and writing',
        'read for gist, detail and inference',
        'produce organised paragraphs and simple compositions',
      ],
      units: [
        { title: 'Travel, transport and giving directions', term: 1, topics: ['Directions and prepositions of movement', 'Present continuous and future plans', 'Modals of possibility', 'Dialogue writing'] },
        { title: 'Work, occupations and future plans', term: 1, topics: ['Vocabulary of jobs and skills', 'Future forms: will and going to', 'Expressing intentions', 'Writing a short CV'] },
        { title: 'Tenses: present perfect and past continuous', term: 1, topics: ['Present perfect with for and since', 'Past continuous vs past simple', 'Time expressions', 'Error correction practice'] },
        { title: 'Environment and conservation', term: 2, topics: ['Environmental vocabulary', 'Cause and effect connectors', 'Reading argumentative texts', 'Writing a persuasive paragraph'] },
        { title: 'Reported speech and reporting information', term: 2, topics: ['Statements in reported speech', 'Reported questions and commands', 'Reporting verbs', 'Summarising a report'] },
        { title: 'Active and passive voice', term: 3, topics: ['Forming the passive', 'When to use the passive', 'Passive in processes and reports', 'Transformation exercises'] },
        { title: 'Literature in English: short stories and poems', term: 3, topics: ['Elements of a short story', 'Characters and setting', 'Figurative language in poems', 'Responding to a text'] },
      ],
    },
    S3: {
      competences: [
        'communicate fluently in formal and informal registers',
        'analyse texts critically and summarise accurately',
        'write structured compositions, letters and reports',
      ],
      units: [
        { title: 'Formal and informal correspondence', term: 1, topics: ['Formal letter conventions', 'Informal letters and emails', 'Register and tone', 'Applications and requests'] },
        { title: 'Conditional sentences and hypothetical language', term: 1, topics: ['Zero and first conditional', 'Second and third conditional', 'Wishes and regrets', 'Mixed conditionals'] },
        { title: 'Relative clauses and complex sentences', term: 2, topics: ['Defining and non-defining relative clauses', 'Relative pronouns', 'Subordinate clauses', 'Sentence combining'] },
        { title: 'Comprehension and summary skills', term: 2, topics: ['Skimming and scanning', 'Inference and implied meaning', 'Note-making', 'Summary within a word limit'] },
        { title: 'Composition writing: narrative, descriptive, argumentative', term: 2, topics: ['Planning and outlining', 'Introductions and conclusions', 'Cohesive devices', 'Editing and proofreading'] },
        { title: 'Speaking skills: debate, discussion and presentation', term: 3, topics: ['Expressing and defending opinions', 'Agreeing and disagreeing politely', 'Debate structure', 'Oral presentation techniques'] },
        { title: 'Literature: novel, drama and poetry', term: 3, topics: ['Plot and theme', 'Character analysis', 'Dramatic techniques', 'Poetic devices and interpretation'] },
      ],
    },
    S4: {
      competences: [
        'use advanced grammar structures accurately',
        'analyse literary and non-literary texts',
        'write extended essays with clear argument and evidence',
      ],
      units: [
        { title: 'Advanced grammar in use', term: 1, topics: ['Verb patterns: gerunds and infinitives', 'Modal verbs of deduction', 'Articles and determiners', 'Common grammatical errors'] },
        { title: 'Vocabulary building and word formation', term: 1, topics: ['Prefixes and suffixes', 'Collocations', 'Idioms and phrasal verbs', 'Synonyms, antonyms and register'] },
        { title: 'Reading comprehension and critical reading', term: 1, topics: ['Author purpose and tone', 'Fact, opinion and bias', 'Text organisation', 'Vocabulary in context'] },
        { title: 'Summary and note-making', term: 2, topics: ['Identifying key points', 'Paraphrasing techniques', 'Summary within word limits', 'Linking summarised ideas'] },
        { title: 'Essay writing: exposition and argument', term: 2, topics: ['Thesis statements', 'Paragraph unity and coherence', 'Evidence and examples', 'Counter-argument and refutation'] },
        { title: 'Functional writing: reports, speeches and articles', term: 3, topics: ['Report format and headings', 'Speech writing conventions', 'Newspaper and magazine articles', 'Audience and purpose'] },
        { title: 'Introduction to literary appreciation', term: 3, topics: ['Genres of literature', 'Themes and messages', 'Style and diction', 'Writing a literary response'] },
      ],
    },
    S5: {
      competences: [
        'evaluate texts for style, purpose and effect',
        'communicate persuasively in formal contexts',
        'produce well-researched extended writing',
      ],
      units: [
        { title: 'Discourse analysis and text structure', term: 1, topics: ['Cohesion and coherence', 'Discourse markers', 'Genre conventions', 'Analysing text structure'] },
        { title: 'Stylistics and figurative language', term: 1, topics: ['Imagery and symbolism', 'Irony, satire and humour', 'Tone and mood', 'Effect of stylistic choices'] },
        { title: 'The novel: analysis and criticism', term: 2, topics: ['Plot structure and narrative voice', 'Characterisation techniques', 'Setting and social context', 'Thematic analysis'] },
        { title: 'Drama: structure, character and performance', term: 2, topics: ['Acts, scenes and dramatic conflict', 'Dialogue and soliloquy', 'Stagecraft', 'Interpreting a play extract'] },
        { title: 'Poetry: form, sound and meaning', term: 2, topics: ['Forms of poetry', 'Rhyme, rhythm and metre', 'Sound devices', 'Unseen poem analysis'] },
        { title: 'Research and academic writing', term: 3, topics: ['Formulating a research question', 'Gathering and evaluating sources', 'Referencing and citation', 'Structuring a research report'] },
        { title: 'Media literacy and public communication', term: 3, topics: ['Language of advertising', 'News reporting and bias', 'Social media communication', 'Ethical communication'] },
      ],
    },
    S6: {
      competences: [
        'produce sophisticated, well-argued extended writing',
        'critically compare texts across genres and contexts',
        'communicate effectively in professional settings',
      ],
      units: [
        { title: 'Advanced composition and rhetoric', term: 1, topics: ['Rhetorical appeals', 'Advanced argument structures', 'Style, voice and sentence variety', 'Revision and editing strategies'] },
        { title: 'Comparative literary study', term: 1, topics: ['Comparing themes across texts', 'Comparing form and technique', 'Context and interpretation', 'Writing a comparative essay'] },
        { title: 'African literature and Rwandan writing', term: 2, topics: ['Themes in African literature', 'Post-colonial perspectives', 'Rwandan oral tradition and modern writing', 'Cultural identity in texts'] },
        { title: 'Critical reading of unseen texts', term: 2, topics: ['Unseen prose analysis', 'Unseen poetry analysis', 'Comparing two unseen extracts', 'Timed response strategies'] },
        { title: 'Professional and workplace communication', term: 2, topics: ['Job applications and interviews', 'Minutes, memos and proposals', 'Formal presentations', 'Negotiation language'] },
        { title: 'Language change, variety and register', term: 3, topics: ['Standard English and varieties', 'English in Rwanda and East Africa', 'Register and appropriateness', 'Language and identity'] },
        { title: 'Examination skills and extended response', term: 3, topics: ['Analysing question requirements', 'Planning under time pressure', 'Structuring extended answers', 'Self-assessment against criteria'] },
      ],
    },
  },
};
