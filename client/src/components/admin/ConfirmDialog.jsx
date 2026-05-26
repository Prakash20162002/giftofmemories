import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Overlay with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-charcoal-black/5"
          >
            {/* Header */}
            <div className="p-6 pb-4 flex items-center gap-3 border-b border-charcoal-black/5 bg-red-50/50">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-playfair text-lg font-bold text-charcoal-black">
                  Confirm Action
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm text-slate-gray hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <p className="text-sm font-medium text-slate-gray leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 pt-0 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 border border-charcoal-black/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
