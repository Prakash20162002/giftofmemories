import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Video } from "lucide-react";
import axios from "axios";

const PageVideoSection = ({ pageType, title, subtitle, layout = "static", customVideos }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (customVideos && customVideos.length > 0) {
      setVideos(customVideos);
      setIsLoading(false);
      return;
    }
    
    if (!pageType) {
      setIsLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/page-videos/page/${pageType}`
        );
        const allVideos = response.data || [];
        const filtered = allVideos.filter((v) => {
          if (pageType === "shop" || pageType === "product-details") {
            return layout === "floating";
          }
          const wantFloating = layout === "floating";
          const isFloating = v.showAsFloating === true;
          return wantFloating === isFloating;
        });
        setVideos(filtered);
      } catch (error) {
        console.error("Error fetching page videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [pageType, customVideos, layout]);

  useEffect(() => {
    if (videos.length > 0) {
      setFeaturedVideo(videos[0]);
    } else {
      setFeaturedVideo(null);
    }
  }, [videos]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  if (isLoading || videos.length === 0) {
    return null;
  }

  // If layout is floating, render the floating widget
  if (layout === "floating") {
    if (!featuredVideo) return null;
    return (
      <>
        {/* Floating Video Widget */}
        <motion.div
          initial={{ x: 350, opacity: 0 }}
          animate={{ 
            x: isWidgetExpanded ? 0 : "calc(100% + 24px)",
            opacity: 1
          }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed right-6 top-[28%] z-[45] md:w-[320px] w-[280px]"
        >
          {/* Toggle Button */}
          <motion.button
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            whileHover={!isWidgetExpanded ? { x: -6 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 shadow-2xl flex items-center justify-center border border-charcoal-black/10 cursor-pointer z-50 transition-colors duration-300 ${
              isWidgetExpanded 
                ? "-left-6 bg-white rounded-full text-charcoal-black hover:bg-gold-accent hover:text-white" 
                : "-left-12 bg-charcoal-black rounded-l-full text-gold-accent hover:bg-gold-accent hover:text-charcoal-black"
            }`}
            aria-label={isWidgetExpanded ? "Collapse video panel" : "Expand video panel"}
          >
            {isWidgetExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} className="animate-pulse" />}
          </motion.button>

          {/* Inner Content Container */}
          <div className="w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-charcoal-black/5 flex flex-col overflow-hidden">
            {/* Widget Header */}
            <div className="p-4 border-b border-charcoal-black/5 bg-warm-ivory/30 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-gold-accent" />
                <span className="font-playfair font-bold text-sm text-charcoal-black">
                  {title || "Video Guides"}
                </span>
              </div>
              <span className="text-[9px] font-black bg-gold-accent/15 text-gold-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                {videos.length} {videos.length === 1 ? "Video" : "Videos"}
              </span>
            </div>

            {/* Featured Video Card */}
            <div className="p-4 pb-3">
              <div 
                onClick={() => setSelectedVideo(featuredVideo)}
                className="relative aspect-video rounded-2xl overflow-hidden shadow-md group cursor-pointer bg-charcoal-black border border-charcoal-black/5"
              >
                {featuredVideo.videoType === "youtube" ? (
                  <img 
                    src={featuredVideo.thumbnailUrl} 
                    alt={featuredVideo.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <video 
                    src={featuredVideo.videoUrl} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    muted 
                    playsInline 
                    preload="metadata" 
                  />
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <Play size={14} className="text-gold-accent ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* YouTube Badge */}
                {featuredVideo.videoType === "youtube" && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#FF0000] text-white text-[8px] font-bold uppercase tracking-wider shadow-sm">
                      YouTube
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-playfair font-bold text-xs text-charcoal-black mt-3 line-clamp-1">
                {featuredVideo.title}
              </h3>
              {featuredVideo.description && (
                <p className="text-[10px] text-slate-gray font-inter mt-1 line-clamp-2 leading-relaxed">
                  {featuredVideo.description}
                </p>
              )}
            </div>

            {/* Playlist Items */}
            {videos.length > 1 && (
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 max-h-[170px] custom-scrollbar border-t border-charcoal-black/5 pt-2">
                <span className="text-[8px] font-black uppercase text-slate-gray/55 tracking-widest block mb-2">
                  Playlist
                </span>
                {videos.map((video) => {
                  const isFeatured = video._id === featuredVideo._id;
                  return (
                    <button
                      key={video._id}
                      onClick={() => setFeaturedVideo(video)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isFeatured 
                          ? "border-gold-accent bg-gold-accent/5 shadow-sm" 
                          : "border-charcoal-black/5 hover:bg-warm-ivory/50"
                      }`}
                    >
                      <div className="relative w-14 aspect-video rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {video.videoType === "youtube" ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={video.videoUrl} 
                            className="w-full h-full object-cover"
                            muted 
                            playsInline 
                            preload="metadata"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play size={8} className="text-white" fill="currentColor" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-playfair font-bold text-[10px] text-charcoal-black line-clamp-1">
                          {video.title}
                        </h4>
                        {video.description && (
                          <p className="text-[8px] text-slate-gray font-inter mt-0.5 line-clamp-1">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Video Modal Player (Full Screen) */}
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
                className="fixed top-4 right-4 md:absolute md:-top-12 md:right-0 text-white/70 hover:text-gold-accent transition-colors z-[110] p-2 bg-black/20 md:bg-transparent rounded-full border-0 cursor-pointer"
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
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl w-full border border-white/10">
                  {selectedVideo.videoType === "youtube" ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedVideo.title || "Video Player"}
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
  }

  // If layout is static (original inline grid/carousel presentation)
  return (
    <>
      <section className="py-10 md:py-12 bg-gradient-to-b from-warm-ivory to-white w-full">
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

          {/* Mobile uses 2-col Grid */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-3 max-w-5xl mx-auto">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Carousel / Grid */}
          <div className="hidden md:block">
            {videos.length === 1 ? (
              <motion.div className="max-w-2xl mx-auto">
                <VideoCard video={videos[0]} onClick={() => setSelectedVideo(videos[0])} />
              </motion.div>
            ) : videos.length <= 3 ? (
              <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto">
                {videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative max-w-4xl mx-auto">
                <div className="overflow-hidden rounded-xl">
                  <motion.div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {videos.map((video) => (
                      <div key={video._id} className="w-full flex-shrink-0 px-4">
                        <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                <button
                  onClick={handlePrev}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10 cursor-pointer border-0"
                >
                  <ChevronLeft size={18} className="text-charcoal-black hover:text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-gold-accent hover:text-white transition-colors z-10 cursor-pointer border-0"
                >
                  <ChevronRight size={18} className="text-charcoal-black hover:text-white" />
                </button>

                <div className="flex justify-center gap-2 mt-4">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 rounded-full transition-all border-0 cursor-pointer ${
                        index === currentIndex ? "w-6 bg-gold-accent" : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal Player (Full Screen) */}
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
              className="fixed top-4 right-4 md:absolute md:-top-12 md:right-0 text-white/70 hover:text-gold-accent transition-colors z-[110] p-2 bg-black/20 md:bg-transparent rounded-full border-0 cursor-pointer"
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
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl w-full border border-white/10">
                {selectedVideo.videoType === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title || "Video Player"}
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

// Video Card Component
const VideoCard = ({ video, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
    >
      <div className="relative aspect-video bg-gray-100 shrink-0">
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
            playsInline
            preload="metadata"
          />
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

      <div className="p-2.5 md:p-4 flex-1 flex flex-col justify-between">
        <div>
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
    </div>
  );
};

export default PageVideoSection;