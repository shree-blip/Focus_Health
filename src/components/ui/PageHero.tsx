"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  backgroundImage: string;
  primaryCta?: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
}

export const PageHero = ({ 
  eyebrow,
  title, 
  description, 
  backgroundImage, 
  primaryCta,
  secondaryCta,
}: PageHeroProps) => {
  const router = useRouter();
  const sharedHeroBackground = "/recent-event-hero.webp";
  const heroBackground = backgroundImage || sharedHeroBackground;
  const ctas = [primaryCta, secondaryCta].filter(
    (cta): cta is NonNullable<PageHeroProps['primaryCta']> => Boolean(cta)
  );

  const handleCtaClick = (link: string) => {
    if (link.startsWith('#')) {
      // Same-page anchor scroll
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(link);
    }
  };

  const isHashLink = (link: string) => link.startsWith('#');

  return (
    <section className="relative -mt-[100px] h-[calc(50vh+200px)] sm:h-[calc(60vh+200px)] min-h-[550px] sm:min-h-[650px] max-h-[850px] flex items-center justify-center overflow-hidden">
      {/* Background Image with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          filter: 'blur(2px)',
        }}
      />
      
      {/* Muted white overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />
      
      {/* Content */}
      <div className="container-focus relative z-10 text-center px-4 sm:px-6">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8 text-sm font-medium text-foreground"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-4 sm:mb-6 max-w-4xl mx-auto leading-[1.05]"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2"
        >
          {description}
        </motion.p>
        
        {ctas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {ctas.map((cta, index) => (
              isHashLink(cta.link) ? (
                <Button 
                  key={`${cta.text}-${cta.link}`}
                  size="lg" 
                  variant={index === 0 ? 'hero' : 'hero-outline'}
                  className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => handleCtaClick(cta.link)}
                >
                  {cta.text}
                  <ArrowRight size={16} className="sm:hidden" />
                  <ArrowRight size={18} className="hidden sm:block" />
                </Button>
              ) : (
                <Button key={`${cta.text}-${cta.link}`} asChild size="lg" variant={index === 0 ? 'hero' : 'hero-outline'} className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">
                  <Link href={cta.link}>
                    {cta.text}
                    <ArrowRight size={16} className="sm:hidden" />
                    <ArrowRight size={18} className="hidden sm:block" />
                  </Link>
                </Button>
              )
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
