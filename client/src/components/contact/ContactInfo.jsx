import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-10"
    >
      <div>
        <h2 className="font-playfair text-3xl font-bold text-charcoal-black mb-8">
          Contact Information
        </h2>
        
        <div className="space-y-6">
          {/* Interactive Address Block */}
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Sukanta+pally+Rabindra+Nagar,+Dum+Dum+Cantonment,+Kolkata,+West+Bengal,+India+700065"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start space-x-5 p-4 -ml-4 rounded-2xl hover:bg-warm-ivory/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-charcoal-black/5 flex items-center justify-center flex-shrink-0 text-charcoal-black group-hover:bg-gold-accent group-hover:text-white transition-colors duration-300">
              <MapPin size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-playfair text-lg font-bold text-charcoal-black mb-1 flex items-center gap-2">
                Our Studio <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-accent" />
              </h4>
              <p className="font-inter text-slate-gray text-sm leading-relaxed group-hover:text-charcoal-black transition-colors">
                Sukanta pally Rabindra Nagar, Dum Dum Cantonment <br />
                Kolkata, West Bengal, India 700065
              </p>
            </div>
          </a>

          {/* Interactive Phone Block */}
          <a 
            href="tel:+918335934679"
            className="group flex items-start space-x-5 p-4 -ml-4 rounded-2xl hover:bg-warm-ivory/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-charcoal-black/5 flex items-center justify-center flex-shrink-0 text-charcoal-black group-hover:bg-gold-accent group-hover:text-white transition-colors duration-300">
              <Phone size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-playfair text-lg font-bold text-charcoal-black mb-1">
                Phone
              </h4>
              <p className="font-inter text-slate-gray text-sm leading-relaxed group-hover:text-charcoal-black transition-colors">
                +91 83359 34679
              </p>
            </div>
          </a>

          {/* Interactive Email Block */}
          <a 
            href="mailto:thegiftofmemories.clicks@gmail.com"
            className="group flex items-start space-x-5 p-4 -ml-4 rounded-2xl hover:bg-warm-ivory/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-charcoal-black/5 flex items-center justify-center flex-shrink-0 text-charcoal-black group-hover:bg-gold-accent group-hover:text-white transition-colors duration-300">
              <Mail size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-playfair text-lg font-bold text-charcoal-black mb-1">
                Email
              </h4>
              <p className="font-inter text-slate-gray text-sm leading-relaxed group-hover:text-charcoal-black transition-colors break-all">
                thegiftofmemories.clicks@gmail.com
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Refined Studio Hours Card */}
      <div className="bg-gold-accent/10 border border-gold-accent/20 p-8 md:p-10 rounded-[2rem] text-charcoal-black relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <h3 className="font-playfair text-2xl font-bold mb-8 relative z-10">
          Studio Hours
        </h3>
        <div className="space-y-4 font-inter text-sm relative z-10">
          <div className="flex justify-between items-center border-b border-charcoal-black/10 pb-4">
            <span className="text-slate-gray font-medium uppercase tracking-widest text-[11px]">Monday - Friday</span>
            <span className="font-bold">10:00 AM - 7:00 PM</span>
          </div>
          <div className="flex justify-between items-center border-b border-charcoal-black/10 pb-4">
            <span className="text-slate-gray font-medium uppercase tracking-widest text-[11px]">Saturday</span>
            <span className="font-bold">11:00 AM - 5:00 PM</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-gray font-medium uppercase tracking-widest text-[11px]">Sunday</span>
            <span className="font-bold text-gold-accent bg-charcoal-black px-3 py-1 rounded-full text-[10px]">By Appointment</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;