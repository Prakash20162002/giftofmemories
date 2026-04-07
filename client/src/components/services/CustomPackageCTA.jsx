import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CustomPackageCTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gold-accent text-center relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }} 
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-charcoal-black mb-4 md:mb-6 font-bold leading-tight px-2 drop-shadow-sm">
            Looking for a Custom Photography Package?
          </h2>
          
          <p className="font-inter text-charcoal-black/80 text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
            Tell us your exact requirements and we’ll tailor a comprehensive plan just for your special day.
          </p>
          
          <Link 
            to="/contact" 
            className="cursor-pointer inline-block px-8 py-3.5 md:px-10 md:py-4 bg-charcoal-black text-gold-accent font-inter text-xs md:text-sm uppercase tracking-widest font-bold rounded-full shadow-xl shadow-black/20 hover:bg-warm-ivory hover:text-charcoal-black transition-all duration-300 transform hover:-translate-y-1"
          >
            Request Custom Quote
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomPackageCTA;