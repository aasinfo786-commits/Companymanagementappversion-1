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
  Info
} from 'lucide-react';

export default function DefaultsFinishedGoods() {
  const { companyId, username } = useAppContext();
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');
  const [level3Id, setLevel3Id] = useState('');
  const [level1Accounts, setLevel1Accounts] = useState([]);
  const [level2Accounts, setLevel2Accounts] = useState([]);
  const [level3Accounts, setLevel3Accounts] = useState([]);
  const [allLevel3Accounts, setAllLevel3Accounts] = useState([]);
  const [defaultFinishedGoods, setDefaultFinishedGoods] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const tableRef = useRef(null);
  
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
  
  // Fetch ALL Level 3 accounts for the company
  const fetchAllLevel3Accounts = async () => {
    if (!companyId) {
      setAllLevel3Accounts([]);
      return;
    }
    try {
      // First, get all level 1 accounts
      const level1Res = await fetch(`http://localhost:5000/api/accounts/level1/${companyId}`);
      if (!level1Res.ok) throw new Error('Failed to fetch Level 1 accounts');
      const level1Data = await level1Res.json();
      const allLevel3 = [];
      
      // For each level 1 account, get its level 2 accounts
      for (const level1 of level1Data) {
        const level2Res = await fetch(`http://localhost:5000/api/accounts/level2/${companyId}/${level1._id}`);
        if (!level2Res.ok) continue;
        const level2Data = await level2Res.json();
        
        // For each level 2 account, get its level 3 accounts
        for (const level2 of level2Data) {
          const level3Res = await fetch(`http://localhost:5000/api/accounts/level3/${companyId}/${level1._id}/${level2._id}`);
          if (!level3Res.ok) continue;
          const level3Data = await level3Res.json();
          if (level3Data.data) {
            allLevel3.push(...level3Data.data);
          }
        }
      }
      setAllLevel3Accounts(allLevel3);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch all Level 3 accounts'
      });
    }
  };
  
  // Fetch default finished goods with improved empty state handling
  const fetchDefaultFinishedGoods = async () => {
    if (!companyId) {
      setDefaultFinishedGoods([]);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/defaults/finishedGoods/${companyId}`);
      
      // Handle 404 responses as empty state, not error
      if (res.status === 404) {
        setDefaultFinishedGoods([]);
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch default finished goods');
      }
      const responseData = await res.json();
      
      // Handle both array and object response formats
      const finishedGoodsData = Array.isArray(responseData) ? responseData : (responseData.data || []);
      setDefaultFinishedGoods(finishedGoodsData);
      // Show info message if empty
      if (finishedGoodsData.length === 0) {
        setMessage({
          type: "info",
          text: "No default finished goods found. You can add one using the form above."
        });
      }
    } catch (err) {
      // Only show error if it's not a 404 (not found)
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
  
  // Scroll to newly added item
  useEffect(() => {
    if (newlyAddedId && tableRef.current) {
      const element = document.getElementById(`finished-row-${newlyAddedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setNewlyAddedId(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [newlyAddedId, defaultFinishedGoods]);
  
  useEffect(() => {
    fetchLevel1Accounts();
    fetchDefaultFinishedGoods();
    fetchAllLevel3Accounts();
  }, [companyId]);
  
  useEffect(() => {
    fetchLevel2Accounts();
  }, [companyId, level1Id]);
  
  useEffect(() => {
    fetchLevel3Accounts();
  }, [companyId, level1Id, level2Id]);
  
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
    if (!level1Id || !level2Id || !level3Id) {
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
      if (!selectedLevel1 || !selectedLevel2 || !selectedLevel3) {
        throw new Error("Invalid account selection");
      }
      
      // Check if this combination already exists in the database
      // Exclude the current editId if we're in edit mode
      const existingFinishedGood = defaultFinishedGoods.find(finishedGood => 
        finishedGood.level1Id === level1Id && 
        finishedGood.level2Id === level2Id && 
        finishedGood.level3Id === level3Id && 
        finishedGood._id !== editId
      );
      
      if (existingFinishedGood) {
        // If we're in edit mode and the user is trying to change to a combination that already exists
        if (editId) {
          // Delete the current record
          await fetch(`http://localhost:5000/api/defaults/finishedGoods/${editId}`, {
            method: 'DELETE'
          });
          
          // Show a message that the record was updated
          setMessage({
            type: "success",
            text: "Default finished good updated successfully!"
          });
        } else {
          // If we're adding a new record and it already exists
          throw new Error("This combination of accounts already exists as a default finished good");
        }
      }
      
      const now = new Date();
      const payload = { 
        companyId,
        level1Id: selectedLevel1._id,
        level2Id: selectedLevel2._id,
        level3Id: selectedLevel3._id,
        level1Code: selectedLevel1.code,
        level2Code: selectedLevel2.code,
        level3Code: selectedLevel3.code,
        code: `${selectedLevel1.code}${selectedLevel2.code}${selectedLevel3.code}`,
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
        ? `http://localhost:5000/api/defaults/finishedGoods/${editId}` 
        : `http://localhost:5000/api/defaults/finishedGoods`;
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
      
      // Only show success message if we haven't already shown it above
      if (!existingFinishedGood) {
        setMessage({
          type: "success",
          text: editId ? "Default finished good updated successfully!" : "Default finished good added successfully!"
        });
      }
      
      // Only reset level 3 selection and editId, keep level 1 and level 2 selections
      if (!editId) {
        setLevel3Id('');
        // Set the newly added ID to highlight it
        setNewlyAddedId(json._id || json.data?._id);
      }
      setEditId(null);
      await fetchDefaultFinishedGoods();
      await fetchAllLevel3Accounts();
      
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
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this default finished good?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/defaults/finishedGoods/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete default finished good');
        setMessage({
          type: "success",
          text: "Default finished good deleted successfully!"
        });
        fetchDefaultFinishedGoods();
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete default finished good'
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/defaults/finishedGoods/${id}/active`, {
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
      fetchDefaultFinishedGoods();
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
      
      const res = await fetch(`http://localhost:5000/api/defaults/finishedGoods/${id}/default`, {
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
      await fetchDefaultFinishedGoods();
      
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
  
  // Function to get title from level 3 account
  const getTitleFromLevel3 = (level3Id) => {
    // First try to find in the filtered level3Accounts (for the selected level 2)
    let level3Account = level3Accounts.find(a => a._id === level3Id);
    
    // If not found, try to find in all level 3 accounts
    if (!level3Account) {
      level3Account = allLevel3Accounts.find(a => a._id === level3Id);
    }
    
    return level3Account ? level3Account.title : '';
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
      `}</style>
      
      <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)]">
          <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6 flex items-center justify-center gap-2">
            <Star className="w-6 h-6" />
            Default Finished Goods
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
              <span>{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 flex-shrink-0">
<div className="grid grid-cols-1 gap-4">
  {/* First Row: Level 1 & Level 2 */}
  <div className="grid grid-cols-2 gap-4">
    {/* Level 1 */}
    <div className="flex items-center gap-2">
      <ListTree className="text-blue-500 w-4 h-4" />
      <select
        value={level1Id}
        onChange={(e) => {
          setLevel1Id(e.target.value);
          setLevel2Id('');
          setLevel3Id('');
        }}
        className={`${inputClass} w-full max-w-[550px]`} // Ensures space for 55 chars
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

    {/* Level 2 */}
    <div className="flex items-center gap-2">
      <Layers className="text-blue-500 w-4 h-4" />
      <select
        value={level2Id}
        onChange={(e) => {
          setLevel2Id(e.target.value);
          setLevel3Id('');
        }}
        className={`${inputClass} w-full max-w-[550px]`}
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
  </div>

  {/* Second Row: Level 3 */}
  <div className="flex items-center gap-2">
    <FileText className="text-blue-500 w-4 h-4" />
    <select
      value={level3Id}
      onChange={(e) => setLevel3Id(e.target.value)}
      className={`${inputClass} w-full max-w-[395px]`}
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
</div>

            
            <button
              type="submit"
              disabled={loading || !companyId || !username || !level1Id || !level2Id || !level3Id}
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
              {editId ? 'Update Default Finished Good' : 'Add as Default Finished Good'}
            </button>
          </form>
          
          {companyId ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
              {/* Table container with scrollable area */}
              <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar">
                {defaultFinishedGoods.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <th className="p-3 text-left font-semibold text-sm">Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Title</th>
                        <th className="p-3 text-left font-semibold text-sm">Active</th>
                        <th className="p-3 text-left font-semibold text-sm">Default</th>
                        <th className="p-3 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultFinishedGoods.map((item) => {
                        // Get title from level 3 account using our enhanced function
                        const displayTitle = getTitleFromLevel3(item.level3Id);
                        
                        return (
                          <tr 
                            key={item._id}
                            id={`finished-row-${item._id}`}
                            className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              newlyAddedId === item._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                            }`}
                          >
                            <td className="p-3 font-mono text-sm">{item.code}</td>
                            <td className="p-3 text-sm">{displayTitle}</td>
                            <td className="p-3">
                              <button
                                onClick={() => toggleActive(item._id, item.isActive)}
                                className={`p-1 rounded-full ${item.isActive ? 'text-green-500' : 'text-red-500'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                                title={item.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                              >
                                {item.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="p-3">
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
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {message?.type !== "error" && "No default finished goods found. Add one using the form above."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              Please select a company to view default finished goods
            </div>
          )}
        </div>
      </div>
    </>
  );
}