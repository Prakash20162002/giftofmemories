import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ServiceHero from "../components/services/ServiceHero";
import ServiceFilter from "../components/services/ServiceFilter";
import ServiceCategoryGrid from "../components/services/ServiceCategoryGrid";
import CustomPackageCTA from "../components/services/CustomPackageCTA";
import ServiceTrustStrip from "../components/services/ServiceTrustStrip";
// FIX 1: Removed the MostBookedPackages import
import PageVideoSection from "../components/PageVideoSection";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState({
    packageId: "all",
    priceRange: [0, 500000],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, packagesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/services`),
          axios.get(
            `${
              import.meta.env.VITE_NODE_URL
            }/api/services/packages-with-services`,
          ),
        ]);
        setServices(servicesResponse.data);
        setPackages(packagesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter packages based on active filters
  const filteredPackages = packages
    .map((pkg) => {
      let filteredServices = pkg.services || [];

      // Apply price range filter
      if (activeFilter.priceRange) {
        filteredServices = filteredServices.filter((service) => {
          const priceMatch = service.price?.match(/[\d,]+/);
          if (!priceMatch) return true;
          const price = parseInt(priceMatch[0].replace(/,/g, ""));
          return (
            price >= activeFilter.priceRange[0] &&
            price <= activeFilter.priceRange[1]
          );
        });
      }

      return {
        ...pkg,
        services: filteredServices,
      };
    })
    .filter((pkg) => {
      if (activeFilter.packageId === "all") return true;
      return pkg._id === activeFilter.packageId;
    })
    .filter((pkg) => pkg.services.length > 0); 

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-warm-ivory min-h-screen selection:bg-gold-accent selection:text-white"
    >
      {/* SEO HELPER: Screen-reader only H1 for better Google Indexing */}
      <h1 className="sr-only">
        Premium Wedding Photography & Cinematography Services in Kolkata - Gift of Memories
      </h1>

      {/* Hero Section */}
      <ServiceHero />

      {/* FIX 2: Completely removed the "Most Booked Packages" section so it doesn't interrupt the page flow */}

      {/* Cinematic Video Section */}
      <section aria-label="The Cinematic Experience" className="bg-charcoal-black border-y border-charcoal-black/5">
        <PageVideoSection
          pageType="services"
          title="The Cinematic Experience"
          subtitle="Watch Our Behind-The-Scenes & Service Guides"
        />
      </section>

      {/* Main Services Filter & Grid */}
      {/* FIX 3: Adjusted padding to connect smoothly to the video section above it */}
      <section 
        aria-label="Explore Our Services" 
        className="pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
      >
        <div className="text-center mb-12 md:mb-16">
            <span className="text-gold-accent font-inter text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4 block">
              Tailored for You
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-charcoal-black font-bold mb-6">
              Curated Service Collections
            </h2>
            <p className="font-inter text-slate-gray text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              From intimate haldi ceremonies to grand wedding receptions, explore our bespoke photography and filmmaking packages designed to capture the essence of your most cherished moments.
            </p>
        </div>

        <ServiceFilter
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          packages={packages}
        />
        
        {/* All packages now render exclusively here in the beautiful grid we built! */}
        <div className="mt-12 md:mt-16">
          <ServiceCategoryGrid
            packages={filteredPackages}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Custom Packages CTA */}
      <section aria-label="Request a Custom Package" className="bg-charcoal-black">
        <CustomPackageCTA />
      </section>

      {/* Trust Badges */}
      <section aria-label="Our Guarantees" className="bg-white border-t border-charcoal-black/10">
        <ServiceTrustStrip />
      </section>
      
    </motion.main>
  );
};

export default ServicesPage;