import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import useInputMask from '../../hooks/useInputMask'; // Import the hook
import { 
  ListTree, 
  Layers,
  Hash, 
  FileText, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Info
} from 'lucide-react';

export default function Level4() {
  const { companyId, username } = useAppContext();
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');
  const [level3Id, setLevel3Id] = useState('');
  const [level1Accounts, setLevel1Accounts] = useState([]);
  const [level2Accounts, setLevel2Accounts] = useState([]);
  const [level3Accounts, setLevel3Accounts] = useState([]);
  
  // Use input mask hooks for form fields
  const [subcode, handleSubcodeChange, setSubcode] = useInputMask('', 'subcode5');
  const [title, handleTitleChange, setTitle] = useInputMask('', 'title');
  const [balance, handleBalanceChange, setBalance] = useInputMask(0, 'balance');
  
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAccount, setFetchingAccount] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const tableRef = useRef(null);
  
  const inputClass = "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm min-w-[280px]";
  
  // Helper function to extract ObjectId from either object or string
  const getObjectId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj._id) return obj._id;
    return '';
  };
  
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
      setData([]);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level4/${companyId}/${level1Id}/${level2Id}/${level3Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json.data || []);
      if (json.data && json.data.length === 0) {
        setMessage({
          type: "info",
          text: "No Level 4 accounts found for this combination. You can add one using the form above."
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch data'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch account details by ID for editing
  const fetchAccountDetails = async (id) => {
    setFetchingAccount(true);
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level4/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch account details');
      
      const account = json.data;
      setEditItem(account);
      setEditId(account._id);
      
      // Extract the correct ObjectId values
      const l1Id = getObjectId(account.level1Id);
      const l2Id = getObjectId(account.level2Id);
      const l3Id = getObjectId(account.level3Id);
      
      // Set the level IDs in sequence
      setLevel1Id(l1Id);
      
      // Set form fields immediately using the mask setters
      setSubcode(account.subcode);
      setTitle(account.title);
      setBalance(account.balance);
      
      // After setting level1Id, wait for level2Accounts to be populated
      // This will be handled by the useEffect below
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch account details'
      });
    } finally {
      setFetchingAccount(false);
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
  }, [newlyAddedId, data]);
  
  useEffect(() => {
    fetchLevel1Accounts();
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
  
  // Set level2Id when level2Accounts are loaded and we're in edit mode
  useEffect(() => {
    if (editItem && level1Id && level2Accounts.length > 0) {
      const l2Id = getObjectId(editItem.level2Id);
      setLevel2Id(l2Id);
    }
  }, [editItem, level1Id, level2Accounts]);
  
  // Set level3Id when level3Accounts are loaded and we're in edit mode
  useEffect(() => {
    if (editItem && level2Id && level3Accounts.length > 0) {
      const l3Id = getObjectId(editItem.level3Id);
      setLevel3Id(l3Id);
    }
  }, [editItem, level2Id, level3Accounts]);
  
  // Scroll to top when all levels are set and we're in edit mode
  useEffect(() => {
    if (editItem && level1Id && level2Id && level3Id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editItem, level1Id, level2Id, level3Id]);
  
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
    if (!level1Id) {
      setMessage({
        type: "error",
        text: "Please select a Level 1 account"
      });
      return;
    }
    if (!level2Id) {
      setMessage({
        type: "error",
        text: "Please select a Level 2 account"
      });
      return;
    }
    if (!level3Id) {
      setMessage({
        type: "error",
        text: "Please select a Level 3 account"
      });
      return;
    }
    if (subcode.length !== 5) {
      setMessage({
        type: "error",
        text: "Subcode must be a 5-digit number"
      });
      return;
    }
    setLoading(true);
    setMessage(null);
    
    // Find the selected parent accounts to get their codes
    const selectedLevel1 = level1Accounts.find(a => a._id === level1Id);
    const selectedLevel2 = level2Accounts.find(a => a._id === level2Id);
    const selectedLevel3 = level3Accounts.find(a => a._id === level3Id);
    if (!selectedLevel1 || !selectedLevel2 || !selectedLevel3) {
      setMessage({
        type: "error",
        text: "Invalid parent account selection"
      });
      setLoading(false);
      return;
    }
    
    const now = new Date();
    const payload = { 
      companyId, 
      level1Id,
      level2Id,
      level3Id,
      parentLevel1Code: selectedLevel1.code,
      parentLevel2Code: selectedLevel2.code,
      parentLevel3Code: selectedLevel3.code,
      subcode, 
      title,
      balance: parseFloat(balance),
      updatedBy: username,
      updatedAt: now
    };
    
    // Add created information for new accounts
    if (!editId) {
      payload.createdBy = username;
      payload.createdAt = now;
    }
    
    const url = editId 
      ? `http://localhost:5000/api/accounts/level4/${editId}` 
      : `http://localhost:5000/api/accounts/level4`;
    const method = editId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error occurred');
      
      setMessage({
        type: "success",
        text: editId ? "Account updated successfully!" : "Account created successfully!"
      });
      
      // Reset form
      setSubcode('');
      setTitle('');
      setBalance(0);
      setEditId(null);
      setEditItem(null);
      
      // Set the newly added ID to highlight it
      if (!editId) {
        setNewlyAddedId(json._id || json.data?._id);
      }
      
      fetchLevel4Accounts();
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
    // Fetch the account details
    fetchAccountDetails(item._id);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/accounts/level4/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete account');
        
        setMessage({
          type: "success",
          text: "Account deleted successfully!"
        });
        fetchLevel4Accounts();
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete account'
        });
      } finally {
        setLoading(false);
      }
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
      `}</style>
      
      <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)]">
          <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6 flex items-center justify-center gap-2">
            <FileText className="w-6 h-6" />
            Level 4 Chart of Accounts
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
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  {/* Level 1 */}
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <ListTree className="text-blue-500 w-4 h-4" />
      Level 1 Account
    </label>
    <select
      value={level1Id}
      onChange={(e) => {
        setLevel1Id(e.target.value);
        setLevel2Id('');
        setLevel3Id('');
      }}
      className={`${inputClass} custom-select`}
      required
      disabled={!companyId || fetchingAccount}
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
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <Layers className="text-blue-500 w-4 h-4" />
      Level 2 Account
    </label>
    <select
      value={level2Id}
      onChange={(e) => {
        setLevel2Id(e.target.value);
        setLevel3Id('');
      }}
      className={`${inputClass} custom-select`}
      required
      disabled={!level1Id || fetchingAccount}
    >
      <option value="">Select Level 2 Account</option>
      {level2Accounts.map((account) => (
        <option key={account._id} value={account._id}>
          {account.code} - {account.title}
        </option>
      ))}
    </select>
  </div>

  {/* Level 3 */}
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <Layers className="text-blue-500 w-4 h-4" />
      Level 3 Account
    </label>
    <select
      value={level3Id}
      onChange={(e) => setLevel3Id(e.target.value)}
      className={`${inputClass} custom-select`}
      required
      disabled={!level2Id || fetchingAccount}
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

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Subcode */}
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <Hash className="text-blue-500 w-4 h-4" />
      Subcode
    </label>
    <div className="relative">
      <input
        type="text"
        value={subcode}
        onChange={handleSubcodeChange}
        placeholder="00001"
        className={inputClass}
        required
        disabled={fetchingAccount}
      />
      <div className="text-xs text-gray-500 absolute right-3 top-2">
        {subcode.length}/5 digits
      </div>
    </div>
  </div>

  {/* Title */}
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <FileText className="text-blue-500 w-4 h-4" />
      Title
    </label>
    <div className="relative">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Account Title (max 50 characters)"
        className={inputClass}
        required
        disabled={fetchingAccount}
      />
      <div className="text-xs text-gray-500 absolute right-3 top-2">
        {title.length}/50
      </div>
    </div>
  </div>

  {/* Balance */}
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      Opening Balance
    </label>
    <input
      type="number"
      value={balance}
      onChange={handleBalanceChange}
      placeholder="0.00"
      step="0.01"
      min="0"
      className={inputClass}
      required
      disabled={fetchingAccount}
    />
  </div>
</div>

            
            <button
              type="submit"
              disabled={loading || !companyId || !username || !level1Id || !level2Id || !level3Id || subcode.length !== 5 || title.length === 0 || fetchingAccount}
              className={`w-full p-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md transition ${
                editId
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${loading || fetchingAccount ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading || fetchingAccount ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editId ? 'Update Account' : 'Create Account'}
            </button>
          </form>
          
          {companyId && level1Id && level2Id && level3Id ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
              {/* Table container with scrollable area */}
              <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar">
                {data.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <th className="p-3 text-left font-semibold text-sm">Subcode</th>
                        <th className="p-3 text-left font-semibold text-sm">Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Full Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Title</th>
                        <th className="p-3 text-left font-semibold text-sm">Balance</th>
                        <th className="p-3 text-left font-semibold text-sm">Created By</th>
                        <th className="p-3 text-left font-semibold text-sm">Updated By</th>
                        <th className="p-3 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => {
                        // Extract the correct ObjectId values for display
                        const parentLevel1 = level1Accounts.find(a => a._id === getObjectId(item.level1Id));
                        const parentLevel2 = level2Accounts.find(a => a._id === getObjectId(item.level2Id));
                        const parentLevel3 = level3Accounts.find(a => a._id === getObjectId(item.level3Id));
                        
                        return (
                          <tr
                            key={item._id}
                            id={`row-${item._id}`}
                            className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              newlyAddedId === item._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                            }`}
                          >
                            <td className="p-3 font-mono text-sm">{item.subcode}</td>
                            <td className="p-3 font-mono text-sm">{item.code}</td>
                            <td className="p-3 font-mono text-sm">{item.fullcode}</td>
                            <td className="p-3 text-sm">{item.title}</td>
                            <td className="p-3 font-mono text-sm">{item.balance.toFixed(2)}</td>
                            <td className="p-3 text-sm">{item.createdBy || '-'}</td>
                            <td className="p-3 text-sm">{item.updatedBy || '-'}</td>
                            <td className="p-3 flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                                title="Edit"
                                disabled={fetchingAccount}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                                title="Delete"
                                disabled={fetchingAccount}
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
                    {message?.type !== "error" && "No Level 4 accounts found for this combination. Add one using the form above."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              {!companyId 
                ? "Please select a company to view accounts" 
                : !level1Id
                ? "Please select a Level 1 account"
                : !level2Id
                ? "Please select a Level 2 account"
                : "Please select a Level 3 account to view Level 4 accounts"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}