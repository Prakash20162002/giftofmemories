import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

const HomeVideoSection = ({ videos = [] }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videos || videos.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <section className="py-20 bg-charcoal-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #C9A24D 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-12"
            >
              <span className="inline-block text-gold-accent font-inter text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3 md:mb-4 font-bold drop-shadow-sm">
                Watch Our Story
              </span>
              <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4">
                Featured Videos
              </h2>
              <p className="font-inter text-white/70 text-sm md:text-lg max-w-2xl mx-auto px-4">
                Experience our work through these captivating videos
              </p>
            </motion.div>

            {/* Videos Display Logic */}
            {videos.length === 1 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
              >
                <VideoCard
                  video={videos[0]}
                  onClick={() => setSelectedVideo(videos[0])}
                  large
                />
              </motion.div>
            ) : videos.length === 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <VideoCard
                      video={video}
                      onClick={() => setSelectedVideo(video)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : videos.length === 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {/* Main Video */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <VideoCard
                    video={videos[currentIndex]}
                    onClick={() => setSelectedVideo(videos[currentIndex])}
                    large
                  />
                </motion.div>

                {/* Navigation Buttons: Adjusted placement for mobile */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-all z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-all z-20"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Thumbnail Strip: Added no-scrollbar so it's clean to swipe on mobile */}
                <div className="flex justify-start md:justify-center gap-3 mt-6 overflow-x-auto pb-2 px-2 no-scrollbar">
                  {videos.map((video, index) => (
                    <button
                      key={video._id}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-24 h-16 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                        index === currentIndex
                          ? "ring-2 ring-gold-accent scale-105"
                          : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      {video.type === "youtube" ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            {/* FIX 1: Mobile-safe close button pinned to top right of screen, not just the div */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="fixed top-4 right-4 md:absolute md:-top-12 md:right-0 text-white/70 hover:text-gold-accent transition-colors z-[110] p-2 bg-black/20 md:bg-transparent rounded-full"
            >
              <X size={28} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              // FIX 2: Fixed the 'opacityi' typo
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl w-full">
                {selectedVideo.type === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title || "Video"}
                  />
                ) : (
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Video Info - Added padding and max-height so it doesn't break small screens */}
              {(selectedVideo.title || selectedVideo.description) && (
                <div className="mt-4 md:mt-6 text-white px-2">
                  {selectedVideo.title && (
                    <h3 className="font-playfair text-lg md:text-2xl font-semibold text-warm-ivory">
                      {selectedVideo.title}
                    </h3>
                  )}
                  {selectedVideo.description && (
                    <p className="text-white/70 mt-2 text-sm md:text-base font-inter max-h-32 overflow-y-auto no-scrollbar">
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
const VideoCard = ({ video, onClick, large = false }) => {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer group rounded-2xl overflow-hidden shadow-2xl bg-black ${
        large ? "aspect-video" : "aspect-video"
      }`}
    >
      {/* Thumbnail */}
      {video.type === "youtube" ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title || "Video thumbnail"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
      ) : (
        // FIX 3: Added playsInline and preload to prevent iOS black boxes
        <video
          src={video.url}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          muted
          playsInline
          preload="metadata"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`rounded-full bg-gold-accent flex items-center justify-center shadow-lg group-hover:shadow-gold-accent/50 transition-shadow duration-300 ${
            large ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12 md:w-16 md:h-16"
          }`}
        >
          <Play
            size={large ? 32 : 24}
            className="text-white ml-1"
            fill="currentColor"
          />
        </motion.div>
      </div>

      {/* Video Type Badge */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
        <span
          className={`px-2 py-1 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-medium tracking-wide uppercase shadow-md ${
            video.type === "youtube"
              ? "bg-[#FF0000] text-white"
              : "bg-gold-accent text-charcoal-black font-bold"
          }`}
        >
          {video.type === "youtube" ? "YouTube" : "Studio Video"}
        </span>
      </div>

      {/* Title Overlay */}
      {video.title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-charcoal-black/90 via-charcoal-black/50 to-transparent">
          <h3 className="text-white font-playfair font-semibold text-base md:text-xl line-clamp-1 drop-shadow-md">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/70 font-inter text-xs md:text-sm line-clamp-1 mt-1 md:mt-2">
              {video.description}
            </p>
          )}
        </div>
      )}

      {/* Border Accent */}
      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none group-hover:border-gold-accent/50 transition-colors duration-500" />
    </div>
  );
};

export default HomeVideoSection;