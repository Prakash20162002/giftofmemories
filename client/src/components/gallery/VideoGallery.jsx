import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import Loader from "../Loader";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // States for the "Show All" logic
  const [isExpanded, setIsExpanded] = useState(false);
  const [rowLimit, setRowLimit] = useState(12);

  // Smart listener to always keep exactly 3 rows based on screen width
  useEffect(() => {
    const calculateLimit = () => {
      if (window.innerWidth >= 1024) {
        setRowLimit(12); // 4 columns * 3 rows = 12
      } else if (window.innerWidth >= 768) {
        setRowLimit(9);  // 3 columns * 3 rows = 9
      } else {
        setRowLimit(6);  // 2 columns * 3 rows = 6
      }
    };

    calculateLimit(); // Run on mount
    window.addEventListener("resize", calculateLimit);
    return () => window.removeEventListener("resize", calculateLimit);
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/gallery/get-youtube-videos`
        );
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 bg-charcoal-black flex justify-center items-center">
        <Loader color="#C9A24D" />
      </div>
    );
  }

  if (videos.length === 0) return null;

  const displayedVideos = isExpanded ? videos : videos.slice(0, rowLimit);
  const hasMoreVideos = videos.length > rowLimit;

  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-24 bg-charcoal-black text-warm-ivory">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-10 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4">
            Featured Films
          </h2>
          <p className="font-inter text-stone-400 max-w-xl text-sm md:text-base leading-relaxed">
            Cinematic highlights that bring stories to life. Each film is a 
            unique narrative of emotion and motion.
          </p>
        </div>

        {/* NEW GRID: 2 columns on mobile, 3 on tablet, 4 on desktop.
          Wrapped in motion.div for smooth expanding animation.
        */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
          <AnimatePresence>
            {displayedVideos.map((video, index) => (
              <motion.div
                layout
                key={video._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index < rowLimit ? index * 0.05 : 0 }}
                onClick={() => setSelectedVideo(video)}
                className="group relative aspect-video bg-stone-900 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-white/5"
              >
                {/* Thumbnail with smooth hover zoom */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={video.title || "YouTube video"}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                  }}
                />

                {/* Play Button Overlay - Scaled down for mobile */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gold-accent text-charcoal-black flex items-center justify-center pl-1 shadow-xl group-hover:scale-110 group-hover:shadow-gold-accent/40 transition-all duration-500">
                    <Play fill="currentColor" stroke="none" className="w-4 h-4 md:w-7 md:h-7" />
                  </div>
                </div>

                {/* Text Overlay - Responsive padding and text sizes */}
                <div className="absolute bottom-0 left-0 w-full p-3 md:p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                  <h3 className="font-playfair text-sm md:text-xl font-bold text-white mb-1 md:mb-2 line-clamp-1">
                    {video.title || "Untitled Film"}
                  </h3>
                  {video.tags?.length > 0 && (
                    <span className="inline-block font-inter text-[8px] md:text-[10px] uppercase tracking-widest bg-white/10 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-gold-accent border border-white/10 font-bold">
                      {video.tags[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Expand / Collapse Button */}
        {hasMoreVideos && (
          <motion.div layout className="mt-12 md:mt-16 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-transparent border border-gold-accent/50 text-gold-accent rounded-full font-inter text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-accent hover:text-charcoal-black transition-all duration-500"
            >
              {isExpanded ? "Show Less Films" : "View All Films"}
              {isExpanded ? (
                <ChevronUp size={16} className="transition-transform group-hover:-translate-y-1" />
              ) : (
                <ChevronDown size={16} className="transition-transform group-hover:translate-y-1" />
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Video Modal - Wrapped in AnimatePresence for exit animations */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 md:-top-14 md:-right-12 text-white/60 hover:text-gold-accent transition-colors p-2"
                aria-label="Close video"
              >
                <X size={32} strokeWidth={1.5} />
              </button>

              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                className="w-full h-full rounded-xl md:rounded-2xl shadow-2xl border border-white/10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoGallery;