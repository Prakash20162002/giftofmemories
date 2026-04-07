import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck, Aperture } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Fixed: Added AnimatePresence

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 800);
      } else {
        setError(
          data.Message || data.message || "Invalid credentials. Access denied."
        );
        if (response.status === 429) {
          setError(
            data.message || "Too many attempts. Please try again later."
          );
        }
      }
    } catch (err) {
      console.error("Login failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-inter overflow-hidden bg-warm-ivory">
      
      {/* LEFT PANEL - BRANDING */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 bg-charcoal-black relative flex flex-col justify-center items-center p-12 text-center overflow-hidden min-h-[40vh] md:min-h-screen"
      >
        {/* Subtle decorative background grid */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#C9A24D_1px,_transparent_1px)] bg-[size:24px_24px]"></div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Aperture
            size={48}
            className="text-gold-accent mb-6"
            strokeWidth={1.5}
          />
        </motion.div>
        
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100px" }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-[1px] bg-gold-accent mb-8 hidden md:block"
        ></motion.div>

        <div className="z-10 flex flex-col items-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-warm-ivory mb-4 tracking-wide">
            Gift of Memories
          </h1>

          <div className="h-[1px] w-12 bg-white/20 my-4"></div>

          <p className="text-warm-ivory/70 text-lg font-light tracking-wide">
            Admin Control & Management Portal
          </p>
        </div>

        <div className="absolute bottom-8 left-8 text-warm-ivory/30 text-[10px] font-bold tracking-[0.2em] uppercase hidden md:block">
          Authorized personnel only
        </div>
      </motion.div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative"
      >
        <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 md:p-12 shadow-2xl border border-charcoal-black/5">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-black mb-2">
              Admin Login
            </h2>
            <p className="text-slate-gray text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-gold-accent" />
              Secure System Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full h-14 px-5 rounded-xl bg-warm-ivory/30 border border-charcoal-black/10 outline-none transition-all duration-300 text-charcoal-black placeholder:text-slate-gray/50 focus:border-gold-accent focus:ring-1 focus:ring-gold-accent focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 px-5 pr-12 rounded-xl bg-warm-ivory/30 border border-charcoal-black/10 outline-none transition-all duration-300 text-charcoal-black placeholder:text-slate-gray/50 focus:border-gold-accent focus:ring-1 focus:ring-gold-accent focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray hover:text-gold-accent transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full h-14 rounded-xl font-bold text-[11px] uppercase tracking-widest
                flex items-center justify-center gap-2 transition-all duration-300 mt-8
                ${
                  isSuccess
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-charcoal-black text-gold-accent hover:bg-gold-accent hover:text-charcoal-black shadow-xl"
                }
              `}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isSuccess ? (
                <>
                  Access Granted <ShieldCheck size={16} />
                </>
              ) : (
                "Login to Workspace"
              )}
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 bg-red-50 border border-red-100 text-xs text-center font-bold px-4 py-3 rounded-lg mt-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-8 pt-6 border-t border-charcoal-black/5 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-gray/50">
              System Monitored & Protected
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;