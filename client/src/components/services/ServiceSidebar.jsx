import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Added for premium feel
import axios from "axios";

const ServiceSidebar = ({ currentServiceId, packageId, packageTitle }) => {
  const [relatedServices, setRelatedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedServices = async () => {
      if (!packageId) {
        setIsLoading(false);
        return;
      }
      try {
        // OPTIMIZATION: If your backend supports it, use: /api/services/package/${packageId}
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/services/services`
        );
        const allServices = response.data || [];
        
        const filtered = allServices.filter((s) => {
          const svcPkgId = typeof s.package === "string" ? s.package : s.package?._id;
          return svcPkgId === packageId;
        });
        setRelatedServices(filtered);
      } catch (error) {
        console.error("Error fetching related services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelatedServices();
  }, [packageId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 h-fit sticky top-24 border border-charcoal-black/5 shadow-xl shadow-black/5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
            <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
            <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedServices.length === 0) return null;

  return (
    // FIX 1: Added 'hidden lg:block' to prevent it from breaking mobile layouts
    <aside className="hidden lg:block w-full sticky top-28 h-fit z-10">
      <div className="bg-white rounded-2xl p-6 border border-charcoal-black/5 shadow-xl shadow-black/5 overflow-hidden">
        <h3 className="font-playfair text-xl text-charcoal-black mb-6 font-bold leading-tight">
          {packageTitle ? `${packageTitle}` : "Collection"}
          <span className="block text-[10px] uppercase tracking-[0.2em] text-gold-accent mt-1">Included Services</span>
        </h3>

        <ul className="space-y-1.5">
          {relatedServices.map((service, index) => {
            const isActive = service._id === currentServiceId;
            return (
              <motion.li 
                key={service._id}
                // FIX 3: Staggered entrance for a premium feel
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/services/${service._id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 group ${
                    isActive
                      ? "bg-charcoal-black text-warm-ivory shadow-lg"
                      : "text-slate-gray hover:bg-gold-accent/5 hover:text-charcoal-black"
                  }`}
                >
                  {/* Icon/Logo Logic */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500 ${
                    isActive ? "bg-gold-accent/20" : "bg-warm-ivory border border-charcoal-black/5 group-hover:border-gold-accent/20"
                  }`}>
                    {service.logo ? (
                      <img src={service.logo} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className={`text-xs font-bold ${isActive ? "text-gold-accent" : "text-charcoal-black/30"}`}>
                        {service.title.charAt(0)}
                      </span>
                    )}
                  </div>

                  <span className="font-inter text-sm font-medium flex-1 truncate">
                    {service.title}
                  </span>

                  <ChevronRight
                    size={14}
                    className={`transition-all duration-500 ${
                      isActive 
                        ? "opacity-100 translate-x-0 text-gold-accent" 
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Action CTA */}
        <div className="mt-8 pt-6 border-t border-charcoal-black/5">
          <Link
            to="/contact"
            className="group flex items-center justify-between w-full p-4 bg-gradient-to-br from-charcoal-black to-[#222] rounded-xl text-white shadow-lg hover:shadow-gold-accent/10 transition-all duration-500"
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-gold-accent font-bold mb-0.5">Need more?</p>
              <p className="text-xs font-medium text-warm-ivory/80">Custom Quote</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold-accent transition-colors">
              <ArrowRight size={16} className="text-white" />
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ServiceSidebar;