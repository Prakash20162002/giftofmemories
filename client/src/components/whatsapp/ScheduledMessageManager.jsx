import { useState, useEffect, useCallback } from "react";
import { Clock, Calendar, MessageSquare, Image as ImageIcon, Plus, Trash2, Edit2, Send, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const ScheduledMessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    customerIds: [],
    message: "",
    scheduledDate: "",
    scheduledTime: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [sendToAll, setSendToAll] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/scheduled-messages`, { withCredentials: true });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch scheduled messages:", error);
      toast.error("Failed to fetch scheduled messages");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers`, { withCredentials: true });
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMessages();
      await fetchCustomers();
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formDataToSend = new FormData();
    
    if (sendToAll) {
      formDataToSend.append('customerIds', JSON.stringify(customers.map(c => c._id)));
    } else {
      if (formData.customerIds.length === 0) {
        toast.error("Please select at least one customer");
        setIsSubmitting(false);
        return;
      }
      formDataToSend.append('customerIds', JSON.stringify(formData.customerIds));
    }
    
    formDataToSend.append('message', formData.message);
    formDataToSend.append('scheduledDate', formData.scheduledDate);
    formDataToSend.append('scheduledTime', formData.scheduledTime);
    
    if (selectedImage) {
      formDataToSend.append('image', selectedImage);
    }

    try {
      if (editingMessage) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/scheduled-messages/${editingMessage._id}`, formDataToSend, { withCredentials: true });
        toast.success("Message updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/scheduled-messages`, formDataToSend, { withCredentials: true });
        toast.success("Message scheduled successfully");
      }
      
      resetForm();
      setShowAddForm(false);
      fetchMessages();
      setIsSubmitting(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to schedule message");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ customerIds: [], message: "", scheduledDate: "", scheduledTime: "" });
    setSelectedImage(null);
    setEditingMessage(null);
    setSendToAll(false);
    setCustomerSearchTerm("");
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const filteredCustomers = customers.filter(customer => {
    if (!customerSearchTerm.trim()) return false;
    const searchTerm = customerSearchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(searchTerm) || customer.phone.includes(customerSearchTerm);
  });
  
  const filteredAndSortedMessages = messages.filter(message => {
    if (statusFilter === 'all') return true;
    return message.status === statusFilter;
  });

  const handleCustomerSelection = (customerId) => {
    if (sendToAll) return;
    setFormData(prev => {
      const newIds = prev.customerIds.includes(customerId)
        ? prev.customerIds.filter(id => id !== customerId)
        : [...prev.customerIds, customerId].slice(0, 10);
      return { ...prev, customerIds: newIds };
    });
  };

  const handleDelete = async (messageId) => {
    if (!confirm("Are you sure you want to cancel this scheduled message?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/scheduled-messages/${messageId}`, { withCredentials: true });
      toast.success("Message cancelled successfully");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to cancel message");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-emerald-50 text-emerald-600';
      case 'failed': return 'bg-red-50 text-red-600';
      case 'cancelled': return 'bg-slate-gray/10 text-slate-gray';
      default: return 'bg-amber-50 text-amber-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-gold-accent" size={24} />
          <h2 className="font-playfair text-xl font-bold text-charcoal-black">Scheduled Messages</h2>
        </div>
        
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-gold-accent text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black hover:text-gold-accent transition-all shadow-lg"
        >
          <Plus size={16} />
          Schedule Message
        </button>
      </div>

      {/* Add/Edit Message Form */}
      {showAddForm && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-charcoal-black/5">
          <h3 className="font-playfair text-lg font-bold text-charcoal-black mb-6">
            {editingMessage ? "Edit Scheduled Message" : "Schedule New Message"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black">Select Customers *</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sendToAll" checked={sendToAll} onChange={(e) => { setSendToAll(e.target.checked); if (e.target.checked) setFormData(prev => ({ ...prev, customerIds: [] })); }} className="w-4 h-4 text-gold-accent border-charcoal-black/10 rounded focus:ring-gold-accent" />
                  <label htmlFor="sendToAll" className="text-sm text-charcoal-black cursor-pointer">Send to all customers ({customers.length})</label>
                </div>
              </div>
              
              {!sendToAll && (
                <div className="bg-warm-ivory/20 rounded-xl p-4">
                  <div className="text-xs text-slate-gray mb-2">Select up to 10 customers ({formData.customerIds.length}/10 selected)</div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" size={16} />
                    <input type="text" placeholder="Search customers by name or phone number..." value={customerSearchTerm} onChange={(e) => setCustomerSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none" />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4 text-slate-gray text-sm">Loading customers...</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {filteredCustomers.map((customer) => (
                            <div key={customer._id} className="flex items-center gap-2">
                              <input type="checkbox" id={`customer-${customer._id}`} checked={formData.customerIds.includes(customer._id)} onChange={() => handleCustomerSelection(customer._id)} disabled={formData.customerIds.length >= 10 && !formData.customerIds.includes(customer._id)} className="w-4 h-4 text-gold-accent border-charcoal-black/10 rounded focus:ring-gold-accent" />
                              <label htmlFor={`customer-${customer._id}`} className="text-sm text-charcoal-black cursor-pointer truncate">{customer.name} ({customer.phone})</label>
                            </div>
                          ))}
                        </div>
                        
                        {filteredCustomers.length === 0 && customerSearchTerm.trim() && (
                          <div className="text-center py-4 text-slate-gray text-sm">No customers found matching "{customerSearchTerm}"</div>
                        )}
                        
                        {filteredCustomers.length === 0 && !customerSearchTerm.trim() && (
                          <div className="text-center py-4 text-slate-gray text-sm">Type to search customers by name or phone number</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">Scheduled Date *</label>
                <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none" required />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">Scheduled Time *</label>
                <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none" required />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} className="w-full h-12 px-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none pt-2.5" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-black mb-2">Message *</label>
              <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Enter your message here..." rows={4} className="w-full p-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none resize-none" required />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isSubmitting ? "Processing..." : (editingMessage ? "Update Message" : "Schedule Message")}
              </button>
              
              <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="px-6 py-3 bg-slate-gray text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-white rounded-full shadow-sm border border-charcoal-black/5 w-fit mx-auto my-6">
        {['pending', 'sent', 'cancelled', 'failed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all capitalize ${statusFilter === status ? 'bg-charcoal-black text-gold-accent shadow-md' : 'text-slate-gray hover:bg-warm-ivory/30'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredAndSortedMessages.map((message) => (
          <div key={message._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-charcoal-black/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gold-accent/10 rounded-full flex items-center justify-center">
                    <MessageSquare size={18} className="text-gold-accent" />
                  </div>
                  <div>
                    {/* CRITICAL FIX: Safe fallback for deleted customers */}
                    <h4 className="font-bold text-charcoal-black">{message.customer?.name || "Deleted Customer"}</h4>
                    <p className="text-slate-gray text-sm">{message.customer?.phone || "N/A"}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-charcoal-black bg-warm-ivory/30 rounded-xl p-4 text-sm">{message.message}</p>
                  {message.imageUrl && (
                    <div className="mt-2 flex items-center gap-2 text-slate-gray text-xs">
                      <ImageIcon size={14} />
                      <span>Image attached</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-slate-gray text-xs">
                  <div className="flex items-center gap-1"><Calendar size={14} /><span>{formatDate(message.scheduledDate)}</span></div>
                  <div className="flex items-center gap-1"><Clock size={14} /><span>{message.scheduledTime}</span></div>
                  {message.sentAt && (
                    <div className="flex items-center gap-1"><Send size={14} /><span>Sent at {new Date(message.sentAt).toLocaleString()}</span></div>
                  )}
                </div>
              </div>
              
              {message.status === 'pending' && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingMessage(message);
                      setFormData({
                        customerIds: message.customer?._id ? [message.customer._id] : [],
                        message: message.message,
                        scheduledDate: new Date(message.scheduledDate).toISOString().split('T')[0],
                        scheduledTime: message.scheduledTime
                      });
                      setShowAddForm(true);
                    }}
                    className="p-2 text-gold-accent hover:bg-gold-accent/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(message._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredAndSortedMessages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5">
            <Clock className="mx-auto text-slate-gray/30 mb-4" size={48} />
            {messages.length === 0 ? (
              <p className="text-slate-gray">No scheduled messages found</p>
            ) : (
              <p className="text-slate-gray">No scheduled messages with status "{statusFilter}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledMessageManager;