import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import axios from "axios";

// Default fallback images
const defaultImages = [
  "/preimg1.jpeg",
  "/preimg2.jpeg",
  "/preimg3.jpeg",
  "/preimg4.jpeg",
  "/preimg5.jpeg",
  "/preimg6.jpg",
  "/nowimg3.jpg",
];

// Shared spring config — snappy but smooth
const SPRING = { stiffness: 80, damping: 20, mass: 0.7 };

const Row = ({ images, direction, scrollYProgress, className = "" }) => {
  const safeImages = images && images.length > 0 ? images : defaultImages;
  const loopedImages = [...safeImages, ...safeImages, ...safeImages, ...safeImages];

  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "left" ? ["0%", "-65%"] : ["-65%", "0%"]
  );
  // Wrap raw transform in a spring for butter-smooth motion
  const x = useSpring(rawX, SPRING);

  return (
    <div
      className={`flex gap-4 md:gap-8 mb-4 md:mb-8 overflow-hidden whitespace-nowrap ${className}`}
    >
      <motion.div
        style={{ x, willChange: "transform" }}
        className="flex gap-4 md:gap-8 min-w-full"
      >
        {loopedImages.map((src, i) => (
          <div
            key={`${i}-${src}`}
            className="relative h-[160px] w-[240px] sm:h-[200px] sm:w-[300px] md:h-[300px] md:w-[450px] shrink-0 rounded-xl md:rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={src}
              alt="Gallery"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const ParallaxGallery = () => {
  const [images, setImages] = useState(defaultImages);
  const sectionRef = useRef(null);

  // Single shared scroll source — all rows move from one listener
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/section/parallax`
        );
        if (response.data && response.data.length > 0) {
          setImages(response.data.map((img) => img.imageUrl));
        }
      } catch (error) {
        console.error("Error fetching parallax gallery images:", error);
      }
    };
    fetchImages();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-warm-ivory overflow-hidden relative"
    >
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 mb-10 md:mb-16 text-center">
        <span className="text-gold-accent font-inter text-xs md:text-sm uppercase tracking-widest block mb-3 font-semibold">
          Visual Stories
        </span>
        <h2 className="font-playfair text-3xl sm:text-4xl md:text-6xl text-charcoal-black">
          Capturing Life&apos;s Canvas
        </h2>
      </div>

      {/* Gallery Wrapper with Edge Fades */}
      <div className="relative flex flex-col">
        {/* Cinematic Edge Gradients */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-warm-ivory to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none" />

        {/* Row 1: Left */}
        <Row images={images.slice(0, 5)} direction="left" scrollYProgress={scrollYProgress} />
        {/* Row 2: Right */}
        <Row images={images.slice(5, 10)} direction="right" scrollYProgress={scrollYProgress} />
        {/* Row 3: Left */}
        <Row images={images.slice(2, 7)} direction="left" scrollYProgress={scrollYProgress} />
        {/* Row 4: Right */}
        <Row images={images.slice(1, 6)} direction="right" scrollYProgress={scrollYProgress} />
        {/* Desktop-only rows */}
        <Row images={images.slice(3, 8)} direction="left" scrollYProgress={scrollYProgress} className="hidden md:flex" />
        <Row images={images.slice(0, 5)} direction="right" scrollYProgress={scrollYProgress} className="hidden md:flex" />
        <Row images={images.slice(4, 9)} direction="left" scrollYProgress={scrollYProgress} className="hidden lg:flex" />
      </div>
    </section>
  );
};

export default ParallaxGallery;