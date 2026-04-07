import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Users,
  CheckCircle,
  ShieldCheck,
  CalendarDays,
  Percent,
  Mail,
  Phone
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import Loader from "../components/Loader";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile layout state

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/users/all`,
        { withCredentials: true }
      );
      // Filter to show only approved users
      setUsers(res.data.filter((user) => user.status === "approved"));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user directory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Permanently delete this user account?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/users/${userId}`,
        { withCredentials: true }
      );
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("User account removed");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Filter users by search
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
      );
    });
  }, [users, searchQuery]);

  const getRoleBadge = (role) => {
    return role === "vip"
      ? "bg-purple-50 text-purple-600 border border-purple-100"
      : "bg-charcoal-black/5 text-slate-gray border border-charcoal-black/10";
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
            
            {/* Header & Controls Section */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Titles */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="text-gold-accent" size={24} />
                  </div>
                  <div>
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Client Directory</h1>
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage approved accounts</p>
                  </div>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="relative w-full sm:w-64 lg:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-warm-ivory/50 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 w-full sm:w-auto">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Approved</span>
                      <span className="text-sm font-black text-emerald-600 leading-none">{users.length} Users</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Users Data Grid/Table */}
            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                <ShieldCheck className="mx-auto text-slate-gray/20 mb-4" size={48} />
                <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">No clients found</h3>
                <p className="text-slate-gray text-sm">No approved users match your search criteria.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden">
                
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-warm-ivory/30 border-b border-charcoal-black/5">
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Client Profile</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Contact Details</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Status & Tier</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Metrics</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-black/5">
                      <AnimatePresence>
                        {filteredUsers.map((user) => (
                          <motion.tr
                            key={user._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-warm-ivory/20 transition-colors group"
                          >
                            {/* Profile */}
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gold-accent/10 flex items-center justify-center text-gold-accent font-playfair font-bold text-lg border border-gold-accent/20">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-charcoal-black text-sm">{user.name}</p>
                                  <p className="text-xs text-slate-gray mt-0.5">ID: {user._id.substring(user._id.length - 6)}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-8 py-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-charcoal-black">
                                  <Mail size={14} className="text-slate-gray" />
                                  {user.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-gray">
                                  <Phone size={14} className="text-slate-gray/50" />
                                  {user.phone || "No phone provided"}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-8 py-4">
                              <div className="flex flex-col gap-2 items-start">
                                <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                                  {user.role} Tier
                                </span>
                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                  <CheckCircle size={12} /> Approved
                                </span>
                              </div>
                            </td>

                            {/* Metrics */}
                            <td className="px-8 py-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm font-bold text-charcoal-black">
                                  <Percent size={14} className="text-gold-accent" />
                                  {user.discount}% Discount
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-gray">
                                  <CalendarDays size={14} className="text-slate-gray/50" />
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-8 py-4 text-right">
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Delete Account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View (Hidden on desktop) */}
                <div className="md:hidden divide-y divide-charcoal-black/5">
                  <AnimatePresence>
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-5 space-y-4 hover:bg-warm-ivory/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold-accent/10 flex items-center justify-center text-gold-accent font-playfair font-bold border border-gold-accent/20">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-charcoal-black text-sm leading-tight">{user.name}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="bg-warm-ivory/30 rounded-xl p-4 space-y-3 border border-charcoal-black/5">
                          <div className="flex items-center gap-2 text-xs text-charcoal-black">
                            <Mail size={14} className="text-slate-gray shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-charcoal-black">
                              <Phone size={14} className="text-slate-gray shrink-0" />
                              {user.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-gold-accent">
                              <Percent size={12} /> {user.discount}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;