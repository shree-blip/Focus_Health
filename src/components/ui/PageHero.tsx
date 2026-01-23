import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PageHeroProps {
  title: string;
  description: string;
  backgroundImage: string;
  ctaText?: string;
  ctaLink?: string;
}

export const PageHero = ({ 
  title, 
  description, 
  backgroundImage, 
  ctaText, 
  ctaLink 
}: PageHeroProps) => {
  return (
    <section className="relative h-[50vh] min-h-[400px] max-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/70 to-foreground/50" />
      
      {/* Content */}
      <div className="container-focus relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="heading-1 text-primary-foreground mb-6 max-w-4xl mx-auto"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8"
        >
          {description}
        </motion.p>
        
        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
