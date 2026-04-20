import { motion } from "framer-motion";
import ContactForm from "./contact/ContactForm";

const HomeCTA = () => {
  return (
    // Scaled down vertical padding on mobile
    <section className="py-16 md:py-24 bg-warm-ivory text-charcoal-black relative overflow-hidden">
      
      {/* Background Decorative Circles (Added pointer-events-none and scaled for mobile) */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold-accent/5 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-gold-accent/5 rounded-full blur-[60px] md:blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Tightened the gap for mobile flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <span className="text-gold-accent font-inter text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4 block font-semibold">
              Start Your Journey
            </span>
            <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl mb-4 md:mb-6 leading-tight text-charcoal-black">
              Ready to frame your{" "}
              <span className="italic text-gold-accent">moments?</span>
            </h2>
            <p className="font-inter text-charcoal-black/70 text-base md:text-lg mb-8 font-light max-w-xl leading-relaxed">
              From the first consultation to the final delivery, we ensure your
              experience is as beautiful as the memories we capture. Let's
              discuss your vision.
            </p>
            
            {/* Contact info: Stacks on mobile, sits side-by-side on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 text-sm font-inter text-charcoal-black/60">
              <div>
                <h3 className="text-charcoal-black uppercase tracking-widest mb-1.5 font-bold text-xs md:text-sm">
                  Email
                </h3>
                {/* Clickable Email Link */}
                <a 
                  href="mailto:thegiftofmemories.clicks@gmail.com" 
                  className="hover:text-gold-accent transition-colors duration-200"
                >
                  thegiftofmemories.clicks@gmail.com
                </a>
              </div>
              <div>
                <h3 className="text-charcoal-black uppercase tracking-widest mb-1.5 font-bold text-xs md:text-sm">
                  Phone
                </h3>
                {/* Clickable Phone Link */}
                <a 
                  href="tel:+919876543210" 
                  className="hover:text-gold-accent transition-colors duration-200"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Contact Form */}
          <div className="w-full relative z-20">
            <ContactForm />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeCTA;