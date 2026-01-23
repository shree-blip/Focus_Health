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

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PillarsSection />
      <TurnkeyModelSection />
      <OperatorDNASection />
      <VideoShowcaseSection />
      <MarketSection />
      <InvestmentSection />
      <SplitCTASection />
      <EarlyAccessSection />
    </Layout>
  );
};

export default Index;
