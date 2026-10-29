import { ReviewPackage, Lesson, QuizQuestion, Flashcard, EnrolledStudentRecord } from '../types';

export const reviewPackages: ReviewPackage[] = [
  {
    id: 'pkg-board-comprehensive',
    title: 'PRC Licensure Comprehensive',
    targetAudience: 'For graduating seniors & degree holders taking licensure exams',
    description: 'Complete high-yield review curriculum covering core theory, diagnostic simulations, and rationalized drill banks.',
    price: '₱7,999',
    period: '6-Month Access',
    popular: true,
    features: [
      'Full syllabus modular video lectures',
      'AI-powered adaptive study plan',
      '5 full-length diagnostic mock exams',
      'Unlimited AI Reviewer material summarizer',
      'Downloadable high-yield summaries & formula cards',
      'Weekly live Q&A consultation clinics'
    ],
    totalModules: 68,
    mockExamsCount: 5,
    category: 'Licensure'
  },
  {
    id: 'pkg-college-entrance',
    title: 'College Entrance Exam (CET) Intensive',
    targetAudience: 'For Grade 11 & 12 students aiming for top universities',
    description: 'Targeted preparation for UPCAT, USTET, DLSU-CET, ACET, and state university entrance examinations.',
    price: '₱4,999',
    period: '4-Month Access',
    popular: false,
    features: [
      'Math, Science, English, & Abstract Reasoning drills',
      'Time-pressure speed test simulator',
      'Detailed rationale for every question',
      'AI Flashcards generator for vocabulary & formulas',
      'Essay writing feedback guide'
    ],
    totalModules: 42,
    mockExamsCount: 4,
    category: 'College Entrance'
  },
  {
    id: 'pkg-civil-service',
    title: 'Civil Service Examination Pass',
    targetAudience: 'For career professionals seeking government eligibility',
    description: 'Comprehensive preparation for Professional & Sub-Professional levels covering numerical, analytical, and clerical topics.',
    price: '₱3,499',
    period: '3-Month Access',
    popular: false,
    features: [
      'Philippine Constitution & Code of Ethics modules',
      'Numerical ability shortcuts & word problems',
      'Verbal ability and paragraph organization drills',
      '3 full official-format simulated tests',
      'Progress tracking & weakness diagnostics'
    ],
    totalModules: 36,
    mockExamsCount: 3,
    category: 'Civil Service'
  },
  {
    id: 'pkg-working-student',
    title: 'Working Student Flexible Pass',
    targetAudience: 'For working professionals needing flexible night & weekend review',
    description: 'Self-paced micro-learning modules designed for busy schedules, with audio notes and bite-sized quizzes.',
    price: '₱5,499',
    period: '8-Month Extended Access',
    popular: false,
    features: [
      '15-minute bite-sized audio & text modules',
      'Evening mentor office hours access',
      'Offline downloadable summary sheets',
      'AI voice study companion & flashcards',
      'Flexible deadline pause and resume option'
    ],
    totalModules: 52,
    mockExamsCount: 4,
    category: 'Specialized'
  },
  {
    id: 'pkg-ielts-mastery',
    title: 'IELTS Academic & General Training Masterclass',
    targetAudience: 'For healthcare professionals, nurses, and students targeting Band 7.5+ for UK, Canada, Australia, and US migration',
    description: 'Intensive band-boosting curriculum covering Listening, Academic Reading, Writing Task 1 & 2 criteria, and 1-on-1 speaking interview simulations with AI voice analysis.',
    price: '₱6,999',
    period: '5-Month Access',
    popular: true,
    features: [
      'Official IELTS Band 1.0 to 9.0 diagnostic mock scoring',
      'AI automated essay grading for Cohesion, Lexical Resource & Grammar',
      'Speaking accent & fluency evaluation engine',
      '6 full-length timed IELTS academic exam batteries',
      'Band 8.0+ model answer banks and vocabulary lists'
    ],
    totalModules: 50,
    mockExamsCount: 6,
    category: 'IELTS / Language',
    scoringType: 'ielts-band'
  }
];

export const sampleLessons: Lesson[] = [
  {
    id: 'les-1',
    title: 'Core Principles of Thermodynamics & Energy Transfer',
    subject: 'General Engineering Sciences',
    duration: '45 mins',
    completed: true,
    progressPercent: 100,
    instructor: 'Engr. Marco Santos, M.Sc.',
    materialsCount: 4,
    nextQuizAvailable: true
  },
  {
    id: 'les-2',
    title: 'Constitutional Law, General Principles & Bill of Rights',
    subject: 'Professional Ethics & Law',
    duration: '60 mins',
    completed: true,
    progressPercent: 100,
    instructor: 'Atty. Cristina Valderrama',
    materialsCount: 6,
    nextQuizAvailable: true
  },
  {
    id: 'les-3',
    title: 'Fluid Mechanics: Laminar and Turbulent Flow in Pipes',
    subject: 'Applied Physical Sciences',
    duration: '50 mins',
    completed: false,
    progressPercent: 65,
    instructor: 'Dr. Ramon Delgado',
    materialsCount: 5,
    nextQuizAvailable: true
  },
  {
    id: 'les-4',
    title: 'Quantitative Data Analysis & Probability Distributions',
    subject: 'Applied Mathematics',
    duration: '55 mins',
    completed: false,
    progressPercent: 20,
    instructor: 'Prof. Helen Ramirez',
    materialsCount: 3,
    nextQuizAvailable: false
  },
  {
    id: 'les-5',
    title: 'Organic Chemistry: Reaction Mechanisms & Synthesis',
    subject: 'Chemical Sciences',
    duration: '65 mins',
    completed: false,
    progressPercent: 0,
    instructor: 'Dr. Angela Tan',
    materialsCount: 4,
    nextQuizAvailable: false
  }
];

export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'According to the Second Law of Thermodynamics, which statement correctly describes the behavior of a closed natural system?',
    options: [
      'The total energy of an isolated system always increases during spontaneous processes.',
      'The entropy of an isolated system always increases or remains constant over time; it never spontaneously decreases.',
      'Heat can flow spontaneously from a body of lower temperature to a body of higher temperature without external work.',
      'Absolute zero can be achieved in a finite number of thermodynamic cycles.'
    ],
    correctIndex: 1,
    explanation: 'The Second Law states that the entropy (measure of disorder) of an isolated system never decreases over time. Natural processes are irreversible, meaning total entropy always increases.',
    subject: 'Thermodynamics',
    difficulty: 'Moderate'
  },
  {
    id: 2,
    question: 'In Philippine Constitutional Law, which doctrine protects citizens from self-incrimination during custodial investigations?',
    options: [
      'The Tarasoff Doctrine',
      'The Miranda Rights / Exclusionary Rule under Section 12, Article III',
      'The Ultra Vires Doctrine',
      'The Plain View Doctrine'
    ],
    correctIndex: 1,
    explanation: 'Article III, Section 12 of the 1987 Constitution guarantees any person under investigation for the commission of an offense the right to remain silent, to have competent and independent counsel, and forbids the use of torture or confessions obtained in violation thereof.',
    subject: 'Constitutional Law',
    difficulty: 'Easy'
  },
  {
    id: 3,
    question: 'A fluid is flowing through a circular pipe of diameter D. When the Reynolds number (Re) is calculated to be 1,450, what type of flow regime is occurring?',
    options: [
      'Turbulent flow',
      'Critical transition flow',
      'Laminar flow',
      'Sonic flow'
    ],
    correctIndex: 2,
    explanation: 'For internal flow through cylindrical pipes, a Reynolds number Re < 2,100 indicates laminar flow, where fluid particles travel in parallel streamlines without macroscopic lateral mixing.',
    subject: 'Fluid Dynamics',
    difficulty: 'Moderate'
  },
  {
    id: 4,
    question: 'Which of the following organic compounds will yield a positive Silver Mirror (Tollens) Test?',
    options: [
      'Propanone (Acetone)',
      'Benzophenone',
      'Ethanal (Acetaldehyde)',
      'Ethyl ethanoate'
    ],
    correctIndex: 2,
    explanation: 'Tollens reagent tests for the presence of aldehydes. Ethanal (an aldehyde) is oxidized to ethanoic acid while reducing Ag+ to metallic silver, creating the characteristic mirror coating.',
    subject: 'Organic Chemistry',
    difficulty: 'Challenging'
  },
  {
    id: 5,
    question: 'If the variance of a sample distribution is 36, what is its standard deviation?',
    options: [
      '18',
      '6',
      '72',
      '1296'
    ],
    correctIndex: 1,
    explanation: 'Standard deviation is the square root of variance: sqrt(36) = 6.',
    subject: 'Statistics & Probability',
    difficulty: 'Easy'
  }
];

export const sampleFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    topic: 'Thermodynamics',
    front: 'What is the Carnot Efficiency formula for an ideal heat engine?',
    back: 'η = 1 - (T_cold / T_hot), where temperatures must be expressed in absolute Kelvin.',
    mastered: true
  },
  {
    id: 'fc-2',
    topic: 'Fluid Mechanics',
    front: 'State Bernoulli\'s Principle along a streamline for steady, incompressible, frictionless flow.',
    back: 'P + 0.5·ρ·v² + ρ·g·h = Constant. (Static Pressure + Dynamic Pressure + Hydrostatic Pressure = Total Head).',
    mastered: false
  },
  {
    id: 'fc-3',
    topic: 'Civil Service / Ethics',
    front: 'What Republic Act is known as the "Code of Conduct and Ethical Standards for Public Officials and Employees"?',
    back: 'Republic Act No. 6713 (RA 6713), enacted February 20, 1989.',
    mastered: true
  },
  {
    id: 'fc-4',
    topic: 'Mathematics',
    front: 'What is the quadratic formula to find the roots of ax² + bx + c = 0?',
    back: 'x = (-b ± √(b² - 4ac)) / (2a). The discriminant Δ = b² - 4ac indicates real or complex roots.',
    mastered: false
  },
  {
    id: 'fc-5',
    topic: 'Biology / Medical Sciences',
    front: 'Distinguish between Mitosis and Meiosis in terms of daughter cell ploidy.',
    back: 'Mitosis produces two genetically identical diploid (2n) daughter cells. Meiosis produces four genetically diverse haploid (n) gametes through two successive divisions.',
    mastered: true
  }
];

export const sampleEnrolledStudents: EnrolledStudentRecord[] = [
  {
    id: 'stu-101',
    studentId: 'MH-2026-0841',
    name: 'Alyssa Reyes',
    email: 'alyssa.reyes@univ.edu.ph',
    packageTitle: 'PRC Licensure Comprehensive',
    batch: 'Batch Alpha (Nov 2026)',
    enrollmentDate: 'Oct 12, 2026',
    paymentStatus: 'Paid',
    amount: '₱7,999',
    academicProgress: 74
  },
  {
    id: 'stu-102',
    studentId: 'MH-2026-0842',
    name: 'Joshua David Bautista',
    email: 'joshua.bautista@gmail.com',
    packageTitle: 'College Entrance Exam (CET)',
    batch: 'Batch Gamma (Dec 2026)',
    enrollmentDate: 'Oct 15, 2026',
    paymentStatus: 'Paid',
    amount: '₱4,999',
    academicProgress: 88
  },
  {
    id: 'stu-103',
    studentId: 'MH-2026-0843',
    name: 'Catherine Mae Lim',
    email: 'catherine.lim@gov.ph',
    packageTitle: 'Civil Service Examination Pass',
    batch: 'Batch Beta (Nov 2026)',
    enrollmentDate: 'Oct 19, 2026',
    paymentStatus: 'Pending',
    amount: '₱3,499',
    academicProgress: 42
  },
  {
    id: 'stu-104',
    studentId: 'MH-2026-0844',
    name: 'Mark Lester Mendoza',
    email: 'm.mendoza@telecom.com',
    packageTitle: 'Working Student Flexible Pass',
    batch: 'Evening Track 2',
    enrollmentDate: 'Oct 21, 2026',
    paymentStatus: 'Paid',
    amount: '₱5,499',
    academicProgress: 56
  },
  {
    id: 'stu-105',
    studentId: 'MH-2026-0845',
    name: 'Patricia Nicole Cruz',
    email: 'patricia.cruz@medreview.edu',
    packageTitle: 'PRC Licensure Comprehensive',
    batch: 'Batch Alpha (Nov 2026)',
    enrollmentDate: 'Oct 23, 2026',
    paymentStatus: 'Paid',
    amount: '₱7,999',
    academicProgress: 92
  },
  {
    id: 'stu-106',
    studentId: 'MH-2026-0846',
    name: 'Gabriel James Tan',
    email: 'gabriel.tan99@outlook.com',
    packageTitle: 'Working Student Flexible Pass',
    batch: 'Weekend Track 1',
    enrollmentDate: 'Oct 25, 2026',
    paymentStatus: 'Pending',
    amount: '₱5,499',
    academicProgress: 18
  }
];

export const sampleSummaryContent = {
  title: 'Executive Summary: Thermodynamics & Fluid Transport (Module 4)',
  generatedAt: 'Oct 27, 2026 · AI Reviewer Engine v3',
  sourceFile: 'Lecture_04_Thermo_Fluids_Notes.pdf (24 pages)',
  keyTakeaways: [
    'Closed systems exchange energy as heat and work, but do not exchange mass across boundary limits.',
    'First Law: ΔU = Q - W. Work done by the system is positive in traditional mechanical conventions.',
    'Second Law introduces entropy: S = k·ln(Ω). Real cycles have efficiency strictly lower than Carnot: η < 1 - (Tc/Th).',
    'Laminar vs Turbulent pipe flow threshold: Re = 2,100. Critical Reynolds number determines Darcy-Weisbach friction factors.',
    'Bernoulli equation requires 4 core assumptions: inviscid fluid, steady flow, incompressible liquid, along a single streamline.'
  ],
  highYieldFormulas: [
    'Carnot Max Efficiency: η_max = 1 - (T_L / T_H) [T in Kelvin]',
    'Reynolds Number: Re = (ρ · v · D) / μ = (v · D) / ν',
    'Hydrostatic Gauge Pressure: P_gauge = ρ · g · h',
    'Continuity Equation: A₁ · v₁ = A₂ · v₂ (for constant density)'
  ],
  recommendedReviewFocus: [
    'Watch out for trick questions testing absolute Kelvin versus Celsius in thermal efficiency calculations.',
    'Practice calculating Darcy friction factor using Moody chart coordinates.'
  ]
};

export const sampleIeltsQuestions: QuizQuestion[] = [
  {
    id: 101,
    question: '[IELTS Academic Reading - Passage Analysis]\n"The rapid adoption of automated sensor networks has precipitated a marked diminution in human monitoring errors across oceanic desalination facilities."\n\nAccording to the passage, what effect has sensor automation had on oceanic desalination plants?',
    options: [
      'It has led to a significant decrease in human operational oversight mistakes.',
      'It has completely eliminated the necessity for human maritime maintenance engineers.',
      'It has resulted in higher energy consumption during initial chemical membrane flushing.',
      'It has precipitated disputes between private sensor manufacturers and port authorities.'
    ],
    correctIndex: 0,
    explanation: '"A marked diminution in human monitoring errors" paraphrases directly to "a significant decrease in human operational oversight mistakes". In IELTS Academic Reading, lexical substitution and synonym matching are core evaluation criteria.',
    subject: 'IELTS Academic Reading',
    difficulty: 'Moderate'
  },
  {
    id: 102,
    question: '[IELTS Academic Writing Task 2 - Cohesion & Task Response]\nWhen introducing a counter-argument followed by a rebuttal in an IELTS discursive essay, which discourse marker pair establishes the most formal academic tone?',
    options: [
      'On the flip side... But anyways...',
      'While proponents contend that... nonetheless, closer empirical scrutiny reveals that...',
      'Some people say yes... However I think totally not...',
      'In addition to that... Also another thing is...'
    ],
    correctIndex: 1,
    explanation: '"While proponents contend that... nonetheless, closer empirical scrutiny reveals that..." demonstrates advanced complex sentence structure, hedging, and high-level Band 8.0+ cohesive linking devices.',
    subject: 'IELTS Academic Writing',
    difficulty: 'Easy'
  },
  {
    id: 103,
    question: '[IELTS Listening Section 3 - Academic Discussion]\nIn an audio discussion between two research students regarding urban wind turbines, the female speaker states: "I was initially swayed by the aesthetic objections, but the acoustic dampening data rendered those concerns largely negligible."\n\nWhat is the student\'s final position on the wind turbines?',
    options: [
      'She still believes the turbines are too noisy for residential zoning.',
      'She feels the aesthetic appearance of turbines is unacceptable.',
      'Her initial reservations were overcome by proof of effective noise reduction.',
      'She recommends delaying turbine installation until public hearings conclude.'
    ],
    correctIndex: 2,
    explanation: '"Acoustic dampening data rendered those concerns largely negligible" means evidence showing sound reduction removed her prior doubts, matching "Her initial reservations were overcome by proof of effective noise reduction".',
    subject: 'IELTS Listening Comprehension',
    difficulty: 'Moderate'
  },
  {
    id: 104,
    question: '[IELTS Lexical Resource - Collocations]\nWhich of the following phrases represents an idiomatic, natural academic collocation appropriate for Band 8.0+ in IELTS Speaking Part 3?',
    options: [
      'To make an intensive disaster',
      'To exert a profound influence on sustainable urban planning',
      'To do a strong impact towards citizens',
      'To speak big arguments about nature'
    ],
    correctIndex: 1,
    explanation: '"Exert a profound influence on" is a natural, sophisticated academic collocation demonstrating precision and high lexical control required for Band 8.0–9.0.',
    subject: 'IELTS Lexical Resource',
    difficulty: 'Moderate'
  },
  {
    id: 105,
    question: '[IELTS Academic Reading - True / False / Not Given]\nPassage Statement: "Recent archaeological surveys confirm that the irrigation terraces of Banaue were constructed over a period spanning at least seven centuries, though written records from the initial century remain unverified."\n\nQuestion Statement: "Historians possess verified diaries documenting the inaugural construction year of the terraces."',
    options: [
      'TRUE',
      'FALSE',
      'NOT GIVEN',
      'PARTIALLY TRUE'
    ],
    correctIndex: 1,
    explanation: 'The passage explicitly states: "written records from the initial century remain unverified." The question claims historians possess verified diaries, which directly contradicts the passage text. Therefore, the answer is FALSE.',
    subject: 'IELTS Academic Reading',
    difficulty: 'Challenging'
  }
];

