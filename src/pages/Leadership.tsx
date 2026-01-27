import { motion } from "framer-motion";
import { ArrowRight, Share2, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";
import rickHeadshot from "@/assets/rick-leonard-headshot.png";
import jayHeadshot from "@/assets/srcassetsjay-dahal-headsho.png";
import jamieHeadshot from "@/assets/jamie-alcantar-headshot.png";
import anjilaHeadshot from "@/assets/anjila-shrestha-headshot.png";
import julieHeadshot from "@/assets/julie-moreno-headshot.png";
import heroLeadership from "@/assets/hero-leadership.jpg";
import ganeshHeadshot from "@/assets/ganesh-dahal-headshot.png";
import guinnessHeadshot from "@/assets/guinness-lakhe-headshot.png";
import bhaskarHeadshot from "@/assets/bhaskar-rokka-headshot.png";
import tikaHeadshot from "@/assets/tika-rai-headshot.png";
const featuredLeader = {
  name: "Jay Dahal",
  role: "Founder & CEO",
  category: "Executive Leadership",
  photo: jayHeadshot,
  quote:
    "Our vision is to build institutional-grade healthcare infrastructure that delivers operational excellence and meaningful returns for our partners, one facility at a time.",
  bio: "With experience leading $100M+ in annual revenue across 24+ healthcare locations, Jay brings proven expertise in scaling multi-site operations. As Consulting CFO at Total Point Healthcare and current operator of ER of Irving and ER of Lufkin, he combines financial acumen with hands-on operational leadership.",
  highlights: ["$100M+ annual revenue led", "24+ locations managed", "600+ staff managed"],
};
const teamMembers = [
  {
    name: "Jamie Alcantar",
    role: "Chief Nurse",
    category: "Healthcare",
    photo: jamieHeadshot,
  },
  {
    name: "Anjila Shrestha",
    role: "Operations",
    category: "Operations",
    photo: anjilaHeadshot,
  },
  {
    name: "Julie Moreno",
    role: "Executive Assistance",
    category: "Healthcare Operations",
    photo: julieHeadshot,
  },
  {
    name: "Moa-A",
    role: "Medical Records",
    category: "Healthcare",
    photo: null,
  },
];

const accountingTeam = [
  {
    name: "Ganesh Dahal",
    role: "Tax",
    category: "Accounting & Billing",
    photo: ganeshHeadshot,
  },
  {
    name: "Guinness Lakhe",
    role: "Sr. Accounting Officer",
    category: "Accounting & Billing",
    photo: guinnessHeadshot,
  },
  {
    name: "Bhaskar Rokka",
    role: "Staff Accountant",
    category: "Accounting & Billing",
    photo: bhaskarHeadshot,
  },
  {
    name: "Tika Rai",
    role: "Staff Accountant",
    category: "Accounting & Billing",
    photo: tikaHeadshot,
  },
  {
    name: "Bipul Maharjan",
    role: "Billing",
    category: "Accounting & Billing",
    photo: null,
  },
];
const rickProfile = {
  name: "Rick Leonard",
  role: "Healthcare Operations Leader",
  category: "Operations & Facilities",
  photo: rickHeadshot,
  quote:
    "Operational efficiency isn't just about cost savings—it's about creating environments where healthcare teams can deliver their best care.",
  bio: "Rick brings over 35 years of hospital operations and facility management experience. He has led multiple hospital and emergency center projects from concept to completion, with leadership roles at ServiceMaster, Texas Health Resources, and CHS. His equipment planning expertise spans Stanford, Sutter, and Marshfield Clinic.",
  highlights: ["35+ years experience", "50+ projects delivered", "4 major health systems"],
};
const LeadershipPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <PageHero
        title="Empowering Healthcare Through Visionary Leadership"
        description="Our team is committed to excellence and innovation, driving better outcomes for healthcare providers and patients alike."
        backgroundImage={heroLeadership}
        primaryCta={{
          text: "Get Started",
          link: "/partners",
        }}
        secondaryCta={{
          text: "Learn More",
          link: "/track-record",
        }}
      />

      {/* Featured Leader - Jay */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Photo */}
            <ScrollReveal>
              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                className="relative"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  <img
                    src={featuredLeader.photo}
                    alt={featuredLeader.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              </motion.div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal direction="left">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6">
                  {featuredLeader.category}
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
                  {featuredLeader.name}
                </h2>

                <p className="text-lg sm:text-xl text-primary font-medium mb-6 sm:mb-8">{featuredLeader.role}</p>

                {/* Quote */}
                <div className="border-l-4 border-primary pl-4 sm:pl-6 mb-6 sm:mb-8">
                  <p className="text-muted-foreground italic text-base sm:text-lg leading-relaxed">
                    "{featuredLeader.quote}"
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                  {featuredLeader.bio}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
                  {featuredLeader.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm font-medium"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Button asChild className="gap-2">
                    <Link to="/contact">
                      Connect With Jay
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Leader - Rick */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Content - Left side for Rick */}
            <ScrollReveal>
              <div className="order-2 lg:order-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold uppercase tracking-wider mb-6">
                  {rickProfile.category}
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
                  {rickProfile.name}
                </h2>

                <p className="text-lg sm:text-xl text-accent font-medium mb-6 sm:mb-8">{rickProfile.role}</p>

                {/* Quote */}
                <div className="border-l-4 border-accent pl-4 sm:pl-6 mb-6 sm:mb-8">
                  <p className="text-muted-foreground italic text-base sm:text-lg leading-relaxed">
                    "{rickProfile.quote}"
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                  {rickProfile.bio}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
                  {rickProfile.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-border rounded-lg text-xs sm:text-sm font-medium"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="accent" asChild className="gap-2">
                    <Link to="/contact">
                      Connect With Rick
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            {/* Photo - Right side for Rick */}
            <ScrollReveal direction="left">
              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                className="relative order-1 lg:order-2"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10">
                  <img
                    src={rickProfile.photo}
                    alt={rickProfile.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-2xl -z-10" />
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 sm:mb-4">
                Strategic Minds Behind Focus Health
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
                Our leadership team brings together financial expertise, operational rigor, and deep healthcare industry
                experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <ScrollReveal key={member.name} delay={index * 0.15}>
                <motion.div
                  whileHover={{
                    y: -8,
                  }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                >
                  {/* Photo */}
                  <div className="aspect-[4/5]">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/50">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-heading font-bold text-white mt-1">{member.name}</h3>
                    <p className="text-white/70 text-sm">{member.role}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Accounting & Billing Team Section */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 sm:mb-4">
                Accounting & Billing Team
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
                Our dedicated finance professionals ensure operational excellence and financial accuracy across all facilities.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {accountingTeam.map((member, index) => (
              <ScrollReveal key={member.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{
                    y: -8,
                  }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                >
                  {/* Photo */}
                  <div className="aspect-[4/5]">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/50">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-heading font-bold text-white mt-1">{member.name}</h3>
                    <p className="text-white/70 text-sm">{member.role}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-3 sm:mb-4">
                    Ready to partner with Focus Health?
                  </h2>
                  <p className="text-primary-foreground/80 text-base sm:text-lg">
                    Connect with our executive team to explore investment opportunities and strategic partnerships in
                    Texas healthcare infrastructure.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 lg:justify-end">
                  <Button variant="accent" size="lg" asChild className="gap-2">
                    <Link to="/contact">
                      Contact Our Team
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Link to="/track-record">View Track Record</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
export default LeadershipPage;
