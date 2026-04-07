import { Award, Camera, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";

const TrustStrip = () => {
  const stats = [
    // Slightly thinned out the stroke width on the icons for a more elegant, high-end feel
    { icon: <Camera size={28} strokeWidth={1.5} />, label: "Years Experience", value: "10+" },
    { icon: <Heart size={28} strokeWidth={1.5} />, label: "Happy Couples", value: "500+" },
    { icon: <Award size={28} strokeWidth={1.5} />, label: "Awards Won", value: "15" },
    { icon: <Users size={28} strokeWidth={1.5} />, label: "Events Covered", value: "1200+" },
  ];

  return (
    // FIX 1: Scaled down vertical padding on mobile (py-10) and swapped the border color to match the theme
    <div className="bg-gold-accent py-10 md:py-16 border-b border-charcoal-black/10">
      <div className="container mx-auto px-4 md:px-6">
        {/* Slightly tighter gap on mobile so the elements feel connected */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              // FIX 2: Added the -50px margin trick we used earlier to ensure it triggers perfectly!
              viewport={{ once: true, margin: "-50px" }} 
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-1 md:space-y-2 group cursor-default"
            >
              {/* FIX 3: Swapped slate-gray for charcoal-black/80 to prevent color clashing on gold */}
              <div className="text-charcoal-black/80 mb-1 md:mb-2 transition-transform duration-300 group-hover:scale-110">
                {stat.icon}
              </div>
              
              {/* Scaled the numbers up on desktop for massive impact, kept them reasonable on mobile */}
              <h3 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black drop-shadow-sm">
                {stat.value}
              </h3>
              
              {/* Scaled the text down slightly on mobile to prevent ugly line breaks */}
              <p className="font-inter text-[10px] md:text-xs lg:text-sm uppercase tracking-widest text-charcoal-black/70 font-semibold px-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;