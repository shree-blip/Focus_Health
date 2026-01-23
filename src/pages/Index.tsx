import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PillarsSection } from '@/components/home/PillarsSection';
import { TurnkeyModelSection } from '@/components/home/TurnkeyModelSection';
import { OperatorDNASection } from '@/components/home/OperatorDNASection';
import { VideoShowcaseSection } from '@/components/home/VideoShowcaseSection';
import { MarketSection } from '@/components/home/MarketSection';
import { InvestmentSection } from '@/components/home/InvestmentSection';
import { SplitCTASection } from '@/components/home/SplitCTASection';
import { EarlyAccessSection } from '@/components/home/EarlyAccessSection';
import { BusinessOpportunityModal } from '@/components/home/BusinessOpportunityModal';

const MODAL_SHOWN_KEY = 'focus_health_opportunity_modal_shown';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal on first visit after a short delay
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem(MODAL_SHOWN_KEY);
    
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
      }, 2000); // 2 second delay for better UX

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <HeroSection onOpenOpportunities={handleOpenModal} />
      <PillarsSection />
      <TurnkeyModelSection />
      <OperatorDNASection />
      <VideoShowcaseSection />
      <MarketSection onOpenOpportunities={handleOpenModal} />
      <InvestmentSection />
      <SplitCTASection />
      <EarlyAccessSection />
      
      <BusinessOpportunityModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </Layout>
  );
};

export default Index;
