import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PillarsSection } from '@/components/home/PillarsSection';
import { TurnkeyModelSection } from '@/components/home/TurnkeyModelSection';
import { OperatorDNASection } from '@/components/home/OperatorDNASection';
import { MarketSection } from '@/components/home/MarketSection';
import { SplitCTASection } from '@/components/home/SplitCTASection';
import { EarlyAccessSection } from '@/components/home/EarlyAccessSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PillarsSection />
      <TurnkeyModelSection />
      <OperatorDNASection />
      <MarketSection />
      <SplitCTASection />
      <EarlyAccessSection />
    </Layout>
  );
};

export default Index;
