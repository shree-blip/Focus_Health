"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface FullscreenVideoCardProps {
  title: string;
  ariaLabel: string;
  desktopSrc: string;
  mobileSrc?: string;
  poster?: string;
  mobilePoster?: string;
  className?: string;
  previewContainerClassName?: string;
  previewAspectClassName?: string;
  previewVideoClassName?: string;
  showTitle?: boolean;
}

export function FullscreenVideoCard({
  title,
  ariaLabel,
  desktopSrc,
  mobileSrc,
  poster,
  mobilePoster,
  className,
  previewContainerClassName,
  previewAspectClassName = "aspect-video",
  previewVideoClassName,
  showTitle = true,
}: FullscreenVideoCardProps) {
  const isMobile = useIsMobile();
  const selectedSrc = isMobile && mobileSrc ? mobileSrc : desktopSrc;
  const selectedPoster = isMobile && mobilePoster ? mobilePoster : poster;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const lastPlaybackTimeRef = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMuted(true);
    const previewVideo = previewVideoRef.current;
    if (previewVideo) {
      previewVideo.muted = true;
    }
  }, [selectedSrc]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || !loaded || isOpen) {
      video?.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isOpen, loaded, selectedSrc]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const modalVideo = modalVideoRef.current;
        if (modalVideo) {
          lastPlaybackTimeRef.current = modalVideo.currentTime;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const modalVideo = modalVideoRef.current;
    if (!modalVideo) return;

    const frameId = window.requestAnimationFrame(() => {
      modalVideo.currentTime = lastPlaybackTimeRef.current;
      modalVideo.muted = false;
      modalVideo.volume = 1;
      modalVideo.play().catch(async () => {
        modalVideo.muted = true;
        await modalVideo.play().catch(() => {});
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen, selectedSrc]);

  const openPlayer = () => {
    const previewVideo = previewVideoRef.current;
    if (previewVideo) {
      lastPlaybackTimeRef.current = previewVideo.currentTime;
      previewVideo.pause();
    }
    setIsOpen(true);
  };

  const closePlayer = () => {
    const modalVideo = modalVideoRef.current;
    if (modalVideo) {
      lastPlaybackTimeRef.current = modalVideo.currentTime;
    }

    setIsOpen(false);

    const previewVideo = previewVideoRef.current;
    if (previewVideo) {
      previewVideo.currentTime = lastPlaybackTimeRef.current;
      previewVideo.muted = muted;
      previewVideo.play().catch(() => {});
    }
  };

  const toggleMute = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!previewVideoRef.current) return;
    previewVideoRef.current.muted = !previewVideoRef.current.muted;
    setMuted(previewVideoRef.current.muted);
  };

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPlayer();
    }
  };

  const modal = mounted && isOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} fullscreen video player`}
          onClick={closePlayer}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div
              className="relative w-full max-w-6xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                    Grand Opening Video
                  </p>
                  <h3 className="mt-2 text-xl font-heading font-bold sm:text-2xl">{title}</h3>
                </div>
                <button
                  type="button"
                  onClick={closePlayer}
                  aria-label="Close fullscreen video"
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
                <video
                  key={selectedSrc}
                  ref={modalVideoRef}
                  src={selectedSrc}
                  poster={selectedPoster}
                  autoPlay
                  loop
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${ariaLabel} fullscreen player`}
                  className="max-h-[78vh] w-full bg-black object-contain sm:max-h-[82vh]"
                >
                  <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
                </video>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className={cn("flex flex-col gap-3", className)}>
        {showTitle && (
          <h3 className="text-base font-semibold text-center text-foreground/80 tracking-wide">{title}</h3>
        )}

        <div
          ref={wrapperRef}
          role="button"
          tabIndex={0}
          onClick={openPlayer}
          onKeyDown={handleCardKeyDown}
          aria-label={`${ariaLabel}. Open fullscreen video with sound.`}
          className={cn(
            "group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted shadow-lg transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
            previewAspectClassName,
            previewContainerClassName
          )}
        >
          {loaded ? (
            <video
              key={selectedSrc}
              ref={previewVideoRef}
              src={selectedSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster={selectedPoster}
              aria-label={ariaLabel}
              className={cn("h-full w-full object-cover", previewVideoClassName)}
            >
              <track kind="captions" srcLang="en" label="English" src="/captions/empty.vtt" default />
            </video>
          ) : selectedPoster ? (
            <img
              src={selectedPoster}
              alt={title}
              loading="lazy"
              className={cn("h-full w-full object-cover", previewVideoClassName)}
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

          {loaded && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video preview" : "Mute video preview"}
              className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </div>
      {modal}
    </>
  );
}
