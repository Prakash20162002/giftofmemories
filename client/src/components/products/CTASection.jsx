import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // FIX 1: Import Link
import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "918335934679";

const CTASection = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in a custom album/framing service from Gift of Memories."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    // FIX 3: Scaled padding for mobile vs desktop
    <div className="bg-gold-accent py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Subtle background texture for depth */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-charcoal-black mb-6 leading-tight">
            Premium Bengali Wedding Samogri in <span className="italic">Kolkata</span>
          </h2>
          <p className="text-charcoal-black/70 font-inter text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Shop custom-designed mukut, topor, and wedding essentials crafted for a perfect traditional celebration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* FIX 1 (Cont.): Swapped button for Link */}
            <Link 
              to="/contact"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-charcoal-black text-gold-accent font-inter text-xs uppercase tracking-[0.2em] font-bold rounded-full shadow-2xl shadow-black/20 hover:bg-white hover:text-charcoal-black transition-all duration-500 transform hover:-translate-y-1"
            >
              Request Custom Order
              <ArrowRight size={16} />
            </Link>

            {/* FIX 2: Refined WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 border-2 border-charcoal-black/10 text-charcoal-black font-inter text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-charcoal-black/5 transition-all duration-500 transform hover:-translate-y-1"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CTASection;