"use client";

import { useEffect, useRef, useState } from 'react';

const videos = [
  { src: '/ERofIrving-GrandOpening.mp4', label: 'ER of Irving grand opening event highlight video' },
  { src: '/Irving_Wellness/IHW-Event-Horizontal.mp4', label: 'Irving wellness ribbon-cutting event highlight video' },
];

const LazyVideo = ({ src, label }: { src: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border shadow-sm aspect-video bg-muted">
      {isVisible && (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-label={label}
          className="w-full h-full object-cover"
        >
          <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
        </video>
      )}
    </div>
  );
};

export const VideoShowcaseSection = () => {
  return (
    <section className="w-full bg-background section-padding">
      <div className="container-focus grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {videos.map((video) => (
          <LazyVideo key={video.src} src={video.src} label={video.label} />
        ))}
      </div>
    </section>
  );
};
