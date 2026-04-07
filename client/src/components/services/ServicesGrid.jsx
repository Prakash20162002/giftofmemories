import { useMemo } from "react"; // FIX 3: Added useMemo for performance
import { motion, AnimatePresence } from "framer-motion";
import ServiceCard from "./ServiceCard";
import { Link } from "react-router-dom";

const ServicesGrid = ({ activeFilter, services = [] }) => {
  // Utility moved outside or memoized to avoid re-creation
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    return parseInt(priceStr.replace(/[^\d]/g, ""), 10) || 0;
  };

  // FIX 3 (Cont.): memoize the filtering and sorting so it only runs when activeFilter or services changes
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        // 1. Category Filter
        if (
          activeFilter.category !== "All Services" &&
          service.category !== activeFilter.category
        ) return false;

        // 2. Price Filter
        const price = parsePrice(service.price);
        if (
          price < activeFilter.priceRange[0] ||
          price > activeFilter.priceRange[1]
        ) return false;

        // 3. Location Filter
        const sLoc = service.details?.location || "";
        if (activeFilter.location !== "All") {
           if (sLoc !== activeFilter.location && !sLoc.includes(activeFilter.location)) {
             return false;
           }
        }

        // 4. Duration Filter
        // FIX 1: Removed 'return true' to allow other filters to run. 
        // We set a flag and return 'false' only if it DOESN'T match.
        if (activeFilter.duration !== "All") {
          const sDur = service.details?.duration || "";
          const isFullDay = activeFilter.duration === "Full Day" && sDur.includes("Full Day");
          const isProject = activeFilter.duration === "Project Based" && sDur.toLowerCase().includes("project");
          const isHalfDay = activeFilter.duration === "Half Day (4-6 Hours)" && (sDur.includes("4-6 Hours") || sDur.includes("4-8 Hours"));
          const isShort = activeFilter.duration === "Short Session (2-3 Hours)" && sDur.includes("2-3 Hours");
          
          if (!isFullDay && !isProject && !isHalfDay && !isShort && sDur !== activeFilter.duration) {
            return false;
          }
        }

        return true; // Service passed all checks
      })
      .sort((a, b) => {
        if (activeFilter.sortBy === "Price: Low to High") return parsePrice(a.price) - parsePrice(b.price);
        if (activeFilter.sortBy === "Price: High to Low") return parsePrice(b.price) - parsePrice(a.price);
        return 0;
      });
  }, [activeFilter, services]);

  return (
    <section className="py-16 md:py-24 bg-warm-ivory min-h-[60vh]">
      <div className="container mx-auto px-4 md:px-12">
        {/* FIX 2: Added layout to the container and motion to the wrapper */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                layout
                key={service._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
              >
                <Link to={`/services/${service._id}`} className="block h-full">
                  <ServiceCard service={service} />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredServices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-charcoal-black/10 mt-8"
            >
              <h3 className="font-playfair text-2xl md:text-3xl text-charcoal-black font-semibold">
                No matching memories found.
              </h3>
              <p className="font-inter text-slate-gray mt-3 max-w-md mx-auto">
                Try widening your price range or selecting "All Services" to see our full collection.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServicesGrid;