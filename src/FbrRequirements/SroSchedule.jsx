import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  Hash, 
  FileText, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';

export default function SroSchedule() {
  const { companyId, username, fbrToken } = useAppContext();
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingFBR, setFetchingFBR] = useState(false);
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
      const res = await fetch(`http://localhost:5000/api/sro-schedule/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
      if (json.length === 0) {
        setMessage({
          type: "info",
          text: "No SRO items found. You can add one using the form above or import from FBR."
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
  
  const fetchFBRSroItems = async () => {
    if (!companyId) {
      setMessage({
        type: "error",
        text: "Please select a company first"
      });
      return;
    }
    if (!fbrToken) {
      setMessage({
        type: "error",
        text: "FBR Token is not configured. Please set it in company settings."
      });
      return;
    }
    setFetchingFBR(true);
    setMessage(null);
    try {
      const response = await fetch('https://gw.fbr.gov.pk/pdi/v1/sroitemcode', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbrToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`FBR API Error: ${response.status} ${response.statusText}`);
      }
      const sroItems = await response.json();
      
      if (!Array.isArray(sroItems)) {
        throw new Error('Invalid response format from FBR API');
      }
      if (sroItems.length === 0) {
        throw new Error('No SRO items returned from FBR');
      }
      
      const savePromises = sroItems.map(item => {
        const payload = {
          companyId,
          sroItemId: item.srO_ITEM_ID,
          description: item.srO_ITEM_DESC,
          createdBy: username,
          updatedBy: username
        };
        return fetch('http://localhost:5000/api/sro-schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      });
      
      const results = await Promise.all(savePromises);
      
      // Set the newly added IDs for highlighting
      const newIds = results.map(result => {
        try {
          const data = JSON.parse(result);
          return data._id || data.data?._id;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      if (newIds.length > 0) {
        setNewlyAddedId(newIds[0]); // Highlight the first imported item
      }
      
      setMessage({
        type: "success",
        text: `${sroItems.length} SRO items imported successfully from FBR!`
      });
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch SRO items from FBR'
      });
      console.error('FBR Import Error:', err);
    } finally {
      setFetchingFBR(false);
    }
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
    
    const now = new Date();
    const payload = { 
      companyId, 
      sroItemId: id, 
      description,
      updatedBy: username,
      updatedAt: now
    };
    
    // Add created information for new items
    if (!editId) {
      payload.createdBy = username;
      payload.createdAt = now;
    }
    
    const url = editId 
      ? `http://localhost:5000/api/sro-schedule/${editId}` 
      : `http://localhost:5000/api/sro-schedule`;
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
        text: editId ? "SRO item updated successfully!" : "SRO item created successfully!"
      });
      
      // Reset form
      setId('');
      setDescription('');
      
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
    setId(item.sroItemId);
    setDescription(item.description);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this SRO item?')) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/sro-schedule/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete SRO item');
        
        setMessage({
          type: "success",
          text: "SRO item deleted successfully!"
        });
        fetchData();
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete SRO item'
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
          
          .grid-cols-2 {
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
            <FileText className="w-5 h-5 md:w-8 md:h-8" />
            <span className="truncate">SRO Schedule</span>
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
          
          <div className="flex justify-end mb-4">
            {fbrToken ? (
              <button
                onClick={fetchFBRSroItems}
                disabled={fetchingFBR || !companyId}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                  fetchingFBR 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {fetchingFBR ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Import from FBR
              </button>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 p-2">
                FBR integration not configured. Set FBR Token in company settings.
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="SRO Item ID"
                  className={inputClass}
                  required
                  readOnly={!!editId}
                />
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className={inputClass}
                  required
                />
              </div>
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
              {editId ? 'Update SRO Item' : 'Create SRO Item'}
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
                        <th className="p-3 text-left font-semibold text-sm">SRO Item ID</th>
                        <th className="p-3 text-left font-semibold text-sm">Description</th>
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
                          <td className="p-3 font-mono text-sm whitespace-nowrap">{item.sroItemId}</td>
                          <td className="p-3 text-sm min-w-[200px]">{item.description}</td>
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
                    {message?.type !== "error" && "No SRO items found. Add one using the form above or import from FBR."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex-grow">
              Please select a company to view SRO items
            </div>
          )}
        </div>
      </div>
    </>
  );
}