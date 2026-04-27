"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  HeartPulse,
  MapPin,
  Minus,
  Plus,
  ShieldPlus,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Facility = {
  name: string;
  type: string;
  label: string;
  address: string;
  city: string;
  region: string;
  summary: string;
  emphasis: "emergency" | "wellness";
  lat: number;
  lng: number;
  href: string;
  mapsUrl: string;
  icon: LucideIcon;
};

const facilities: Facility[] = [
  {
    name: "ER of Irving",
    type: "Emergency Room",
    label: "24/7 ER",
    address: "8200 N MacArthur Blvd Suite 110",
    city: "Irving, TX 75063",
    region: "Texas",
    summary:
      "Hospital-level emergency care with board-certified physicians and on-site imaging in the DFW corridor.",
    emphasis: "emergency",
    lat: 32.9025,
    lng: -96.9793,
    href: "/facilities/er-of-irving",
    mapsUrl: "https://maps.app.goo.gl/fBcbBDby6JoXqLec6",
    icon: HeartPulse,
  },
  {
    name: "Irving Health & Wellness Clinic",
    type: "Wellness Clinic",
    label: "Wellness",
    address: "8200 N MacArthur Blvd Suite 100",
    city: "Irving, TX 75063",
    region: "Texas",
    summary:
      "Medical weight loss, hormone therapy, and modern wellness services in a premium outpatient setting.",
    emphasis: "wellness",
    lat: 32.902,
    lng: -96.9785,
    href: "/facilities/irving-wellness-clinic",
    mapsUrl: "https://maps.app.goo.gl/sZrkVzzgbatMVNex8",
    icon: Stethoscope,
  },
  {
    name: "ER of White Rock",
    type: "Emergency Room",
    label: "24/7 ER",
    address: "10705 Northwest Hwy",
    city: "Dallas, TX 75238",
    region: "Texas",
    summary:
      "Fast-access emergency medicine serving East Dallas with advanced diagnostics and clinical speed.",
    emphasis: "emergency",
    lat: 32.8747,
    lng: -96.7199,
    href: "/facilities/er-of-white-rock",
    mapsUrl: "https://maps.app.goo.gl/1bRpejhsPCEzPPmn6",
    icon: ShieldPlus,
  },
  {
    name: "ER of Lufkin",
    type: "Emergency Room",
    label: "24/7 ER",
    address: "501 N Brentwood Dr",
    city: "Lufkin, TX 75904",
    region: "Texas",
    summary:
      "Emergency care for Angelina County and East Texas with rapid triage, imaging, and around-the-clock coverage.",
    emphasis: "emergency",
    lat: 31.3368,
    lng: -94.7218,
    href: "/facilities/er-of-lufkin",
    mapsUrl: "https://maps.app.goo.gl/FZBc8KhuMQmekbWYA",
    icon: HeartPulse,
  },
  {
    name: "Naperville Health & Wellness Clinic",
    type: "Wellness Clinic",
    label: "Wellness",
    address: "2272 95th St STE 100",
    city: "Naperville, IL 60564",
    region: "Illinois",
    summary:
      "A wellness-forward clinic footprint extending the Focus Health platform beyond Texas into the Midwest.",
    emphasis: "wellness",
    lat: 41.6931,
    lng: -88.1561,
    href: "/facilities/naperville-wellness-clinic",
    mapsUrl: "https://maps.app.goo.gl/LodBsKYaS3NdZ4xMA",
    icon: Stethoscope,
  },
  {
    name: "First Choice Emergency Room",
    type: "Emergency Room",
    label: "Under Construction",
    address: "1717 Eldridge Pkwy",
    city: "Houston, TX 77077",
    region: "Texas",
    summary:
      "A legacy emergency-room asset that reflects the team’s operating history and execution depth in Texas.",
    emphasis: "emergency",
    lat: 29.7520825,
    lng: -95.624718,
    href: "/track-record/first-choice-emergency-room",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA",
    icon: Building2,
  },
];

const locationHighlights = [
  {
    title: "Strategic Coverage",
    description:
      "Facilities are placed in markets where demand, accessibility gaps, and operating potential all align.",
  },
  {
    title: "Mixed Facility Model",
    description:
      "Emergency rooms and wellness clinics work together under one branded platform and management approach.",
  },
  {
    title: "Expansion Ready",
    description:
      "The current footprint across Texas and Illinois creates a repeatable blueprint for future market entry.",
  },
];

const createMarkerIcon = (facility: Facility, isActive: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
    html: `
      <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;inset:${isActive ? "0" : "3px"};border-radius:9999px;background:${isActive ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" : "hsl(var(--background))"};border:3px solid ${facility.emphasis === "emergency" ? "hsl(var(--accent))" : "hsl(var(--primary))"};box-shadow:0 18px 38px rgba(11,59,145,0.2);"></span>
        <span style="position:absolute;width:${isActive ? "34px" : "24px"};height:${isActive ? "34px" : "24px"};border-radius:9999px;border:1px solid ${facility.emphasis === "emergency" ? "hsl(var(--accent) / 0.25)" : "hsl(var(--primary) / 0.22)"};opacity:${isActive ? "1" : "0.55"};"></span>
        <span style="position:relative;width:8px;height:8px;border-radius:9999px;background:${facility.emphasis === "emergency" ? "hsl(var(--accent))" : "hsl(var(--primary-foreground))"};"></span>
      </div>
    `,
  });

