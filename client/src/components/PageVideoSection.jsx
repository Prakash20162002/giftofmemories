import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Video } from "lucide-react";
import axios from "axios";

const PageVideoSection = ({ pageType, title, subtitle }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/page-videos/page/${pageType}`,
        );
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching page videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [pageType]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  if (isLoading || videos.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-warm-ivory to-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-gold-accent/10 text-gold-accent px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4"
            >
              <Video size={16} />
              {title || "Video Guides"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black mb-3 md:mb-4"
            >
              {subtitle || "Learn How It Works"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base px-2"
            >
              Watch our helpful video tutorials to understand our process better
            </motion.p>
          </div>

          {/* Videos Grid */}
          {videos.length === 1 ? (
            // Single video - Full width
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <VideoCard
                video={videos[0]}
                onClick={() => setSelectedVideo(videos[0])}
              />
            </motion.div>
          ) : videos.length <= 3 ? (
            // 2-3 videos - Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            // More than 3 videos - Carousel
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden rounded-xl">
                <motion.div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {videos.map((video) => (
                    <div key={video._id} className="w-full flex-shrink-0 px-2 md:px-4">
                      <VideoCard
                        video={video}
                        onClick={() => setSelectedVideo(video)}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Carousel Navigation - Pushed inward on mobile so they don't bleed off screen */}
              <button
                onClick={handlePrev}
                className="absolute left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10"
              >
                <ChevronLeft size={20} className="text-charcoal-black hover:text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10"
              >
                <ChevronRight size={20} className="text-charcoal-black hover:text-white" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-6 bg-gold-accent"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedVideo(null)}
          >
            {/* FIX 1: Mobile-safe Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="fixed top-4 right-4 md:absolute md:-top-12 md:right-0 text-white/70 hover:text-gold-accent transition-colors z-[110] p-2 bg-black/20 md:bg-transparent rounded-full"
            >
              <X size={28} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl w-full">
                {selectedVideo.videoType === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title || "Video"}
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline // FIX 2: Prevents iOS from overriding the player
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Video Info - Added padding and max-height for mobile */}
              {(selectedVideo.title || selectedVideo.description) && (
                <div className="mt-4 md:mt-6 text-white px-2">
                  {selectedVideo.title && (
                    <h3 className="font-playfair text-lg md:text-2xl font-semibold text-warm-ivory">
                      {selectedVideo.title}
                    </h3>
                  )}
                  {selectedVideo.description && (
                    <p className="text-white/70 mt-2 text-sm md:text-base font-inter max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Video Card Component
const VideoCard = ({ video, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {video.videoType === "youtube" ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <video 
            src={video.videoUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            muted 
            playsInline // FIX 3: Required for inline playback on iOS
            preload="metadata" // Speeds up loading and grabs the first frame
          />
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/95 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
            <Play
              size={24}
              className="text-gold-accent ml-1"
              fill="currentColor"
            />
          </div>
        </div>

        {/* Type Badge */}
        {video.videoType === "youtube" && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded bg-[#FF0000] text-white text-[10px] md:text-xs font-medium uppercase tracking-wide shadow-md">
              YouTube
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <h3 className="font-playfair font-semibold text-base md:text-lg text-charcoal-black group-hover:text-gold-accent transition-colors line-clamp-1">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-500 font-inter text-xs md:text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageVideoSection;