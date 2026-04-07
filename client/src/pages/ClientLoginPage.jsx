import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const ClientLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useClientAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/shop");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-gray flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[14px] shadow-2xl w-full max-w-md border border-muted-beige/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-charcoal-black mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-gray text-sm font-inter">
            Log in to access exclusive member pricing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-gray/20 focus:outline-none focus:border-gold-accent bg-warm-ivory/30"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-gray/20 focus:outline-none focus:border-gold-accent bg-warm-ivory/30"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-charcoal-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-charcoal-black text-gold-accent font-bold rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-gray">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-gold-accent font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientLoginPage;
