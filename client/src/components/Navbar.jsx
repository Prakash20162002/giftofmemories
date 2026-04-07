import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo-negative-gom.png";
import { useClientAuth } from "../context/ClientAuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isClientLoggedIn, logout } = useClientAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  // ADDED: Smooth scroll to top function for the logo
  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Shop", path: "/shop" },
    { name: "Gallery", path: "/gallery" },
    { name: "Journal", path: "/blog" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled || isMenuOpen ? "bg-charcoal-black/95 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-6"
    }`}>
      <div className="container mx-auto px-4 md:px-6 xl:px-12 flex items-center justify-between">
        
        {/* ADDED: onClick={handleLogoClick} to the logo link */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 z-50 shrink-0 cursor-pointer">
          <img src={logo} alt="Gift of Memories" className="h-10 md:h-12 w-auto" />
          <span className="font-playfair text-xl font-bold text-warm-ivory hidden xl:inline">
            Gift of Memories<span className="text-gold-accent">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-5 xl:space-x-10">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-[10px] xl:text-[11px] font-inter uppercase tracking-[0.2em] xl:tracking-[0.25em] font-bold text-warm-ivory/80 hover:text-gold-accent transition-colors whitespace-nowrap">
              {link.name}
            </Link>
          ))}
          
          {isClientLoggedIn ? (
            <button onClick={logout} className="text-[10px] xl:text-[11px] font-inter uppercase tracking-[0.2em] xl:tracking-[0.25em] font-bold text-gold-accent whitespace-nowrap cursor-pointer">Logout</button>
          ) : (
            <Link to="/login" className="text-[10px] xl:text-[11px] font-inter uppercase tracking-[0.2em] xl:tracking-[0.25em] font-bold text-warm-ivory/80 whitespace-nowrap">Login</Link>
          )}
          
          <Link to="/contact" className="px-6 xl:px-8 py-2.5 xl:py-3 bg-gold-accent text-charcoal-black text-[9px] xl:text-[10px] font-inter font-black uppercase tracking-widest rounded-full hover:bg-white transition-all whitespace-nowrap shrink-0">
            Book Now
          </Link>
        </div>

        {/* Hamburger Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-warm-ivory z-50 p-2 shrink-0 cursor-pointer">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "100vh" }} 
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-0 left-0 w-full bg-charcoal-black z-40 flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-2xl font-playfair font-bold text-warm-ivory hover:text-gold-accent">
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" className="mt-4 px-10 py-4 bg-gold-accent text-charcoal-black font-bold uppercase tracking-widest rounded-full">
                Book a Session
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;