import React from "react";
import { motion } from "framer-motion";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useClientAuth } from "../../context/ClientAuthContext";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "918335934679";

const ProductCard = ({ product, onClick }) => {
  const { isClientLoggedIn } = useClientAuth();
  const navigate = useNavigate();

  const memberPrice = Math.round(product.price * 0.85);
  const displayPrice = isClientLoggedIn ? memberPrice : product.price;

  const handleWhatsAppBuy = (e) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hi! I'm interested in purchasing the Samogri item: *${product.name}* (Price: ₹${displayPrice.toLocaleString(
        "en-IN"
      )}). Could you help me with the order?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCardClick = () => {
    navigate(`/shop/product/${product._id}`);
  };

  const media = product.preview || product.media?.[0];
  const isVideo = media?.match(/\.(mp4|webm|mov)$/i);

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      // Karukarjo Style: No heavy shadows, transparent background, group hover for animations
      className={`group cursor-pointer flex flex-col h-full bg-transparent ${
        !product.isActive ? "opacity-60 grayscale pointer-events-none" : ""
      }`}
    >
      {/* ---------------- 1. EDITORIAL IMAGE FRAME ---------------- */}
      {/* TALL aspect ratio (4:5) with slight rounding for an elegant art-gallery feel */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md md:rounded-lg bg-[#F5F3ED] mb-4">
        
        {isVideo ? (
          <video
            src={media}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={media || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
            loading="lazy"
          />
        )}

        {/* Minimalist Dark Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Minimalist Tags (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.isBestseller && (
            <span className="bg-white/95 backdrop-blur-sm text-charcoal-black px-2.5 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
              Signature
            </span>
          )}
          {product.tag && (
            <span className="bg-gold-accent/95 backdrop-blur-sm text-white px-2.5 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
              {product.tag}
            </span>
          )}
        </div>

        {/* ---------------- SLIDE-UP WHATSAPP BUTTON ---------------- */}
        {/* Instead of a green button outside, it's a luxury slide-up bar inside the image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-30">
          <button
            onClick={handleWhatsAppBuy}
            className="w-full py-3 md:py-3.5 bg-white/95 backdrop-blur-md text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors duration-300 rounded-sm flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg"
            title="Inquire via WhatsApp"
          >
            <IconBrandWhatsapp strokeWidth={2} size={16} />
            Inquire Now
          </button>
        </div>
      </div>

      {/* ---------------- 2. MINIMALIST TYPOGRAPHY ---------------- */}
      <div className="flex flex-col flex-1 px-1">
        {/* Category Line */}
        <span className="text-[9px] md:text-[10px] text-slate-gray/70 font-semibold uppercase tracking-[0.2em] mb-1.5">
          {product.category?.name || "Heritage"}
        </span>

        {/* Product Title (Serif, Elegant) */}
        <h3 className="font-playfair text-base md:text-xl font-semibold text-charcoal-black mb-2 group-hover:text-gold-accent transition-colors duration-300 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Pricing (Clean, Sans-serif) */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-sm md:text-base font-inter font-medium text-charcoal-black">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>

          {(product.oldPrice || isClientLoggedIn) && (
            <span className="text-[10px] md:text-xs font-inter text-slate-gray/50 line-through font-light">
              ₹{Number(isClientLoggedIn ? product.price : product.oldPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;