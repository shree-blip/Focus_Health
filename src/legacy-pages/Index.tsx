"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
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

// Reusable scroll-autoplay video card
const GrandOpeningVideoCard = ({
  src,
  title,
  ariaLabel,
}: {
  src: string;
  title: string;
  ariaLabel: string;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);

  // Lazy-mount video element near viewport
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLoaded(true); obs.disconnect(); } },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Play / pause on scroll visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { v.play().catch(() => {}); }
        else { v.pause(); }
      },
      { threshold: 0.2 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [loaded]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-center text-foreground/80 tracking-wide">{title}</h3>
      <div
        ref={wrapperRef}
        className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-muted group"
      >
        {loaded && (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-label={ariaLabel}
            className="w-full h-full object-cover"
          >
            <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
          </video>
        )}
        {loaded && (
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <GrandOpeningVideoCard
              src="/Irving_Wellness/IHW-Event-Horizontal.mp4"
              title="Irving Health & Wellness — Grand Opening"
              ariaLabel="Irving Health and Wellness grand opening event highlight video"
            />
            <GrandOpeningVideoCard
              src="/ERofIrving-GrandOpening.mp4"
              title="ER of Irving — Grand Opening"
              ariaLabel="ER of Irving grand opening event highlight video"
            />
            <GrandOpeningVideoCard
              src={lufkinGrandOpeningMedia.videoDesktop}
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
