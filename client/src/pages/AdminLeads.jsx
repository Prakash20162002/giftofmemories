import React, { useEffect, useState } from 'react';

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignMessage, setCampaignMessage] = useState("Hello {name}! 👋\n\nWe have a special offer for you today...");
  const [campaignStatus, setCampaignStatus] = useState("");

  const API_URL = import.meta.env.VITE_NODE_URL;

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads/all`);
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleBroadcast = async () => {
    if (!window.confirm("Are you sure you want to send this message to ALL pending leads?")) return;
    
    setCampaignStatus("Starting campaign...");
    try {
      const res = await fetch(`${API_URL}/api/leads/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: campaignMessage })
      });
      const data = await res.json();
      setCampaignStatus(data.message);
      
      // Refresh the leads table after a few seconds to show updated statuses
      setTimeout(fetchLeads, 5000); 
    } catch (err) {
      setCampaignStatus("Error starting campaign.");
    }
  };

  const pendingCount = leads.filter(l => l.status === 'pending').length;

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 Lead CRM</h1>
            <p className="text-gray-500">Manage leads and run WhatsApp broadcast campaigns</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-indigo-800 text-center">
            <span className="block text-2xl font-bold">{pendingCount}</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Pending Leads</span>
          </div>
        </div>

        {/* Broadcast Campaign Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gold-accent">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Broadcast Campaign</h2>
          <p className="text-sm text-gray-500 mb-4">Send a message to all 'pending' leads. The system will automatically add a safe 3-second delay between each message. Use <code className="bg-gray-100 px-1 rounded text-red-500">{'{name}'}</code> to insert their name.</p>
          
          <textarea 
            rows="4" 
            value={campaignMessage}
            onChange={(e) => setCampaignMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-gold-accent focus:border-transparent"
          />
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBroadcast}
              disabled={pendingCount === 0}
              className="bg-charcoal-black text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              ▶ Send to All Pending Leads
            </button>
            {campaignStatus && <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded">{campaignStatus}</span>}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Lead Database</h2>
            <button onClick={fetchLeads} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">↻ Refresh Data</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Name</th>
                  <th className="p-4 border-b">Phone</th>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading leads...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">No leads captured yet.</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{lead.name}</td>
                      <td className="p-4 text-gray-600">{lead.phone}</td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(lead.createdAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'sent' ? 'bg-green-100 text-green-800' : 
                          lead.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLeads;