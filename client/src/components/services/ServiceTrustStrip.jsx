import { Camera, Clock, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ServiceTrustStrip = () => {
  const items = [
    { icon: <Camera size={22} strokeWidth={1.5} />, label: "Pro Equipment", desc: "Top-tier camera systems & cinematic gear" },
    { icon: <Clock size={22} strokeWidth={1.5} />, label: "On-Time Delivery", desc: "Timely release of beautifully graded visual assets" },
    { icon: <Users size={22} strokeWidth={1.5} />, label: "Expert Team", desc: "Passionate visual directors & wedding storytellers" },
    { icon: <ShieldCheck size={22} strokeWidth={1.5} />, label: "Transparent Pricing", desc: "Honest quotes, upfront custom plans, no hidden fees" },
  ];

  return (
    <div className="bg-[#FAF9F6]/80 py-16 md:py-24 border-t border-charcoal-black/5">
      <div className="container mx-auto px-4 md:px-12">
        <div 
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              role="listitem"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-charcoal-black/5 shadow-sm hover:shadow-md transition-all duration-500 group cursor-default relative overflow-hidden"
            >
              {/* Subtle hover background highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-gold-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Icon Container with elegant double-ring look */}
              <div className="w-16 h-16 rounded-full bg-warm-ivory/30 border border-charcoal-black/5 flex items-center justify-center text-gold-accent mb-5 shadow-inner transition-all duration-500 group-hover:scale-105 group-hover:bg-charcoal-black group-hover:text-gold-accent">
                {item.icon}
              </div>
              
              <h4 className="font-playfair text-base md:text-lg font-bold text-charcoal-black mb-2 tracking-wide">
                {item.label}
              </h4>
              
              <p className="font-inter text-xs text-slate-gray leading-relaxed font-light opacity-90 max-w-[200px]">
                {item.desc}
              </p>
              
              {/* Subtle Decorative Underline */}
              <div className="h-[1.5px] w-0 bg-gold-accent/50 mt-4 transition-all duration-500 group-hover:w-12" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTrustStrip;