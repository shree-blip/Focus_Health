import { motion } from 'framer-motion';
import { 
  Shield, Target, Users, TrendingUp, Heart, 
  Building2, Briefcase, Award, 
  Stethoscope, Star, ChevronRight,
  HardHat, GraduationCap, Sparkles
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useState } from 'react';

const leaders = [
  {
    id: 'jay',
    initials: 'JD',
    name: 'Jay Dahal',
    role: 'Founder & CEO',
    subtitle: 'Financial Architect',
    tagline: 'Building healthcare empires through strategic vision and operational excellence.',
    color: 'primary',
    accentColor: 'accent',
    skills: ['Private Equity', 'M&A', 'Healthcare Leader', 'Finance Leader'],
    stats: [
      { value: '$100M+', label: 'Annual Revenue Led' },
      { value: '24+', label: 'Locations Managed' },
      { value: '600+', label: 'Staff Managed' },
    ],
    highlights: [
      { icon: Briefcase, text: 'Consulting CFO at Total Point Healthcare managing 24 hospitals' },
      { icon: Stethoscope, text: 'Currently managing ER of Irving & ER of Lufkin' },
      { icon: Building2, text: 'Key leadership at Focus Health & Elysian Capital' },
      { icon: TrendingUp, text: 'Proven track record in scaling multi-site operations' },
    ],
    philosophy: [
      'Patient-centered approach to emergency care',
      'Data-driven operational excellence',
      'Strategic market expansion in high-growth regions',
    ],
  },
  {
    id: 'rick',
    initials: 'RL',
    name: 'Rick Leonard',
    role: 'Healthcare Operations',
    subtitle: 'Leader',
    tagline: 'Transforming healthcare infrastructure through operational excellence and strategic facility planning.',
    color: 'accent',
    accentColor: 'primary',
    skills: ['Hospital Operations', 'Facility Management', 'Healthcare Construction', 'Equipment Planning'],
    stats: [
      { value: '35+', label: 'Years Experience' },
      { value: '50+', label: 'Projects Delivered' },
      { value: '4', label: 'Major Health Systems' },
    ],
    highlights: [
      { icon: Building2, text: '35+ years in hospital operations & facility management' },
      { icon: HardHat, text: 'Led multiple hospital & emergency center projects from concept to completion' },
      { icon: Briefcase, text: 'Leadership roles at ServiceMaster, Texas Health Resources, CHS' },
      { icon: Target, text: 'Equipment planning for Stanford, Sutter & Marshfield Clinic' },
    ],
    philosophy: [
      'Operational efficiency drives patient outcomes',
      'Strategic facility planning creates lasting value',
      'Excellence in execution, every project',
    ],
  },
];

const principles = [
  {
    icon: Shield,
    title: 'Integrity',
    description: 'Transparent dealings, honest communication, and ethical operations.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Relentless focus on efficiency and continuous improvement.',
  },
  {
    icon: Users,
    title: 'Partnership',
    description: 'Deep commitment to the communities we serve.',
  },
  {
    icon: Heart,
    title: 'Patient-First',
    description: 'Every decision starts with patient safety and outcomes.',
  },
];

const LeadershipPage = () => {
  const [activeLeader, setActiveLeader] = useState<string | null>(null);

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-hero-pattern relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container-focus relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles size={16} />
              Meet Our Leadership
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              The Minds Behind <br />
              <span className="text-gradient-blue">Focus Health</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Two visionary leaders. Decades of combined experience. One mission: 
              Building the next generation of healthcare infrastructure.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Leadership Cards - Side by Side */}
      <section className="section-padding bg-card relative">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-8">
            {leaders.map((leader, index) => (
              <ScrollReveal key={leader.id} delay={index * 0.2}>
                <motion.div
                  onHoverStart={() => setActiveLeader(leader.id)}
                  onHoverEnd={() => setActiveLeader(null)}
                  whileHover={{ y: -8 }}
                  className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 ${
                    activeLeader === leader.id 
                      ? `border-${leader.color} shadow-2xl` 
                      : 'border-border shadow-lg'
                  }`}
                >
                  {/* Header with gradient */}
                  <div className={`bg-${leader.color} p-8 text-${leader.color}-foreground relative overflow-hidden`}>
                    {/* Animated background pattern */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                      className="absolute -right-20 -top-20 w-64 h-64 opacity-10"
                    >
                      <div className="w-full h-full border-[40px] border-white rounded-full" />
                    </motion.div>
                    
                    <div className="relative flex items-start gap-6">
                      {/* Avatar */}
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="relative flex-shrink-0"
                      >
                        <div className={`w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl`}>
                          <span className="text-4xl font-heading font-bold text-white">
                            {leader.initials}
                          </span>
                        </div>
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.2 }}
                          className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-${leader.accentColor} flex items-center justify-center shadow-lg`}
                        >
                          <Star size={14} className="text-white fill-white" />
                        </motion.div>
                      </motion.div>

                      {/* Name & Title */}
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                          {leader.name}
                        </h2>
                        <p className="text-white/80 font-medium mt-1">
                          {leader.role} <span className="text-white/60">/</span> {leader.subtitle}
                        </p>
                        <p className="text-white/70 text-sm mt-2 leading-relaxed">
                          {leader.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 border-b border-border">
                    {leader.stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        viewport={{ once: true }}
                        className={`p-4 text-center ${i < 2 ? 'border-r border-border' : ''} bg-background`}
                      >
                        <p className={`text-xl sm:text-2xl font-heading font-bold text-${leader.color}`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="p-6 bg-background">
                    <div className="flex flex-wrap gap-2">
                      {leader.skills.map((skill, i) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          viewport={{ once: true }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border border-${leader.color}/30 bg-${leader.color}/5 text-${leader.color}`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="p-6 pt-0 bg-background">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Career Highlights
                    </h3>
                    <div className="space-y-3">
                      {leader.highlights.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 group"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-${leader.color}/10 flex items-center justify-center flex-shrink-0 group-hover:bg-${leader.color}/20 transition-colors`}>
                            <item.icon size={16} className={`text-${leader.color}`} />
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Philosophy */}
                  <div className={`p-6 bg-${leader.color}/5 border-t border-${leader.color}/10`}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Leadership Philosophy
                    </h3>
                    <ul className="space-y-2">
                      {leader.philosophy.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <ChevronRight size={14} className={`text-${leader.color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Combined Vision Section */}
      <section className="section-padding bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="container-focus relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                United by Purpose
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Together, Jay and Rick bring the perfect blend of financial acumen and operational expertise 
                to deliver exceptional healthcare facilities.
              </p>
            </div>
          </ScrollReveal>

          {/* Combined Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '50+', label: 'Years Combined Experience' },
              { value: '100+', label: 'Healthcare Projects' },
              { value: '$100M+', label: 'Revenue Managed' },
              { value: '10+', label: 'States Covered' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <p className="text-3xl sm:text-4xl font-heading font-bold text-accent">{stat.value}</p>
                  <p className="text-sm text-primary-foreground/70 mt-2">{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Guiding Principles
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
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 text-center h-full group"
                >
                  <motion.div 
                    whileHover={{ rotate: 10 }}
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors"
                  >
                    <principle.icon size={28} className="text-primary" />
                  </motion.div>
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