import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { ChevronDown, Loader2, Send } from "lucide-react";

const ContactForm = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/services/services`
        );
        setServices(response.data);
        if (response.data.length > 0) {
          setForm((prev) => ({ ...prev, eventType: response.data[0].title }));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "eventDate") setError("");
  };

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.eventDate);

    if (selectedDate < todayDate) {
      setError("Event date cannot be in the past.");
      toast.error("Event date cannot be in the past.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/enquiry/post-enquiry`,
        {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          eventType: form.eventType,
          eventDate: form.eventDate,
          message: form.message,
          source: "website",
          status: "pending",
        }
      );
      
      toast.success("Enquiry received! We will contact you soon.");
      
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        eventType: services.length > 0 ? services[0].title : "",
        eventDate: "",
        message: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      // FIX: Fluid padding (px-5 py-10 on mobile, p-12 on desktop)
      className="bg-white px-5 py-10 md:p-12 rounded-[2rem] shadow-2xl border border-charcoal-black/5 relative overflow-hidden"
    >
      {/* Decorative Blur - Scaled down for mobile */}
      <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-gold-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Header Section: Centered on mobile for better balance */}
        <div className="text-center md:text-left mb-8 md:mb-10">
          <span className="text-gold-accent font-bold text-[9px] md:text-xs tracking-[0.3em] uppercase mb-2 block">
            Get In Touch
          </span>
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-black mb-3">
            Send us a <span className="italic text-gold-accent">Message</span>
          </h2>
          <p className="font-inter text-slate-gray text-xs md:text-base max-w-md mx-auto md:mx-0 leading-relaxed">
            We'd love to hear about your vision. Fill out the form and our team will be in touch shortly.
          </p>
        </div>

        <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
          
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Jane"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black placeholder:text-slate-gray/30"
                required
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black placeholder:text-slate-gray/30"
                required
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black placeholder:text-slate-gray/30"
                required
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black placeholder:text-slate-gray/30"
                required
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                Event Type
              </label>
              <div className="relative group">
                <select
                  name="eventType"
                  value={form.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black appearance-none cursor-pointer pr-10"
                  required
                >
                  <option value="" disabled>Select event...</option>
                  {services.map((service) => (
                    <option key={service._id} value={service.title}>{service.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray group-focus-within:text-gold-accent transition-colors pointer-events-none" size={16} />
              </div>
            </div>
            
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                min={today}
                className={`w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black ${
                  error && error.includes("date") ? "border-red-500" : "border-charcoal-black/10"
                }`}
                required
              />
            </div>
          </div>

          {/* Message Area */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="font-inter text-[10px] md:text-[11px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
              Enquiry
            </label>
            <textarea
              rows="3"
              name="message"
              placeholder="Tell us about your plans..."
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm md:text-base text-charcoal-black placeholder:text-slate-gray/30 resize-none"
              required
            ></textarea>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-inter text-[10px] md:text-xs bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {error}
            </motion.div>
          )}

          {/* Luxury Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-charcoal-black text-gold-accent font-inter text-[11px] md:text-sm uppercase tracking-[0.25em] font-bold rounded-xl shadow-xl transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gold-accent hover:text-charcoal-black hover:shadow-gold-accent/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Confirm Enquiry
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ContactForm;