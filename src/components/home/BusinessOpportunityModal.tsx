"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ArrowRight, Music, Building2, Stethoscope, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const metroAreas = [
  { 
    name: 'Austin', 
    growth: '+25%', 
    icon: Music,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    description: 'Rapid expansion in North Austin and Round Rock creates immediate demand for specialized urgent care clinics.'
  },
  { 
    name: 'Dallas-Fort Worth', 
    growth: '+18%', 
    icon: Building2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
    description: 'The Metroplex remains a hub for corporate relocation, driving the need for 24/7 emergency care proximity.'
  },
  { 
    name: 'Houston', 
    growth: '+15%', 
    icon: Stethoscope,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
    description: 'Medical center saturation is shifting focus to outlying suburban communities requiring robust emergency infrastructure.'
  },
  { 
    name: 'San Antonio', 
    growth: '+12%', 
    icon: Landmark,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    description: 'Steady demographic growth in the military and tourism sectors ensures consistent patient volume for new facilities.'
  },
];

interface BusinessOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessOpportunityModal = ({ isOpen, onClose }: BusinessOpportunityModalProps) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl sm:rounded-2xl bg-card shadow-2xl border border-border"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 rounded-full bg-muted/80 p-1.5 sm:p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <X size={16} className="sm:hidden" />
              <X size={18} className="hidden sm:block" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Image Section - Hidden on mobile for better UX */}
              <div className="hidden md:block relative w-2/5 min-h-[480px] bg-gradient-to-br from-primary/20 to-accent/20">
                <img 
                  src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600&h=800&fit=crop&crop=bottom"
                  alt="Austin Texas Skyline"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Market Insight</span>
                  <h3 className="mt-2 text-xl font-bold leading-tight">
                    The Future of Healthcare Infrastructure in the Lone Star State
                  </h3>
                </div>
              </div>

              {/* Right Content Section */}
              <div className="flex-1 p-4 sm:p-6 md:p-8">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl sm:text-2xl font-bold text-foreground"
                >
                  Texas <span className="text-primary">Business Opportunities</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mt-2 text-sm text-muted-foreground"
                >
                  High-growth emergency care markets across the state.
                </motion.p>

                {/* Metro List */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {metroAreas.map((metro, index) => {
                    const IconComponent = metro.icon;
                    return (
                      <motion.div
                        key={metro.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                        className="flex items-start gap-3 sm:gap-4"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${metro.iconBg} flex items-center justify-center`}>
                          <IconComponent size={16} className={`${metro.iconColor} sm:hidden`} />
                          <IconComponent size={20} className={`${metro.iconColor} hidden sm:block`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{metro.name}</h4>
                            <div className="flex items-center gap-1">
                              <TrendingUp size={12} className="text-accent sm:hidden" />
                              <TrendingUp size={14} className="text-accent hidden sm:block" />
                              <span className="text-xs sm:text-sm font-semibold text-accent">{metro.growth}</span>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                            {metro.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 sm:mt-8 flex justify-center sm:justify-end"
                >
                  <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link href="/partners#opportunity-form" onClick={onClose}>
                      Partner With Us
                      <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};