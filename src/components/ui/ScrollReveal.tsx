"use client";

import { useEffect, useRef, ReactNode, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const controls = useAnimation();
  const [mounted, setMounted] = useState(false);

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isInView) {
      controls.start('visible');
    }
  }, [isInView, controls, mounted]);

  // Fallback: if content hasn't animated in after 3s, force it visible
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      controls.start('visible');
    }, 3000);
    return () => clearTimeout(timer);
  }, [mounted, controls]);

  // Only animate on client after mount; on SSR, render static content to avoid hydration mismatch
  if (!mounted) {
    return <div ref={ref} className={className}>{children}</div>;
  }
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {
          opacity: 0,
          ...directions[direction],
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
