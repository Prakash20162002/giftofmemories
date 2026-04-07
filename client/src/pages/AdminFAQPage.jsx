import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, HelpCircle, X } from "lucide-react";
import axios from "axios";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";

const AdminFAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/faqs/all`,
        { withCredentials: true }
      );
      setFaqs(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleChange = (idx, field, value) => {
    const updated = [...faqs];
    updated[idx][field] = value;
    setFaqs(updated);
  };

  const handleAdd = () => {
    setFaqs([...faqs, { question: "", answer: "", isActive: true }]);
  };

  const handleDelete = async (id, idx) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    if (id) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_NODE_URL}/api/faqs/delete/${id}`,
          { withCredentials: true }
        );
        toast.success("FAQ removed");
      } catch {
        toast.error("Failed to delete FAQ from server");
        return;
      }
    }
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Logic: Update existing ones, Post new ones
      for (const faq of faqs) {
        if (faq._id) {
          await axios.put(
            `${import.meta.env.VITE_NODE_URL}/api/faqs/update/${faq._id}`,
            faq,
            { withCredentials: true }
          );
        } else if (faq.question.trim() && faq.answer.trim()) {
          await axios.post(
            `${import.meta.env.VITE_NODE_URL}/api/faqs/add`,
            faq,
            { withCredentials: true }
          );
        }
      }
      toast.success("All changes saved beautifully");
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to save some changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Sidebar - Mobile Toggle Integrated */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Content Management</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black">Manage FAQs</h2>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <button
                  onClick={fetchFaqs}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-charcoal-black/10 rounded-xl text-charcoal-black text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg"
                >
                  <Plus size={16} />
                  New Question
                </button>
              </div>
            </div>

            {isLoading && faqs.length === 0 ? (
              <div className="flex justify-center py-32">
                <Loader color="#C9A24D" />
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {faqs.map((faq, idx) => (
                    <motion.div
                      key={faq._id || `new-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-[2rem] p-6 md:p-8 border border-charcoal-black/5 shadow-sm relative group transition-all hover:shadow-md"
                    >
                      <button
                        type="button"
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        onClick={() => handleDelete(faq._id, idx)}
                      >
                        <X size={16} />
                      </button>

                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-gray uppercase tracking-widest block ml-1">
                            Question {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleChange(idx, "question", e.target.value)}
                            placeholder="What is your photography style?"
                            className="w-full px-5 py-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-playfair text-lg text-charcoal-black"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-gray uppercase tracking-widest block ml-1">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => handleChange(idx, "answer", e.target.value)}
                            rows={3}
                            placeholder="Describe your process here..."
                            className="w-full px-5 py-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black leading-relaxed resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {faqs.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <HelpCircle className="w-12 h-12 text-slate-gray/20 mx-auto mb-4" />
                    <p className="text-slate-gray text-sm">No FAQs created yet. Start by adding a question.</p>
                  </div>
                )}
              </div>
            )}

            {/* Global Actions */}
            {faqs.length > 0 && (
              <div className="sticky bottom-6 mt-12 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-charcoal-black/5 shadow-2xl flex justify-end gap-4 z-10 max-w-fit ml-auto">
                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest flex items-center px-4 border-r border-charcoal-black/10">
                  Unsaved Changes Exist
                </p>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gold-accent text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black hover:text-gold-accent transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gold-accent/20"
                >
                  {isSaving ? (
                    <Save className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Apply All Changes
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFAQPage;