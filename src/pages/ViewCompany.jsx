import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Building2,
  LocateFixed,
  Phone,
  BadgeDollarSign,
  BadgeCent,
  User,
  Hash,
  Pencil,
  Trash2,
  Search,
  Plus,
  Grid,
  List,
} from "lucide-react";

const ViewCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("box"); // 'box' or 'table'
  const navigate = useNavigate();
  
  // Function to get JWT token from localStorage
  const getToken = () => localStorage.getItem("token");
  
  // Load view mode preference from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("companyViewMode");
    if (savedViewMode === "table" || savedViewMode === "box") {
      setViewMode(savedViewMode);
    }
  }, []);
  
  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("companyViewMode", viewMode);
  }, [viewMode]);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      const token = getToken();
      if (!token) {
        toast.error("You must be logged in to view companies.");
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanies(res.data);
      } catch (error) {
        console.error("Failed to fetch companies", error);
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load companies.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [navigate]);
  
  // Filter companies by name based on searchTerm (case-insensitive)
  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddCompany = () => {
    navigate("/add_company");
  };
  
  const handleEdit = (id) => {
    navigate(`/edit_company/${id}`);
  };
  
const handleDelete = (id) => {
  toast.custom((t) => (
    <div className="max-w-xs w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Are you sure you want to delete this company?
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const token = getToken();
              if (!token) {
                toast.error("You must be logged in to delete a company.");
                navigate("/login");
                return;
              }
              try {
                const response = await axios.delete(`http://localhost:5000/api/companies/${id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                if (response.status === 200) {
                  setCompanies((prev) =>
                    prev.filter((company) => company._id !== id)
                  );
                  toast.success("Company deleted successfully!");
                }
              } catch (error) {
                console.error("Failed to delete company:", error);
                if (error.response && error.response.status === 401) {
                  toast.error("Session expired. Please login again.");
                  localStorage.removeItem("token");
                  navigate("/login");
                } else if (error.response && error.response.status === 400 && error.response.data.references) {
                  // Show detailed error message about references
                  toast.error(`Cannot delete company. Referenced in: ${error.response.data.references}`);
                } else {
                  toast.error("Failed to delete the company.");
                }
              }
            }}
            className="px-4 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ));
};

  // Toggle view mode between box and table
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "box" ? "table" : "box");
  };

  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-3 md:mb-0">
            Companies Directory
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-300 py-2 px-4 rounded-lg transition-all duration-300 shadow-md border border-purple-200 dark:border-purple-700"
              title={`Switch to ${viewMode === "box" ? "Table" : "Box"} View`}
            >
              {viewMode === "box" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {viewMode === "box" ? "Table View" : "Box View"}
            </button>
            <button
              onClick={handleAddCompany}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>
        
        {/* Search Section */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-purple-500" />
            </div>
            <input
              type="text"
              placeholder="Search company by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-purple-700 dark:text-white shadow-sm transition-all duration-300"
            />
          </div>
        </div>
        
        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-3"></div>
              <p className="text-purple-600 dark:text-purple-400 font-medium">Loading companies...</p>
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 mb-3">
                <Building2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No companies found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-5">
                {searchTerm ? "No companies match your search." : "Get started by adding your first company."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddCompany}
                  className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-5 rounded-lg transition-all duration-300 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Company
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "box" ? (
          // Box View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company, idx) => (
              <div 
                key={company._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-purple-100 dark:border-purple-900 transition-all duration-300 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white text-opacity-80 text-xs mb-1">Company ID</div>
                      <div className="text-white font-bold text-lg flex items-center gap-1.5">
                        <Hash className="w-4 h-4" />
                        {company.companyId}
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-white text-xs font-medium">
                      #{idx + 1}
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1.5 mb-1">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {company.companyName}
                    </h3>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <LocateFixed className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{company.address1 || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{company.phone1 || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <BadgeDollarSign className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">STRN</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{company.strn || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <BadgeCent className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">NTN</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{company.nationalTaxNumber || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Created By</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{company.createdBy || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(company._id)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company._id)}
                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="overflow-x-auto rounded-xl shadow-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900">
            <table className="min-w-full table-auto border-collapse text-gray-700 dark:text-gray-300">
              <thead className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase text-sm font-semibold tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-left w-12">Sr#</th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-600" /> Company ID
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" /> Name
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <LocateFixed className="w-4 h-4 text-green-600" /> Address
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-500" /> Phone
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <BadgeDollarSign className="w-4 h-4 text-teal-500" /> STRN
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <BadgeCent className="w-4 h-4 text-red-500" /> NTN
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <span className="inline-flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" /> Created By
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company, idx) => (
                  <tr
                    key={company._id}
                    className="border-b border-purple-200 dark:border-purple-700 transition-colors duration-200 hover:bg-purple-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4 text-sm">{idx + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium">{company.companyId}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{company.companyName}</td>
                    <td className="py-3 px-4 text-sm">{company.address1 || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{company.phone1 || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{company.strn || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{company.nationalTaxNumber || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{company.createdBy || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(company._id)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCompany;