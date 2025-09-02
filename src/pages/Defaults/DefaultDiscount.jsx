import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  ListTree,
  Layers,
  FileText,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Star,
  Info,
  Percent
} from 'lucide-react';

export default function DefaultDiscount() {
  const { companyId, username } = useAppContext();
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');
  const [level3Id, setLevel3Id] = useState('');
  const [level4Id, setLevel4Id] = useState('');
  const [level1Accounts, setLevel1Accounts] = useState([]);
  const [level2Accounts, setLevel2Accounts] = useState([]);
  const [level3Accounts, setLevel3Accounts] = useState([]);
  const [level4Accounts, setLevel4Accounts] = useState([]);
  const [defaultDiscounts, setDefaultDiscounts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingLevel4Id, setEditingLevel4Id] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discountRate, setDiscountRate] = useState('');
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const tableRef = useRef(null);
  
  // Responsive input class
  const inputClass = "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";
  
  // Fetch Level 1 accounts when company changes
  const fetchLevel1Accounts = async () => {
    if (!companyId) {
      setLevel1Accounts([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level1/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch Level 1 accounts');
      setLevel1Accounts(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch Level 1 accounts'
      });
    }
  };
  
  // Fetch Level 2 accounts when Level 1 selection changes
  const fetchLevel2Accounts = async () => {
    if (!companyId || !level1Id) {
      setLevel2Accounts([]);
      setLevel2Id('');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level2/${companyId}/${level1Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch Level 2 accounts');
      setLevel2Accounts(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch Level 2 accounts'
      });
    }
  };
  
  // Fetch Level 3 accounts when Level 2 selection changes
  const fetchLevel3Accounts = async () => {
    if (!companyId || !level1Id || !level2Id) {
      setLevel3Accounts([]);
      setLevel3Id('');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level3/${companyId}/${level1Id}/${level2Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch Level 3 accounts');
      setLevel3Accounts(json.data || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch Level 3 accounts'
      });
    }
  };
  
  // Fetch Level 4 accounts when Level 3 selection changes
  const fetchLevel4Accounts = async () => {
    if (!companyId || !level1Id || !level2Id || !level3Id) {
      setLevel4Accounts([]);
      setLevel4Id('');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level4/${companyId}/${level1Id}/${level2Id}/${level3Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch Level 4 accounts');
      setLevel4Accounts(json.data || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch Level 4 accounts'
      });
    }
  };
  
  // Fetch default discount accounts
  const fetchDefaultDiscounts = async () => {
    if (!companyId) {
      setDefaultDiscounts([]);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/defaults/discounts/${companyId}`);
      if (res.status === 404) {
        setDefaultDiscounts([]);
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch default discount accounts');
      }
      const responseData = await res.json();
      const discountsData = Array.isArray(responseData) ? responseData : (responseData.data || []);
      setDefaultDiscounts(discountsData);
      if (discountsData.length === 0) {
        setMessage({
          type: "info",
          text: "No default discount accounts found. You can add one using the form above."
        });
      }
    } catch (err) {
      if (err.message !== 'Not Found') {
        setMessage({
          type: "error",
          text: err.message
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch level 4 accounts for all discounts to get their titles
  const fetchTitlesForDiscounts = async () => {
    if (defaultDiscounts.length === 0) return;
    
    try {
      // Get all unique level 4 IDs from discounts
      const level4Ids = [...new Set(defaultDiscounts.map(disc => disc.level4Id))];
      
      // Try to fetch level 4 accounts for these IDs
      const promises = level4Ids.map(id => 
        fetch(`http://localhost:5000/api/accounts/level4/single/${id}`)
          .then(res => {
            if (!res.ok) return null;
            return res.json().catch(() => null);
          })
          .catch(() => null)
      );
      
      const accounts = await Promise.all(promises);
      const level4AccountMap = {};
      
      accounts.forEach(account => {
        if (account && account._id) {
          level4AccountMap[account._id] = account.title;
        }
      });
      
      // Update discounts with titles
      setDefaultDiscounts(prev => 
        prev.map(disc => ({
          ...disc,
          level4Title: level4AccountMap[disc.level4Id] || disc.level4Title || 'Unknown Title'
        }))
      );
    } catch (err) {
      console.error('Error fetching titles for discounts:', err);
      // If fetching fails, keep existing titles or set to 'Unknown Title'
      setDefaultDiscounts(prev => 
        prev.map(disc => ({
          ...disc,
          level4Title: disc.level4Title || 'Unknown Title'
        }))
      );
    }
  };
  
  // Scroll to newly added item
  useEffect(() => {
    if (newlyAddedId && tableRef.current) {
      const element = document.getElementById(`row-${newlyAddedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setNewlyAddedId(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [newlyAddedId, defaultDiscounts]);
  
  useEffect(() => {
    fetchLevel1Accounts();
    fetchDefaultDiscounts();
  }, [companyId]);
  
  useEffect(() => {
    fetchLevel2Accounts();
  }, [companyId, level1Id]);
  
  useEffect(() => {
    fetchLevel3Accounts();
  }, [companyId, level1Id, level2Id]);
  
  useEffect(() => {
    fetchLevel4Accounts();
  }, [companyId, level1Id, level2Id, level3Id]);
  
  // Fetch titles when discounts change
  useEffect(() => {
    if (defaultDiscounts.length > 0 && !defaultDiscounts[0].level4Title) {
      fetchTitlesForDiscounts();
    }
  }, [defaultDiscounts.length]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setMessage({
        type: "error",
        text: "Please select a company first"
      });
      return;
    }
    if (!username) {
      setMessage({
        type: "error",
        text: "User information not available"
      });
      return;
    }
    if (!level1Id || !level2Id || !level3Id || !level4Id) {
      setMessage({
        type: "error",
        text: "Please select all account levels"
      });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const selectedLevel1 = level1Accounts.find(a => a._id === level1Id);
      const selectedLevel2 = level2Accounts.find(a => a._id === level2Id);
      const selectedLevel3 = level3Accounts.find(a => a._id === level3Id);
      const selectedLevel4 = level4Accounts.find(a => a._id === level4Id);
      
      if (!selectedLevel1 || !selectedLevel2 || !selectedLevel3 || !selectedLevel4) {
        throw new Error("Invalid account selection");
      }
      
      const now = new Date();
      const payload = {
        companyId,
        level1Id: selectedLevel1._id,
        level2Id: selectedLevel2._id,
        level3Id: selectedLevel3._id,
        level4Id: selectedLevel4._id,
        parentLevel1Code: selectedLevel1.code,
        parentLevel2Code: selectedLevel2.code,
        parentLevel3Code: selectedLevel3.code,
        level4Subcode: selectedLevel4.subcode,
        code: `${selectedLevel1.code}${selectedLevel2.code}${selectedLevel3.code}`,
        fullcode: `${selectedLevel1.code}${selectedLevel2.code}${selectedLevel3.code}${selectedLevel4.subcode}`,
        discountRate: parseFloat(discountRate) || 0,
        isActive: true,
        isDefault: false
      };
      
      // Add user information and timestamps
      if (editId) {
        // Update operation
        payload.updatedBy = username;
        payload.updatedAt = now;
      } else {
        // Create operation
        payload.createdBy = username;
        payload.updatedBy = username;
        payload.createdAt = now;
        payload.updatedAt = now;
      }
      
      const url = editId
        ? `http://localhost:5000/api/defaults/discounts/${editId}`
        : `http://localhost:5000/api/defaults/discounts`;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Operation failed');
      }
      
      setMessage({
        type: "success",
        text: editId ? "Discount account updated successfully!" : "Discount account added successfully!"
      });
      
      // Keep level 1, level 2, and level 3 selections after adding/updating
      if (!editId) {
        // Only reset level 4 and discount rate when adding new
        setLevel4Id('');
        setDiscountRate('');
        // Set the newly added ID to highlight it
        setNewlyAddedId(json._id || json.data?._id);
      }
      setEditId(null);
      await fetchDefaultDiscounts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (item) => {
    setLevel1Id(item.level1Id);
    setLevel2Id(item.level2Id);
    setLevel3Id(item.level3Id);
    setLevel4Id(item.level4Id || '');
    setDiscountRate(item.discountRate?.toString() || '');
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const startEditingTitle = (item) => {
    setEditingItemId(item._id);
    setEditingLevel4Id(item.level4Id);
    setEditingTitle(item.level4Title);
  };
  
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingLevel4Id(null);
    setEditingTitle('');
  };
  
  const saveEditedTitle = async () => {
    if (!editingTitle.trim()) {
      setMessage({
        type: "error",
        text: "Title cannot be empty"
      });
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level4/${editingLevel4Id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: editingTitle })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update title');
      setMessage({
        type: "success",
        text: "Title updated successfully!"
      });
      setEditingItemId(null);
      setEditingLevel4Id(null);
      setEditingTitle('');
      await fetchDefaultDiscounts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to update title'
      });
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount account?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/defaults/discounts/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete discount account');
        
        setMessage({
          type: "success",
          text: "Discount account deleted successfully!"
        });
        fetchDefaultDiscounts();
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete discount account'
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/defaults/discounts/${id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: !currentStatus,
          updatedBy: username,
          updatedAt: new Date()
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      fetchDefaultDiscounts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to update status'
      });
    }
  };
  
  const toggleDefault = async (id, currentStatus) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/defaults/discounts/${id}/default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          isDefault: !currentStatus,
          updatedBy: username,
          updatedAt: new Date()
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update default status');
      }
      await fetchDefaultDiscounts();
    } catch (err) {
      console.error('Toggle default error:', err);
      setMessage({
        type: "error",
        text: err.message || 'Failed to update default status'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <style jsx global>{`
        /* Hide browser scrollbar */
        body {
          overflow: hidden;
        }
        
        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Dark mode scrollbar */
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Highlight animation for newly added row */
        @keyframes highlight {
          0% { background-color: rgba(34, 197, 94, 0.3); }
          100% { background-color: transparent; }
        }
        
        .highlight-row {
          animation: highlight 3s ease-in-out;
        }
        
        /* Custom select styles for better text display */
        .custom-select {
          min-width: 280px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .custom-select option {
          white-space: normal;
          word-wrap: break-word;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ml-0.md\\:ml-64 {
            margin-left: 0 !important;
          }
          
          .h-\\[calc\\(100vh-3rem\\)\\] {
            height: calc(100vh - 5rem);
          }
          
          .max-w-4xl {
            max-width: 100%;
            padding: 1rem;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .text-2xl {
            font-size: 1.5rem;
          }
          
          .p-3 {
            padding: 0.5rem;
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          
          /* Make table responsive */
          .responsive-table {
            overflow-x: auto;
          }
          
          .responsive-table table {
            min-width: 600px;
          }
          
          /* Hide less important columns on small screens */
          @media (max-width: 640px) {
            .hide-on-mobile {
              display: none;
            }
          }
          
          /* Custom select responsive adjustments */
          .custom-select {
            min-width: 100%;
          }
          
          /* Adjust discount rate input width on mobile */
          .discount-rate-input {
            min-width: 100%;
          }
          
          /* Adjust title editing on mobile */
          .title-edit-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .title-edit-input {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
        <div className="max-w-4xl mx-auto mt-6 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]">
          <h2 className="text-xl md:text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-4 md:mb-6 flex items-center justify-center gap-2">
            <Percent className="w-5 h-5 md:w-6 md:h-6" />
            <span className="truncate">Default Discount Accounts</span>
          </h2>
          
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-white font-medium shadow-md flex items-center gap-2 ${
                message.type === "success" ? "bg-green-500" :
                  message.type === "error" ? "bg-red-500" : "bg-blue-500"
                }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : message.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <ListTree className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <select
                  value={level1Id}
                  onChange={(e) => {
                    setLevel1Id(e.target.value);
                    setLevel2Id('');
                    setLevel3Id('');
                    setLevel4Id('');
                  }}
                  className={`${inputClass} custom-select`}
                  required
                  disabled={!companyId}
                >
                  <option value="">Select Level 1 Account</option>
                  {level1Accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Layers className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <select
                  value={level2Id}
                  onChange={(e) => {
                    setLevel2Id(e.target.value);
                    setLevel3Id('');
                    setLevel4Id('');
                  }}
                  className={`${inputClass} custom-select`}
                  required
                  disabled={!level1Id}
                >
                  <option value="">Select Level 2 Account</option>
                  {level2Accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <select
                  value={level3Id}
                  onChange={(e) => {
                    setLevel3Id(e.target.value);
                    setLevel4Id('');
                  }}
                  className={`${inputClass} custom-select`}
                  required
                  disabled={!level2Id}
                >
                  <option value="">Select Level 3 Account</option>
                  {level3Accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <select
                  value={level4Id}
                  onChange={(e) => setLevel4Id(e.target.value)}
                  className={`${inputClass} custom-select`}
                  required
                  disabled={!level3Id}
                >
                  <option value="">Select Level 4 Account</option>
                  {level4Accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.subcode} - {account.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Percent className="text-blue-500 w-4 h-4 flex-shrink-0" />
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                placeholder="Discount Rate (%)"
                className={`${inputClass} discount-rate-input`}
                step="0.01"
                min="0"
                max="100"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !companyId || !username || !level1Id || !level2Id || !level3Id || !level4Id}
              className={`w-full p-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md transition ${
                editId
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editId ? 'Update Discount Account' : 'Add Discount Account'}
            </button>
          </form>
          
          {companyId ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
              {/* Table container with scrollable area */}
              <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar responsive-table">
                {defaultDiscounts.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <th className="p-3 text-left font-semibold text-sm">Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Subcode</th>
                        <th className="p-3 text-left font-semibold text-sm">Title</th>
                        <th className="p-3 text-left font-semibold text-sm">Discount Rate</th>
                        <th className="p-3 text-left font-semibold text-sm">Active</th>
                        <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Default</th>
                        <th className="p-3 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultDiscounts.map((item) => (
                        <tr
                          key={item._id}
                          id={`row-${item._id}`}
                          className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            newlyAddedId === item._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                          }`}
                        >
                          <td className="p-3 font-mono text-sm">{item.code}</td>
                          <td className="p-3 font-mono text-sm">{item.level4Subcode}</td>
                          <td className="p-3 text-sm">
                            {editingItemId === item._id ? (
                              <div className="title-edit-container flex flex-col md:flex-row items-start md:items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="p-2 border rounded-lg text-sm title-edit-input"
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={saveEditedTitle}
                                    className="p-1 text-green-500 hover:bg-green-50 rounded-full"
                                    title="Save"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="truncate max-w-[150px] md:max-w-[250px]" title={item.level4Title || 'Unknown Title'}>
                                  {item.level4Title || 'Unknown Title'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-sm">{item.discountRate}%</td>
                          <td className="p-3">
                            <button
                              onClick={() => toggleActive(item._id, item.isActive)}
                              className={`p-1 rounded-full ${item.isActive ? 'text-green-500' : 'text-red-500'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                              title={item.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                            >
                              {item.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="p-3 hide-on-mobile">
                            <button
                              onClick={() => toggleDefault(item._id, item.isDefault)}
                              className={`p-1 rounded-full ${item.isDefault ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                              title={item.isDefault ? 'Default - Click to remove as default' : 'Click to set as default'}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="p-3 flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {message?.type !== "error" && "No default discount accounts found. Add one using the form above."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              Please select a company to view default discount accounts
            </div>
          )}
        </div>
      </div>
    </>
  );
}