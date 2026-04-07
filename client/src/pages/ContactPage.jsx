import { motion } from "framer-motion";
import ContactHero from "../components/contact/ContactHero";
import ContactForm from "../components/contact/ContactForm";
import ContactInfo from "../components/contact/ContactInfo";
import MapSection from "../components/contact/MapSection";
import FAQSection from "../components/contact/FAQSection";

const ContactPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-warm-ivory/30 min-h-[100dvh] font-inter overflow-x-hidden relative"
    >
      {/* ---------------- HERO SECTION ---------------- */}
      <ContactHero />

      {/* ---------------- MAIN CONTACT CARD ---------------- */}
      {/* Negative margin (-mt-16 md:-mt-32) pulls this card up to overlap the Hero section, 
        creating a premium, layered architectural look.
      */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-12 sm:-mt-20 lg:-mt-32 pb-20 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-charcoal-black/5 overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Left Side: Contact Info
            Takes up 40% of the space on desktop. 
            On mobile, it stacks cleanly on top with a distinct background.
          */}
          <div className="w-full lg:w-2/5 bg-warm-ivory/40 p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-charcoal-black/5 relative overflow-hidden">
            {/* Subtle decorative background pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_#C9A24D_1px,_transparent_1px)] bg-[size:24px_24px] mix-blend-multiply pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col justify-center">
              <ContactInfo />
            </div>
          </div>

          {/* Right Side: Contact Form
            Takes up 60% of the space on desktop.
          */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 lg:p-16 bg-white">
            <ContactForm />
          </div>
        </motion.div>
      </section>

      {/* ---------------- MAP SECTION ---------------- */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
      >
        {/* Subtle divider */}
        <div className="max-w-7xl mx-auto px-6 mb-16 md:mb-24">
          <hr className="border-t border-charcoal-black/10" />
        </div>
        
        <MapSection />
      </motion.section>

      {/* ---------------- FAQ SECTION ---------------- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="pt-16 md:pt-24 pb-24 md:pb-32"
      >
        <FAQSection />
      </motion.section>
      
    </motion.div>
  );
};

export default ContactPage;