import { motion } from "framer-motion";
import { MapPin, Navigation, ArrowUpRight } from "lucide-react";

const MapSection = () => {
  return (
    <section className="py-20 md:py-32 bg-warm-ivory">
      <div className="container mx-auto px-4 md:px-12">
        
        {/* Section Header for Context */}
        <div className="text-center mb-12">
          <span className="text-gold-accent font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 block">
            Visit Us
          </span>
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-black">
            Our Studio
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[450px] md:h-[600px] border border-charcoal-black/10 group"
        >
          {/* FIX 1 & 3: Interactive iframe with custom CSS filters to match your brand */}
          <div className="absolute inset-0 bg-[#EFECE6]">
            <iframe
              title="Gift of Memories Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14732.404543163351!2d88.4214591!3d22.6214591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89e3a35a60001%3A0x6b63d91f24d35e1!2sDum%20Dum%20Cantonment%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0 grayscale-[80%] contrast-[1.1] opacity-80 mix-blend-multiply transition-all duration-700 group-hover:grayscale-[30%] group-hover:opacity-100"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* FIX 2: Glassmorphism Card - Adjusted positioning for mobile clarity */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-10 md:left-10 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl max-w-sm border border-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                <MapPin size={20} strokeWidth={2} />
              </div>
              <h4 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black">
                Gift of Memories
              </h4>
            </div>
            
            <p className="font-inter text-sm md:text-base text-slate-gray mb-6 leading-relaxed">
              Sukanta Pally, Rabindra Nagar, <br />
              Dum Dum Cantonment, <br />
              Kolkata, West Bengal 700065
            </p>
            
            <a
              href="https://maps.google.com/?q=Dum+Dum+Cantonment,+Kolkata"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-charcoal-black text-gold-accent py-3.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all duration-300 shadow-lg hover:-translate-y-1"
            >
              <Navigation size={14} />
              Get Directions
              <ArrowUpRight size={14} className="opacity-50" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapSection;