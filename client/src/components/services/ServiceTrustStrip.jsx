import { Camera, Clock, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ServiceTrustStrip = () => {
  const items = [
    { icon: <Camera size={26} strokeWidth={1.5} />, label: "Pro Equipment" },
    { icon: <Clock size={26} strokeWidth={1.5} />, label: "On-Time Delivery" },
    { icon: <Users size={26} strokeWidth={1.5} />, label: "Expert Team" },
    { icon: <ShieldCheck size={26} strokeWidth={1.5} />, label: "Transparent Pricing" },
  ];

  return (
    // FIX 2: Scaled mobile padding (py-10) vs desktop (py-20)
    <div className="bg-warm-ivory py-10 md:py-20 border-t border-charcoal-black/5">
      <div className="container mx-auto px-6">
        {/* FIX 3: Added role="list" for better accessibility */}
        <div 
          role="list"
          className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              role="listitem"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              // FIX 2 (Cont.): Triggering the animation slightly late for better visibility
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="flex flex-col items-center text-center group cursor-default"
            >
              {/* Refined Icon Container */}
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-gold-accent mb-4 shadow-sm border border-charcoal-black/5 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md">
                {item.icon}
              </div>
              
              <span className="font-inter text-[10px] md:text-xs font-bold text-charcoal-black uppercase tracking-[0.2em] leading-relaxed px-2">
                {item.label}
              </span>
              
              {/* Subtle Decorative Underline */}
              <div className="h-[1px] w-0 bg-gold-accent/40 mt-2 transition-all duration-500 group-hover:w-8" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTrustStrip;