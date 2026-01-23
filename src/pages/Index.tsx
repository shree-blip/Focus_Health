import { useState } from 'react';
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

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout>
      <HeroSection onOpenOpportunities={() => setIsModalOpen(true)} />
      <PillarsSection />
      <TurnkeyModelSection />
      <OperatorDNASection />
      <VideoShowcaseSection />
      <MarketSection onOpenOpportunities={() => setIsModalOpen(true)} />
      <InvestmentSection />
      <SplitCTASection />
      <EarlyAccessSection />
      
      <BusinessOpportunityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Layout>
  );
};

export default Index;