const buildPopupHtml = (facility: Facility) => `
  <div style="min-width:220px;padding:2px 0;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
      <div>
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:hsl(var(--muted-foreground));font-weight:700;">${facility.region}</p>
        <p style="margin:0;font-size:16px;line-height:1.2;font-weight:700;color:hsl(var(--foreground));font-family:var(--font-sora),sans-serif;">${facility.name}</p>
      </div>
      <span style="display:inline-flex;align-items:center;border-radius:9999px;padding:4px 10px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:${facility.emphasis === "emergency" ? "hsl(var(--accent) / 0.12)" : "hsl(var(--primary) / 0.1)"};color:${facility.emphasis === "emergency" ? "hsl(var(--accent))" : "hsl(var(--primary))"};">${facility.label}</span>
    </div>
    <p style="margin:12px 0 0;font-size:13px;line-height:1.55;color:hsl(var(--muted-foreground));">${facility.address}<br/>${facility.city}</p>
  </div>
`;

export function FacilitiesMapSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const hasFocusedSelectionRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeFacilityName, setActiveFacilityName] = useState(facilities[0].name);

  const activeFacility =
    facilities.find((facility) => facility.name === activeFacilityName) ??
    facilities[0];
  const ActiveFacilityIcon = activeFacility.icon;

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (!isClientMounted || !containerRef.current || mapRef.current) return;

    const element = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number;
    };

    if (typeof element._leaflet_id !== "undefined") {
      element._leaflet_id = undefined;
    }

    const map = L.map(element, {
      center: [36.0, -93.5],
      zoom: 5,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      detectRetina: true,
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    markerRefs.current = {};

    facilities.forEach((facility, index) => {
      const marker = L.marker([facility.lat, facility.lng], {
        icon: createMarkerIcon(facility, index === 0),
      })
        .addTo(map)
        .bindPopup(buildPopupHtml(facility), {
          closeButton: false,
          offset: [0, -12],
        });

      marker.on("click", () => {
        setActiveFacilityName(facility.name);
      });

      markerRefs.current[facility.name] = marker;
      bounds.extend([facility.lat, facility.lng]);
    });

    map.fitBounds(bounds.pad(0.22));
    window.setTimeout(() => map.invalidateSize(), 150);
    resizeObserverRef.current = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserverRef.current.observe(element);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      map.remove();
      mapRef.current = null;
      markerRefs.current = {};
      element._leaflet_id = undefined;
    };
  }, [isClientMounted]);

  useEffect(() => {
    if (!isClientMounted || !mapRef.current) return;

    facilities.forEach((facility) => {
      const marker = markerRefs.current[facility.name];
      if (!marker) return;
      marker.setIcon(
        createMarkerIcon(facility, facility.name === activeFacilityName),
      );
    });

    if (!hasFocusedSelectionRef.current) {
      hasFocusedSelectionRef.current = true;
      return;
    }

    mapRef.current.flyTo([activeFacility.lat, activeFacility.lng], 9, {
      animate: true,
      duration: 0.9,
    });
    markerRefs.current[activeFacility.name]?.openPopup();
  }, [activeFacility, activeFacilityName, isClientMounted]);

  return (
    <section className="section-padding relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-hero-pattern opacity-[0.03]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-focus relative">
        <ScrollReveal>
          <header className="mb-12 max-w-3xl space-y-6 lg:mb-16">
            <span className="inline-flex items-center rounded-full border border-accent/15 bg-accent/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              Our Locations
            </span>
            <div className="space-y-4">
              <h2 className="text-4xl font-heading font-black uppercase tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                Our Locations
              </h2>
              <h3 className="max-w-2xl text-2xl font-heading font-bold text-primary sm:text-3xl">
                Facilities positioned across Texas and Illinois.
              </h3>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Focus Health operates emergency rooms and wellness clinics in
                high-growth markets, giving the platform both immediate regional
                coverage and a repeatable path for expansion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                `${facilities.length} facilities`,
                "2 states",
                "24/7 emergency coverage",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </header>
        </ScrollReveal>

        <div className="grid items-start gap-8 lg:grid-cols-12 xl:gap-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-7 lg:gap-5">
            {facilities.map((facility, index) => {
              const FacilityIcon = facility.icon;
              const isActive = facility.name === activeFacilityName;
              const isEmergency = facility.emphasis === "emergency";

              return (
                <ScrollReveal
                  key={facility.name}
                  delay={index * 0.08}
                  direction={index % 2 === 0 ? "right" : "left"}
                >
                  <motion.article
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    onClick={() => setActiveFacilityName(facility.name)}
                    onMouseEnter={() => setActiveFacilityName(facility.name)}
                    onFocusCapture={() => setActiveFacilityName(facility.name)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveFacilityName(facility.name);
                      }
                    }}
                    tabIndex={0}
                    className={`group relative cursor-pointer overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_18px_45px_rgba(11,59,145,0.08)] transition-all duration-300 ${
                      isActive
                        ? isEmergency
                          ? "border-accent/25 bg-gradient-to-br from-accent/10 via-card to-background"
                          : "border-primary/25 bg-gradient-to-br from-primary/10 via-card to-background"
                        : "border-border/80 bg-card/90 hover:border-primary/20 hover:bg-background"
                    }`}
                  >
                    <div
                      className={`absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 ${
                        isEmergency ? "bg-accent/10" : "bg-primary/10"
                      } ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`}
                    />

                    <div className="relative flex items-start justify-between gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                          isEmergency
                            ? "border-accent/20 bg-accent/10 text-accent"
                            : "border-primary/20 bg-primary/10 text-primary"
                        }`}
                      >
                        <FacilityIcon size={22} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {facility.region}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            facility.label === "Under Construction"
                              ? "border border-primary/20 bg-primary/10 text-primary"
                              : "border border-border/70 bg-background/90 text-muted-foreground"
                          }`}
                        >
                          {facility.label}
                        </span>
                      </div>
                    </div>

                    <div className="relative mt-6">
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                          isEmergency ? "text-accent" : "text-primary"
                        }`}
                      >
                        {facility.type}
                      </p>
                      <h3 className="mt-3 text-xl font-heading font-extrabold text-foreground transition-colors group-hover:text-primary">
                        {facility.name}
                      </h3>

                      <div className="mt-4 flex gap-3">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-muted-foreground"
                        />
                        <div className="space-y-1">
                          <p className="text-sm leading-snug text-muted-foreground">
                            {facility.address}
                          </p>
                          <p className="text-sm leading-snug text-muted-foreground">
                            {facility.city}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {facility.summary}
                      </p>
                    </div>

                    <div className="relative mt-6 flex flex-wrap items-center gap-3">
                      <a
                        href={facility.href}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        View Location <ArrowUpRight size={15} />
                      </a>
                      <a
                        href={facility.mapsUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/25 hover:text-primary"
                      >
                        Directions <ExternalLink size={15} />
                      </a>
                    </div>
                  </motion.article>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal
            delay={0.16}
            direction="left"
            className="lg:col-span-5 lg:sticky lg:top-24"
          >
            <div className="rounded-[2rem] border border-border/80 bg-card/70 p-3 shadow-[0_24px_70px_rgba(11,59,145,0.12)] backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/60 bg-muted">
                <div className="pointer-events-none absolute inset-0 z-[400] bg-gradient-to-b from-primary/5 via-transparent to-background/20" />

                <div className="absolute left-4 top-4 z-[500] flex items-center gap-3 rounded-full border border-white/70 bg-background/80 px-4 py-2 shadow-lg backdrop-blur-xl">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Precision Network
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Interactive facility map
                    </p>
                  </div>
                </div>

                <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomIn()}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-background/80 text-foreground shadow-lg backdrop-blur-xl transition-colors hover:text-primary"
                    aria-label="Zoom in"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomOut()}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-background/80 text-foreground shadow-lg backdrop-blur-xl transition-colors hover:text-primary"
                    aria-label="Zoom out"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                <div className="h-[420px] w-full sm:h-[500px]">
                  {isClientMounted && (
                    <div ref={containerRef} className="h-full w-full" />
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-[1.4rem] border border-border/80 bg-background/90 p-5 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                        activeFacility.emphasis === "emergency"
                          ? "text-accent"
                          : "text-primary"
                      }`}
                    >
                      {activeFacility.type}
                    </p>
                    <h3 className="mt-2 text-2xl font-heading font-bold text-foreground">
                      {activeFacility.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {activeFacility.address}, {activeFacility.city}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      activeFacility.emphasis === "emergency"
                        ? "bg-accent/10 text-accent"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <ActiveFacilityIcon size={22} />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {activeFacility.summary}
                </p>

                <div className="mt-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      activeFacility.label === "Under Construction"
                        ? "border border-primary/20 bg-primary/10 text-primary"
                        : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {activeFacility.label}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={activeFacility.href}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Explore Facility <ArrowUpRight size={15} />
                  </a>
                  <a
                    href={activeFacility.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/25 hover:text-primary"
                  >
                    Get Directions <ExternalLink size={15} />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-2 pt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <span>Map data: OpenStreetMap + CARTO</span>
                <span>{facilities.length} active locations</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-12 border-t border-border/80 pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            {locationHighlights.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.08}>
                <div className="rounded-[1.5rem] border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
