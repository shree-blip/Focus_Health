"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { FullscreenVideoCard } from '@/components/ui/FullscreenVideoCard';
import { lufkinGrandOpeningMedia } from '@/lib/lufkin-grand-opening-media';

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
const FacilitiesMapSection = dynamic(
  () => import('@/components/home/FacilitiesMapSection').then(mod => ({ default: mod.FacilitiesMapSection })),
  { ssr: false }
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

const nafecTafecLogoCandidates = [
  '/lufkin-grand-opening/gallery/nafec-tafec-membership.webp',
  '/nafec-tafec-membership.png',
  '/nafec-tafec.png',
  '/NAFEC-TAFEC-membership.png',
  '/image.png',
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nafecLogoIndex, setNafecLogoIndex] = useState(0);
  const [showNafecLogo, setShowNafecLogo] = useState(true);

  const nafecLogoSrc = nafecTafecLogoCandidates[nafecLogoIndex];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seenKey = 'focus_home_business_modal_seen';
    const hasSeenModal = window.sessionStorage.getItem(seenKey);
    if (hasSeenModal) return;

    let timeoutId: number | undefined;
    const idleCallback = (
      window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).requestIdleCallback;
    const cancelIdleCallback = (
      window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).cancelIdleCallback;

    const openModal = () => {
      setIsModalOpen(true);
      window.sessionStorage.setItem(seenKey, '1');
    };

    let idleId: number | undefined;
    if (idleCallback) {
      idleId = idleCallback(() => {
        timeoutId = window.setTimeout(openModal, 1800);
      });
    } else {
      timeoutId = window.setTimeout(openModal, 3000);
    }

    return () => {
      if (typeof idleId === 'number' && cancelIdleCallback) {
        cancelIdleCallback(idleId);
      }
      if (typeof timeoutId === 'number') {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <HeroSection onOpenOpportunities={handleOpenModal} />

      {/* Grand Opening Videos */}
      <section className="w-full bg-background py-10 md:py-14">
        <div className="container-focus">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
              Now Open
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Grand Opening Videos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FullscreenVideoCard
              desktopSrc="/Irving_Wellness/IHW-Event-Horizontal.mp4"
              title="Irving Health & Wellness — Grand Opening"
              ariaLabel="Irving Health and Wellness grand opening event highlight video"
            />
            <FullscreenVideoCard
              desktopSrc="/ERofIrving-GrandOpening.mp4"
              title="ER of Irving — Grand Opening"
              ariaLabel="ER of Irving grand opening event highlight video"
            />
            <FullscreenVideoCard
              desktopSrc={lufkinGrandOpeningMedia.videoDesktop}
              mobileSrc={lufkinGrandOpeningMedia.videoMobile}
              poster={lufkinGrandOpeningMedia.heroDesktop}
              mobilePoster={lufkinGrandOpeningMedia.heroMobile}
              title="ER of Lufkin — Grand Opening"
              ariaLabel="ER of Lufkin grand opening event highlight video"
            />
          </div>
        </div>
      </section>

      <PillarsSection />
      <TurnkeyModelSection />
      <OperatorDNASection />
      <FacilitiesMapSection />
      <MarketSection onOpenOpportunities={handleOpenModal} />
      <InvestmentSection />
      <SplitCTASection />

      <section className="w-full bg-card py-10 md:py-14">
        <div className="container-focus">
          <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-background p-4 sm:p-5">
            <p className="text-center text-sm sm:text-base font-heading font-bold text-foreground mb-3">
              Our Emergency Room are member of{' '}
              <a
                href="https://nafec.org"
                target="_blank"
                rel="dofollow noopener"
                className="text-primary hover:underline"
              >
                NAFEC
              </a>{' '}
              and{' '}
              <a
                href="https://tafec.org"
                target="_blank"
                rel="dofollow noopener"
                className="text-primary hover:underline"
              >
                TAFEC
              </a>
              .
            </p>
            <div className="flex items-center justify-center">
              {showNafecLogo ? (
                <div className="w-full max-w-2xl rounded-xl bg-white border border-border/60 p-2">
                  <a
                    href="https://nafec.org"
                    target="_blank"
                    rel="dofollow noopener"
                    aria-label="Visit NAFEC"
                    className="block"
                  >
                    <img
                      src={nafecLogoSrc}
                      alt="NAFEC and TAFEC membership logos"
                      className="w-full h-auto object-contain"
                      loading="lazy"
                      onError={() => {
                        if (nafecLogoIndex < nafecTafecLogoCandidates.length - 1) {
                          setNafecLogoIndex(nafecLogoIndex + 1);
                        } else {
                          setShowNafecLogo(false);
                        }
                      }}
                    />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Please add the NAFEC/TAFEC logo file to the public folder.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-10 md:py-14">
        <div className="container-focus">
          <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-center text-sm sm:text-base font-heading font-bold text-foreground mb-3">
              We are Partner with{' '}
              <a
                href="https://cityambulance.com"
                target="_blank"
                rel="dofollow noopener"
                className="text-primary hover:underline"
              >
                City Ambulance
              </a>
              .
            </p>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs rounded-xl bg-white border border-border/60 p-2.5 sm:p-3">
                <a
                  href="https://cityambulance.com"
                  target="_blank"
                  rel="dofollow noopener"
                  aria-label="Visit City Ambulance"
                  className="block"
                >
                  <img
                    src="/city-ambulance-logo.png"
                    alt="City Ambulance logo"
                    className="w-full max-h-32 h-auto object-contain mx-auto"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
