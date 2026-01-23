import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PageHeroProps {
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
  title, 
  description, 
  backgroundImage, 
  primaryCta,
  secondaryCta,
}: PageHeroProps) => {
  return (
    <section className="relative h-[60vh] min-h-[450px] max-h-[650px] flex items-center justify-center overflow-hidden">
      {/* Background Image with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(2px)',
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-foreground/60" />
      
      {/* Content */}
      <div className="container-focus relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 max-w-4xl mx-auto leading-tight"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {description}
        </motion.p>
        
        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {primaryCta && (
              <Button asChild size="lg" variant="accent" className="gap-2 px-8">
                <Link to={primaryCta.link}>
                  {primaryCta.text}
                  <ArrowRight size={18} />
                </Link>
              </Button>
            )}
            {secondaryCta && (
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="gap-2 px-8 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
              >
                <Link to={secondaryCta.link}>
                  {secondaryCta.text}
                </Link>
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
