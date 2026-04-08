import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react"; 
import Loader from "../Loader";

const ProductCategoryGrid = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/shop/get-bestsellers`
        );
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  // FIX 1: Display exactly 6 products on desktop to form a perfect single row
  const visibleProducts = isMobile ? products.slice(0, 4) : products.slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader color="#C9A24D" />
      </div>
    );
  }

  if (!products.length) return null;

  return (
    // FIX 2: Added lg:grid-cols-5 and xl:grid-cols-6 to fit 5-6 cards in a row. Increased max-width to give them breathing room.
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 w-full max-w-[100rem] mx-auto px-4 lg:px-8">
      {visibleProducts.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const isUnavailable = !product.isActive || product.stock === 0;

  const getProductImage = () => {
    if (product.image) return product.image;
    if (product.media && product.media.length > 0) return product.media[0];
    return "/placeholder-product.jpg";
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (!isUnavailable && product._id) {
      navigate(`/shop/product/${product._id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onClick={handleClick}
      className={`group relative flex flex-col h-full bg-white transition-all duration-700 ${
        isUnavailable ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Editorial Media Frame */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F8F6] rounded-sm">
        <img
          src={getProductImage()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Subtle Gold Overlay on Hover */}
        <div className="absolute inset-0 bg-charcoal-black/0 group-hover:bg-charcoal-black/10 transition-colors duration-500" />

        {/* Floating Category Badge */}
        {product.category && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
             <span className="bg-white/90 backdrop-blur-sm text-charcoal-black px-2 py-1 text-[7px] md:text-[8px] xl:text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                {typeof product.category === 'object' ? product.category.name : "Collection"}
             </span>
          </div>
        )}

        {/* New Badge */}
        {product.tag && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gold-accent flex items-center justify-center text-white text-[6px] md:text-[8px] font-black uppercase shadow-md">
                    {product.tag}
                </div>
            </div>
        )}
      </div>

      {/* Editorial Content Info */}
      <div className="pt-3 md:pt-5 pb-2 flex flex-col flex-1 text-left">
        <div className="mb-2 md:mb-3">
            {/* FIX 3: Scaled desktop font down slightly (lg:text-lg xl:text-xl) since cards are now narrower */}
            <h3 className="font-playfair text-sm sm:text-base lg:text-lg xl:text-xl text-charcoal-black mb-1 md:mb-2 group-hover:text-gold-accent transition-colors duration-500 line-clamp-2">
                {product.name}
            </h3>
            <div className="w-0 group-hover:w-full h-[1px] bg-gold-accent/30 transition-all duration-700" />
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] xl:text-[10px] uppercase tracking-widest text-slate-gray/60 font-bold mb-0.5">Price</span>
            <span className="font-inter text-sm lg:text-base xl:text-lg font-light text-charcoal-black">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2 text-charcoal-black font-inter text-[8px] xl:text-[10px] font-black uppercase tracking-widest group-hover:text-gold-accent transition-all">
            <span className="hidden sm:inline">Explore</span> <ArrowRight size={12} className="xl:w-3.5 xl:h-3.5 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCategoryGrid;