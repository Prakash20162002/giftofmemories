import { Instagram, Facebook, Mail, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    // CRITICAL FIX: Changed py-16 to pt-16 pb-32 md:py-16. 
    // The pb-32 on mobile gives the floating dock space to sit without covering the links!
    <footer className="bg-gold-accent text-charcoal-black pt-10 pb-24 md:py-10 border-t border-charcoal-black/10 relative z-10">
      <div className="container mx-auto px-6">
        
        {/* Adjusted gap and bottom margin to be more compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-6 md:mb-8">
          
          {/* Brand */}
          <div className="space-y-2 md:space-y-3">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold tracking-tighter">
              Gift of Memories<span className="text-charcoal-black">.</span>
            </h2>
            <h3 className="font-inter text-charcoal-black text-xs font-bold uppercase tracking-wider">
              Best Wedding Photographer in Kolkata for Bengali Weddings
            </h3>
            <p className="font-inter text-charcoal-black/80 text-xs md:text-sm leading-relaxed max-w-sm">
              Award-worthy wedding photography and cinematic films capturing authentic Bengali rituals, emotions, and luxury moments across Kolkata and beyond.
            </p>

            {/* Direct Contact Links */}
            <div className="pt-1.5 flex flex-col gap-2 font-inter text-xs md:text-sm font-bold">
              <a href="tel:+918335934679" className="flex items-center gap-2.5 text-charcoal-black hover:text-white transition-colors cursor-pointer w-fit">
                <Phone size={16} />
                +91 83359 34679
              </a>
              <a href="https://wa.me/918335934679" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-charcoal-black hover:text-white transition-colors cursor-pointer w-fit">
                <MessageCircle size={16} />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-inter text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3 opacity-80">
                Explore
              </h4>
              <ul className="space-y-1.5 md:space-y-2 font-inter text-xs md:text-sm font-semibold text-charcoal-black/70">
                <li>
                  <Link to="/" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-inter text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3 opacity-80">
                Store
              </h4>
              <ul className="space-y-1.5 md:space-y-2 font-inter text-xs md:text-sm font-semibold text-charcoal-black/70">
                <li>
                  <Link to="/shop" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    Samogri
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    Book a Session
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-warm-ivory transition-colors cursor-pointer">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-inter text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3 opacity-80">
              Follow Us
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/gift_of_memories_wedding"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-black/70 hover:text-white transition-colors cursor-pointer"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/thegiftofmemoriesofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-black/70 hover:text-white transition-colors cursor-pointer"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:thegiftofmemories.clicks@gmail.com"
                className="text-charcoal-black/70 hover:text-white transition-colors cursor-pointer"
              >
                <Mail size={20} />
              </a>
            </div>

            <div className="mt-4">
               <h4 className="font-inter text-xs md:text-sm font-bold uppercase tracking-widest mb-1 opacity-80">
                Email Us
               </h4>
               <a href="mailto:thegiftofmemories.clicks@gmail.com" className="font-inter text-xs md:text-sm font-semibold text-charcoal-black/80 hover:text-white transition-colors cursor-pointer">
                 thegiftofmemories.clicks@gmail.com
               </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Section */}
        <div className="pt-4 md:pt-5 border-t border-charcoal-black/10 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-2 md:space-y-0 text-xs font-inter font-bold text-charcoal-black/60">
          <p>&copy; {new Date().getFullYear()} Gift of Memories Photography. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link
              to="/privacy"
              className="hover:text-charcoal-black transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-charcoal-black transition-colors cursor-pointer"
            >
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;