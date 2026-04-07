import { useEffect, useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Quote, Edit2, Trash2, Save, X, Plus } from "lucide-react";

const AdminTestimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    title: "",
    feedback: "",
  });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/testimonial/testimonials`
      );
      setTestimonials(res.data);
    } catch (err) {
      setError("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/testimonial/add-testimonial`,
        form,
        { withCredentials: true }
      );
      setTestimonials((prev) => [res.data.testimonial, ...prev]);
      setForm({ name: "", title: "", feedback: "" });
      toast.success("Client review added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || "",
      title: t.title || "",
      feedback: t.feedback || "",
    });
    // Scroll to top smoothly so the user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", title: "", feedback: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/testimonial/update-testimonial/${editing._id}`,
        form,
        { withCredentials: true }
      );
      setTestimonials((prev) =>
        prev.map((p) => (p._id === editing._id ? res.data.testimonial : p))
      );
      setEditing(null);
      setForm({ name: "", title: "", feedback: "" });
      toast.success("Review updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this testimonial?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/testimonial/delete-testimonial/${id}`,
        { withCredentials: true }
      );
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      {/* Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Layout Area */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MessageSquare className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Client Reviews</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage public testimonials</p>
                </div>
              </div>
            </div>

            {/* Layout Grid: Form Left, List Right on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Section */}
              <div className="lg:col-span-1 sticky top-28">
                <motion.div
                  layout
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-black/5">
                    <div>
                      <h3 className="font-playfair text-xl font-bold text-charcoal-black">
                        {editing ? "Edit Review" : "Add Review"}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mt-1">
                        {editing ? "Modifying existing entry" : "Create new entry"}
                      </p>
                    </div>
                    {editing ? (
                      <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Edit2 size={16} /></div>
                    ) : (
                      <div className="w-8 h-8 bg-charcoal-black/5 text-charcoal-black rounded-xl flex items-center justify-center"><Plus size={16} /></div>
                    )}
                  </div>

                  <form onSubmit={editing ? handleUpdate : handleAdd} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Client Name <span className="text-red-500">*</span></label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Sarah & James"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black font-medium"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Event Type / Role</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Wedding Clients, 2023"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Feedback Quote <span className="text-red-500">*</span></label>
                      <textarea
                        name="feedback"
                        value={form.feedback}
                        onChange={handleChange}
                        placeholder="Their exact words..."
                        rows={4}
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black resize-none"
                        required
                      />
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      {editing && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-5 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />}
                        {saving ? "Saving..." : editing ? "Update Review" : "Publish Review"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center text-sm font-bold border border-red-100">{error}</div>
                ) : testimonials.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-charcoal-black/5">
                    <Quote className="mx-auto text-slate-gray/20 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-2">No Reviews Yet</h3>
                    <p className="text-slate-gray text-sm max-w-sm mx-auto">Use the form on the left to add your first client testimonial to the website.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {testimonials.map((t) => (
                      <motion.div
                        key={t._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-white rounded-[2rem] p-6 shadow-sm border transition-all group ${editing?._id === t._id ? 'border-gold-accent ring-2 ring-gold-accent/20' : 'border-charcoal-black/5 hover:border-gold-accent/30'}`}
                      >
                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Avatar Placeholder */}
                          <div className="w-16 h-16 rounded-2xl bg-warm-ivory flex items-center justify-center text-gold-accent font-playfair text-2xl shrink-0 border border-charcoal-black/5">
                            {t.name?.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <h4 className="font-bold text-charcoal-black text-lg">{t.name}</h4>
                                {t.title && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">{t.title}</span>}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(t)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editing?._id === t._id ? 'bg-gold-accent text-white' : 'bg-charcoal-black/5 text-slate-gray hover:bg-gold-accent hover:text-white'}`}
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(t._id)}
                                  className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <Quote size={24} className="absolute -top-1 -left-2 text-gold-accent/20 rotate-180" />
                              <p className="text-sm text-slate-gray leading-relaxed pl-4 pr-2 relative z-10 italic">
                                "{t.feedback}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTestimonial;