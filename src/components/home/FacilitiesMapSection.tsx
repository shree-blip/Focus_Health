"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MapPin, ExternalLink } from "lucide-react";

// Fix Leaflet default marker icon broken by webpack/Next.js asset pipeline
const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

const facilities = [
  {
    name: "ER of Irving",
    type: "Emergency Room",
    address: "8200 N MacArthur Blvd Suite 110",
    city: "Irving, TX 75063",
    lat: 32.9025,
    lng: -96.9793,
    href: "/facilities/er-of-irving",
    mapsUrl: "https://maps.app.goo.gl/fBcbBDby6JoXqLec6",
  },
  {
    name: "Irving Health & Wellness Clinic",
    type: "Wellness Clinic",
    address: "8200 N MacArthur Blvd Suite 100",
    city: "Irving, TX 75063",
    lat: 32.9020,
    lng: -96.9785,
    href: "/facilities/irving-wellness-clinic",
    mapsUrl: "https://maps.app.goo.gl/sZrkVzzgbatMVNex8",
  },
  {
    name: "ER of White Rock",
    type: "Emergency Room",
    address: "10705 Northwest Hwy",
    city: "Dallas, TX 75238",
    lat: 32.8747,
    lng: -96.7199,
    href: "/facilities/er-of-white-rock",
    mapsUrl: "https://maps.app.goo.gl/1bRpejhsPCEzPPmn6",
  },
  {
    name: "ER of Lufkin",
    type: "Emergency Room",
    address: "501 N Brentwood Dr",
    city: "Lufkin, TX 75904",
    lat: 31.3368,
    lng: -94.7218,
    href: "/facilities/er-of-lufkin",
    mapsUrl: "https://maps.app.goo.gl/FZBc8KhuMQmekbWYA",
  },
  {
    name: "Naperville Health & Wellness Clinic",
    type: "Wellness Clinic",
    address: "2272 95th St STE 100",
    city: "Naperville, IL 60564",
    lat: 41.6931,
    lng: -88.1561,
    href: "/facilities/naperville-wellness-clinic",
    mapsUrl: "https://maps.app.goo.gl/LodBsKYaS3NdZ4xMA",
  },
  {
    name: "First Choice Emergency Room",
    type: "Emergency Room",
    address: "1717 Eldridge Pkwy",
    city: "Houston, TX 77077",
    lat: 29.7520825,
    lng: -95.624718,
    href: "/track-record/first-choice-emergency-room",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA",
  },
];

export function FacilitiesMapSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
  }, []);

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
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    facilities.forEach((f) => {
      L.marker([f.lat, f.lng])
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px;">
            <p style="font-weight:700;font-size:14px;margin-bottom:2px;">${f.name}</p>
            <p style="font-size:11px;color:#6b7280;margin-bottom:6px;">${f.type}</p>
            <p style="font-size:13px;margin:2px 0;">${f.address}</p>
            <p style="font-size:13px;margin:2px 0;">${f.city}</p>
            <a href="${f.href}" style="display:inline-flex;align-items:center;gap:4px;margin-top:8px;font-size:12px;color:#2563eb;text-decoration:none;font-weight:500;">View Location</a>
            <br />
            <a href="${f.mapsUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:12px;color:#16a34a;text-decoration:none;font-weight:500;">Get Directions</a>
          </div>
        `);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      element._leaflet_id = undefined;
    };
  }, [isClientMounted]);

  return (
    <section className="w-full bg-muted/30 py-16 md:py-20">
      <div className="container-focus">
        {/* Heading */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
              Our Locations
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
              Facilities Across the Nation
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              Focus Health operates emergency rooms and wellness clinics
              strategically placed in high-growth markets across Texas and Illinois.
            </p>
          </div>
        </ScrollReveal>

        {/* Map */}
        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg h-[450px] w-full">
            {isClientMounted && (
              <div ref={containerRef} className="h-full w-full" />
            )}
          </div>
        </ScrollReveal>

        {/* Facility address cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {facilities.map((f, i) => (
            <ScrollReveal key={f.name} delay={i * 0.06}>
              <a
                href={f.href}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:border-accent/50 hover:shadow-md transition-all group"
              >
                <MapPin
                  size={18}
                  className="text-accent shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                    {f.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.address}</p>
                  <p className="text-xs text-muted-foreground">{f.city}</p>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
