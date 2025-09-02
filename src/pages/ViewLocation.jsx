// 📁 src/pages/ViewLocation.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  LocateFixed,
  Phone,
  Pencil,
  Trash2,
  Factory,
  ShieldCheck,
  Star,
  Search,
  Hash,
  Shield,
  Plus,
  Grid,
  List,
} from "lucide-react";

const ViewLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'locationId', direction: 'ascending' });
  const [viewMode, setViewMode] = useState("box"); // 'box' or 'table'
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Load view mode preference from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("locationViewMode");
    if (savedViewMode === "table" || savedViewMode === "box") {
      setViewMode(savedViewMode);
    }
  }, []);
  
  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("locationViewMode", viewMode);
  }, [viewMode]);
  
  // Memoize axiosInstance to prevent recreation on every render
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: "http://localhost:5000/api",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }, [token]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get("/locations");
        console.log("API Response:", res.data);
        
        // Handle different possible response structures
        let locationsArray = [];
        if (Array.isArray(res.data)) {
          locationsArray = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          locationsArray = res.data.data;
        } else if (res.data?.locations && Array.isArray(res.data.locations)) {
          locationsArray = res.data.locations;
        } else {
          throw new Error("Invalid data format received from server");
        }
        
        // First sort by isDefault (default locations first)
        const sortedByDefault = locationsArray.sort((a, b) => {
          if (a.isDefault === b.isDefault) return 0;
          return a.isDefault ? -1 : 1;
        });
        
        setLocations(sortedByDefault);
      } catch (err) {
        console.error("Failed to fetch locations", err);
        if (err.response && err.response.status === 401) {
          toast.error("Unauthorized! Please log in again.");
          navigate("/login");
        } else {
          toast.error("Failed to load locations.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, [axiosInstance, navigate]);
  
  // Function to handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Apply sorting to locations
  const sortedLocations = useMemo(() => {
    const sortableLocations = [...locations];
    if (sortConfig.key) {
      sortableLocations.sort((a, b) => {
        // For isDefault, isHO, isActive - boolean comparison
        if (typeof a[sortConfig.key] === 'boolean') {
          if (a[sortConfig.key] === b[sortConfig.key]) return 0;
          return a[sortConfig.key] ? -1 : 1;
        }
        
        // For locationId - numeric comparison
        if (sortConfig.key === 'locationId') {
          const numA = parseInt(a.locationId, 10);
          const numB = parseInt(b.locationId, 10);
          return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        
        // For other fields - string comparison
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLocations;
  }, [locations, sortConfig]);

  const filteredLocations = sortedLocations.filter((location) =>
    location.locationName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLocation = () => {
    navigate("/add_location");
  };

  const handleEdit = (id) => {
    navigate(`/edit_location/${id}`);
  };

const handleDelete = (id) => {
  toast.custom((t) => (
    <div className="max-w-xs w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Are you sure you want to delete this location? This action cannot be undone.
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
              try {
                // Send DELETE request to permanently remove the location
                await axiosInstance.delete(`/locations/${id}`);
                
                // Remove the location from the state
                setLocations((prev) =>
                  prev.filter((location) => location._id !== id)
                );
                
                toast.success("Location deleted successfully!");
              } catch (error) {
                console.error("Failed to delete location:", error);
                if (error.response && error.response.status === 401) {
                  toast.error("Unauthorized! Please log in again.");
                  navigate("/login");
                } else if (error.response && error.response.data) {
                  // Try to extract the error message from the response
                  let errorMessage = "Failed to delete the location.";
                  
                  if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                  } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                  } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                  }
                  
                  toast.error(errorMessage);
                } else {
                  toast.error("Failed to delete the location.");
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

  // Function to get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-3 md:mb-0">
            Locations Directory
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
              onClick={handleAddLocation}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Location
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-purple-700 dark:text-white shadow-sm transition-all duration-300"
              placeholder="Search location by name..."
            />
          </div>
        </div>
        
        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-3"></div>
              <p className="text-purple-600 dark:text-purple-400 font-medium">Loading locations...</p>
            </div>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 mb-3">
                <Factory className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No locations found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-5">
                {locations.length === 0 ? "Get started by adding your first location." : "No locations match your search."}
              </p>
              {locations.length === 0 && (
                <button
                  onClick={handleAddLocation}
                  className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-5 rounded-lg transition-all duration-300 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Location
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "box" ? (
          // Box View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location, idx) => (
              <div 
                key={location._id || location.locationId} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-purple-100 dark:border-purple-900 transition-all duration-300 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white text-opacity-80 text-xs mb-1">Location ID</div>
                      <div className="text-white font-bold text-lg flex items-center gap-1.5">
                        <Hash className="w-4 h-4" />
                        {location.locationId ?? "N/A"}
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
                      <Factory className="w-4 h-4 text-purple-600" />
                      {location.locationName}
                    </h3>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Company</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {location.companyName || "N/A"} ({location.companyId || "N/A"})
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <LocateFixed className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{location.address || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{location.phone || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Character</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{location.character || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1">
                        <Star className={`w-3.5 h-3.5 ${location.isActive ? 'text-green-500' : 'text-gray-400'} flex-shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                          <div className="text-xs text-gray-800 dark:text-gray-200">{location.isActive ? "Yes" : "No"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className={`w-3.5 h-3.5 ${location.isDefault ? 'text-purple-500' : 'text-gray-400'} flex-shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Default</div>
                          <div className="text-xs text-gray-800 dark:text-gray-200">{location.isDefault ? "Yes" : "No"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Shield className={`w-3.5 h-3.5 ${location.isHO ? 'text-red-500' : 'text-gray-400'} flex-shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">HO</div>
                          <div className="text-xs text-gray-800 dark:text-gray-200">{location.isHO ? "Yes" : "No"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(location._id || location.locationId)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location._id || location.locationId)}
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
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('locationId')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-600" /> Location ID{getSortIndicator('locationId')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('locationName')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Factory className="w-4 h-4 text-purple-600" /> Location Name{getSortIndicator('locationName')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('companyId')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-600" /> Company ID{getSortIndicator('companyId')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('companyName')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" /> Company Name{getSortIndicator('companyName')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('address')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LocateFixed className="w-4 h-4 text-green-600" /> Address{getSortIndicator('address')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('phone')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-500" /> Phone{getSortIndicator('phone')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('character')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-500" /> Character{getSortIndicator('character')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('isActive')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-600" /> Is Active{getSortIndicator('isActive')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('isDefault')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-600" /> Is Default{getSortIndicator('isDefault')}
                    </span>
                  </th>
                  <th 
                    className="py-3 px-4 text-left cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => requestSort('isHO')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" /> Is HO{getSortIndicator('isHO')}
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((location, idx) => (
                  <tr
                    key={location._id || location.locationId}
                    className="border-b border-purple-200 dark:border-purple-700 transition-colors duration-200 hover:bg-purple-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4 text-sm">{idx + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium">{location.locationId ?? "N/A"}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{location.locationName}</td>
                    <td className="py-3 px-4 text-sm">{location.companyId || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{location.companyName || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{location.address || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{location.phone || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">{location.character || "N/A"}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${location.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {location.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${location.isDefault ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {location.isDefault ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${location.isHO ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {location.isHO ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(location._id || location.locationId)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location._id || location.locationId)}
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

export default ViewLocation;