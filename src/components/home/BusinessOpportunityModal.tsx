import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const metroAreas = [
  { name: 'Dallas-Fort Worth', growth: '+18%', icon: '🏙️' },
  { name: 'Houston', growth: '+15%', icon: '🌆' },
  { name: 'Austin', growth: '+25%', icon: '🎸' },
  { name: 'San Antonio', growth: '+12%', icon: '🏛️' },
];

interface BusinessOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessOpportunityModal = ({ isOpen, onClose }: BusinessOpportunityModalProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl border border-border"
          >
            {/* Decorative background */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-muted/80 p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 text-center">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-foreground sm:text-2xl"
              >
                Texas <span className="text-gradient-blue">Business Opportunities</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-1 text-sm text-muted-foreground"
              >
                High-growth emergency care markets
              </motion.p>
            </div>

            {/* Metro Cards Grid */}
            <div className="relative grid grid-cols-2 gap-3 px-6 pb-4">
              {metroAreas.map((metro, index) => (
                <motion.div
                  key={metro.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 p-3 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/50"
                >
                  <div className="mb-1 text-2xl">{metro.icon}</div>
                  <h3 className="text-sm font-medium text-foreground">{metro.name}</h3>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <TrendingUp size={12} className="text-accent" />
                    <span className="text-xs font-semibold text-accent">{metro.growth}</span>
                  </div>
                  
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"
                    animate={{ scale: hoveredIndex === index ? 1.02 : 1 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative border-t border-border bg-muted/20 px-6 py-4"
            >
              <Button
                variant="hero"
                size="default"
                asChild
                className="group w-full"
              >
                <Link to="/partners" onClick={onClose}>
                  Partner With Us
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
