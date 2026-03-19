"use client";

import { useState } from 'react';
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
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
    </>
);
};

export default Index;
