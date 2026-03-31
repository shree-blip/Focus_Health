import type { InsightCategory } from './insights';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: InsightCategory;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: string;
  status: 'draft' | 'published';
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Why Texas Is a Prime Market for Freestanding Emergency Rooms',
    slug: 'texas-prime-market-for-fsers',
    category: 'Market Analysis',
    excerpt:
      'Texas population growth, healthcare access gaps, and policy environment make it one of the strongest markets for FSER infrastructure investment.',
    coverImage: '/hero-market.jpg',
    publishedAt: '2026-03-15',
    author: 'Focus Health Team',
    status: 'published',
    content: `
      <h1>Why Texas Is a Prime Market for Freestanding Emergency Rooms</h1>
      <p>Texas continues to lead national population expansion while many suburban corridors remain underserved by traditional hospital emergency departments. This creates a clear opportunity for scalable, high-quality emergency infrastructure.</p>

      <h2>Population and Demand Tailwinds</h2>
      <p>New residential growth in metro-adjacent communities has outpaced hospital expansion timelines. Patients need access to emergency care closer to home, and FSERs are positioned to fill this gap with speed.</p>

      <h3>Operational Model Advantages</h3>
      <p>Freestanding ERs can deliver shorter wait times, focused triage workflows, and highly standardized care pathways compared to overloaded hospital systems.</p>

      <h4>Strategic Takeaway</h4>
      <p>For partners evaluating healthcare real estate and operations, Texas offers one of the most compelling combinations of growth, demand, and long-term infrastructure need.</p>

      <p><a href="/market">Explore our market analysis</a> and see how Focus Health evaluates opportunities.</p>
      <p><img src="/facility-er-irving-real.webp" alt="ER facility in Texas" /></p>
    `,
  },
  {
    id: '2',
    title: 'How Focus Health Builds, Funds, and Operates with One Platform',
    slug: 'focus-health-build-fund-operate-platform',
    category: 'Clinical Operations',
    excerpt:
      'Our integrated model combines market intelligence, facility delivery, and operating discipline into one repeatable platform for healthcare growth.',
    coverImage: '/hero-platform.jpg',
    publishedAt: '2026-03-16',
    author: 'Focus Health Team',
    status: 'published',
    content: `
      <h1>How Focus Health Builds, Funds, and Operates with One Platform</h1>
      <p>Fragmented execution is one of the biggest risks in healthcare infrastructure. Focus Health addresses this through a single integrated platform that aligns development, capital, and operations from day one.</p>

      <h2>Build</h2>
      <p>We identify target corridors, design efficient facility footprints, and execute disciplined launch timelines with experienced project teams.</p>

      <h3>Fund</h3>
      <p>Partners gain access to transparent underwriting assumptions, milestone tracking, and operator-aligned execution.</p>

      <h4>Operate</h4>
      <p>Post-launch, we focus on clinical quality, staffing reliability, and operational KPIs that support sustainable growth.</p>

      <p>See our <a href="/platform">platform overview</a> and <a href="/track-record">track record</a> for proof points.</p>
      <p><img src="/facility-er-whiterock.webp" alt="Focus Health operating model" /></p>
    `,
  },
  {
    id: '3',
    title: 'What Investors Should Look for in Healthcare Infrastructure Operators',
    slug: 'investor-checklist-healthcare-infrastructure-operators',
    category: 'Company News',
    excerpt:
      'A practical checklist for evaluating operators across execution speed, reporting quality, and long-term clinical-operational alignment.',
    coverImage: '/hero-partners.jpg',
    publishedAt: '2026-03-17',
    author: 'Focus Health Team',
    status: 'published',
    content: `
      <h1>What Investors Should Look for in Healthcare Infrastructure Operators</h1>
      <p>Operator quality directly impacts both care outcomes and investment performance. Strong operators combine disciplined execution with transparent reporting and clinical leadership.</p>

      <h2>Execution Discipline</h2>
      <p>Look for repeatable launch processes, predictable development milestones, and real operating history across multiple facilities.</p>

      <h3>Reporting and Governance</h3>
      <p>Institutional-grade updates, KPI transparency, and clear accountability structures are non-negotiable for long-term trust.</p>

      <h4>Alignment and Scale</h4>
      <p>The best operators are aligned with partner outcomes and can scale without sacrificing quality-of-care standards.</p>

      <p>Meet our <a href="/leadership">leadership team</a> and connect via <a href="/partners#opportunity-form">partnership inquiry</a>.</p>
      <p><img src="/hero-track-record.jpg" alt="Healthcare investor briefing" /></p>
    `,
  },
  {
    id: '4',
    title: 'How Focus Health Evaluates New Healthcare Markets Before Expansion',
    slug: 'focus-health-market-evaluation-expansion-playbook',
    category: 'Market Analysis',
    excerpt:
      'A closer look at the data points, access gaps, and local demand signals Focus Health reviews before entering a new market.',
    coverImage: '/hero-market.jpg',
    publishedAt: '2026-03-18',
    author: 'Jay Dahal',
    status: 'published',
    content: `
      <h1>How Focus Health Evaluates New Healthcare Markets Before Expansion</h1>
      <p>Entering a new healthcare market requires more than strong demographics. Focus Health studies patient access patterns, competitor density, referral behavior, and neighborhood-level growth trends before committing capital.</p>

      <h2>Start With Access Gaps</h2>
      <p>We begin by identifying corridors where patients experience friction in receiving timely emergency or urgent care. Long drive times, overcrowded hospital systems, and fast-moving residential growth can all signal opportunity.</p>

      <h3>Validate Local Economics</h3>
      <p>Population growth alone is not enough. We also evaluate commercial development, payer mix, employment centers, and physician ecosystem strength to understand long-term sustainability.</p>

      <h4>Move With Discipline</h4>
      <p>Every market review is filtered through an execution lens. If staffing, permitting, or launch timelines look misaligned, we would rather wait than force expansion.</p>

      <p><a href="/market">Review our market strategy</a> and learn how Focus Health prioritizes expansion opportunities.</p>
      <p><img src="/hero-market.jpg" alt="Healthcare market evaluation strategy" /></p>
    `,
  },
  {
    id: '5',
    title: 'Operational Readiness: What Happens in the 90 Days Before a Facility Opens',
    slug: 'operational-readiness-90-days-before-facility-opening',
    category: 'Clinical Operations',
    excerpt:
      'From staffing and training to systems testing and patient experience workflows, the final 90 days are critical to a strong healthcare launch.',
    coverImage: '/hero-platform.jpg',
    publishedAt: '2026-03-19',
    author: 'Jamie Alcantar',
    status: 'published',
    content: `
      <h1>Operational Readiness: What Happens in the 90 Days Before a Facility Opens</h1>
      <p>The weeks leading up to launch set the tone for everything that follows. Focus Health uses the final 90 days to align leadership, staffing, systems, and patient-facing processes so facilities open with confidence.</p>

      <h2>Recruitment and Clinical Alignment</h2>
      <p>Staffing plans are finalized early enough to support onboarding, role clarity, and simulation-based training. This is where culture and accountability start taking shape.</p>

      <h3>Systems Testing</h3>
      <p>Technology, reporting, clinical workflows, and escalation paths are tested before day one. Launches run smoother when teams know exactly how information will move across the facility.</p>

      <h4>Patient Experience Matters</h4>
      <p>Signage, intake, triage, communication, and discharge education are all reviewed through the patient lens. Strong operations should feel clear, fast, and reassuring from the first visit.</p>

      <p>Learn more about our <a href="/platform">operating platform</a> and how we prepare facilities for high-performance launches.</p>
      <p><img src="/hero-platform.jpg" alt="Clinical operations readiness before opening" /></p>
    `,
  },
  {
    id: '6',
    title: 'Focus Health Growth Update: Building a Stronger Pipeline for 2026',
    slug: 'focus-health-growth-update-2026-pipeline',
    category: 'Company News',
    excerpt:
      'Focus Health is expanding its pipeline with disciplined market selection, partner alignment, and a deeper focus on scalable healthcare infrastructure.',
    coverImage: '/hero-partners.jpg',
    publishedAt: '2026-03-20',
    author: 'Rick Leonard',
    status: 'published',
    content: `
      <h1>Focus Health Growth Update: Building a Stronger Pipeline for 2026</h1>
      <p>As Focus Health looks ahead, our priority is not growth for growth’s sake. We are building a stronger, more selective pipeline rooted in demand, execution readiness, and operator alignment.</p>

      <h2>A More Focused Pipeline</h2>
      <p>Current pipeline activity reflects lessons from prior launches. We are concentrating attention on markets where access gaps are clear and partnership structures support long-term performance.</p>

      <h3>Partner Alignment</h3>
      <p>We are also strengthening coordination with investors, operators, and local stakeholders so projects move with clearer expectations and better reporting from the start.</p>

      <h4>Looking Ahead</h4>
      <p>With deeper underwriting discipline and a repeatable launch model, Focus Health is well-positioned to keep expanding responsibly through 2026 and beyond.</p>

      <p>Visit our <a href="/track-record">track record</a> and <a href="/investors">investor resources</a> pages for more information.</p>
      <p><img src="/hero-partners.jpg" alt="Focus Health growth pipeline update" /></p>
    `,
  },
];

export function getPublishedBlogPosts() {
  return BLOG_POSTS.filter((post) => post.status === 'published').sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
