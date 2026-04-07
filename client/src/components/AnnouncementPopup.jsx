"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import axios from "axios";

const WHATSAPP_NUMBER = "918335934679";

const AnnouncementPopup = () => {
  const [popupData, setPopupData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/pop/popup`
        );
        const data = response.data;

        if (data && data._id) {
          // Anti-spam check (Commented out for easy testing)
          // const seenPopup = sessionStorage.getItem(`popup_seen_${data._id}`);
          // if (seenPopup) return; 

          if (!data.image && !data.message) {
            data.message = "Welcome! This is a placeholder for your announcement. Please update it in the Admin Panel.";
          }

          setPopupData(data);
          
          setTimeout(() => {
            setIsVisible(true);
          }, data.delay || 3000);
        }
      } catch (error) {
        console.error("Failed to fetch popup:", error);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Anti-spam save (Commented out for easy testing)
    // if (popupData?._id) {
    //   sessionStorage.setItem(`popup_seen_${popupData._id}`, "true");
    // }
  };

  return (
    <AnimatePresence>
      {isVisible && popupData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-charcoal-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[600px] overflow-hidden rounded-2xl shadow-2xl bg-charcoal-black"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all duration-300 z-50 border border-white/20"
            >
              <X size={20} />
            </button>

            {popupData.link ? (
              <a href={popupData.link} target="_blank" rel="noopener noreferrer" className="block group relative cursor-pointer">
                <PopupContent data={popupData} />
              </a>
            ) : (
              <div className="relative">
                <PopupContent data={popupData} />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PopupContent = ({ data }) => {
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent("Hi! I saw your announcement and would like to know more about your services.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <>
      {data.image ? (
        <img src={data.image} alt="Announcement" className="w-full h-auto max-h-[70vh] object-cover object-top" />
      ) : (
        <div className="w-full h-64 bg-warm-ivory flex items-center justify-center">
          <p className="text-gray-400 font-inter text-sm tracking-widest uppercase">No Image</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-6 px-6 md:px-8">
        {data.message && (
          <p className="text-white font-playfair text-xl md:text-3xl font-medium leading-tight tracking-tight drop-shadow-lg">
            {data.message}
          </p>
        )}

        <div className="mt-4 md:mt-6 flex items-center gap-4">
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white p-3 md:p-3.5 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
          >
            <IconBrandWhatsapp size={24} />
          </button>

          {data.link && (
            <div className="flex items-center gap-2 text-gold-accent text-xs md:text-sm font-bold uppercase tracking-widest transition-opacity duration-300 drop-shadow-md">
              <span>Learn More</span>
              <ExternalLink size={14} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnnouncementPopup;