import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Assuming these link to categories/search

const tags = [
  "Outdoor",
  "Candid",
  "Traditions",
  "Pre-Wedding",
  "Studio",
  "Night Shoots",
  "Destination",
  "Black & White",
  "Drone Shots",
];

const ExplorationTags = ({ activeTag = "" }) => {
  return (
    <section className="py-10 md:py-14 bg-muted-beige border-y border-charcoal-black/5">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Added a subtle label to give the section purpose */}
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-gray mb-6 font-bold">
          Explore by Style
        </p>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {tags.map((tag, index) => {
            const isActive = activeTag === tag;
            
            return (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  // Encodes tag for URL safety (e.g., "Black & White" -> "Black%20%26%20White")
                  to={`/gallery?style=${encodeURIComponent(tag)}`}
                  className={`
                    inline-block px-5 py-2 md:px-7 md:py-2.5 rounded-full 
                    font-inter text-[11px] md:text-sm font-bold uppercase tracking-wider
                    transition-all duration-500 transform
                    ${isActive 
                      ? "bg-charcoal-black text-gold-accent shadow-lg -translate-y-1" 
                      : "bg-warm-ivory text-charcoal-black/70 border border-charcoal-black/5 hover:border-gold-accent hover:text-charcoal-black hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-accent/10"
                    }
                  `}
                >
                  {tag}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExplorationTags;