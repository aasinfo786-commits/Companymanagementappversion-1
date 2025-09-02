import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import useInputMask from '../../hooks/useInputMask';
import { 
  ListTree, 
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

export default function Level2() {
  const { companyId, username } = useAppContext();
  const [level1Id, setLevel1Id] = useState('');
  const [level1Accounts, setLevel1Accounts] = useState([]);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const tableRef = useRef(null);
  
  // Use the input mask hook for code field (2 digits only)
  const [code, handleCodeChange, setCode] = useInputMask('', 'code');
  
  // Use the input mask hook for title field (max 50 characters)
  const [title, handleTitleChange, setTitle] = useInputMask('', 'title');
  
  // Responsive classes
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
      setData([]);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/accounts/level2/${companyId}/${level1Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
      if (json.length === 0) {
        setMessage({
          type: "info",
          text: "No Level 2 accounts found for this Level 1 account. You can add one using the form above."
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
    setLoading(true);
    setMessage(null);
    
    const now = new Date();
    const payload = { 
      companyId, 
      level1Id, 
      code, 
      title,
      updatedBy: username,
      updatedAt: now
    };
    
    // Add created information for new accounts
    if (!editId) {
      payload.createdBy = username;
      payload.createdAt = now;
    }
    
    const url = editId 
      ? `http://localhost:5000/api/accounts/level2/${editId}` 
      : `http://localhost:5000/api/accounts/level2`;
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
      setCode('');
      setTitle('');
      setEditId(null);
      
      // Set the newly added ID to highlight it
      if (!editId) {
        setNewlyAddedId(json._id || json.data?._id);
      }
      
      fetchLevel2Accounts();
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
    setCode(item.code);
    setTitle(item.title);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/accounts/level2/${id}`, {
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
        fetchLevel2Accounts();
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
        }
      `}</style>
      
      <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
        <div className="max-w-4xl mx-auto mt-6 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]">
          <h2 className="text-xl md:text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-4 md:mb-6 flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 md:w-6 md:h-6" />
            <span className="truncate">Level 2 Chart of Accounts</span>
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
            <div className="flex items-center gap-2">
              <ListTree className="text-blue-500 w-4 h-4 flex-shrink-0" />
              <select
                value={level1Id}
                onChange={(e) => setLevel1Id(e.target.value)}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="01"
                    className={inputClass}
                    required
                  />
                  <div className="text-xs text-gray-500 absolute right-3 top-3">
                    {code.length}/2 digits
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Account Title (max 50 characters)"
                    className={inputClass}
                    required
                  />
                  <div className="text-xs text-gray-500 absolute right-3 top-3">
                    {title.length}/50
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !companyId || !username || !level1Id || code.length !== 2 || title.length === 0}
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
              {editId ? 'Update Account' : 'Create Account'}
            </button>
          </form>
          
          {companyId && level1Id ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
              {/* Table container with scrollable area */}
              <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar responsive-table">
                {data.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <th className="p-3 text-left font-semibold text-sm">Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Title</th>
                        <th className="p-3 text-left font-semibold text-sm">Parent Account</th>
                        <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Created By</th>
                        <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Updated By</th>
                        <th className="p-3 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => {
                        const parentAccount = level1Accounts.find(a => a._id === item.level1Id);
                        return (
                          <tr
                            key={item._id}
                            id={`row-${item._id}`}
                            className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              newlyAddedId === item._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                            }`}
                          >
                            <td className="p-3 font-mono text-sm">{item.code}</td>
                            <td className="p-3 text-sm">{item.title}</td>
                            <td className="p-3 text-sm">
                              {parentAccount ? `${parentAccount.code} - ${parentAccount.description}` : 'N/A'}
                            </td>
                            <td className="p-3 text-sm hide-on-mobile">{item.createdBy || '-'}</td>
                            <td className="p-3 text-sm hide-on-mobile">{item.updatedBy || '-'}</td>
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
                    {message?.type !== "error" && "No Level 2 accounts found for this Level 1 account. Add one using the form above."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              {!companyId 
                ? "Please select a company to view accounts" 
                : "Please select a Level 1 account to view Level 2 accounts"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}