import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery"; // Real Wedding Stories
import CombinedSections from "../components/CombinedSections";
import ServiceCategoryGrid from "../components/services/ServiceCategoryGrid";
import ProductCategoryGrid from "../components/products/ProductCategoryGrid";
import Testimonials from "../components/Testimonials";
import HomeCTA from "../components/HomeCTA";
import RevealOnScroll from "../components/RevealOnScroll";

// --- Galleries & Videos ---
import ParallaxGallery from "../components/ParallaxGallery";
import HomeVideoSection from "../components/HomeVideoSection"; // <-- RESTORED IMPORT

const HomePage = () => {
  const [packages, setPackages] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // --- RESTORED: Video Settings State ---
  const [videoSettings, setVideoSettings] = useState({
    showHomeVideo: true,
    homeVideos: [],
  });

  // Text values aligned with handwritten note and requests
  const settings = {
    productsBadge: "Samogri by gift of memories",
    productsTitle: "Wedding Ritual Collection",
    productsDesc: "A curated collection of handcrafted Samogri designed for every Bengali wedding ritual.",
    servicesBadge: "What we offer",
    servicesTitle: "Photography Experiences",
    servicesBtn: "View all services package"
  };

  // --- RESTORED: Fetch Video Settings ---
  useEffect(() => {
    const fetchVideoSettings = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/get-settings`
        );
        setVideoSettings({
          showHomeVideo: response.data.showHomeVideo ?? true,
          homeVideos: response.data.homeVideos ?? [],
        });
      } catch (error) {
        console.error("Error fetching video settings:", error);
      }
    };
    fetchVideoSettings();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/packages-with-services`);
        setPackages(res.data);
      } catch (e) { 
        console.error("Service fetch failed", e); 
      } finally { 
        setIsLoadingServices(false); 
      }
    };
    fetchPackages();
  }, []);

  return (
    // Added max-w-[100vw] to ensure no horizontal double scrollbars ever appear
    <main className="overflow-x-hidden max-w-[100vw] bg-charcoal-black selection:bg-gold-accent selection:text-charcoal-black relative">
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">Gift of Memories - Premium Wedding Photography & Samogri in Kolkata</h1>

      <Hero />

      {/* Real Wedding Stories */}
      <section id="stories" aria-label="Real Wedding Stories" className="w-full">
        <Gallery /> 
      </section>
            
      {/* PRODUCTS SECTION (SAMOGRI) */}
      <RevealOnScroll>
        <section id="shop" className="py-14 md:py-20 bg-white relative w-full">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <span className="text-gold-accent font-inter text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4 block">
              {settings.productsBadge}
            </span>
            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-charcoal-black mb-4">
              {settings.productsTitle}
            </h2>
            <p className="font-inter text-slate-gray/80 text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed">
              {settings.productsDesc}
            </p>
            
            <ProductCategoryGrid />

            <div className="mt-8 md:mt-10 flex justify-center">
              <a href="/shop" className="w-max inline-flex px-6 py-3.5 md:px-10 md:py-4 bg-gold-accent text-white font-inter text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full md:rounded-sm shadow-2xl hover:bg-charcoal-black transition-all items-center justify-center gap-2">
                Explore Samogri Shop <ArrowRight size={14} className="md:w-4 md:h-4" />
              </a>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* SERVICES SECTION */}
      <RevealOnScroll>
        <section id="services" className="py-14 md:py-20 bg-warm-ivory border-y border-charcoal-black/5 w-full">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            {/* Eyebrow with flanking lines */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-[1px] w-8 md:w-14 bg-gold-accent/40" />
              <span className="text-gold-accent font-inter text-[10px] md:text-[11px] uppercase tracking-[0.45em] font-black">
                {settings.servicesBadge}
              </span>
              <span className="h-[1px] w-8 md:w-14 bg-gold-accent/40" />
            </div>

            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-charcoal-black font-bold mb-6 tracking-tight">
              {settings.servicesTitle}
            </h2>

            <ServiceCategoryGrid packages={packages} isLoading={isLoadingServices} />

            <div className="mt-8 md:mt-10 flex justify-center">
              <a
                href="/services"
                className="group w-max inline-flex items-center gap-3 px-6 py-3.5 md:px-10 md:py-4 border-2 border-gold-accent text-charcoal-black font-inter text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full md:rounded-sm hover:bg-gold-accent hover:text-white transition-all items-center justify-center gap-2"
              >
                {settings.servicesBtn}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </section>
      </RevealOnScroll>
      {/* --- RESTORED: VIDEOS SECTION --- */}
      {videoSettings.showHomeVideo && videoSettings.homeVideos?.length > 0 && (
        <RevealOnScroll>
          <section aria-label="Cinematic Wedding Films" className="relative z-10 bg-charcoal-black w-full overflow-hidden">
            <HomeVideoSection videos={videoSettings.homeVideos} />
          </section>
        </RevealOnScroll>
      )}
      {/* --- The Cinematic Parallax Gallery --- */}
      <section aria-label="Cinematic Portfolio Showcase" className="relative z-10 bg-charcoal-black w-full overflow-hidden">
        <ParallaxGallery />
      </section>

      

      {/* Studio Details */}
      <section aria-label="Our Studio Details" className="w-full overflow-hidden">
        <CombinedSections />
      </section>

      <section aria-label="Client Experience" className="w-full overflow-hidden">
        <Testimonials />
      </section>
      
      <HomeCTA />
    </main>
  );
};

export default HomePage;