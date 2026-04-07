import {
  LayoutDashboard,
  Layers,
  Image,
  Users,
  Bell,
  MessageSquare,
  Settings,
  Aperture,
  TvMinimalPlay,
  Bot,
  FileText,
  ShoppingBag,
  Star,
  BookOpen,
  Calendar,
  Video,
  Package,
  LogOut,
  X,
  Tag
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react"; // <-- NEW IMPORTS

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null); // <-- NEW: Reference for the scrollable area

  // <-- NEW: Restore scroll position when the component mounts
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("adminSidebarScroll");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  // <-- NEW: Save scroll position as the user scrolls
  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem("adminSidebarScroll", scrollRef.current.scrollTop);
    }
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_NODE_URL}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin-portal-secret");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuGroups = [
    {
      title: "Analytics",
      items: [{ icon: LayoutDashboard, label: "Overview", path: "/dashboard" }],
    },
    {
      title: "Reservations",
      items: [{ icon: Calendar, label: "Bookings", path: "/admin-enquiries" }],
    },
    {
      title: "Content Studio",
      items: [
        { icon: Layers, label: "Services", path: "/admin-services" },
        { icon: Image, label: "Gallery", path: "/admin-gallery" },
        { icon: ShoppingBag, label: "Shop", path: "/admin-shop" },
        { icon: Package, label: "Collections", path: "/admin-product-collections" },
        { icon: Tag, label: "Offers", path: "/admin-offers" },
        { icon: FileText, label: "Journal", path: "/admin-blogs" },
        { icon: BookOpen, label: "About Page", path: "/admin-about" },
        { icon: Users, label: "Users", path: "/admin-users" },
        { icon: Star, label: "Testimonials", path: "/admin-testimonials" },
        { icon: TvMinimalPlay, label: "Hero Banner", path: "/admin-hero" },
        { icon: Bell, label: "Popups", path: "/admin-popups" },
        { icon: Settings, label: "Home Settings", path: "/admin-homepage-settings" },
        { icon: Image, label: "Page Heroes", path: "/admin-page-heroes" },
        { icon: Layers, label: "Home Gallery", path: "/admin-homepage-gallery" },
        { icon: Video, label: "Page Videos", path: "/admin-page-videos" },
        { icon: MessageSquare, label: "FAQs", path: "/admin-faqs" },
      ],
    },
    {
      title: "Automation",
      items: [
        { icon: Bot, label: "Chatbot", path: "/admin-chatbot" },
        { icon: MessageSquare, label: "WhatsApp CRM", path: "/admin-whatsapp-reminders" },
      ],
    },
    {
      title: "Intelligence",
      items: [{ icon: FileText, label: "Reports", path: "/admin-reports" }],
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`w-[280px] bg-charcoal-black flex-shrink-0 fixed h-full flex flex-col border-r border-white/5 font-inter z-50 transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header Section */}
        <div className="p-8 pb-6 flex justify-between items-center sticky top-0 bg-charcoal-black/90 backdrop-blur-xl z-10 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-accent/10 rounded-lg">
                <Aperture className="text-gold-accent" size={22} strokeWidth={2} />
              </div>
              <h1 className="font-playfair text-xl text-warm-ivory font-bold tracking-tight">
                GOM <span className="text-gold-accent text-xs font-inter font-black align-top ml-1">ADMIN</span>
              </h1>
            </div>
            <p className="text-[9px] font-black text-slate-gray/60 uppercase tracking-[0.3em] mt-1 pl-1">
              Editorial Studio
            </p>
          </div>
          
          <button onClick={onClose} className="md:hidden text-slate-gray hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation - ADDED REF AND ONSCROLL HERE */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 py-8 px-5 space-y-10 overflow-y-auto no-scrollbar"
        >
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="text-gold-accent/80 text-[9px] font-black uppercase tracking-[0.4em] px-4">
                {group.title}
              </h3>

              <div className="space-y-1.5">
                {group.items.map((item, itemIndex) => {
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      onClick={(e) => {
                        if (active) e.preventDefault();
                        if (window.innerWidth < 768) onClose?.();
                      }}
                      className="block relative outline-none"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all duration-500 relative overflow-hidden ${
                          active
                            ? "text-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/20"
                            : "text-warm-ivory/80 hover:text-warm-ivory"
                        }`}
                      >
                        {!active && (
                          <div className="absolute inset-0 bg-gold-accent/0 group-hover:bg-gold-accent/5 transition-colors duration-500" />
                        )}
                        
                        <item.icon
                          size={18}
                          strokeWidth={active ? 2.5 : 1.5}
                          className={`relative z-10 transition-transform duration-500 group-hover:scale-110 ${
                            active ? "text-gold-accent" : "text-slate-gray/80 group-hover:text-gold-accent"
                          }`}
                        />
                        
                        <span className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                        {item.label}
                      </span>

                        {active && (
                          <motion.div
                            layoutId="glow-pill"
                            className="absolute right-4 w-1.5 h-1.5 rounded-full bg-gold-accent shadow-[0_0_12px_#C9A24D]"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout */}
        <div className="p-6 bg-charcoal-black border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-slate-gray hover:bg-red-500/10 hover:text-red-400 group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-500/10 transition-colors">
              <LogOut size={16} strokeWidth={2} />
            </div>
            Secure Logout
          </button>
        </div>
      </aside>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;