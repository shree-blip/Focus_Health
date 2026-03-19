"use client";

const grandOpeningVideo = '/ERofIrving-GrandOpening.mp4';

export const VideoShowcaseSection = () => {
  return (
    <section className="w-full bg-background">
      <video
        src={grandOpeningVideo}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto object-cover"
      />
    </section>
  );
};
