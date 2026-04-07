import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, ArrowLeft, BookX } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import BlogEditor from "../components/admin/BlogEditor";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // FIX 1: Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/blogs`
      );
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAddBlog = () => {
    setCurrentBlog(null);
    setIsEditing(true);
  };

  const handleEditBlog = (blog) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this journal entry?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/blogs/${id}`, {
          withCredentials: true // Ensure security cookie is sent for admin action
        });
        toast.success("Entry removed successfully");
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        toast.error("Failed to delete entry");
      }
    }
  };

  const handleSaveBlog = async (blogData) => {
    try {
      setIsLoading(true);

      if (currentBlog) {
        await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/blogs/${currentBlog._id}`,
          blogData,
          { withCredentials: true }
        );
        toast.success("Journal updated beautifully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/blogs`,
          blogData,
          { withCredentials: true }
        );
        toast.success("New journal published");
      }
      setIsEditing(false);
      setCurrentBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save. Please try again.");
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Responsive Content Wrapper */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 text-slate-gray hover:text-charcoal-black mb-8 transition-colors text-[11px] font-bold uppercase tracking-widest group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Journal List
                </button>
                <BlogEditor
                  blog={currentBlog}
                  onSave={handleSaveBlog}
                  onCancel={() => setIsEditing(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                  <div>
                    <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
                      Content Management
                    </span>
                    <h1 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black mb-2">
                      Journal & Stories
                    </h1>
                  </div>
                  <button
                    onClick={handleAddBlog}
                    className="w-full md:w-auto bg-charcoal-black text-gold-accent px-6 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Draft New Entry
                  </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm mb-8 flex items-center gap-3 border border-charcoal-black/5 max-w-md">
                  <div className="pl-4 text-slate-gray">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search journal entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-charcoal-black placeholder:text-slate-gray/50 font-inter text-sm py-2 pr-4"
                  />
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-32">
                    <Loader color="#C9A24D" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.map((blog) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-charcoal-black/5 group flex flex-col"
                      >
                        <div className="h-56 overflow-hidden relative">
                          <img
                            src={blog.image || "/placeholder.png"}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal-black rounded-lg backdrop-blur-sm shadow-sm">
                            {blog.category}
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8 flex flex-col flex-1">
                          <div className="text-[10px] text-slate-gray mb-3 font-inter font-bold uppercase tracking-widest">
                            {blog.date}
                          </div>
                          <h3 className="font-playfair text-xl font-bold text-charcoal-black mb-3 line-clamp-2 leading-tight group-hover:text-gold-accent transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-slate-gray text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                            {blog.excerpt}
                          </p>
                          
                          {/* Premium Action Buttons */}
                          <div className="flex gap-3 pt-6 border-t border-charcoal-black/5 mt-auto">
                            <button
                              onClick={() => handleEditBlog(blog)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-warm-ivory/50 text-charcoal-black rounded-xl hover:bg-gold-accent hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* FIX 3: Polished Empty Search State */}
                {!isLoading && filteredBlogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-charcoal-black/5 shadow-sm">
                    <div className="w-16 h-16 bg-warm-ivory/50 rounded-full flex items-center justify-center text-slate-gray mb-4">
                      <BookX size={24} />
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-charcoal-black mb-2">
                      No Entries Found
                    </h3>
                    <p className="text-slate-gray text-sm text-center max-w-sm">
                      {searchQuery ? `We couldn't find any journals matching "${searchQuery}". Try adjusting your search.` : "Your journal is currently empty. Start writing your first story!"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminBlogPage;