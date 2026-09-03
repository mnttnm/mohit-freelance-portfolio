export const PORTFOLIO_CONTENT_VERSION = '2026-09-01.1';

export const portfolioProfile = {
  name: 'Mohit Tater',
  role: 'Design Engineer and Product Partner',
  location: 'Bengaluru, India',
  positioning:
    'One product partner from first sketch to shipped software, spanning product shaping, design, engineering, QA, automation, and applied AI workflows.',
  experienceSummary:
    '10+ years shipping products across design, engineering, and QA/automation, from enterprise software to founder-led products and AI-native workflows.',
  strengths: [
    'Product shaping from ambiguous requirements',
    'End-to-end product design and full-stack delivery',
    'Human-in-the-loop AI workflows and evaluation',
    'Complex enterprise workflow design',
    'Design systems, dashboard UX, and automation',
  ],
  bestFit: [
    'Founders turning an idea or rough prototype into a production product',
    'Teams needing one owner across design, frontend, backend, and QA',
    'Organizations adding reliable AI workflows without removing human judgment',
  ],
  representativeProjectIds: [
    'ai-resizing-studio',
    'ops-workspace',
    'reviewhub',
    'dashboard-skill',
  ],
  links: {
    home: '/',
    work: '/projects',
    about: '/about',
    contact: '/#studio-footer',
    booking: 'https://cal.com/tatermohit/call-with-mohit-tater',
  },
} as const;

export const portfolioServices = [
  {
    id: 'product-shaping',
    label: 'Product Shaping & Strategy',
    summary:
      'Turn an idea, prototype, or incomplete requirement set into a clear product direction, interface scope, and build order.',
    tags: ['product-shaping', 'product-strategy', 'ux', 'requirements'],
  },
  {
    id: 'end-to-end-development',
    label: 'End-to-End Development',
    summary:
      'Design, frontend, backend, QA, and deployment with one accountable product partner and fewer hand-offs.',
    tags: ['full-stack', 'product-design', 'qa', 'production-delivery'],
  },
  {
    id: 'ai-workflows',
    label: 'AI Workflows & Automation',
    summary:
      'Build practical agents, automation, evaluation loops, and AI-assisted product workflows with human control where it matters.',
    tags: ['ai-workflows', 'automation', 'human-in-the-loop', 'evaluation'],
  },
] as const;

export const portfolioExperience = [
  {
    role: 'Freelance Consultant',
    organization: 'Independent',
    detail: 'Product engineering and AI workflows for founders',
    period: 'Dec 2023 – Present',
  },
  {
    role: 'UX Engineer',
    organization: 'GoodCode',
    detail: 'Custom software and design studio for startups and enterprises',
    period: 'Dec 2022 – Nov 2023',
  },
  {
    role: 'Senior Software Engineer',
    organization: 'Query.ai',
    detail: 'Decentralized security investigations platform',
    period: 'Sept 2020 – Nov 2022',
  },
  {
    role: 'Senior Software Developer',
    organization: 'BlueJeans/Verizon',
    detail: 'Cloud-based video and web conferencing platform',
    period: 'Nov 2016 – Sept 2020',
  },
] as const;

export const portfolioTestimonials = [
  {
    id: 'fred-wilmot',
    person: 'Fred Wilmot',
    role: 'Founder & 3x CISO',
    evidence:
      'Mohit translated complex product requirements into wireframes and effective UX designs, then brainstormed practical solutions.',
  },
  {
    id: 'dean-teffer',
    person: 'Dean Teffer',
    role: 'VP of AI, Arctic Wolf',
    evidence:
      'Mohit surfaced assumptions and gaps, recommended paths forward, accelerated the work, and helped produce a better UI.',
  },
  {
    id: 'kyle-prinsloo',
    person: 'Kyle Prinsloo',
    role: 'Founder/CEO, ClientManager',
    evidence:
      'Mohit provided exceptionally good UX advice structured by importance.',
  },
] as const;

export type PortfolioServiceId = (typeof portfolioServices)[number]['id'];
