"use client";

const grandOpeningVideo = '/ERofIrving-GrandOpening.mp4';
const ribbonCuttingVideo = '/Irving_Wellness/IHW-Event-Horizontal.mp4';

export const VideoShowcaseSection = () => {
  return (
    <section className="w-full bg-background section-padding">
      <div className="container-focus grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
          <video
            src={grandOpeningVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-label="ER of Irving grand opening event highlight video"
            className="w-full h-full object-cover aspect-video"
          >
            <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
          </video>
        </div>
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
          <video
            src={ribbonCuttingVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-label="Irving wellness ribbon-cutting event highlight video"
            className="w-full h-full object-cover aspect-video"
          >
            <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
          </video>
        </div>
      </div>
    </section>
  );
};
