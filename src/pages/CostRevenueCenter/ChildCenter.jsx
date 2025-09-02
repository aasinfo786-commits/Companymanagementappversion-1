import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../contexts/AppContext";
import useInputMask from "../../hooks/useInputMask"; // Import the input mask hook
import {
    Folder,
    Save,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    Check,
    Edit,
    Trash2,
    Plus,
    Info
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ChildCenter = () => {
    const { companyId, username } = useAppContext(); // Get username from context
    const [title, handleTitleChange] = useInputMask("", "title"); // Use input mask hook for title
    const [formData, setFormData] = useState({
        parentCenterId: "",
        startDate: new Date(),
        isActive: true
    });
    const [childCenters, setChildCenters] = useState([]);
    const [parentCenters, setParentCenters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [editId, setEditId] = useState(null);
    const [childCode, setChildCode] = useState("001");
    const [newlyAddedId, setNewlyAddedId] = useState(null);
    const tableRef = useRef(null);
    
    const fetchParentCenters = async () => {
        if (!companyId) {
            setParentCenters([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/parent-centers/company/${companyId}`);
            const data = await res.json();
            if (res.ok) {
                setParentCenters(data.data || []);
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        }
    };
    
    const fetchChildCenters = async () => {
        if (!companyId) {
            setChildCenters([]);
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`http://localhost:5000/api/child-centers/company/${companyId}`);
            const data = await res.json();
            if (res.ok) {
                setChildCenters(data.data || []);
                if (data.data && data.data.length === 0) {
                    setMessage({
                        type: "info",
                        text: "No child centers found. You can add one using the form above."
                    });
                }
            } else {
                throw new Error(data.error || "Failed to fetch child centers");
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };
    
    const getNextChildCode = async (parentCenterId) => {
        if (!companyId || !parentCenterId) return "001";
        try {
            const res = await fetch(
                `http://localhost:5000/api/child-centers/last-code?companyId=${companyId}&parentCenterId=${parentCenterId}`
            );
            const data = await res.json();
            if (res.ok && data.lastCode) {
                const nextNumber = parseInt(data.lastCode) + 1;
                return nextNumber.toString().padStart(3, '0');
            }
            return "001";
        } catch (err) {
            console.error("Error fetching last child code:", err);
            return "001";
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };
    
    const handleParentCenterChange = async (e) => {
        const parentCenterId = e.target.value;
        // Only update the child code if we're not in edit mode
        if (!editId) {
            const nextCode = await getNextChildCode(parentCenterId);
            setChildCode(nextCode);
        }
        setFormData(prev => ({
            ...prev,
            parentCenterId
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyId) {
            setMessage({ type: "error", text: "Please select a company first" });
            return;
        }
        if (!username) {
            setMessage({ type: "error", text: "User information not available" });
            return;
        }
        if (!formData.parentCenterId || !title || !formData.startDate) {
            setMessage({ type: "error", text: "All fields are required" });
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = editId
                ? `http://localhost:5000/api/child-centers/${editId}`
                : "http://localhost:5000/api/child-centers";
            const method = editId ? "PUT" : "POST";
            
            const requestBody = {
                ...formData,
                title, // Use the masked title value
                companyId,
                childCode: editId ? undefined : childCode
            };
            
            // Add user tracking fields
            if (editId) {
                // For updates, only include updatedBy
                requestBody.updatedBy = username;
            } else {
                // For new records, include both createdBy and updatedBy
                requestBody.createdBy = username;
                requestBody.updatedBy = username;
            }
            
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");
            
            setMessage({
                type: "success",
                text: editId
                    ? "Child center updated successfully!"
                    : "Child center added successfully!"
            });
            
            // Reset form
            handleTitleChange({ target: { value: "" } }); // Reset title using the hook
            setFormData({
                parentCenterId: "",
                startDate: new Date(),
                isActive: true
            });
            
            // Set the newly added ID to highlight it
            if (!editId) {
                setNewlyAddedId(data._id || data.data?._id);
            }
            
            setEditId(null);
            
            // If we added a new center, get the next code for the same parent center
            if (!editId) {
                const nextCode = await getNextChildCode(formData.parentCenterId);
                setChildCode(nextCode);
            } else {
                // If we were editing, reset to default
                setChildCode("001");
            }
            
            fetchChildCenters();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };
    
    const handleEdit = (center) => {
        handleTitleChange({ target: { value: center.title } }); // Use hook to set title
        setFormData({
            parentCenterId: center.parentCenterId,
            startDate: new Date(center.startDate),
            isActive: center.isActive
        });
        setEditId(center._id);
        // Set the child code to the center's current code when editing
        setChildCode(center.childCode);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this child center?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/child-centers/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to delete child center");
            setMessage({ type: "success", text: "Child center deleted successfully" });
            fetchChildCenters();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };
    
    const toggleActive = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/child-centers/${id}/active`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    isActive: !currentStatus,
                    updatedBy: username // Only include updatedBy for status changes
                })
            });
            if (!res.ok) throw new Error("Failed to update status");
            fetchChildCenters();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
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
    }, [newlyAddedId, childCenters]);
    
    useEffect(() => {
        fetchParentCenters();
        fetchChildCenters();
    }, [companyId]);
    
    // Responsive classes
    const inputClass = "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";
    const disabledInputClass = "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed";
    
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
                    
                    .max-w-4xl {
                        max-width: 100%;
                        padding: 1rem;
                    }
                    
                    .grid-cols-1 {
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
                    
                    /* Date picker responsive styles */
                    .react-datepicker-wrapper {
                        width: 100%;
                    }
                    
                    .react-datepicker__input-container input {
                        width: 100%;
                        padding: 0.75rem;
                        border-radius: 0.75rem;
                    }
                }
            `}</style>
            
            <div className="ml-0 md:ml-64 transition-all duration-300 fixed inset-0 overflow-hidden">
                <div className="max-w-4xl mx-auto mt-6 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]">
                    <h2 className="text-xl md:text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-4 md:mb-6 flex items-center justify-center gap-2">
                        <Folder className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="truncate">Child Centers Management</span>
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
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Parent Center
                                </label>
                                <select
                                    name="parentCenterId"
                                    value={formData.parentCenterId}
                                    onChange={handleParentCenterChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select Parent Center</option>
                                    {parentCenters.map(parent => (
                                        <option key={parent._id} value={parent._id}>
                                            {parent.parentCode} - {parent.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Child Code (Small Width) */}
                            <div className="flex-1 md:flex-none md:w-24">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Child Code
                                </label>
                                <input
                                    type="text"
                                    value={childCode}
                                    className={`${disabledInputClass} w-full`}
                                    readOnly
                                    disabled
                                />
                            </div>
                            
                            {/* Title (Largest Width) */}
                            <div className="flex-1 md:flex-[2]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        name="title"
                                        value={title}
                                        onChange={handleTitleChange} // Use the masked change handler
                                        placeholder="Enter child center title"
                                        className={`${inputClass} w-full`}
                                        required
                                        maxLength={50} // Add maxLength as a fallback
                                    />
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{title.length}/50</span> {/* Character counter */}
                                </div>
                            </div>
                            
                            {/* Start Date (Medium Width) */}
                            <div className="flex-1 md:flex-[1.5]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <DatePicker
                                    selected={formData.startDate}
                                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                                    className={`${inputClass} w-full`}
                                    dateFormat="dd-MM-yyyy"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="accent-blue-500 scale-125"
                                />
                                <label>Active Status</label>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || !companyId || !username || !formData.parentCenterId || !title || !formData.startDate}
                                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition ${
                                    editId
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : editId ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Update</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>Add Child Center</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden flex-grow flex flex-col max-h-[35vh]">
                        {/* Table container with scrollable area */}
                        <div ref={tableRef} className="overflow-y-auto flex-grow custom-scrollbar responsive-table">
                            {childCenters.length > 0 ? (
                                <table className="w-full">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                            <th className="p-3 text-left font-semibold text-sm">Parent Code</th>
                                            <th className="p-3 text-left font-semibold text-sm">Child Code</th>
                                            <th className="p-3 text-left font-semibold text-sm">Title</th>
                                            <th className="p-3 text-left font-semibold text-sm">Start Date</th>
                                            <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Created By</th>
                                            <th className="p-3 text-left font-semibold text-sm hide-on-mobile">Updated By</th>
                                            <th className="p-3 text-left font-semibold text-sm">Status</th>
                                            <th className="p-3 text-right font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {childCenters.map((center) => (
                                            <tr
                                                key={center._id}
                                                id={`row-${center._id}`}
                                                className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                                    newlyAddedId === center._id ? 'highlight-row bg-green-100 dark:bg-green-900/30' : ''
                                                }`}
                                            >
                                                <td className="p-3 font-mono text-sm">{center.parentCode}</td>
                                                <td className="p-3 font-mono text-sm">{center.childCode}</td>
                                                <td className="p-3 text-sm">{center.title}</td>
                                                <td className="p-3 text-sm">
                                                    {new Date(center.startDate).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }).replace(/\//g, '-')}
                                                </td>
                                                <td className="p-3 text-sm hide-on-mobile">{center.createdBy || '-'}</td>
                                                <td className="p-3 text-sm hide-on-mobile">{center.updatedBy || '-'}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => toggleActive(center._id, center.isActive)}
                                                        className={`p-1 rounded-full ${center.isActive ? 'text-green-500' : 'text-red-500'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                                                        title={center.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                                                    >
                                                        {center.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="p-3 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(center)}
                                                        className="p-1 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(center._id)}
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
                                    {companyId 
                                        ? (message?.type !== "error" && "No child centers found. Add one using the form above.")
                                        : "Please select a company to view child centers"
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChildCenter;