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
      <section className="py-10 md:py-12 bg-gradient-to-b from-warm-ivory to-white">
        <div className="container mx-auto px-4 md:px-6">
          
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-gold-accent/10 text-gold-accent px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium mb-3"
            >
              <Video size={14} />
              {title || "Video Guides"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black mb-2"
            >
              {subtitle || "Learn How It Works"}
            </motion.h2>
          </div>

          {/* FIX: Mobile strictly uses a 2-column Grid for all videos. Desktop uses Carousel if > 3 */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-3 max-w-5xl mx-auto">
              {videos.map((video, index) => (
                <motion.div key={video._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Grid / Carousel Logic */}
          <div className="hidden md:block">
            {videos.length === 1 ? (
              <motion.div className="max-w-2xl mx-auto">
                <VideoCard video={videos[0]} onClick={() => setSelectedVideo(videos[0])} />
              </motion.div>
            ) : videos.length <= 3 ? (
              <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto">
                {videos.map((video, index) => (
                  <motion.div key={video._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative max-w-4xl mx-auto">
                <div className="overflow-hidden rounded-xl">
                  <motion.div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {videos.map((video) => (
                      <div key={video._id} className="w-full flex-shrink-0 px-4">
                        <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                <button onClick={handlePrev} className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10">
                  <ChevronLeft size={18} className="text-charcoal-black hover:text-white" />
                </button>
                <button onClick={handleNext} className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10">
                  <ChevronRight size={18} className="text-charcoal-black hover:text-white" />
                </button>

                <div className="flex justify-center gap-2 mt-4">
                  {videos.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`h-1.5 rounded-full transition-all ${index === currentIndex ? "w-6 bg-gold-accent" : "w-2 bg-gray-300 hover:bg-gray-400"}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal (No changes needed here) */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedVideo(null)}
          >
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
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

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

// Video Card Component - Scaled text for mobile 2-col
const VideoCard = ({ video, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-video bg-gray-100">
        {video.videoType === "youtube" ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <video src={video.videoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted playsInline preload="metadata" />
        )}

        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/95 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
            <Play size={16} className="text-gold-accent ml-0.5 md:ml-1 md:w-5 md:h-5" fill="currentColor" />
          </div>
        </div>

        {video.videoType === "youtube" && (
          <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2">
            <span className="px-1.5 py-0.5 rounded bg-[#FF0000] text-white text-[7px] md:text-[10px] font-medium uppercase tracking-wide shadow-md">
              YouTube
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 md:p-4">
        <h3 className="font-playfair font-semibold text-xs md:text-base text-charcoal-black group-hover:text-gold-accent transition-colors line-clamp-1">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-500 font-inter text-[9px] md:text-xs mt-1 md:mt-1.5 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageVideoSection;