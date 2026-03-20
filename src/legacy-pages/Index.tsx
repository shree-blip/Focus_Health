"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';

// Below-the-fold sections loaded dynamically to reduce initial JS bundle
const PillarsSection = dynamic(
  () => import('@/components/home/PillarsSection').then(mod => ({ default: mod.PillarsSection })),
  { ssr: true }
);
const TurnkeyModelSection = dynamic(
  () => import('@/components/home/TurnkeyModelSection').then(mod => ({ default: mod.TurnkeyModelSection })),
  { ssr: true }
);
const OperatorDNASection = dynamic(
  () => import('@/components/home/OperatorDNASection').then(mod => ({ default: mod.OperatorDNASection })),
  { ssr: true }
);
const VideoShowcaseSection = dynamic(
  () => import('@/components/home/VideoShowcaseSection').then(mod => ({ default: mod.VideoShowcaseSection })),
  { ssr: true }
);
const MarketSection = dynamic(
  () => import('@/components/home/MarketSection').then(mod => ({ default: mod.MarketSection })),
  { ssr: true }
);
const InvestmentSection = dynamic(
  () => import('@/components/home/InvestmentSection').then(mod => ({ default: mod.InvestmentSection })),
  { ssr: true }
);
const SplitCTASection = dynamic(
  () => import('@/components/home/SplitCTASection').then(mod => ({ default: mod.SplitCTASection })),
  { ssr: true }
);
const EarlyAccessSection = dynamic(
  () => import('@/components/home/EarlyAccessSection').then(mod => ({ default: mod.EarlyAccessSection })),
  { ssr: true }
);
const BusinessOpportunityModal = dynamic(
  () => import('@/components/home/BusinessOpportunityModal').then(mod => ({ default: mod.BusinessOpportunityModal })),
  { ssr: false }
);

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
      
      {isModalOpen && (
        <BusinessOpportunityModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default Index;
