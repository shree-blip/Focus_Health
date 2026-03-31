"use client";

import Link from 'next/link';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      opacity: [0.2, 0.5, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Animated gradient orb
const GradientOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Live pulse ring component
const PulseRing = ({ delay, size, color }: { delay: number; size: number; color: string }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
    style={{ 
      width: size, 
      height: size,
      borderColor: color,
    }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: [0.8, 1.5, 2], opacity: [0, 0.4, 0] }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

// Heartbeat line animation
const HeartbeatLine = () => {
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="absolute bottom-20 left-0 w-full h-24 opacity-20" preserveAspectRatio="none">
      <motion.path
        key={key}
        d="M0 50 L100 50 L120 50 L130 20 L140 80 L150 30 L160 50 L200 50 L1400 50"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

const liveStats = [
  { value: "24+", label: "Facilities Managed" },
  { value: "24/7", label: "Operations Model" },
  { value: "Texas", label: "Growth Markets" },
];

// Live stats ticker
const LiveStatsTicker = () => {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % liveStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-8 overflow-hidden">
      {liveStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="absolute inset-0 flex items-center gap-2"
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: currentStat === index ? 0 : currentStat > index ? -30 : 30,
            opacity: currentStat === index ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="text-accent font-bold">{stat.value}</span>
          <span className="text-muted-foreground">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Mouse follow effect hook
const useMousePosition = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointerQuery = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    if (!finePointerQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
};

interface HeroSectionProps {
  onOpenOpportunities?: () => void;
}

export const HeroSection = ({ onOpenOpportunities }: HeroSectionProps) => {
  const { mouseX, mouseY } = useMousePosition();

  const springConfig = { stiffness: 100, damping: 30 };
  const transformedX = useTransform(mouseX, (x) => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    return (x / w) * 60 - 30;
  });
  const transformedY = useTransform(mouseY, (y) => {
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;
    return (y / h) * 60 - 30;
  });
  const orbX = useSpring(transformedX, springConfig);
  const orbY = useSpring(transformedY, springConfig);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const unit = seed / 233280;
        const unit2 = ((seed * 7919) % 233280) / 233280;
        const unit3 = ((seed * 1543) % 233280) / 233280;
        const unit4 = ((seed * 2971) % 233280) / 233280;
        const unit5 = ((seed * 6151) % 233280) / 233280;

        return {
          id: i,
          x: unit * 100,
          y: unit2 * 100,
          size: unit3 * 8 + 4,
          delay: unit4 * 5,
          duration: unit5 * 3 + 4,
        };
      }),
    [],
  );

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideos = ['/Irving_Wellness/IHW-Event-Horizontal.mp4', '/ERofIrving-GrandOpening.mp4'];
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);

  // Robust autoplay: handles first load, tab focus, back-nav (bfcache), retries
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.muted = true;
      if (v.paused) v.play().catch(() => {});
    };

    // Immediate + buffering events
    tryPlay();
    v.addEventListener('canplay', tryPlay);
    v.addEventListener('loadeddata', tryPlay);

    // Tab/window regains focus
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Back-navigation / bfcache restore — most common repeated-visit failure
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) tryPlay();
    };
    window.addEventListener('pageshow', onPageShow);

    // Safety-net retries for slow connections
    const t1 = setTimeout(tryPlay, 300);
    const t2 = setTimeout(tryPlay, 1000);
    const t3 = setTimeout(tryPlay, 2500);

    return () => {
      v.removeEventListener('canplay', tryPlay);
      v.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleHeroVideoEnded = () => {
    setHeroVideoIndex((current) => {
      if (current < heroVideos.length - 1) return current + 1;
      return current;
    });
  };

  return (
    <section className="relative -mt-[100px] min-h-[calc(100vh+200px)] flex items-center overflow-hidden bg-background">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={heroVideoRef}
          src={heroVideos[heroVideoIndex]}
          autoPlay
          loop={heroVideoIndex === heroVideos.length - 1}
          muted
          playsInline
          preload="metadata"
          poster="/recent-event-hero.webp"
          onEnded={handleHeroVideoEnded}
          aria-hidden="true"
          className="w-full h-full object-cover"
          /* Extra attributes for iOS/Safari autoplay */
          {...{ 'webkit-playsinline': 'true' } as React.VideoHTMLAttributes<HTMLVideoElement>}
        >
          <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
        </video>
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />

      {/* Subtle animated overlays on top of video */}
      <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0 pointer-events-none"> 

        <GradientOrb className="w-[600px] h-[600px] -top-40 -left-40 bg-gradient-to-br from-primary/20 to-primary/5" />
        <GradientOrb className="w-[400px] h-[400px] -bottom-20 left-1/3 bg-gradient-to-tr from-secondary/15 to-secondary/5" delay={4} />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Heartbeat line */}
      <div className="hidden md:block">
        <HeartbeatLine />
      </div>

      {/* Content */}
      <div className="container-focus relative z-10 pt-[130px]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            {/* Live indicator badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20 text-sm font-medium backdrop-blur-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
                <span className="text-foreground">Now Accepting Strategic Partners</span>
                <Activity size={14} className="text-accent" />
              </span>
            </motion.div>

            {/* Main Headline with gradient animation */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-bold leading-[1.05] mb-4 sm:mb-6"
            >
              <span className="block">Investing in</span>
              <motion.span 
                className="block bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] text-transparent bg-clip-text"
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Healthcare.
              </motion.span>
              <span className="block text-foreground/90">Delivering Excellence.</span>
            </motion.h1>

            {/* Supporting Line */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4"
            >
              We're revolutionizing healthcare by partnering with communities and investors to build and operate high-performance medical facilities.
            </motion.p>

            {/* Extended Value Prop with typewriter effect hint */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono"
            >
              <span className="text-primary">→</span>
              <span>site strategy → build-out → staffing → operations → optimization</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10"
            >
              <Button variant="hero" size="lg" asChild className="group">
                <Link href="/partners#opportunity-form">
                  Partner With Us
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link href="/contact">Get Early Access</Link>
              </Button>
            </motion.div>

            {/* Live stats ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1 h-6 bg-gradient-to-b from-accent to-accent/30 rounded-full" />
                <LiveStatsTicker />
              </div>
            </motion.div>
          </div>

          {/* Right side - Interactive visual element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center relative"
          >
            <div className="relative w-96 h-96">
              {/* Video Logo Central Hub */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shadow-primary/40 border-2 border-primary/20"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <video
                  src="/FocusHealth.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                >
                  <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
                </video>
                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Pulsing glow ring around video */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-2xl border-2 border-primary/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Orbiting elements */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-5 h-5 -ml-2.5 -mt-2.5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "2.5px 160px" }}
                >
                  <motion.div
                    className={`w-5 h-5 rounded-full ${i % 2 === 0 ? 'bg-secondary/80 shadow-lg shadow-secondary/40' : 'bg-accent/80 shadow-lg shadow-accent/40'}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                  />
                </motion.div>
              ))}

              {/* Circular track */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 384">
                <circle cx="192" cy="192" r="160" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="2" strokeDasharray="10 5" />
                <circle cx="192" cy="192" r="130" fill="none" stroke="hsl(var(--accent) / 0.1)" strokeWidth="1" strokeDasharray="6 4" />
              </svg>

              {/* Floating labels */}
              {[
                { label: "Build", angle: -30 },
                { label: "Fund", angle: 90 },
                { label: "Operate", angle: 210 },
              ].map((item, i) => {
                const radians = (item.angle * Math.PI) / 180;
                const x = 192 + 175 * Math.cos(radians);
                const y = 192 + 175 * Math.sin(radians);
                return (
                  <motion.div
                    key={item.label}
                    className="absolute text-xs font-semibold text-primary bg-card/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-xl"
                    style={{ left: x - 35, top: y - 14 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.label}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom trust strip - Card based design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 sm:mt-16"
        >
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-lg p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {/* Solution Card */}
              <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 bg-background/50">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-primary sm:hidden" />
                  <Zap size={22} className="text-primary hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Solution</p>
                  <p className="font-semibold text-foreground text-xs sm:text-base truncate">Turnkey Solution</p>
                </div>
              </div>

              {/* Availability Card */}
              <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 bg-background/50">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-primary sm:hidden" />
                  <Clock size={22} className="text-primary hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Availability</p>
                  <p className="font-semibold text-foreground text-xs sm:text-base truncate">24/7 Operations</p>
                </div>
              </div>

              {/* Region Card */}
              <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 bg-background/50">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-primary sm:hidden" />
                  <MapPin size={22} className="text-primary hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Region</p>
                  <p className="font-semibold text-foreground text-xs sm:text-base truncate">Texas Markets</p>
                </div>
              </div>

              {/* View Markets Button */}
              <motion.button
                onClick={onOpenOpportunities}
                className="flex items-center justify-center gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-base hover:bg-accent/90 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">View Markets</span>
                <span className="sm:hidden">Markets</span>
                <ArrowRight size={14} className="sm:hidden" />
                <ArrowRight size={18} className="hidden sm:block" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
