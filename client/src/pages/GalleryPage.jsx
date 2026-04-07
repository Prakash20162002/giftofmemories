import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GalleryHero from "../components/gallery/GalleryHero";
import GalleryFilter from "../components/gallery/GalleryFilter";
import MainGalleryGrid from "../components/gallery/MainGalleryGrid";
import VideoGallery from "../components/gallery/VideoGallery";
import ExplorationTags from "../components/gallery/ExplorationTags"; // Retained for future use
import GalleryCTA from "../components/gallery/GalleryCTA";
import ImmersiveGallery from "../components/gallery/ImmersiveGallery";
import GallerySectionDivider from "../components/gallery/GallerySectionDivider";
import LoadingScreen from "../components/LoadingScreen"; // Added for premium loading experience

import axios from "axios";

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState("masonry");
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Smooth scroll to top when toggling viewing modes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/gallery/get-gallery`
        );
        setGalleryItems(response.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      // STRICT OVERFLOW CONTROL: Prevents horizontal scrolling/wobbling on mobile
      className="bg-warm-ivory min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex flex-col font-inter"
    >
      
      {/* ---------------- DYNAMIC VIEWPORT ---------------- */}
      <div className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="immersive-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex-1"
            >
              <ImmersiveGallery
                viewMode={viewMode}
                setViewMode={setViewMode}
                items={galleryItems}
              />
            </motion.div>
          ) : (
            <motion.div
              key="standard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex-1 flex flex-col"
            >
              <GalleryHero />
              
              {/* Filter Container: Pulled up slightly to overlap the hero naturally */}
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-6 md:-mt-10">
                <GalleryFilter
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>

              {/* Main Grid Container */}
              <div className="w-full flex-1 mt-8 md:mt-12 pb-16 md:pb-24">
                <MainGalleryGrid
                  activeFilter={activeFilter}
                  viewMode={viewMode}
                  items={galleryItems}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- LOWER SECTIONS ---------------- */}
      {/* Grouped tightly to prevent awkward mobile spacing gaps */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* Divider bridges the gap between the light gallery and dark footer elements */}
        <div className="w-full bg-warm-ivory">
          <GallerySectionDivider />
        </div>
        
        {/* Video Gallery with strict overflow bounds */}
        <div className="w-full max-w-[100vw] overflow-hidden bg-charcoal-black">
          <VideoGallery />
        </div>
        
        <div className="w-full">
          <GalleryCTA />
        </div>
        
      </div>

    </motion.div>
  );
};

export default GalleryPage;