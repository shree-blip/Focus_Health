import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SchemaMarkup } from "@/components/seo";
import Index from "./pages/Index";
import Platform from "./pages/Platform";
import Market from "./pages/Market";
import TrackRecord from "./pages/TrackRecord";
import OurProcess from "./pages/OurProcess";
import Leadership from "./pages/Leadership";
import Partners from "./pages/Partners";
import Investors from "./pages/Investors";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ERofLufkin from "./pages/facilities/ERofLufkin";
import ERofIrving from "./pages/facilities/ERofIrving";
import ERofWhiteRock from "./pages/facilities/ERofWhiteRock";
import IrvingWellnessClinic from "./pages/facilities/IrvingWellnessClinic";
import NapervilleWellnessClinic from "./pages/facilities/NapervilleWellnessClinic";
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SchemaMarkup type="organization" />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/market" element={<Market />} />
            <Route path="/track-record" element={<TrackRecord />} />
            <Route path="/our-process" element={<OurProcess />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/facilities/er-of-lufkin" element={<ERofLufkin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
