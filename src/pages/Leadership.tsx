import { motion } from 'framer-motion';
import { 
  Shield, Target, Users, TrendingUp, Heart, 
  Building2, Briefcase, Award, UserCheck, 
  Stethoscope, BarChart3, MapPin, Star 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const skillBadges = [
  'Private Equity',
  'M&A',
  'Healthcare Leader',
  'Finance Leader',
];

const experienceItems = [
  {
    icon: Briefcase,
    highlight: 'Chief Financial Officer',
    company: 'Total Point Healthcare',
    description: 'Successfully managed',
    stats: [
      { value: '24', label: 'hospitals' },
      { value: '600+', label: 'staff members' },
    ],
  },
  {
    icon: Stethoscope,
    highlight: 'ER of Irving',
    secondHighlight: 'ER of Lufkin',
    description: 'Currently managing with a team of',
    stats: [
      { value: '80', label: 'medical professionals' },
      { value: '10', label: 'administrative staff' },
    ],
  },
  {
    icon: Building2,
    highlight: 'Focus Health',
    secondHighlight: 'Elysian Capital Inc',
    description: 'Key leadership roles, bringing extensive experience in healthcare investment and operations',
    stats: [],
  },
  {
    icon: TrendingUp,
    highlight: 'healthcare business development',
    description: 'Proven track record of successful',
    suffix: 'with expertise in scaling multi-site operations',
    stats: [],
  },
];

const achievements = [
  'Led $100M+ annual revenue healthcare organization',
  'Ran 40+ planned healthcare facilities across multiple states',
  'Developed a diversified portfolio across healthcare and QSR',
];

const philosophy = [
  'Patient-centered approach to emergency care',
  'Data-driven operational excellence',
  'Strategic market expansion in high-growth regions',
  'Building strong healthcare teams for 24/7 operations',
];

const supportingTeam = [
  'Experienced clinical directors',
  'Skilled operations management',
  'Dedicated acquisition specialists',
  'Regional development coordinators',
];

const principles = [
  {
    icon: Shield,
    title: 'Integrity',
    description: 'Transparent dealings, honest communication, and ethical operations in all that we do.',
  },
  {
    icon: Target,
    title: 'Operational Excellence',
    description: 'Relentless focus on efficiency, quality, and continuous improvement across every location.',
  },
  {
    icon: Users,
    title: 'Community Partnership',
    description: 'Deep commitment to the communities we serve, building lasting relationships beyond transactions.',
  },
  {
    icon: Heart,
    title: 'Patient-Centered Care',
    description: 'Every decision starts with the patient—their safety, experience, and outcomes come first.',
  },
];

const LeadershipPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-hero-pattern">
        <div className="container-focus">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Our Team
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              Leadership
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Experienced operators building the next generation of healthcare infrastructure.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Creative Portfolio Section */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column - Profile & Experience */}
            <div className="lg:col-span-7">
              <ScrollReveal>
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                  {/* Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative flex-shrink-0"
                  >
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center ring-4 ring-background shadow-premium">
                      <span className="text-4xl sm:text-5xl font-heading font-bold text-primary">JD</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Star size={16} className="text-white fill-white" />
                    </div>
                  </motion.div>

                  {/* Name & Title */}
                  <div className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
                      Jay Dahal
                    </h2>
                    <p className="text-lg sm:text-xl font-medium mt-1">
                      <span className="text-primary">Founder & CEO</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-accent">Financial Architect</span>
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {skillBadges.map((badge, index) => (
                        <motion.span
                          key={badge}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="px-4 py-1.5 rounded-full border border-border bg-background text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-default"
                        >
                          {badge}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Divider */}
              <div className="w-16 h-1 bg-accent rounded-full mb-8" />

              {/* Experience Timeline */}
              <div className="space-y-6">
                {experienceItems.map((item, index) => (
                  <ScrollReveal key={index} delay={index * 0.1}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex gap-4 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <item.icon size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed">
                          {item.description}{' '}
                          <span className="font-semibold text-accent">{item.highlight}</span>
                          {item.secondHighlight && (
                            <>
                              {' '}and{' '}
                              <span className="font-semibold text-accent">{item.secondHighlight}</span>
                            </>
                          )}
                          {item.company && (
                            <> at <span className="text-primary font-medium">{item.company}</span></>
                          )}
                          {item.stats.length > 0 && (
                            <>
                              {' '}with over{' '}
                              {item.stats.map((stat, i) => (
                                <span key={i}>
                                  <span className="font-bold text-accent">{stat.value}</span>
                                  {' '}<span className="font-semibold text-accent">{stat.label}</span>
                                  {i < item.stats.length - 1 && ' and '}
                                </span>
                              ))}
                            </>
                          )}
                          {item.suffix && <> {item.suffix}</>}
                        </p>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Right Column - Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Key Achievements Card */}
              <ScrollReveal direction="left">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-primary text-primary-foreground"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Award size={20} className="text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">Key Achievements</h3>
                  </div>
                  <ul className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-2 text-sm text-primary-foreground/90"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        {achievement}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollReveal>

              {/* Leadership Philosophy Card */}
              <ScrollReveal direction="left" delay={0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-primary text-primary-foreground"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">Leadership Philosophy</h3>
                  </div>
                  <ul className="space-y-3">
                    {philosophy.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-2 text-sm text-primary-foreground/90"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollReveal>

              {/* Supporting Team Card */}
              <ScrollReveal direction="left" delay={0.2}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-primary text-primary-foreground"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <UserCheck size={20} className="text-accent" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">Supporting Team</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/90 leading-relaxed">
                    {supportingTeam.join(' • ')}
                  </p>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Principles
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The values that guide every decision we make
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <ScrollReveal key={principle.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 text-center h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <principle.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground text-sm">{principle.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LeadershipPage;
