import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Maximize2 } from "lucide-react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import ImageLightbox from "../components/gallery/ImageLightbox";

const ClientGalleryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    const fetchGalleryDetails = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/client-gallery/active/${id}`
        );
        setGallery(res.data);
      } catch (err) {
        console.error("Error fetching client gallery:", err);
        toast.error("Failed to load this wedding story");
        navigate("/gallery");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchGalleryDetails();
    }
  }, [id, navigate]);

  const formattedImages = useMemo(() => {
    if (!gallery || !gallery.images) return [];
    return gallery.images.map((url, idx) => ({
      id: idx,
      src: url,
      type: "image",
      caption: `${gallery.name} - Capture ${idx + 1}`,
    }));
  }, [gallery]);

  const handleImageClick = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % formattedImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + formattedImages.length) % formattedImages.length);

  if (isLoading) return <LoadingScreen />;
  if (!gallery) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-warm-ivory min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex flex-col font-inter"
    >
      {/* Premium Hero Banner */}
      <section className="relative h-[40dvh] md:h-[60dvh] w-full overflow-hidden flex items-center justify-center bg-charcoal-black">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={gallery.coverImage}
            alt={gallery.name}
            className="w-full h-full object-cover opacity-45 scale-105 filter blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/85 via-transparent to-charcoal-black/95 pointer-events-none" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-4xl flex flex-col items-center">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-gold-accent text-warm-ivory hover:text-gold-accent bg-black/25 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={12} /> Back to Gallery
          </button>

          <span className="text-gold-accent text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-2 md:mb-3">
            {gallery.category}
          </span>
          <h1 className="font-playfair text-4xl sm:text-6xl md:text-7xl text-warm-ivory font-bold mb-4 leading-tight drop-shadow-2xl">
            {gallery.name}
          </h1>
          <p className="font-inter text-xs md:text-sm text-warm-ivory/70 uppercase tracking-widest font-medium">
            A beautiful collection of {gallery.images?.length || 0} captures
          </p>
        </div>
      </section>

      {/* Main Grid Container */}
      <section className="py-12 md:py-24 bg-warm-ivory w-full flex-1">
        <div className="container mx-auto px-4 md:px-8">
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2 md:gap-4 space-y-2 md:space-y-4">
            {formattedImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative group break-inside-avoid overflow-hidden cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.src}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Luxury Hover Overlay */}
                <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px]">
                  <div className="flex space-x-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-gold-accent hover:text-charcoal-black transition-colors">
                      <Eye size={18} strokeWidth={1.5} />
                    </div>
                    <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-gold-accent hover:text-charcoal-black transition-colors">
                      <Maximize2 size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {formattedImages.length === 0 && (
            <div className="text-center py-32 bg-white/30 rounded-[2rem] border border-dashed border-charcoal-black/10 max-w-lg mx-auto">
              <p className="font-playfair italic text-2xl text-slate-gray">
                This wedding story is currently being curated.
              </p>
              <p className="text-sm font-inter text-slate-gray/60 mt-2">Please check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Component */}
      <ImageLightbox
        selectedImage={selectedImageIndex !== null ? formattedImages[selectedImageIndex] : null}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
        hasNext={formattedImages.length > 1}
        hasPrev={formattedImages.length > 1}
      />
    </motion.div>
  );
};

export default ClientGalleryPage;
