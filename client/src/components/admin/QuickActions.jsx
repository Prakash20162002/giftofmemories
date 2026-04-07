import { Plus, Upload, Bell } from "lucide-react";
import { motion } from "framer-motion";

const QuickActions = () => {
  const actions = [
    { label: "New Booking", icon: Plus }, // Contextualized for your studio
    { label: "Upload Gallery", icon: Upload },
    { label: "Set Reminder", icon: Bell },
  ];

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-charcoal-black/5 shadow-sm">
      
      {/* FIX 3: Upgraded Typographic Hierarchy */}
      <div className="flex flex-col gap-1">
        <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em]">
          Workspace
        </span>
        <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black">
          Quick Actions
        </h3>
      </div>

      {/* FIX 2: Predictable responsive grid for mobile, flex for desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:flex gap-3 md:gap-4 w-full md:w-auto">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            // FIX 1: Semantic variables and tactile hover states
            className="group flex items-center justify-center gap-2.5 px-6 py-3.5 bg-warm-ivory/50 border border-charcoal-black/5 rounded-xl text-charcoal-black text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-white hover:border-gold-accent hover:shadow-xl hover:shadow-gold-accent/20 transition-all duration-300 w-full md:w-auto"
          >
            <action.icon 
              size={16} 
              strokeWidth={2} 
              className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" 
            />
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;