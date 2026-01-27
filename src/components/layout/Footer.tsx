import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import focusHealthIcon from "@/assets/focus-health-icon.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-focus section-padding">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={focusHealthIcon} alt="Focus Health Logo" className="h-8 sm:h-10 w-auto brightness-0 invert" />
              <div className="flex items-baseline gap-1 sm:gap-1.5">
                <span className="font-heading font-bold text-base sm:text-lg text-primary-foreground">Focus</span>
                <span className="font-heading font-bold text-base sm:text-lg text-secondary">Health</span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-xs sm:text-sm leading-relaxed">
              Institutional-grade healthcare infrastructure, made simple. Building and operating high-performance
              freestanding ERs across Texas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Platform", href: "/platform" },
                { label: "Market", href: "/market" },
                { label: "Track Record", href: "/track-record" },
                { label: "Leadership", href: "/leadership" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-heading font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Partners</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "For Investors", href: "/partners?tab=investors" },
                { label: "For Communities", href: "/partners?tab=communities" },
                { label: "Early Access", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="mailto:info@getfocushealth.com"
                  className="flex items-center gap-1.5 sm:gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                >
                  <Mail size={14} className="sm:hidden" />
                  <Mail size={16} className="hidden sm:block" />
                  <span className="break-all sm:break-normal">info@getfocushealth.com</span>
                </a>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-primary-foreground/70 text-xs sm:text-sm">
                <MapPin size={14} className="sm:hidden" />
                <MapPin size={16} className="hidden sm:block" />
                350 Main St Suite H-7 Pleasanton CA 94566
              </li>
            </ul>
            <div className="mt-4 sm:mt-6">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/20 rounded-full text-[10px] sm:text-xs font-medium text-accent">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-pulse" />
                Actively Partnering in Texas
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-primary-foreground/60 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} Focus Healthcare LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/privacy"
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs sm:text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs sm:text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
