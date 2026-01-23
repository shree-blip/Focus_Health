import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, TrendingUp, Users, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetroArea {
  name: string;
  population: string;
  growth: string;
  erVisits: string;
  icon: string;
  gradient: string;
}

const metroAreas: MetroArea[] = [
  {
    name: 'Dallas-Fort Worth',
    population: '7.6M+',
    growth: '+18%',
    erVisits: '2.1M+',
    icon: '🏙️',
    gradient: 'from-primary to-secondary',
  },
  {
    name: 'Houston',
    population: '7.1M+',
    growth: '+15%',
    erVisits: '1.9M+',
    icon: '🌆',
    gradient: 'from-accent to-destructive',
  },
  {
    name: 'Austin',
    population: '2.3M+',
    growth: '+25%',
    erVisits: '680K+',
    icon: '🎸',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'San Antonio',
    population: '2.5M+',
    growth: '+12%',
    erVisits: '720K+',
    icon: '🏛️',
    gradient: 'from-amber-500 to-orange-600',
  },
];

interface BusinessOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessOpportunityModal = ({ isOpen, onClose }: BusinessOpportunityModalProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
          />

          {/* Modal - Improved responsive positioning */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 z-50 m-auto h-fit max-h-[90vh] w-auto max-w-4xl overflow-auto sm:inset-6 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-2xl border border-border">
              {/* Decorative background elements */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full bg-muted p-2 text-muted-foreground transition-all hover:bg-muted-foreground/20 hover:text-foreground sm:right-4 sm:top-4"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="relative px-4 pt-6 pb-3 text-center sm:px-6 sm:pt-8 sm:pb-4 md:px-10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:mb-3 sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  <Sparkles size={14} className="sm:h-4 sm:w-4" />
                  <span>Exclusive Investment Opportunities</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl"
                >
                  Texas Metro{' '}
                  <span className="text-gradient-blue">Business Opportunities</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base"
                >
                  Partner with Focus Health in Texas's fastest-growing emergency care markets
                </motion.p>
              </div>

              {/* Metro Cards Grid */}
              <div className="relative grid gap-3 px-4 pb-3 sm:gap-4 sm:px-6 sm:pb-4 md:grid-cols-2 md:px-10">
                {metroAreas.map((metro, index) => (
                  <motion.div
                    key={metro.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.1 }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:p-4 md:p-5"
                  >
                    {/* Gradient overlay on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${metro.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                    />

                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-2xl sm:text-3xl">{metro.icon}</div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground sm:text-base">{metro.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                            <MapPin size={12} className="sm:h-3.5 sm:w-3.5" />
                            <span>Metro Area</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          scale: hoveredIndex === index ? 1.1 : 1,
                          rotate: hoveredIndex === index ? 5 : 0,
                        }}
                        className="rounded-full bg-primary/10 p-1.5 sm:p-2"
                      >
                        <TrendingUp size={14} className="text-primary sm:h-[18px] sm:w-[18px]" />
                      </motion.div>
                    </div>

                    {/* Stats */}
                    <div className="relative mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
                      <div className="rounded-lg bg-muted/50 p-1.5 text-center sm:p-2.5">
                        <Users size={14} className="mx-auto mb-0.5 text-primary sm:mb-1 sm:h-4 sm:w-4" />
                        <p className="text-xs font-semibold text-foreground sm:text-sm">{metro.population}</p>
                        <p className="text-[10px] text-muted-foreground sm:text-xs">Population</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-1.5 text-center sm:p-2.5">
                        <TrendingUp size={14} className="mx-auto mb-0.5 text-accent sm:mb-1 sm:h-4 sm:w-4" />
                        <p className="text-xs font-semibold text-accent sm:text-sm">{metro.growth}</p>
                        <p className="text-[10px] text-muted-foreground sm:text-xs">Growth</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-1.5 text-center sm:p-2.5">
                        <Building2 size={14} className="mx-auto mb-0.5 text-secondary sm:mb-1 sm:h-4 sm:w-4" />
                        <p className="text-xs font-semibold text-foreground sm:text-sm">{metro.erVisits}</p>
                        <p className="text-[10px] text-muted-foreground sm:text-xs">ER Visits/yr</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative border-t border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-6 md:px-10"
              >
                <div className="flex flex-col items-center justify-between gap-3 text-center sm:gap-4 md:flex-row md:text-left">
                  <div>
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      Ready to explore partnership opportunities?
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Join our investor network and access exclusive market data
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="default"
                    asChild
                    className="group w-full sm:w-auto sm:min-w-[200px]"
                  >
                    <Link to="/partners" onClick={onClose}>
                      Partner With Us
                      <ArrowRight
                        size={18}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
