import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useClientAuth } from "../../context/ClientAuthContext";

const ServiceBookingForm = ({ serviceTitle, servicePrice, isLoggedIn }) => {
  const { clientUser } = useClientAuth();

  const extractPrice = (priceString) => {
    const match = priceString?.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, "")) : 0;
  };

  const originalPrice = extractPrice(servicePrice);
  const discountedPrice =
    isLoggedIn && originalPrice > 0
      ? Math.round(originalPrice * 0.85)
      : originalPrice;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "", // FIX 2: Started empty to let the placeholder do the work
  });

  // FIX 3: Automatically pre-fill the form for logged-in users
  useEffect(() => {
    if (isLoggedIn && clientUser) {
      setFormData((prev) => ({
        ...prev,
        name: clientUser.name || "",
        email: clientUser.email || "",
      }));
    }
  }, [isLoggedIn, clientUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dateError, setDateError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "date") setDateError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);

    if (selectedDate < today) {
      setDateError("Please select a current or future date.");
      toast.error("Event date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/enquiry/post-enquiry`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventType: serviceTitle,
          eventDate: formData.date,
          // FIX 2 (Cont.): Use a default string if the user left the message empty
          message: formData.message || `Interested in ${serviceTitle}`,
          source: "service-page",
          status: "pending",
        }
      );

      setIsSuccess(true);
      toast.success("Booking inquiry sent successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-emerald-600 text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} strokeWidth={2} />
        </div>
        <h3 className="font-playfair text-2xl text-charcoal-black mb-2">Thank You!</h3>
        <p className="text-gray-600 font-inter mb-6 text-sm">
          We've received your booking inquiry for <strong>{serviceTitle}</strong>.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline"
        >
          Send another inquiry
        </button>
      </motion.div>
    );
  }

  return (
    // FIX 1: Changed 'sticky' to 'lg:sticky' so it doesn't break scrolling on mobile
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border-t-4 border-gold-accent lg:sticky lg:top-24 h-fit">
      <h3 className="font-playfair text-2xl text-charcoal-black mb-1">Book This Service</h3>
      <p className="text-gray-500 text-xs mb-6">
        Check availability and receive a custom quote within 24 hours.
      </p>

      {/* Pricing Display */}
      {servicePrice && originalPrice > 0 && (
        <div className="bg-gold-accent/5 border border-gold-accent/20 rounded-xl p-4 mb-6 shadow-inner">
          <p className="text-[10px] text-slate-gray uppercase tracking-widest mb-2 font-bold">
            {isLoggedIn ? "Your Exclusive Price" : "Package Starts From"}
          </p>
          {isLoggedIn ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 line-through text-base font-medium">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-2xl font-bold text-charcoal-black">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                -15% MEMBER DEAL
              </span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-charcoal-black">
              {servicePrice}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-accent transition-colors" size={18} />
          <input
            type="text"
            name="name"
            placeholder="Your Full Name*"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-warm-ivory/20 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm"
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-accent transition-colors" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-warm-ivory/20 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-accent transition-all font-inter text-sm"
            />
          </div>
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-accent transition-colors" size={18} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone*"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-warm-ivory/20 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-accent transition-all font-inter text-sm"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-accent transition-colors" size={18} />
          <input
            type="date"
            name="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={formData.date}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-warm-ivory/20 border rounded-lg focus:outline-none focus:border-gold-accent transition-all font-inter text-sm text-gray-600 ${
              dateError ? "border-red-500" : "border-gray-200"
            }`}
          />
          {dateError && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{dateError}</p>}
        </div>

        {/* Message */}
        <div className="relative group">
          <MessageSquare className="absolute left-3 top-4 text-gray-400 group-focus-within:text-gold-accent transition-colors" size={18} />
          <textarea
            name="message"
            // FIX 2 (Cont.): Used a placeholder instead of pre-filling the value
            placeholder={`Tell us about your ${serviceTitle} plans...`}
            rows="3"
            className="w-full pl-10 pr-4 py-3 bg-warm-ivory/20 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-accent transition-all font-inter text-sm resize-none"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-charcoal-black text-gold-accent font-inter font-bold uppercase tracking-[0.2em] text-xs py-4 rounded-lg hover:bg-gold-accent hover:text-white transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-gold-accent/30"
        >
          {isSubmitting ? "Processing..." : "Check Availability"}
        </button>
      </form>
    </div>
  );
};

export default ServiceBookingForm;