export interface IeltsBandDescriptor {
  band: number;
  label: string;
  cefr: string;
  summary: string;
}

export const getIeltsBandScore = (correctCount: number, totalQuestions: number = 5): IeltsBandDescriptor => {
  const percentage = (correctCount / totalQuestions) * 100;
  if (percentage === 100) {
    return {
      band: 9.0,
      label: 'Expert User',
      cefr: 'C2 Proficient',
      summary: 'Has fully operational command of the language: appropriate, accurate, and fluent with complete understanding.',
    };
  } else if (percentage >= 80) {
    return {
      band: 8.0,
      label: 'Very Good User',
      cefr: 'C1 Advanced',
      summary: 'Has fully operational command with only occasional unsystematic inaccuracies and inappropriate usage.',
    };
  } else if (percentage >= 60) {
    return {
      band: 7.0,
      label: 'Good User',
      cefr: 'B2+ Vantage',
      summary: 'Has operational command, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations.',
    };
  } else if (percentage >= 40) {
    return {
      band: 6.0,
      label: 'Competent User',
      cefr: 'B2 Independent',
      summary: 'Generally has effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings.',
    };
  } else {
    return {
      band: 5.0,
      label: 'Modest User',
      cefr: 'B1 Threshold',
      summary: 'Has partial command of the language, coping with overall meaning in most situations, though is likely to make many mistakes.',
    };
  }
};

export const samplePaymentTransactions = [
  {
    id: 'tx-901',
    studentId: 'MH-2026-0841',
    studentName: 'Alyssa Reyes',
    studentEmail: 'alyssa.reyes@univ.edu.ph',
    packageTitle: 'PRC Licensure Comprehensive',
    amount: '₱7,999',
    paymentMethod: 'GCash' as const,
    referenceNumber: 'GCASH-998241029',
    status: 'Verified' as const,
    date: 'Oct 12, 2026',
  },
  {
    id: 'tx-902',
    studentId: 'MH-2026-0842',
    studentName: 'Joshua David Bautista',
    studentEmail: 'joshua.bautista@gmail.com',
    packageTitle: 'College Entrance Exam (CET)',
    amount: '₱4,999',
    paymentMethod: 'Maya' as const,
    referenceNumber: 'MAYA-441092811',
    status: 'Verified' as const,
    date: 'Oct 15, 2026',
  },
  {
    id: 'tx-903',
    studentId: 'MH-2026-0843',
    studentName: 'Catherine Mae Lim',
    studentEmail: 'catherine.lim@gov.ph',
    packageTitle: 'Civil Service Examination Pass',
    amount: '₱3,499',
    paymentMethod: 'Bank Transfer' as const,
    referenceNumber: 'BPI-DEPOSIT-88192',
    status: 'Pending' as const,
    date: 'Oct 19, 2026',
  },
  {
    id: 'tx-904',
    studentId: 'MH-2026-0847',
    studentName: 'Nurse Stephanie Garcia',
    studentEmail: 'stephanie.garcia@nursingreview.ph',
    packageTitle: 'IELTS Academic & General Training Masterclass',
    amount: '₱6,999',
    paymentMethod: 'Credit/Debit Card' as const,
    referenceNumber: 'VISA-AUTH-771920',
    status: 'Verified' as const,
    date: 'Oct 26, 2026',
  }
];

