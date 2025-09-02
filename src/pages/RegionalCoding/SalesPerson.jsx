import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  UserRound,
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Hash,
  FileText,
  Info
} from 'lucide-react';

export default function SalesPerson() {
  const { companyId, username } = useAppContext();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(true);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const tableRef = useRef(null);
  
  const inputClass = "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";
  
  const fetchData = async () => {
    if (!companyId) {
      setData([]);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/sales-persons/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
      if (json.length === 0) {
        setMessage({
          type: "info",
          text: "No sales persons found. You can add one using the form above."
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
  
  useEffect(() => {
    fetchData();
  }, [companyId]);
  
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
  
  const generateNextCode = () => {
    if (data.length === 0) return '01';
    const lastCode = data[data.length - 1].code;
    const nextNum = parseInt(lastCode) + 1;
    return nextNum.toString().padStart(2, '0');
  };
  
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
    
    setLoading(true);
    setMessage(null);
    
    const salesPersonCode = editId ? code : generateNextCode();
    const now = new Date();
    const payload = { 
      companyId, 
      code: salesPersonCode, 
      name, 
      status,
      updatedBy: username,
      updatedAt: now
    };
    
    // Add created information for new sales persons
    if (!editId) {
      payload.createdBy = username;
      payload.createdAt = now;
    }
    
    const url = editId 
      ? `http://localhost:5000/api/sales-persons/${editId}` 
      : `http://localhost:5000/api/sales-persons`;
    const method = editId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error occurred');
      
      setMessage({
        type: "success",
        text: editId ? "Sales Person updated successfully!" : "Sales Person created successfully!"
      });
      
      // Reset form
      setCode('');
      setName('');
      setStatus(true);
      
      // Set the newly added ID to highlight it
      if (!editId) {
        setNewlyAddedId(json._id || json.data?._id);
      }
      
      setEditId(null);
      fetchData();
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
    setCode(item.code);
    setName(item.name);
    setStatus(item.status);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales person?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/sales-persons/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete sales person');
        
        setMessage({
          type: "success",
          text: "Sales Person deleted successfully!"
        });
        fetchData();
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete sales person'
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/sales-persons/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: !currentStatus,
          updatedBy: username,
          updatedAt: new Date()
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      
      setMessage({
        type: "success",
        text: "Status updated successfully!"
      });
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to update status'
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
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ml-0.md\\:ml-64 {
            margin-left: 0 !important;
          }
          
          .h-\\[calc\\(100vh-3rem\\)\\] {
            height: calc(100vh - 5rem);
          }
          
          .max-w-5xl {
            max-width: 100%;
            padding: 1rem;
          }
          
          .grid-cols-1 {
            grid-template-columns: 1fr;
          }
          
          .grid-cols-3 {
            grid-template-columns: 1fr;
          }
          
          .text-3xl {
            font-size: 1.5rem;
          }
          
          .p-4 {
            padding: 0.5rem;
          }
          
          .px-4 {
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
          
          /* Adjust button size on mobile */
          .mobile-button {
            width: 100%;
            margin-top: 0.5rem;
          }
        }
      `}</style>
      
      <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
        <div className="max-w-5xl mx-auto mt-6 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)]">
          <h2 className="text-xl md:text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-4 md:mb-6 flex items-center justify-center gap-2">
            <UserRound className="w-5 h-5 md:w-8 md:h-8" />
            <span className="truncate">Sales Person Management</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={editId ? code : generateNextCode()}
                  className={inputClass}
                  readOnly
                  required
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sales Person Name"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="status"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
            <button
              type="submit"
              disabled={loading || !companyId || !username}
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
              {editId ? 'Update Sales Person' : 'Create Sales Person'}
            </button>
          </form>
          
          {companyId ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
              {/* Table container with scrollable area */}
              <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar responsive-table">
                {data.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <th className="p-3 text-left font-semibold text-sm">Code</th>
                        <th className="p-3 text-left font-semibold text-sm">Name</th>
                        <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Status</th>
                        <th className="p-3 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr
                          key={item._id}
                          id={`row-${item._id}`}
                          className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            newlyAddedId === item._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                          }`}
                        >
                          <td className="p-3 font-mono text-sm">{item.code}</td>
                          <td className="p-3 text-sm">{item.name}</td>
                          <td className="p-3 text-sm hide-on-mobile">
                            <span 
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.status 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {item.status ? 'Active' : 'Inactive'}
                            </span>
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
                              onClick={() => toggleStatus(item._id, item.status)}
                              className="p-1 rounded-full text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700"
                              title={item.status ? 'Deactivate' : 'Activate'}
                            >
                              {item.status ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
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
                    {message?.type !== "error" && "No sales persons found. Add one using the form above."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              Please select a company to view sales persons
            </div>
          )}
        </div>
      </div>
    </>
  );
}