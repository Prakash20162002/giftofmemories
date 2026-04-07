import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react"; // Added for business context

const MetricCard = ({ 
  label, 
  value, 
  icon: Icon, 
  delay = 0, 
  trend, 
  trendUp = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-charcoal-black/5 relative overflow-hidden group cursor-default"
    >
      <div className="flex justify-between items-start mb-6">
        
        {/* FIX 3: Grouped Typography Hierarchy */}
        <div className="flex flex-col z-10">
          <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            {label}
          </span>
          <h3 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black tracking-tight group-hover:text-gold-accent transition-colors duration-300">
            {value}
          </h3>
        </div>

        {/* FIX 1: Semantic Colors & Upgraded Icon Container */}
        <div className="p-4 bg-warm-ivory rounded-2xl text-gold-accent group-hover:bg-gold-accent group-hover:text-charcoal-black transition-all duration-500 transform group-hover:rotate-12 z-10 shadow-sm">
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      {/* FIX 2: Optional Business Trend Context */}
      {trend && (
        <div className="flex items-center gap-2 mt-2 z-10 relative">
          <span className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
            trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {trendUp ? <TrendingUp size={12} className="mr-1" strokeWidth={3} /> : <TrendingDown size={12} className="mr-1" strokeWidth={3} />}
            {trend}
          </span>
          <span className="text-[10px] text-slate-gray/50 font-bold uppercase tracking-wider">
            vs last month
          </span>
        </div>
      )}

      {/* Subtle background glow on hover for depth */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Upgraded Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold-accent/40 to-gold-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
};

export default MetricCard;