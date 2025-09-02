import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../contexts/AppContext";
import useInputMask from "../hooks/useInputMask";
import { Calendar, CheckCircle, Edit, Hash, Layers, Save, Trash2, Building2, ChevronDown } from "lucide-react";

const FinancialYear = () => {
  const { username } = useAppContext();
  const [formData, setFormData] = useState({
    yearId: "", title: "", isDefault: false, isActive: true,
    startDate: "", endDate: "", createdBy: username || "", 
    updatedBy: username || "", companyId: "",
  });
  const [message, setMessage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [years, setYears] = useState([]);
  const [comps, setComps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  
  const [titleValue, handleTitleChange, setTitleValue] = useInputMask(formData.title, 'title');
  
  // Function to get the next year ID for a company
  const getNextYearId = async (companyId) => {
    if (!companyId) return "01";
    
    try {
      const response = await fetch(`http://localhost:5000/api/financial-years/next-year-id/${companyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to get next year ID");
      }
      
      const data = await response.json();
      return data.nextYearId;
    } catch (error) {
      console.error("Error getting next year ID:", error);
      // Fallback to client-side calculation
      const companyYears = years.filter(y => y.companyId === companyId);
      if (companyYears.length === 0) return "01";
      
      const ids = companyYears.map(y => parseInt(y.yearId, 10)).filter(id => !isNaN(id));
      const maxId = ids.length > 0 ? Math.max(...ids) : 0;
      const nextId = maxId + 1;
      return nextId < 10 ? `0${nextId}` : `${nextId}`;
    }
  };
  
  // Update yearId when companyId changes
  useEffect(() => {
    const updateYearId = async () => {
      if (!isEditMode && formData.companyId) {
        const nextYearId = await getNextYearId(formData.companyId);
        setFormData(prev => ({ ...prev, yearId: nextYearId }));
      }
    };
    
    updateYearId();
  }, [formData.companyId, isEditMode, years]);
  
  useEffect(() => setFormData(prev => ({ ...prev, title: titleValue })), [titleValue]);
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      createdBy: username || "",
      updatedBy: username || ""
    }));
  }, [username]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resComps = await fetch("http://localhost:5000/api/companies", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!resComps.ok) throw new Error("Failed to fetch companies");
        setComps(await resComps.json());
        await fetchYears();
      } catch (error) {
        console.error(error);
        setMessage({ type: "error", text: error.message || "Failed to load data" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const fetchYears = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/financial-years", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch financial years");
      }
      setYears(await res.json());
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = { ...formData, [name]: type === "checkbox" ? checked : value };
    if (name === "startDate" && newFormData.endDate && value > newFormData.endDate) {
      newFormData.endDate = value;
    }
    setFormData(newFormData);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      setMessage({ type: "error", text: "Please select a company!" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (isNaN(startDate) || isNaN(endDate)) {
      setMessage({ type: "error", text: "Invalid date format!" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    if (endDate <= startDate) {
      setMessage({ type: "error", text: "End date must be after start date!" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    try {
      setIsLoading(true);
      const url = isEditMode
        ? `http://localhost:5000/api/financial-years/${formData._id}`
        : "http://localhost:5000/api/financial-years";
      const method = isEditMode ? "PUT" : "POST";
      
      const dataToSend = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdBy: isEditMode ? (originalData?.createdBy || username) : username,
        updatedBy: username,
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Network error");
      
      setMessage({
        type: "success",
        text: isEditMode ? "Financial year updated successfully!" : "Financial year added successfully!"
      });
      await fetchYears();
      if (!isEditMode) {
        setFormData({
          yearId: "", title: "", isDefault: false, isActive: true,
          startDate: "", endDate: "", createdBy: username || "", 
          updatedBy: username || "", companyId: formData.companyId, // Keep the selected company
        });
        setTitleValue("");
        
        // Get the next year ID for the selected company
        const nextYearId = await getNextYearId(formData.companyId);
        setFormData(prev => ({ ...prev, yearId: nextYearId }));
      }
      setIsEditMode(false);
      setOriginalData(null);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: error.message || `Failed to ${isEditMode ? 'update' : 'add'} financial year. Try again.`
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };
  
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this financial year?")) return;
  try {
    setIsLoading(true);
    const res = await fetch(`http://localhost:5000/api/financial-years/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // Check if the error has detailed information about references
      if (data.details && data.details.references) {
        // Format the reference details into a readable message
        const referenceDetails = data.details.references
          .map(ref => `${ref.model}: ${ref.count} records`)
          .join(', ');
        
        throw new Error(`Cannot delete financial year. Found references in: ${referenceDetails}. ${data.details.actionRequired || ''}`);
      } else {
        // Use the error message from the backend if available
        throw new Error(data.message || data.error || "Failed to delete financial year");
      }
    }
    
    setMessage({ type: "success", text: data.message || "Financial year deleted successfully!" });
    await fetchYears();
  } catch (error) {
    console.error("Delete error:", error);
    setMessage({ 
      type: "error", 
      text: error.message || "Failed to delete financial year" 
    });
  } finally {
    setIsLoading(false);
    setTimeout(() => setMessage(null), 5000);
  }
};
  
  const handleEdit = (year) => {
    setOriginalData(year);
    const fmtDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    setFormData({
      ...year,
      startDate: fmtDate(year.startDate),
      endDate: fmtDate(year.endDate),
      companyId: year.companyId || "",
    });
    setTitleValue(year.title || "");
    setIsEditMode(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setOriginalData(null);
    setFormData({
      yearId: "", title: "", isDefault: false, isActive: true,
      startDate: "", endDate: "", createdBy: username || "", 
      updatedBy: username || "", companyId: "",
    });
    setTitleValue("");
  };
  
  const fmtDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  const getCompName = (companyId) => {
    const company = comps.find(c => c.companyId === companyId);
    return company ? company.companyName : "Unknown";
  };
  
  // Filter years by selected company for display
  const filteredYears = useMemo(() => {
    return years.filter(year => year.companyId === formData.companyId);
  }, [years, formData.companyId]);
  
  const sortedYears = useMemo(() => {
    return [...filteredYears].sort((a, b) => {
      const aId = parseInt(a.yearId, 10);
      const bId = parseInt(b.yearId, 10);
      return aId - bId;
    });
  }, [filteredYears]);
  
  const inCls = "w-full p-1 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs";
  const secCls = "bg-purple-50 dark:bg-gray-800 p-2 rounded shadow mb-2 border border-purple-100 dark:border-purple-900";
  const secTitleCls = "text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  
  return (
    <div className="ml-0 md:ml-64 bg-purple-50 dark:bg-gray-900 p-1">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            Financial Year Management
          </h1>
          <p className="text-purple-500 dark:text-purple-400 text-xs">
            {isEditMode ? "Update financial year information" : "Create a new financial year"}
          </p>
        </div>
        
        {message && (
          <div className={`mb-2 p-1 rounded text-white text-xs ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className={secCls}>
            <h2 className={secTitleCls}>
              <Building2 className="text-purple-600" size={12} />
              Company Information
            </h2>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Company</label>
              <div className="relative">
                <Building2 className="absolute left-1 top-1 text-purple-500" size={12} />
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                  className={`${inCls} pl-6 appearance-none ${isEditMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Company</option>
                  {comps.map((company) => (
                    <option key={company._id} value={company.companyId}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1 text-purple-500 pointer-events-none" size={12} />
              </div>
            </div>
          </div>
          
          <div className={secCls}>
            <h2 className={secTitleCls}>
              <Calendar className="text-purple-600" size={12} />
              Financial Year Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Year ID</label>
                <div className="relative">
                  <Hash className="absolute left-1 top-1 text-purple-500" size={12} />
                  <input
                    type="text"
                    name="yearId"
                    value={formData.yearId}
                    readOnly
                    className={`${inCls} pl-6 bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Title</label>
                <div className="relative">
                  <Layers className="absolute left-1 top-1 text-purple-500" size={12} />
                  <input
                    type="text"
                    name="title"
                    value={titleValue}
                    onChange={handleTitleChange}
                    className={`${inCls} pl-6`}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-1 top-1 text-purple-500" size={12} />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`${inCls} pl-6`}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-1 top-1 text-purple-500" size={12} />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    className={`${inCls} pl-6`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className={secCls}>
            <h2 className={secTitleCls}>
              <CheckCircle className="text-purple-600" size={12} />
              Status Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {[
                { name: "isDefault", label: "Is Default", icon: <CheckCircle className="w-3 h-3 text-purple-500" /> },
                { name: "isActive", label: "Is Active", icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
              ].map(({ name, label, icon }) => (
                <div key={name} className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded border border-purple-100 dark:border-purple-800">
                  {icon}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="h-3 w-3 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700 text-xs"
              >
                Cancel
              </button>
            )}
            <div className={isEditMode ? "" : "ml-auto"}>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex gap-1 items-center px-3 py-1 rounded text-white text-xs ${isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                <Save size={12} />
                {isEditMode ? "Update" : "Add"} Financial Year
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-4">
          <h2 className="text-md font-bold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1">
            <Calendar className="text-purple-600" size={12} />
            Financial Years for {getCompName(formData.companyId) || "Selected Company"}
          </h2>
          
          <div className="overflow-x-auto rounded shadow border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900">
            <table className="min-w-full text-xs">
              <thead className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                <tr>
                  <th className="py-1 px-1 text-left">ID</th>
                  <th className="py-1 px-1 text-left">Title</th>
                  <th className="py-1 px-1 text-left">Start</th>
                  <th className="py-1 px-1 text-left">End</th>
                  <th className="py-1 px-1 text-left">Default</th>
                  <th className="py-1 px-1 text-left">Active</th>
                  <th className="py-1 px-1 text-left">Created</th>
                  <th className="py-1 px-1 text-left">Updated</th>
                  <th className="py-1 px-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedYears.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-2 text-center text-gray-500 dark:text-gray-400">
                      No financial years found for this company.
                    </td>
                  </tr>
                ) : (
                  sortedYears.map((year) => (
                    <tr key={year._id} className="border-b border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-gray-800">
                      <td className="py-1 px-1">{year.yearId}</td>
                      <td className="py-1 px-1 font-medium">{year.title}</td>
                      <td className="py-1 px-1">{fmtDate(year.startDate)}</td>
                      <td className="py-1 px-1">{fmtDate(year.endDate)}</td>
                      <td className="py-1 px-1">
                        <span className={`px-1 py-0.5 rounded text-xs ${year.isDefault ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {year.isDefault ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-1 px-1">
                        <span className={`px-1 py-0.5 rounded text-xs ${year.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {year.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-1 px-1">{year.createdBy}</td>
                      <td className="py-1 px-1">{year.updatedBy}</td>
                      <td className="py-1 px-1">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEdit(year)}
                            className="p-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={() => handleDelete(year._id)}
                            className="p-0.5 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
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

export default FinancialYear;