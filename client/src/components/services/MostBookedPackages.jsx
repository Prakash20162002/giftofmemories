import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const MostBookedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMostBookedPackages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/services/most-booked-packages`
        );
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching most booked packages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMostBookedPackages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!packages || !packages.length) {
    return null; 
  }

  return (
    // Scaled mobile padding slightly
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          // Added margin safety trigger we've used in previous components
          viewport={{ once: true, margin: "-50px" }} 
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30 mb-4 shadow-lg shadow-amber-500/5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs md:text-sm font-medium tracking-wide uppercase">
              Client Favorites
            </span>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-sm">
            Most Booked Packages
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
            Discover our most popular photography packages, loved and chosen by
            hundreds of happy couples.
          </p>
        </motion.div>

        {/* Packages Grid */}
        {/* FIX 1: Added 'items-start' so neighboring cards don't stretch awkwardly when one expands! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg._id} category={pkg} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PackageCard = ({ category, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Determine if there are valid services to show
  const hasServices = category.services && category.services.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all duration-300 group shadow-xl"
    >
      {/* Popular Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg">
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">
            Popular
          </span>
        </div>
      </div>

      {/* Package Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
            <span className="text-amber-500 text-5xl font-playfair font-bold">
              {/* FIX 2: Optional chaining guarantees no app crash if title is undefined */}
              {category.title?.charAt(0) || "P"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <h3 className="font-playfair text-xl md:text-2xl text-white font-bold mb-1 drop-shadow-md">
            {category.title}
          </h3>
          {category.startingPrice && (
            <p className="text-amber-400 font-semibold text-sm drop-shadow-md">
              Starting from ₹{category.startingPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Description & Toggle */}
      <div className="p-5 md:p-6">
        {category.description && (
          <p className="text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}

        {/* FIX 3: Conditionally render the button style and disabled state based on if services exist */}
        <button
          onClick={() => hasServices && setIsOpen(!isOpen)}
          disabled={!hasServices}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
            hasServices 
              ? "bg-white/5 hover:bg-white/10 text-white cursor-pointer" 
              : "bg-white/5 opacity-50 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span className="text-xs md:text-sm font-medium">
            View Services ({category.services?.length || 0})
          </span>
          {hasServices && (
            isOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 transition-colors" />
            )
          )}
        </button>

        {/* Expanded Services */}
        <AnimatePresence>
          {isOpen && hasServices && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-2">
                {category.services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => navigate(`/services/${service._id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all duration-200 text-left group/service"
                  >
                    {service.logo ? (
                      <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white/10 p-1">
                        <img
                          src={service.logo}
                          alt={service.title}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover/service:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <span className="text-amber-400 text-lg font-playfair font-bold">
                          {service.title?.charAt(0) || "S"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-medium group-hover/service:text-amber-400 transition-colors block truncate">
                        {service.title}
                      </span>
                      {service.price && (
                        <span className="text-gray-400 text-xs">
                          ₹{service.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MostBookedPackages;