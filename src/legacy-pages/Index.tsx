"use client";

import { useState, useEffect, useRef } from 'react';
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

// Lazy-loaded standalone video below the hero — autoplay on scroll, pause when out of view
const ERofIrvingVideo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);

  // Lazy load: render video element once close to viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    loadObserver.observe(el);
    return () => loadObserver.disconnect();
  }, []);

  // Play / pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 }
    );
    playObserver.observe(v);
    return () => playObserver.disconnect();
  }, [visible]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <section ref={ref} className="w-full bg-background py-8 md:py-12">
      <div className="container-focus">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-muted group">
          {visible && (
            <video
              ref={videoRef}
              src="/ERofIrving-GrandOpening.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              aria-label="ER of Irving grand opening event highlight video"
              className="w-full h-full object-cover"
            >
              <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
            </video>
          )}
          {/* Sound toggle button */}
          {visible && (
            <button
              onClick={toggleSound}
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors opacity-80 group-hover:opacity-100"
            >
              {muted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

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

      {/* ER of Irving Showcase Video */}
      <ERofIrvingVideo />

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
