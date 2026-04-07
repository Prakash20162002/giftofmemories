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
        <section id="shop" className="py-16 md:py-32 bg-white relative w-full">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <span className="text-gold-accent font-inter text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4 block">
              {settings.productsBadge}
            </span>
            <h2 className="font-playfair text-3xl md:text-7xl text-charcoal-black mb-6">
              {settings.productsTitle}
            </h2>
            <p className="font-inter text-slate-gray text-base md:text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
              {settings.productsDesc}
            </p>
            
            <ProductCategoryGrid />

            <div className="mt-12 flex justify-center">
              <a href="/shop" className="w-full sm:w-auto px-10 py-5 bg-gold-accent text-white font-inter text-xs font-black uppercase tracking-widest rounded-sm shadow-2xl hover:bg-charcoal-black transition-all flex items-center justify-center gap-2">
                Explore Samogri Shop <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* SERVICES SECTION */}
      <RevealOnScroll>
        <section id="services" className="py-16 md:py-32 bg-warm-ivory border-y border-charcoal-black/5 w-full">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <span className="text-gold-accent font-inter text-[10px] uppercase tracking-[0.4em] mb-4 block font-black">
              {settings.servicesBadge}
            </span>
            <h2 className="font-playfair text-3xl md:text-7xl text-charcoal-black mb-6">
              {settings.servicesTitle}
            </h2>
            
            <ServiceCategoryGrid packages={packages} isLoading={isLoadingServices} />

            <div className="mt-12 flex justify-center">
              <a href="/services" className="w-full sm:w-auto px-10 py-5 border-2 border-gold-accent text-charcoal-black font-inter text-xs font-black uppercase tracking-widest rounded-sm hover:bg-gold-accent hover:text-white transition-all flex items-center justify-center gap-2">
                {settings.servicesBtn} <ArrowRight size={16} />
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