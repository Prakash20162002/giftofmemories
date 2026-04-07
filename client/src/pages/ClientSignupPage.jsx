import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const ClientSignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useClientAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    const result = await signup(name, email, password, phone);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Account created successfully!");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  return (
    // min-h-[100dvh] and overflow-y-auto ensures the long form scrolls perfectly on mobile when the keyboard opens
    <div className="min-h-[100dvh] bg-warm-ivory/50 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 font-inter relative overflow-y-auto custom-scrollbar">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-warm-ivory to-transparent -z-10" />

      {/* Navigation Link */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-gray hover:text-gold-accent transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-gold-accent/10 transition-colors border border-charcoal-black/5">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          Return to Studio
        </Link>
      </div>

      {/* my-auto allows the flex container to center it, but push to top if the screen is too small (mobile keyboards) */}
      <div className="w-full max-w-md mx-auto relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-charcoal-black/5"
        >
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-black mb-3">
              Request Access
            </h1>
            <p className="text-slate-gray text-sm md:text-base font-light">
              Join our client list to unlock 15% off premium products.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-charcoal-black/10 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent bg-warm-ivory/30 text-charcoal-black transition-all placeholder:text-slate-gray/50"
                placeholder="e.g. Sarah Jenkins"
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-charcoal-black/10 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent bg-warm-ivory/30 text-charcoal-black transition-all placeholder:text-slate-gray/50"
                placeholder="you@example.com"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-12 rounded-xl border border-charcoal-black/10 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent bg-warm-ivory/30 text-charcoal-black transition-all placeholder:text-slate-gray/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray hover:text-charcoal-black transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black">
                  Phone Number
                </label>
                <span className="text-[9px] text-slate-gray uppercase tracking-widest">Optional</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-charcoal-black/10 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent bg-warm-ivory/30 text-charcoal-black transition-all placeholder:text-slate-gray/50"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-charcoal-black text-gold-accent font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-slate-gray border-t border-charcoal-black/5 pt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gold-accent font-bold hover:text-charcoal-black transition-colors ml-1"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientSignupPage;