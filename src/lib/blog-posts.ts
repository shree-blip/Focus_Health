export type BlogPost = {
  id: string;
  title: string;
  slug: string;
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
      <p><img src="/facility-er-whiterock.png" alt="Focus Health operating model" /></p>
    `,
  },
  {
    id: '3',
    title: 'What Investors Should Look for in Healthcare Infrastructure Operators',
    slug: 'investor-checklist-healthcare-infrastructure-operators',
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
