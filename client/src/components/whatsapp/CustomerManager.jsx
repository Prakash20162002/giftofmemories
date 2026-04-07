import { useState, useEffect } from "react";
import { Plus, Users, Phone, Mail, Edit2, Trash2, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers`, { withCredentials: true });
      setCustomers(res.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers/${editingCustomer._id}`, formData, { withCredentials: true });
        toast.success("Customer updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers`, formData, { withCredentials: true });
        toast.success("Customer added successfully");
      }
      
      setFormData({ name: "", phone: "", email: "", notes: "" });
      setShowAddForm(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      notes: customer.notes || ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (customerId) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers/${customerId}`, { withCredentials: true });
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-gold-accent" size={24} />
          <h2 className="font-playfair text-xl font-bold text-charcoal-black">Customer Management</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" size={16} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingCustomer(null);
              setFormData({ name: "", phone: "", email: "", notes: "" });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gold-accent text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black hover:text-gold-accent transition-all shadow-lg"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Add/Edit Customer Form */}
      {showAddForm && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-charcoal-black/5">
          <h3 className="font-playfair text-lg font-bold text-charcoal-black mb-6">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">
                  Phone Number * (with country code, e.g., 911234567890)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '') })}
                  placeholder="e.g., 911234567890"
                  className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                  required
                  minLength={10}
                  maxLength={15}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg"
              >
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCustomer(null);
                  setFormData({ name: "", phone: "", email: "", notes: "" });
                }}
                className="px-6 py-3 bg-slate-gray text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-black/10">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Name</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Phone</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Email</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Notes</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="border-b border-charcoal-black/5 hover:bg-warm-ivory/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold-accent/10 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gold-accent" />
                      </div>
                      <span className="font-medium text-charcoal-black">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-gray">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {customer.email ? (
                      <div className="flex items-center gap-2 text-slate-gray">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-gray/50">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-slate-gray text-sm">{customer.notes || '-'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 text-gold-accent hover:bg-gold-accent/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-gray/30 mb-4" size={48} />
              <p className="text-slate-gray">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;