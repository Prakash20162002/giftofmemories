import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // FIX 1: Import Link for routing
import { useClientAuth } from "../../context/ClientAuthContext";

const ServiceCard = ({ service }) => {
  const { isClientLoggedIn } = useClientAuth();

  // Extract numeric price from string (e.g., "₹25,000+" -> 25000)
  const extractPrice = (priceString) => {
    const match = priceString?.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, "")) : 0;
  };

  const originalPrice = extractPrice(service.price);
  const discountedPrice = Math.round(originalPrice * 0.85);
  
  // Hypothetical URL slug
  const serviceUrl = `/services/${service._id || service.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      // FIX 2: Wrapped the entire card logic in a transition-rich hover container
      className="group relative bg-white rounded-2xl overflow-hidden shadow-[0px_8px_24px_rgba(0,0,0,0.04)] border border-charcoal-black/5 transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
    >
      {/* Image Container - Now clickable! */}
      <Link to={serviceUrl} className="block h-[250px] overflow-hidden relative">
        <img
          src={
            service.images && service.images.length > 0
              ? service.images[0]
              : service.image
          }
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* FIX 3: Swapped Red for a more Premium Gold/Dark badge */}
        {isClientLoggedIn && originalPrice > 0 && (
          <div className="absolute top-4 right-4 bg-gold-accent text-charcoal-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest">
            Member Rate
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <Link to={serviceUrl}>
          <h3 className="font-playfair text-2xl font-bold text-charcoal-black mb-3 group-hover:text-gold-accent transition-colors duration-300">
            {service.title}
          </h3>
        </Link>
        
        <p className="font-inter text-slate-gray mb-6 text-sm leading-relaxed line-clamp-3">
          {service.shortDescription || service.description}
        </p>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-charcoal-black/5">
          <div>
            <p className="font-inter text-[10px] text-slate-gray/60 uppercase tracking-widest mb-1 font-bold">
              {isClientLoggedIn ? "Exclusive Offer" : "Investment"}
            </p>
            {isClientLoggedIn && originalPrice > 0 ? (
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs text-slate-400 line-through mb-0.5 font-inter">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xl font-bold text-charcoal-black font-inter">
                  ₹{discountedPrice.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <p className="font-inter text-lg font-bold text-charcoal-black">
                {service.price}
              </p>
            )}
          </div>

          {/* FIX 1 (Cont.): Swapped <button> for <Link> */}
          <Link 
            to={serviceUrl}
            className="px-5 py-2.5 rounded-full border border-gold-accent text-gold-accent font-inter text-xs uppercase tracking-widest font-bold transition-all duration-500 hover:bg-gold-accent hover:text-charcoal-black hover:shadow-lg hover:shadow-gold-accent/20"
          >
            Explore
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;