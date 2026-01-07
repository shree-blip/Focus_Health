import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Building, Users2, Rocket, LineChart } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const steps = [
  {
    id: 1,
    icon: MapPin,
    title: 'Market & Site Selection',
    shortDesc: 'Strategic location analysis',
    fullDesc: 'Rigorous market analysis identifies high-growth Texas markets with underserved populations. We evaluate demographics, competition, accessibility, and long-term growth potential to select optimal sites.',
  },
  {
    id: 2,
    icon: Building,
    title: 'Facility Build & Compliance',
    shortDesc: 'Turn-key construction',
    fullDesc: 'From ground-up builds to retrofits, we manage the entire construction process. Our standardized facility design ensures regulatory compliance, operational efficiency, and exceptional patient experience.',
  },
  {
    id: 3,
    icon: Users2,
    title: 'Clinical + Ops Staffing',
    shortDesc: 'Expert team assembly',
    fullDesc: 'We recruit and train high-caliber clinical and operational staff. Our proven staffing model ensures 24/7 coverage with the right mix of experience and credentials for each location.',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Launch & 24/7 Operations',
    shortDesc: 'Seamless activation',
    fullDesc: 'Our launch playbook ensures a smooth opening with immediate operational excellence. We handle credentialing, payer contracting, community outreach, and day-one readiness.',
  },
  {
    id: 5,
    icon: LineChart,
    title: 'Performance Optimization',
    shortDesc: 'Continuous improvement',
    fullDesc: 'Ongoing operational refinement drives efficiency and quality. We monitor key metrics, implement best practices, and continuously optimize staffing, throughput, and patient satisfaction.',
  },
];

export const TurnkeyModelSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-focus">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
              How the Turnkey Model Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              End-to-end delivery from site selection to operational excellence
            </p>
          </div>
        </ScrollReveal>

        {/* Horizontal Scrolling Timeline - Desktop */}
        <div className="hidden lg:block relative">
          {/* Timeline Line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-border">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-8 pt-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-64"
              >
                <div className="relative">
                  {/* Step Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                      activeStep === step.id
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <span className="text-sm font-bold">{step.id}</span>
                  </div>

                  {/* Card */}
                  <motion.button
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full p-6 rounded-xl text-left transition-all duration-300 ${
                      activeStep === step.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-card border border-border hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    <step.icon
                      size={24}
                      className={`mb-4 ${
                        activeStep === step.id ? 'text-primary-foreground' : 'text-primary'
                      }`}
                    />
                    <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
                    <p
                      className={`text-sm ${
                        activeStep === step.id
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.shortDesc}
                    </p>
                    <ChevronRight
                      size={16}
                      className={`mt-4 transition-transform ${
                        activeStep === step.id ? 'rotate-90' : ''
                      } ${activeStep === step.id ? 'text-primary-foreground' : 'text-primary'}`}
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail Drawer */}
          <AnimatePresence>
            {activeStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 overflow-hidden"
              >
                <div className="bg-card border border-border rounded-xl p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const step = steps.find((s) => s.id === activeStep);
                        if (step) {
                          const Icon = step.icon;
                          return <Icon size={24} className="text-primary" />;
                        }
                        return null;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xl mb-3">
                        {steps.find((s) => s.id === activeStep)?.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {steps.find((s) => s.id === activeStep)?.fullDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Stack View */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, index) => (
            <ScrollReveal key={step.id} delay={index * 0.1}>
              <motion.div
                initial={false}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  className="w-full p-6 flex items-center gap-4 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeStep === step.id
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <span className="font-bold">{step.id}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.shortDesc}</p>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-muted-foreground transition-transform ${
                      activeStep === step.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeStep === step.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-border">
                        <p className="text-muted-foreground leading-relaxed">
                          {step.fullDesc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
