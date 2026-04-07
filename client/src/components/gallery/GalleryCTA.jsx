import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react"; // Added for visual cue

const WHATSAPP_NUMBER = "918335934679"; // Using your number from previous components

const GalleryCTA = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I just saw your beautiful gallery and would like to check your availability for a session."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    // FIX 1: Responsive padding (py-16 on mobile, py-24 on desktop)
    <section className="py-16 md:py-24 bg-white text-center relative overflow-hidden">
      {/* Subtle Background Detail to keep it premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gold-accent/30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-black mb-4 leading-tight">
            Loved What You See?
          </h2>
          <p className="font-inter text-base md:text-lg text-charcoal-black/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Every story is unique. Let us capture yours with the elegance it deserves. 
            <span className="block mt-1 font-semibold text-gold-accent italic">Our calendar fills up quickly.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* FIX 2: Internal Navigation Link */}
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-10 py-4 bg-charcoal-black text-gold-accent font-inter text-xs md:text-sm uppercase tracking-[0.2em] font-bold rounded-full shadow-xl shadow-black/10 hover:bg-gold-accent hover:text-charcoal-black transition-all duration-500 transform hover:-translate-y-1"
            >
              Book a Session
            </Link>

            {/* FIX 3: Dynamic WhatsApp Action */}
            <button 
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 border border-charcoal-black/10 text-charcoal-black font-inter text-xs md:text-sm uppercase tracking-[0.2em] font-bold rounded-full hover:bg-warm-ivory transition-all duration-500 transform hover:-translate-y-1"
            >
              <MessageCircle size={18} className="text-emerald-600" />
              Talk on WhatsApp
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryCTA;