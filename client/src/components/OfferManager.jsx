import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

const OfferManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null
  });

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/offers/admin/all`, {
        withCredentials: true
      });
      setOffers(res.data);
    } catch (error) {
      toast.error("Failed to fetch offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return toast.error("Title and Image are required");
    
    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("link", formData.link);
    data.append("image", formData.image);

    try {
      await axios.post(`${import.meta.env.VITE_NODE_URL}/api/offers/admin/create`, data, {
        withCredentials: true
      });
      toast.success("Offer published successfully!");
      setFormData({ title: "", description: "", link: "", image: null });
      fetchOffers();
    } catch (error) {
      toast.error("Failed to upload offer");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_NODE_URL}/api/offers/admin/toggle/${id}`, {}, { withCredentials: true });
      fetchOffers();
      toast.success("Status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteOffer = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/offers/admin/delete/${id}`, { withCredentials: true });
      fetchOffers();
      toast.success("Offer deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Floating Offers Manager</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
          <input 
            type="text" 
            className="w-full border rounded-md p-2 text-sm" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., 20% Off Wedding Packages"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
          <input 
            type="text" 
            className="w-full border rounded-md p-2 text-sm" 
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            placeholder="/shop or /services"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input 
            type="text" 
            className="w-full border rounded-md p-2 text-sm" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Valid till end of month..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Offer Image</label>
          <input 
            type="file" 
            accept="image/*"
            className="w-full border rounded-md p-2 text-sm bg-white" 
            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            required
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {loading ? "Uploading..." : <><Plus size={16}/> Publish Offer</>}
          </button>
        </div>
      </form>

      {/* List of Offers */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 border-b pb-2">History</h3>
        {offers.map(offer => (
          <div key={offer._id} className={`flex items-center justify-between p-4 rounded-lg border ${offer.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <img src={offer.image} alt={offer.title} className="w-16 h-16 object-cover rounded-md shadow-sm" />
              <div>
                <h4 className="font-bold text-gray-800">{offer.title}</h4>
                <p className="text-xs text-gray-500">{offer.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleStatus(offer._id)}
                className={`px-3 py-1 rounded-full text-xs font-bold ${offer.isActive ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                {offer.isActive ? 'Active' : 'Set Active'}
              </button>
              <button onClick={() => deleteOffer(offer._id)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferManager;