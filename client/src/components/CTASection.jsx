import { motion } from "framer-motion";

const CTASection = () => {
  return (
    // 1. Scaled down vertical padding on mobile (py-20)
    <section id="contact" className="py-20 md:py-32 bg-warm-ivory text-center relative overflow-hidden">
      
      {/* 2. Added a subtle, premium background glow behind the text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gold-accent/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Optional: Added a small elegant kicker text above the heading */}
          <span className="text-gold-accent font-inter text-[10px] md:text-xs uppercase tracking-[0.2em] mb-3 md:mb-4 block font-semibold">
            Start Your Journey
          </span>
          
          {/* 3. Scaled typography for mobile (text-4xl) to desktop (text-6xl) */}
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-charcoal-black mb-4 md:mb-6 leading-tight">
            Let's Create Something <br className="hidden sm:block" /> Beautiful
          </h2>
          
          {/* 4. Tighter margins and slightly smaller text on mobile */}
          <p className="font-inter text-slate-gray mb-8 md:mb-10 text-sm md:text-lg font-light max-w-lg mx-auto leading-relaxed">
            Ready to capture your story? Get in touch to discuss your project or
            book a session.
          </p>
          
          <motion.a
            href="mailto:hello@giftofmemories.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            /* 5. Improved button: rounded ends, better mobile padding, and a high-contrast hover state */
            className="inline-block px-8 py-3.5 md:px-10 md:py-4 bg-gold-accent text-charcoal-black font-inter text-xs md:text-sm font-semibold uppercase tracking-widest hover:bg-charcoal-black hover:text-gold-accent transition-all duration-300 shadow-xl shadow-gold-accent/20 rounded-full"
          >
            Book a Consultation
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;