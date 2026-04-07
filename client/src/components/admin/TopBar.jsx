import {
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  Menu,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// FIX 1: Added onMenuClick prop to trigger the mobile sidebar
const TopBar = ({ onMenuClick }) => {
  const [admin, setAdmin] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_NODE_URL}/api/admin/verify`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data?.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        // Silent catch for auth flow
      }
    };
    fetchAdmin();
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_NODE_URL}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin-portal-secret");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // FIX 2: Dynamic Page Title Generator
  const getPageTitle = () => {
    const path = location.pathname.split("/")[1] || "";
    if (!path || path === "dashboard") return "Dashboard Overview";
    
    // Convert "admin-gallery" to "Gallery Management"
    const formatted = path.replace("admin-", "").replace("-", " ");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1) + " Management";
  };

  // Extract initial for avatar
  const initial = admin?.name ? admin.name.charAt(0).toUpperCase() : null;

  return (
    <header className="h-20 bg-warm-ivory/90 backdrop-blur-md border-b border-charcoal-black/5 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all">
      
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-charcoal-black hover:bg-charcoal-black/5 rounded-lg transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div>
          <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block mb-0.5">
            Gift of Memories Workspace
          </span>
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black capitalize">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu((s) => !s)}
          className="flex items-center gap-3 cursor-pointer group hover:bg-charcoal-black/5 p-2 pr-3 rounded-2xl transition-all duration-300 border border-transparent hover:border-charcoal-black/5"
          aria-haspopup="menu"
          aria-expanded={showMenu}
        >
          {/* Avatar Area */}
          <div className="w-10 h-10 rounded-full bg-gold-accent flex items-center justify-center text-white shadow-md shadow-gold-accent/20 overflow-hidden font-inter font-bold text-lg">
            {initial ? initial : <User size={18} strokeWidth={2.5} />}
          </div>

          <div className="flex flex-col text-left hidden md:block">
            <span className="text-[10px] font-bold text-slate-gray uppercase tracking-widest leading-none mb-1">
              Admin
            </span>
            <span className="text-sm font-bold text-charcoal-black leading-none group-hover:text-gold-accent transition-colors">
              {admin?.name || "System User"}
            </span>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={`text-slate-gray transition-transform duration-300 ${
              showMenu ? "rotate-180 text-gold-accent" : "group-hover:text-gold-accent"
            }`}
          />
        </button>

        {/* FIX 3: Framer Motion Dropdown */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-64 bg-white border border-charcoal-black/5 rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right"
            >
              <div className="p-4 border-b border-charcoal-black/5 bg-warm-ivory/30">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-1">
                  Signed in as
                </div>
                <div className="font-bold text-sm text-charcoal-black truncate">
                  {admin?.email || admin?.name}
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/admin-settings");
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-warm-ivory/50 flex items-center gap-3 transition-colors text-charcoal-black group/btn"
                >
                  <SettingsIcon size={16} className="text-slate-gray group-hover/btn:text-gold-accent transition-colors" />
                  <span className="text-sm font-bold">Account Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 mt-1 rounded-xl hover:bg-red-50 flex items-center gap-3 transition-colors text-red-500 group/btn"
                >
                  <LogOut size={16} className="text-red-400 group-hover/btn:text-red-600 transition-colors" />
                  <span className="text-sm font-bold">Secure Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default TopBar;