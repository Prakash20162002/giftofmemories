import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Award, 
  ChevronRight,
  Leaf,
  ArrowLeft
} from "lucide-react";

import Loader from "../components/Loader";
import TrustStrip from "../components/products/TrustStrip";
import CTASection from "../components/products/CTASection";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_1000/");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/shop/get-product/${id}`);
        
        let mediaArray = res.data.media || [];
        if (res.data.image && !mediaArray.includes(res.data.image)) {
          mediaArray = [res.data.image, ...mediaArray];
        }

        const optimizedMedia = mediaArray.map((file) => optimizeUrl(file));
        setProduct({ ...res.data, media: optimizedMedia });
        setSelectedMedia(optimizedMedia[0]);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader color="#C9A24D" /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-playfair text-xl">Product not found.</div>;

  const handleWhatsAppOrder = () => {
    const msg = `Hello Gift of Memories! I want to order ${product.name} (₹${product.price}).\nLink: ${window.location.href}`;
    window.open(`https://wa.me/918335934679?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <article className="bg-[#FAF9F6] min-h-screen pb-10 overflow-x-hidden selection:bg-gold-accent selection:text-white">
      <h1 className="sr-only">{product.name} - Luxury Wedding Food & Ritual Collection Kolkata</h1>

      <main className="max-w-[1300px] mx-auto px-6 lg:px-10 pt-28 lg:pt-36">
        
        {/* Breadcrumb / Back button - ADDED CURSOR POINTER */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-gray hover:text-gold-accent mb-8 transition-colors cursor-pointer">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
          
          {/* LEFT: PICTURE AREA */}
          <div className="w-full lg:w-[48%] space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-charcoal-black/5 max-h-[550px]"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedMedia}
                  src={selectedMedia} 
                  alt={product.name} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              <div className="absolute top-4 left-4">
                <span className="bg-charcoal-black/90 backdrop-blur-md text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl">
                  {product.tag || "Exclusive"}
                </span>
              </div>
            </motion.div>

            {/* Thumbnails - ADDED CURSOR POINTER */}
            {product.media?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.media.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMedia(file)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      selectedMedia === file ? "border-gold-accent scale-95 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={file} className="w-full h-full object-cover" alt="Gallery preview" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO AREA */}
          <div className="w-full lg:w-[52%] lg:sticky lg:top-32 h-fit space-y-8">
            <header>
              <div className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-gold-accent mb-3">
                <Link to="/shop" className="hover:underline cursor-pointer">
                  {product.category?.name || "Boutique Collection"}
                </Link>
              </div>
              <h2 className="text-3xl md:text-5xl font-playfair font-bold text-charcoal-black leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-5 mt-6">
                <span className="text-2xl md:text-3xl font-light text-charcoal-black">₹{Number(product.price).toLocaleString("en-IN")}</span>
                {product.oldPrice && (
                  <span className="text-lg text-slate-gray/40 line-through">₹{Number(product.oldPrice).toLocaleString("en-IN")}</span>
                )}
              </div>
            </header>

            {/* Quick Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-charcoal-black/5">
                <Clock className="text-gold-accent" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-black">Freshly Prepared</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-charcoal-black/5">
                <Leaf className="text-gold-accent" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-black">Pure Ingredients</span>
              </div>
            </div>

            {/* Booking / CTA Section - ADDED CURSOR POINTER */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gold-accent hover:text-charcoal-black transition-all duration-500 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
              >
                <ShoppingCart size={18} />
                Order via WhatsApp
              </button>
              <div className="flex justify-between items-center px-2 text-[9px] font-bold uppercase text-slate-gray/60 tracking-widest">
                <span className="flex items-center gap-2"><Truck size={14} /> Nationwide Delivery</span>
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> Quality Assured</span>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal-black/5">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-gray mb-3">The Offering</h4>
                <p className="text-slate-gray text-base leading-relaxed font-light italic">
                  Crafted with tradition and presented with modern elegance, this selection is designed to be the highlight of your ritual. 
                </p>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <section className="mt-20 lg:mt-32 pt-16 border-t border-charcoal-black/10">
          <div className="grid lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl md:text-3xl font-playfair font-bold flex items-center gap-4">
                Product Details
                <div className="h-[1px] w-16 bg-gold-accent/30" />
              </h3>
              <p className="text-slate-gray text-lg leading-loose font-light">
                {product.description} Sourced meticulously from the heart of Kolkata, each item undergoes a strict quality check to ensure visual and sensory perfection. Perfect for weddings, festivals, and heirloom gifting.
              </p>
            </div>

            <div className="bg-charcoal-black p-8 rounded-3xl text-warm-ivory shadow-2xl">
              <h4 className="text-xl font-playfair italic mb-6 text-gold-accent flex items-center gap-2">
                <Award size={20}/> Selection Highlights
              </h4>
              <ul className="space-y-5">
                <li className="flex flex-col border-b border-white/10 pb-3">
                  <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold mb-1">Cuisine / Heritage</span>
                  <span className="text-sm font-light">Traditional Bengali Authenticity</span>
                </li>
                <li className="flex flex-col border-b border-white/10 pb-3">
                  <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold mb-1">Storage Guide</span>
                  <span className="text-sm font-light">Store in a cool environment. Avoid humidity.</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold mb-1">Presentation</span>
                  <span className="text-sm font-light">Hand-packed in luxury eco-friendly hampers.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Policies Section */}
        <section className="mt-20 grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-white rounded-2xl border border-charcoal-black/5 shadow-sm">
            <h4 className="font-playfair text-xl font-bold mb-4">Shipping Info</h4>
            <p className="text-xs text-slate-gray leading-relaxed font-light">
              Items are shipped within 24-48 hours to maintain freshness. We use express logistics to ensure your ritual samogri reaches you in pristine condition. Replacement available for transit damages.
            </p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-charcoal-black/5 shadow-sm">
            <h4 className="font-playfair text-xl font-bold mb-4">Quality Promise</h4>
            <p className="text-xs text-slate-gray leading-relaxed font-light">
              Every product is inspected by our creative team for visual aesthetics and freshness. We guarantee the authenticity of every artisan-crafted item in our collection.
            </p>
          </div>
        </section>
      </main>

      <section className="mt-20 bg-white border-t border-charcoal-black/5">
        <TrustStrip />
        <CTASection />
      </section>
    </article>
  );
};

export default ProductDetailsPage;