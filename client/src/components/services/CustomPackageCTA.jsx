import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Camera, Palette, Star } from "lucide-react";

const floatingTags = [
  { text: "Wedding Films", icon: Camera, delay: 0 },
  { text: "Bespoke Shoots", icon: Star, delay: 0.15 },
  { text: "Cinematic Edits", icon: Palette, delay: 0.3 },
];

const CustomPackageCTA = () => {
  return (
    <section className="relative bg-gold-accent overflow-hidden">
      {/* Animated diagonal gold/dark accent lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-charcoal-black/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-charcoal-black/5 to-transparent" />
        <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-charcoal-black/5 to-transparent" />
      </div>

      {/* Decorative large background number */}
      <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 font-playfair text-[160px] md:text-[240px] leading-none font-black text-charcoal-black/[0.03] select-none pointer-events-none tracking-tighter">
        ?
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        {/* Top border line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-charcoal-black/15 to-transparent mb-12 md:mb-16 origin-left"
        />

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT — Editorial headline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-charcoal-black/40" />
              <span className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-charcoal-black/80">
                Bespoke Offerings
              </span>
            </div>

            <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-charcoal-black font-bold leading-[1.1] tracking-tight mb-6">
              Something{" "}
              <em className="not-italic text-white">
                unique
              </em>{" "}
              in
              <br />
              mind?
            </h2>

            <p className="font-inter text-charcoal-black/70 text-sm leading-loose max-w-sm font-light">
              Every love story is different. Share your vision and we&apos;ll craft a completely bespoke photography and film experience tailored to your day.
            </p>

            {/* Floating tags row */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              {floatingTags.map(({ text, icon: Icon, delay }) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay, duration: 0.5 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-charcoal-black/20 bg-white/10 backdrop-blur-sm"
                >
                  <Icon size={11} className="text-charcoal-black" />
                  <span className="text-[10px] font-bold font-inter text-charcoal-black/80 uppercase tracking-widest">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Stats + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex flex-col gap-8 lg:pl-8 lg:border-l lg:border-charcoal-black/10"
          >
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: "200+", label: "Couples Served" },
                { num: "8+", label: "Years of Art" },
                { num: "100%", label: "Bespoke Plans" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black leading-none mb-1">
                    {num}
                  </p>
                  <p className="font-inter text-[9px] uppercase tracking-widest text-charcoal-black/60 font-bold leading-tight">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Thin divider */}
            <div className="h-[1px] bg-gradient-to-r from-charcoal-black/20 to-transparent" />

            {/* Description blurb */}
            <p className="font-inter text-charcoal-black/70 text-xs leading-relaxed font-light">
              From palace weddings to intimate garden ceremonies — our team travels anywhere, crafts everything from scratch, and delivers memories that outlast a lifetime.
            </p>

            {/* CTA button — full width, editorial bar style */}
            <Link
              to="/contact"
              className="group cursor-pointer flex items-center justify-between w-full px-6 py-4 bg-charcoal-black text-gold-accent font-inter font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_40px_rgba(15,15,15,0.15)] hover:shadow-[0_14px_50px_rgba(15,15,15,0.25)] hover:bg-[#1f1f1f] transition-all duration-400"
            >
              <span>Request Custom Quote</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <ArrowUpRight size={16} className="text-gold-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom border line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-charcoal-black/15 to-transparent mt-12 md:mt-16 origin-right"
        />
      </div>
    </section>
  );
};

export default CustomPackageCTA;