import { motion } from 'framer-motion';
import { RefreshCw, Building, Zap, Users, LineChart, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const whyFocus = [
  { icon: Zap, title: 'Turnkey Delivery', description: 'Complete end-to-end solution from site selection to operational excellence.' },
  { icon: RefreshCw, title: 'Speed to Launch', description: 'Proven playbook for efficient facility activation and market entry.' },
  { icon: Building, title: 'Operational Rigor', description: 'Standardized processes refined across 24+ managed locations.' },
  { icon: Users, title: 'Community-First Approach', description: 'Deep partnerships with local stakeholders and healthcare ecosystems.' },
  { icon: LineChart, title: 'Scalable Platform', description: 'Infrastructure designed to grow with your investment portfolio.' },
  { icon: FileText, title: 'Transparent Reporting', description: 'Clear metrics, regular updates, and full operational visibility.' },
];

const PlatformPage = () => {
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
              Our Platform
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              Build + Fund + <span className="text-gradient-blue">Operate</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Our integrated platform delivers the complete lifecycle of freestanding ER and micro-hospital development—from initial market analysis to ongoing operational optimization.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Platform Diagram */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-center justify-center py-16">
                {/* Loop Animation */}
                <svg viewBox="0 0 400 200" className="w-full max-w-lg">
                  {/* Background Circle */}
                  <motion.ellipse
                    cx="200"
                    cy="100"
                    rx="150"
                    ry="70"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2 }}
                  />

                  {/* Animated Pulse */}
                  <motion.circle
                    r="8"
                    fill="hsl(var(--accent))"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ offsetPath: 'ellipse(150px 70px at 200px 100px)' }}
                  />

                  {/* Nodes */}
                  {[
                    { x: 50, y: 100, label: 'Build' },
                    { x: 200, y: 30, label: 'Fund' },
                    { x: 350, y: 100, label: 'Operate' },
                  ].map((node, i) => (
                    <g key={node.label}>
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r="30"
                        fill="hsl(var(--primary))"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                      />
                      <motion.text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill="hsl(var(--primary-foreground))"
                        fontSize="12"
                        fontWeight="600"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 + 0.3 }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Focus */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Why Focus Healthcare
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Six pillars that define our operational excellence
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyFocus.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PlatformPage;
