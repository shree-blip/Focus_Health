import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleCtaClick = (link: string) => {
    if (link.startsWith('#')) {
      // Same-page anchor scroll
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(link);
    }
  };

  const isHashLink = (link: string) => link.startsWith('#');

  return (
    <section className="relative h-[50vh] sm:h-[60vh] min-h-[350px] sm:min-h-[450px] max-h-[650px] flex items-center justify-center overflow-hidden">
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
      <div className="container-focus relative z-10 text-center px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2"
        >
          {description}
        </motion.p>
        
        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {primaryCta && (
              isHashLink(primaryCta.link) ? (
                <Button 
                  size="lg" 
                  variant="accent" 
                  className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => handleCtaClick(primaryCta.link)}
                >
                  {primaryCta.text}
                  <ArrowRight size={16} className="sm:hidden" />
                  <ArrowRight size={18} className="hidden sm:block" />
                </Button>
              ) : (
                <Button asChild size="lg" variant="accent" className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">
                  <Link to={primaryCta.link}>
                    {primaryCta.text}
                    <ArrowRight size={16} className="sm:hidden" />
                    <ArrowRight size={18} className="hidden sm:block" />
                  </Link>
                </Button>
              )
            )}
            {secondaryCta && (
              isHashLink(secondaryCta.link) ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
                  onClick={() => handleCtaClick(secondaryCta.link)}
                >
                  {secondaryCta.text}
                </Button>
              ) : (
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="gap-2 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
                >
                  <Link to={secondaryCta.link}>
                    {secondaryCta.text}
                  </Link>
                </Button>
              )
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
