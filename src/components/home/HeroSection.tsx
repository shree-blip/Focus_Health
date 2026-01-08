import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import focusHealthVideo from '@/assets/FocusHealth.mp4';

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

// Live stats ticker
const LiveStatsTicker = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { value: "24+", label: "Facilities Managed" },
    { value: "24/7", label: "Operations Model" },
    { value: "Texas", label: "Growth Markets" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-8 overflow-hidden">
      {stats.map((stat, index) => (
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
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
};

export const HeroSection = () => {
  const { mouseX, mouseY } = useMousePosition();
  
  const springConfig = { stiffness: 100, damping: 30 };
  const orbX = useSpring(useTransform(mouseX, [0, window.innerWidth], [-30, 30]), springConfig);
  const orbY = useSpring(useTransform(mouseY, [0, window.innerHeight], [-30, 30]), springConfig);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4,
  }));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Animated gradient background orbs */}
      <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0 pointer-events-none">
        <GradientOrb className="w-[600px] h-[600px] -top-40 -left-40 bg-gradient-to-br from-primary/30 to-primary/5" />
        <GradientOrb className="w-[500px] h-[500px] top-1/3 -right-40 bg-gradient-to-bl from-accent/20 to-accent/5" delay={2} />
        <GradientOrb className="w-[400px] h-[400px] -bottom-20 left-1/3 bg-gradient-to-tr from-secondary/25 to-secondary/5" delay={4} />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Pulse rings from center */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PulseRing delay={0} size={300} color="hsl(var(--primary) / 0.3)" />
        <PulseRing delay={1} size={500} color="hsl(var(--primary) / 0.2)" />
        <PulseRing delay={2} size={700} color="hsl(var(--accent) / 0.15)" />
      </div>

      {/* Heartbeat line */}
      <HeartbeatLine />

      {/* Network connections SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Animated connection paths */}
        <motion.path
          d="M100 300 Q 300 200 500 300 T 900 250 T 1100 350"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
        <motion.path
          d="M200 500 Q 400 400 600 500 T 1000 450"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          fill="none"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, delay: 0.5, ease: 'easeInOut' }}
        />
        
        {/* Traveling dot along path */}
        <motion.circle
          r="4"
          fill="hsl(var(--accent))"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: "path('M100 300 Q 300 200 500 300 T 900 250 T 1100 350')" }}
        />
      </svg>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Content */}
      <div className="container-focus relative z-10 pt-20">
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] mb-6"
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
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-4"
            >
              We're revolutionizing healthcare by partnering with communities and investors to build and operate high-performance medical facilities.
            </motion.p>

            {/* Extended Value Prop with typewriter effect hint */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono"
            >
              <span className="text-primary">→</span>
              <span>site strategy → build-out → staffing → operations → optimization</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Button variant="hero" size="lg" asChild className="group">
                <Link to="/partners?tab=investors">
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
                <Link to="/contact">Get Early Access</Link>
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
            className="hidden lg:flex items-center justify-center relative"
          >
            <div className="relative w-96 h-96">
              {/* Video Logo Central Hub */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shadow-primary/40 border-2 border-primary/20"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <video
                  src={focusHealthVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
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
                    className={`w-5 h-5 rounded-full ${i % 2 === 0 ? 'bg-accent shadow-lg shadow-accent/50' : 'bg-primary shadow-lg shadow-primary/50'}`}
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
                { label: "Operate", angle: 90 },
                { label: "Optimize", angle: 210 },
              ].map((item, i) => {
                const radians = (item.angle * Math.PI) / 180;
                const x = 192 + 175 * Math.cos(radians);
                const y = 192 + 175 * Math.sin(radians);
                return (
                  <motion.div
                    key={item.label}
                    className="absolute text-xs font-semibold text-primary bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-xl"
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

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 pt-8 border-t border-border/50"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Zap, label: 'Turnkey Solution' },
              { icon: Clock, label: '24/7 Operations' },
              { icon: MapPin, label: 'Texas Growth Markets' },
            ].map((item, i) => (
              <motion.div 
                key={item.label} 
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-default"
                whileHover={{ scale: 1.05 }}
              >
                <item.icon size={16} className="text-primary" />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
