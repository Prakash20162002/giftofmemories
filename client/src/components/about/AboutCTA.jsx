import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon } from "lucide-react"; // Added icons for visual cues

const AboutCTA = () => {
  return (
    // Responsive padding to prevent mobile users from scrolling forever
    <section className="relative py-16 md:py-24 bg-white text-center overflow-hidden border-t border-charcoal-black/5">
      
      {/* Subtle Background Detail to keep it premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-gold-accent to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10 mt-4 md:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-black mb-6 leading-tight tracking-tight">
            Ready to Write <span className="italic text-gold-accent">Your Chapter?</span>
          </h2>
          
          <p className="font-inter text-base md:text-lg text-charcoal-black/70 mb-10 block max-w-xl mx-auto leading-relaxed">
            We break everything down for you. Reach out for a no-obligation chat and let's discuss how we can beautifully preserve your legacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Action */}
            <Link
              to="/contact"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-charcoal-black text-gold-accent font-inter text-xs md:text-sm uppercase tracking-[0.2em] font-bold rounded-full shadow-2xl shadow-charcoal-black/20 hover:bg-gold-accent hover:text-charcoal-black transition-all duration-500 transform hover:-translate-y-1 group"
            >
              Start a Conversation
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            {/* Secondary Action */}
            <Link
              to="/gallery"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 border-2 border-charcoal-black/10 text-charcoal-black font-inter text-xs md:text-sm uppercase tracking-[0.2em] font-bold rounded-full hover:border-charcoal-black hover:bg-charcoal-black/5 transition-all duration-500 transform hover:-translate-y-1"
            >
              <ImageIcon size={16} className="opacity-50" />
              View Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA;