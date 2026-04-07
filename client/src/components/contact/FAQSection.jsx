import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import axios from "axios";

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/faqs`
        );
        setFaqs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
        setFaqs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // FIX 3: Graceful loading state
  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center bg-warm-ivory/20">
        <Loader2 className="w-8 h-8 text-gold-accent animate-spin" />
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-warm-ivory/20">
      <div className="container mx-auto px-6 max-w-3xl">
        
        <div className="text-center mb-16">
          <span className="text-gold-accent font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 block">
            Clarity & Assurance
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-black mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            
            return (
              <motion.div
                key={faq._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                // FIX 2: Dynamic luxury styling based on active state
                className={`rounded-2xl transition-all duration-500 border ${
                  isActive 
                    ? "bg-white border-gold-accent/30 shadow-xl shadow-gold-accent/5" 
                    : "bg-transparent border-charcoal-black/10 hover:border-gold-accent/40 hover:bg-white/40"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 md:py-6 flex items-center justify-between focus:outline-none text-left group"
                >
                  <span className={`font-playfair text-lg md:text-xl font-bold transition-colors duration-300 ${
                    isActive ? "text-gold-accent" : "text-charcoal-black group-hover:text-gold-accent"
                  }`}>
                    {faq.question}
                  </span>
                  
                  {/* FIX 1: Rotating Plus Icon */}
                  <motion.div
                    animate={{ rotate: isActive ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: "backOut" }}
                    className={`flex-shrink-0 ml-4 rounded-full p-2 transition-colors duration-300 ${
                      isActive 
                        ? "bg-gold-accent text-charcoal-black" 
                        : "bg-charcoal-black/5 text-charcoal-black group-hover:bg-gold-accent/20"
                    }`}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 md:pb-8 pt-0 text-slate-gray text-sm md:text-base font-inter leading-relaxed pr-12">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;