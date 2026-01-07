import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-pattern">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Abstract Texas Map Effect with Nodes */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Connection Lines */}
          <motion.path
            d="M200 400 Q 400 300 600 400 T 1000 350"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
          <motion.path
            d="M300 500 Q 500 400 700 500 T 900 450"
            stroke="hsl(var(--secondary))"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Network Nodes - Blue */}
          {[
            { cx: 200, cy: 400, delay: 0 },
            { cx: 400, cy: 350, delay: 0.3 },
            { cx: 600, cy: 400, delay: 0.6 },
            { cx: 800, cy: 380, delay: 0.9 },
            { cx: 1000, cy: 350, delay: 1.2 },
          ].map((node, i) => (
            <g key={i}>
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r="8"
                fill="hsl(var(--primary))"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: node.delay + 1, duration: 0.5 }}
              />
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r="16"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{
                  delay: node.delay + 1.5,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </g>
          ))}
          
          {/* Red Accent Nodes - Momentum */}
          {[
            { cx: 500, cy: 380, delay: 1.5 },
            { cx: 900, cy: 420, delay: 2 },
          ].map((node, i) => (
            <g key={`red-${i}`}>
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r="6"
                fill="hsl(var(--accent))"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: node.delay, duration: 0.5 }}
              />
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r="12"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{
                  delay: node.delay + 0.5,
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              />
            </g>
          ))}
        </svg>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-focus relative z-10">
        <div className="max-w-4xl">
          {/* Launch Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Launch Expected Q4 2025
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] mb-6"
          >
            Investing in Healthcare.{' '}
            <span className="text-gradient-blue">Delivering Excellence.</span>
          </motion.h1>

          {/* Supporting Line */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-4 max-w-2xl"
          >
            We're revolutionizing healthcare by partnering with communities and investors to build and operate high-performance medical facilities.
          </motion.p>

          {/* Extended Value Prop */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-muted-foreground mb-8 max-w-2xl"
          >
            Turnkey FSER delivery: site strategy → build-out → staffing → operations → performance optimization.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/partners?tab=investors">
                Partner With Us
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/contact">Get Early Access</Link>
            </Button>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { icon: Zap, label: 'Turnkey' },
              { icon: Clock, label: '24/7 Model' },
              { icon: MapPin, label: 'Texas Growth Markets' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={16} className="text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
