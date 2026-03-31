"use client";

import { MapPin, Building, Users2, Rocket, LineChart } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: MapPin,
    title: 'Market & Site Selection',
    shortDesc: 'Strategic location analysis',
    fullDesc: 'Rigorous market analysis identifies high-growth Texas markets with underserved populations. We evaluate demographics, competition, accessibility, and long-term growth potential to select optimal sites.',
  },
  {
    id: 2,
    icon: Building,
    title: 'Facility Build & Compliance',
    shortDesc: 'Turn-key construction',
    fullDesc: 'From ground-up builds to retrofits, we manage the entire construction process. Our standardized facility design ensures regulatory compliance, operational efficiency, and exceptional patient experience.',
  },
  {
    id: 3,
    icon: Users2,
    title: 'Clinical + Ops Staffing',
    shortDesc: 'Expert team assembly',
    fullDesc: 'We recruit and train high-caliber clinical and operational staff. Our proven staffing model ensures 24/7 coverage with the right mix of experience and credentials for each location.',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Launch & 24/7 Operations',
    shortDesc: 'Seamless activation',
    fullDesc: 'Our launch playbook ensures a smooth opening with immediate operational excellence. We handle credentialing, payer contracting, community outreach, and day-one readiness.',
  },
  {
    id: 5,
    icon: LineChart,
    title: 'Performance Optimization',
    shortDesc: 'Continuous improvement',
    fullDesc: 'Ongoing operational refinement drives efficiency and quality. We monitor key metrics, implement best practices, and continuously optimize staffing, throughput, and patient satisfaction.',
  },
];

export const TurnkeyModelSection = () => {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-focus">
        {/* Heading Section */}
        <div className="max-w-3xl mb-16 mx-auto">
          <h2 className="text-foreground font-heading text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
            How the Turnkey Model Works
          </h2>
          <p className="text-primary font-medium text-lg mb-6">
            End-to-end delivery from site selection to operational excellence
          </p>
          <div className="w-12 h-1.5 bg-primary" />
        </div>
        {/* 5-Step Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="step-card group flex flex-col p-6 sm:p-8 rounded-xl bg-primary/5 border border-border hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <step.icon size={20} />
                </div>
                <span className="text-primary/20 font-heading text-3xl font-black group-hover:text-primary/40 transition-colors">
                  {String(step.id).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-foreground font-heading text-lg font-bold leading-snug mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.shortDesc}. {step.fullDesc.split('. ').slice(0, 1)[0]}.
              </p>
            </div>
          ))}
        </div>
        {/* Quote/Footer Decoration */}
        <div className="mt-20 flex justify-center">
          <div className="max-w-3xl bg-card border border-border p-6 sm:p-10 rounded-xl text-center shadow-sm">
            <p className="text-foreground font-sans text-base italic leading-relaxed">
              "Our Clinical Precision approach ensures every facility meets the highest standards of operational excellence through a unified architectural and clinical framework."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
