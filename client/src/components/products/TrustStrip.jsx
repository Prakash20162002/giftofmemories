import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, Award } from "lucide-react";

const TrustStrip = () => {
  const features = [
    {
      icon: <Award className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />,
      text: "Premium Quality Materials",
    },
    {
      icon: <Truck className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />,
      text: "Fast & Secure Shipping",
    },
    {
      icon: <CreditCard className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />,
      text: "Secure Payments",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />,
      text: "Loved by Professionals",
    },
  ];

  return (
    <section className="bg-warm-ivory border-y border-charcoal-black/5">
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center gap-4 group cursor-default"
            >
              {/* Icon Container */}
              <div className="bg-white p-4 md:p-6 rounded-2xl text-gold-accent shadow-sm border border-charcoal-black/5 group-hover:bg-gold-accent group-hover:text-white group-hover:shadow-xl group-hover:shadow-gold-accent/20 transition-all duration-500 transform group-hover:-translate-y-1">
                {feature.icon}
              </div>

              {/* Text - Refined Typography */}
              <span className="font-playfair text-[11px] md:text-sm font-bold text-charcoal-black uppercase tracking-widest leading-relaxed px-2">
                {feature.text}
              </span>
              
              {/* Subtle Decorative Line */}
              <div className="w-0 h-[1px] bg-gold-accent group-hover:w-8 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;