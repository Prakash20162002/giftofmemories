import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Edit, Trash2, Plus, Save, X, Image as ImageIcon } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import Loader from "../components/Loader";

const AdminAboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // FIX 1: Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Story Section State
  const [storyModal, setStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({
    storyTitle: "",
    storyContent: "",
    storySignature: "",
    image: null,
  });
  const [storyImagePreview, setStoryImagePreview] = useState(null);

  // Team Member State
  const [teamModal, setTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    designation: "",
    quote: "",
    image: null,
  });
  const [teamImagePreview, setTeamImagePreview] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/about/get-about`
      );
      setAboutData(response.data);
      setStoryForm({
        storyTitle: response.data.storyTitle,
        storyContent: response.data.storyContent,
        storySignature: response.data.storySignature,
        image: null,
      });
      setStoryImagePreview(response.data.storyImage);
    } catch (error) {
      console.error("Error fetching about data:", error);
      toast.error("Failed to fetch about data");
    } finally {
      setIsLoading(false);
    }
  };

  // Story Section Handlers
  const handleStoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoryForm({ ...storyForm, image: file });
      setStoryImagePreview(URL.createObjectURL(file)); // Fast preview without Base64 block
    }
  };

  const handleUpdateStory = async () => {
    try {
      const formData = new FormData();
      formData.append("storyTitle", storyForm.storyTitle);
      formData.append("storyContent", storyForm.storyContent);
      formData.append("storySignature", storyForm.storySignature);
      if (storyForm.image) {
        formData.append("image", storyForm.image);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/about/update-story`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setAboutData(response.data.about);
      setStoryModal(false);
      toast.success("Story beautifully updated.");
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("Failed to update story section");
    }
  };

  // Team Member Handlers
  const handleTeamImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeamForm({ ...teamForm, image: file });
      setTeamImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddTeamModal = () => {
    setTeamForm({ name: "", designation: "", quote: "", image: null });
    setTeamImagePreview(null);
    setEditingMemberId(null);
    setTeamModal(true);
  };

  const openEditTeamModal = (member) => {
    setTeamForm({
      name: member.name,
      designation: member.designation,
      quote: member.quote,
      image: null,
    });
    setTeamImagePreview(member.image);
    setEditingMemberId(member._id);
    setTeamModal(true);
  };

  const handleSaveTeamMember = async () => {
    try {
      if (!teamForm.name || !teamForm.designation || !teamForm.quote) {
        toast.error("Please fill all fields");
        return;
      }

      const formData = new FormData();
      formData.append("name", teamForm.name);
      formData.append("designation", teamForm.designation);
      formData.append("quote", teamForm.quote);
      if (teamForm.image) {
        formData.append("image", teamForm.image);
      }

      let response;
      if (editingMemberId) {
        response = await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/about/update-team-member/${editingMemberId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        toast.success("Creator profile updated");
      } else {
        if (!teamForm.image) {
          toast.error("Please upload an image");
          return;
        }
        response = await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/about/add-team-member`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        toast.success("New creator added");
      }

      setAboutData(response.data.about);
      setTeamModal(false);
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this creator from the team?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/about/delete-team-member/${memberId}`,
        { withCredentials: true }
      );
      setAboutData(response.data.about);
      toast.success("Creator removed successfully");
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
          <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 flex items-center justify-center">
            <Loader color="#C9A24D" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Responsive Content Wrapper */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-charcoal-black/5">
                <div>
                  <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
                    Page Content
                  </span>
                  <h2 className="text-2xl font-playfair font-bold text-charcoal-black">
                    Studio Story
                  </h2>
                </div>
                <button
                  onClick={() => setStoryModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-warm-ivory/50 border border-charcoal-black/10 text-charcoal-black text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold-accent hover:text-white hover:border-gold-accent transition-all duration-300 w-full md:w-auto justify-center"
                >
                  <Edit size={16} />
                  Edit Story
                </button>
              </div>

              <div className="p-6 md:p-8 grid md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-charcoal-black/10 shadow-sm">
                    <img
                      src={aboutData?.storyImage || "/placeholder.png"}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="md:col-span-7 flex flex-col justify-center">
                  <h3 className="text-3xl font-playfair font-bold text-charcoal-black mb-4">
                    {aboutData?.storyTitle}
                  </h3>
                  <p className="text-slate-gray font-inter leading-relaxed mb-6 whitespace-pre-wrap">
                    {aboutData?.storyContent}
                  </p>
                  <p className="text-gold-accent font-playfair italic text-xl">
                    {aboutData?.storySignature}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Members Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-charcoal-black/5">
                <div>
                  <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
                    Staff Management
                  </span>
                  <h2 className="text-2xl font-playfair font-bold text-charcoal-black">
                    Meet The Creators
                  </h2>
                </div>
                <button
                  onClick={openAddTeamModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-black text-gold-accent text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold-accent hover:text-charcoal-black shadow-lg transition-all duration-300 w-full md:w-auto justify-center"
                >
                  <Plus size={16} />
                  Add Creator
                </button>
              </div>

              <div className="p-6 md:p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {aboutData?.teamMembers?.map((member) => (
                  <div
                    key={member._id}
                    className="bg-warm-ivory/30 rounded-2xl overflow-hidden border border-charcoal-black/5 hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">
                        {member.name}
                      </h3>
                      <p className="text-[10px] text-gold-accent font-inter font-bold uppercase tracking-widest mb-3">
                        {member.designation}
                      </p>
                      <p className="text-sm text-slate-gray font-inter line-clamp-3 mb-6 flex-1">
                        "{member.quote}"
                      </p>
                      
                      {/* FIX 2: Premium Action Buttons */}
                      <div className="flex gap-3 mt-auto">
                        <button
                          onClick={() => openEditTeamModal(member)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl hover:bg-charcoal-black hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(member._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Reusable Modal Component logic (Simplified for length, but styled luxuriously) */}
      <AnimatePresence>
        {(storyModal || teamModal) && (
          <div className="fixed inset-0 bg-charcoal-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 border-b border-charcoal-black/10 pb-4">
                <h3 className="text-2xl font-playfair font-bold text-charcoal-black">
                  {storyModal ? "Edit Story Content" : editingMemberId ? "Edit Creator Profile" : "Add New Creator"}
                </h3>
                <button
                  onClick={() => { setStoryModal(false); setTeamModal(false); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-gray hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* FIX 3: Premium Input Fields */}
                <div className="space-y-2">
                   <label className="block text-[11px] font-bold text-charcoal-black uppercase tracking-widest">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-6 p-4 border border-charcoal-black/10 rounded-xl bg-warm-ivory/30">
                    {(storyModal ? storyImagePreview : teamImagePreview) ? (
                      <img
                        src={storyModal ? storyImagePreview : teamImagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-white border border-charcoal-black/10 flex items-center justify-center text-slate-gray">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-5 py-2.5 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl hover:bg-gold-accent hover:text-white hover:border-gold-accent transition-all cursor-pointer text-[11px] font-bold uppercase tracking-widest shadow-sm">
                      <Upload size={16} />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={storyModal ? handleStoryImageChange : handleTeamImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-charcoal-black uppercase tracking-widest">
                    {storyModal ? "Headline" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={storyModal ? storyForm.storyTitle : teamForm.name}
                    onChange={(e) => storyModal ? setStoryForm({ ...storyForm, storyTitle: e.target.value }) : setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black"
                  />
                </div>

                {/* Team-only Designation */}
                {teamModal && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-charcoal-black uppercase tracking-widest">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={teamForm.designation}
                      onChange={(e) => setTeamForm({ ...teamForm, designation: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-charcoal-black uppercase tracking-widest">
                    {storyModal ? "Story Content" : "Biography Quote"}
                  </label>
                  <textarea
                    value={storyModal ? storyForm.storyContent : teamForm.quote}
                    onChange={(e) => storyModal ? setStoryForm({ ...storyForm, storyContent: e.target.value }) : setTeamForm({ ...teamForm, quote: e.target.value })}
                    rows={storyModal ? 8 : 4}
                    className="w-full px-5 py-3.5 bg-white border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black resize-y"
                  />
                </div>

                {/* Story-only Signature */}
                {storyModal && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-charcoal-black uppercase tracking-widest">
                      Sign-off Text
                    </label>
                    <input
                      type="text"
                      value={storyForm.storySignature}
                      onChange={(e) => setStoryForm({ ...storyForm, storySignature: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black"
                    />
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-charcoal-black/10 mt-8">
                  <button
                    onClick={() => { setStoryModal(false); setTeamModal(false); }}
                    className="px-6 py-3 border border-charcoal-black/10 text-charcoal-black rounded-xl hover:bg-charcoal-black/5 transition-colors text-[11px] font-bold uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={storyModal ? handleUpdateStory : handleSaveTeamMember}
                    className="flex items-center gap-2 px-8 py-3 bg-charcoal-black text-gold-accent rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg text-[11px] font-bold uppercase tracking-widest"
                  >
                    <Save size={16} />
                    {storyModal ? "Update Story" : editingMemberId ? "Save Profile" : "Add Creator"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAboutPage;