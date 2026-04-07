import { useEffect, useState, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { Check, Camera, Video, Clapperboard } from "lucide-react"; // <-- Added elegant icons
import axios from "axios";

// Default fallback images
const defaultScrollImages = [
  "/nowimg1.jpg",
  "/nowimg2.jpg",
  "/nowimg3.jpg",
  "/img1.jpeg",
  "/img2.jpeg",
  "/img4.jpg",
  "/preimg1.jpeg",
  "/preimg2.jpeg",
  "/preimg5.jpeg",
];

// --- NEW ELEGANT SPECIALTIES REPLACING PERCENTAGES ---
const specialtiesList = [
  { name: "Photography", icon: Camera, desc: "Candid moments & timeless portraits." },
  { name: "Cinematography", icon: Video, desc: "Cinematic storytelling & highlight films." },
  { name: "Film Making", icon: Clapperboard, desc: "High-end production & artistic direction." },
];

const features = [
  "6+ Years of Wedding Photography Experience",
  "Creative Direction & Wedding Planning Support",
  "Associated with Top Camera Brands (Canon)",
  "High-End Camera & Equipment (HD & 4K Quality)",
  "Professional Team of Skilled Photographers",
  "Strong Focus on Candid & Cinematic Storytelling",
];

const stats = [
  { value: 100, suffix: "%", label: "Client Satisfaction Rate" },
  { value: 1000, suffix: "+", label: "Successful Photography Sessions" },
  { value: 50, suffix: "+", label: "Dedicated & Experienced Team" }, 
  { value: 500, suffix: "+", label: "Weddings & Events Covered" },
];

const AnimatedNumber = ({ value, suffix }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const number = useMotionValue(0);
  const display = useTransform(number, (v) => Math.floor(v));

  useEffect(() => {
    if (isInView) {
      number.set(0);

      animate(number, value * 1.25, {
        duration: 1,
        ease: "easeIn",
      }).then(() => {
        // Snap back to final value
        animate(number, value, {
          duration: 0.6,
          ease: "easeOut",
        });
      });
    }
  }, [isInView, value, number]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{display}</motion.span>
      <span>{suffix}</span>
    </span>
  );
};

const CombinedSections = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const [scrollImages, setScrollImages] = useState(defaultScrollImages);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/section/scroll`
        );
        if (response.data && response.data.length > 0) {
          setScrollImages(response.data.map((img) => img.imageUrl));
        }
      } catch (error) {
        console.error("Error fetching scroll gallery images:", error);
      }
    };
    fetchImages();
  }, []);

  // Split images into two columns
  const col1Images = scrollImages.filter((_, i) => i % 2 === 0);
  const col2Images = scrollImages.filter((_, i) => i % 2 === 1);

  return (
    <section
      ref={containerRef}
      className="py-16 lg:py-24 bg-warm-ivory text-charcoal-black relative overflow-hidden w-full max-w-[100vw]"
    >
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-warm-ivory z-0 hidden lg:block border-l border-gold-accent/10" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-gold-accent/5 rounded-full blur-[80px] lg:blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative z-10">
        {/* LEFT COLUMN: Content Stack */}
        <div className="flex flex-col gap-16 lg:gap-32">
          
          {/* 1. Real Wedding Stories Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-2 rounded-full bg-gold-accent/40 border border-white/10 mb-6 lg:mb-8 backdrop-blur-sm">
              <span className="text-charcoal-black text-[10px] lg:text-xs font-inter uppercase tracking-widest font-bold">
                Short brand story
              </span>
            </div>
            
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 lg:mb-8 text-charcoal-black">
              About <span className="italic text-gold-accent">Gift of Memories</span>
            </h2>
            
            <p className="font-inter text-charcoal-black/70 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12 max-w-xl">
              Gift of Memories is a professional wedding photography studio in Kolkata known for candid storytelling and cinematic wedding films. Our team captures weddings, celebrations, and family milestones with creativity, passion, and attention to detail.
            </p>

            {/* Mobile Only: Auto-Scrolling Horizontal Image Gallery */}
            <div className="lg:hidden flex overflow-hidden mb-10 -mx-6 px-6 relative w-[100vw]">
              <motion.div
                className="flex gap-4 w-max"
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  ease: "linear",
                  duration: scrollImages.length * 3,
                  repeat: Infinity,
                }}
              >
                {[...scrollImages, ...scrollImages].map((src, idx) => (
                  <div
                    key={`mob-img-${idx}`}
                    className="w-[60vw] sm:w-[40vw] h-64 shrink-0 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      alt="Mobile Gallery"
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ELEGANT SPECIALTY CARDS REPLACING PROGRESS BARS */}
            <div className="flex flex-col gap-4 max-w-lg mt-4">
              {specialtiesList.map((item, index) => (
                <div key={index} className="flex items-center gap-5 p-4 rounded-2xl bg-white/40 border border-gold-accent/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:bg-white/60">
                  <div className="w-12 h-12 rounded-full bg-gold-accent/10 flex items-center justify-center text-gold-accent shrink-0">
                    <item.icon size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-playfair text-lg md:text-xl font-bold text-charcoal-black mb-0.5">{item.name}</h4>
                    <p className="font-inter text-[11px] md:text-xs text-slate-gray/80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. Why Choose Us Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-charcoal-black font-inter text-xs lg:text-sm font-bold uppercase tracking-widest block mb-4 lg:mb-6 px-4 border-l-2 border-charcoal-black">
              Why Couples Choose Gift of Memories
            </span>
            <p className="font-inter text-charcoal-black/60 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12 max-w-xl">
              Gift of Memories delivers candid and cinematic wedding photography
              with creativity, professionalism, and a personalized touch
              to make your memories timeless.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 lg:gap-y-6 gap-x-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 mt-1 rounded-full bg-gold-accent/20 flex items-center justify-center flex-shrink-0 text-gold-accent">
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <span className="font-inter font-bold text-sm tracking-wide text-charcoal-black leading-tight pt-1">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3. Team Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-charcoal-black font-inter text-xs lg:text-sm font-bold uppercase tracking-widest block mb-4 lg:mb-6 px-4 border-l-2 border-charcoal-black">
              Our Team – Passionate Visual Storytellers
            </span>
            <p className="font-inter text-charcoal-black/60 text-base lg:text-lg leading-relaxed mb-8 lg:mb-16 max-w-xl">
              Our team consists of experienced photographers and filmmakers who are deeply passionate about capturing emotions. Every smile, glance, and ritual is documented with attention to detail, ensuring a perfect blend of artistry and authenticity. We believe that every wedding has a story—and we are here to tell yours beautifully.
            </p>
            
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-12 gap-y-6 lg:gap-y-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="border-b border-charcoal-black/10 pb-4 lg:pb-8"
                >
                  <h3 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-charcoal-black mb-1 lg:mb-2">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-charcoal-black/70 mb-2 lg:mb-4 leading-tight">
                    {stat.label}
                  </p>
                  <div className="w-6 lg:w-8 h-1 bg-gold-accent rounded-full" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Continuous Image Flow (Desktop Only) */}
        <div className="hidden lg:block relative h-full">
          <div className="sticky top-24 grid grid-cols-2 gap-4 h-screen">
            {/* Column 1 of Images */}
            <motion.div
              style={{ y: y1 }}
              className="space-y-4 flex flex-col pt-12"
            >
              {col1Images.map((src, index) => (
                <div
                  key={`col1-${index}`}
                  className={`${
                    index % 3 === 0
                      ? "h-64"
                      : index % 3 === 1
                      ? "h-80"
                      : "h-96"
                  } rounded-3xl overflow-hidden shrink-0 shadow-sm`}
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                    alt="Gallery"
                  />
                </div>
              ))}
            </motion.div>

            {/* Column 2 of Images */}
            <motion.div style={{ y: y2 }} className="space-y-4 flex flex-col">
              {col2Images.map((src, index) => (
                <div
                  key={`col2-${index}`}
                  className={`${
                    index % 3 === 0
                      ? "h-96"
                      : index % 3 === 1
                      ? "h-64"
                      : "h-80"
                  } rounded-3xl overflow-hidden shrink-0 shadow-sm`}
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                    alt="Gallery"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CombinedSections;