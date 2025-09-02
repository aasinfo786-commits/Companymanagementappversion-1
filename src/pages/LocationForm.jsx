import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import useInputMask from "../hooks/useInputMask";
import { Building2, MapPin, Phone, BadgeCheck, ShieldCheck, ChevronDown, Factory } from "lucide-react";

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username } = useAppContext();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    locationName: "", address: "", phone: "", character: "", companyId: "",
    createdBy: username || "", updatedBy: username || "", isActive: true,
    isDefault: false, isHO: false,
  });
  
  const [locationNameValue, handleLocationNameChange, setLocationNameValue] = useInputMask("", 'locationName');
  const [addressValue, handleAddressChange, setAddressValue] = useInputMask("", 'address');
  const [phoneValue, handlePhoneChange, setPhoneValue] = useInputMask("", 'phone');
  const [characterValue, handleCharacterChange, setCharacterValue] = useInputMask("", 'character');
  
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [locationData, setLocationData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      locationName: locationNameValue, address: addressValue,
      phone: phoneValue, character: characterValue,
    }));
  }, [locationNameValue, addressValue, phoneValue, characterValue]);
  
  useEffect(() => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        createdBy: username || "",
        updatedBy: username || ""
      }));
    } else {
      setFormData(prev => ({ ...prev, updatedBy: username || "" }));
    }
  }, [username, isEditMode]);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage({ type: "error", text: "Authentication token not found. Please login." });
          return;
        }
        
        const res = await fetch("http://localhost:5000/api/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch companies");
        }
        
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch companies", error);
        setMessage({ 
          type: "error", 
          text: error.message || "Failed to load companies. Please try again." 
        });
        setTimeout(() => setMessage(null), 5000);
      }
    };
    
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage({ type: "error", text: "Authentication token not found. Please login." });
          return;
        }
        
        const res = await fetch(`http://localhost:5000/api/locations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Failed to fetch location data.");
        const data = await res.json();
        setLocationData(data);
        
        setFormData({
          ...data,
          createdBy: data.createdBy,
          updatedBy: username || ""
        });
        
        setLocationNameValue(data.locationName || "");
        setAddressValue(data.address || "");
        setPhoneValue(data.phone || "");
        setCharacterValue(data.character || "");
        
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching location:", err);
        setMessage({ type: "error", text: err.message || "Failed to load location data." });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocation();
  }, [id, isEditMode, username, 
      setLocationNameValue, setAddressValue, setPhoneValue, setCharacterValue]);
      
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name !== "createdBy" && { updatedBy: username || "" })
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.companyId) {
      setMessage({ type: "error", text: "Please select a company." });
      setIsSubmitting(false);
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "Authentication token not found. Please login." });
      setIsSubmitting(false);
      return;
    }
    
    let submissionData;
    if (isEditMode) {
      submissionData = {
        ...formData,
        createdBy: locationData?.createdBy || username,
        updatedBy: username || ""
      };
    } else {
      submissionData = {
        ...formData,
        createdBy: username || "",
        updatedBy: username || ""
      };
    }
    
    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/locations/${id}`
        : "http://localhost:5000/api/locations";
        
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...submissionData,
          phone: submissionData.phone.toString(),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Network error");
      }
      
      const successMessage = isEditMode 
        ? "Location updated successfully!" 
        : "Location added successfully!";
        
      setMessage({ type: "success", text: successMessage });
      
      if (!isEditMode) {
        setFormData({
          locationName: "", address: "", phone: "", character: "", companyId: "",
          createdBy: username || "", updatedBy: username || "", isActive: true,
          isDefault: false, isHO: false,
        });
        
        setLocationNameValue("");
        setAddressValue("");
        setPhoneValue("");
        setCharacterValue("");
        
        setLocationData(null);
        setDataLoaded(false);
      } else {
        setTimeout(() => navigate("/view_location"), 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: error.message || "Failed to save location. Try again." });
    }
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 5000);
  };
  
  const inputClass = "w-full p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-sm";
  const sectionClass = "bg-purple-50 dark:bg-gray-800 p-4 rounded-xl shadow mb-4 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-base font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2";
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-2"></div>
          <p className="text-purple-600 dark:text-purple-400 text-sm">
            {isEditMode ? "Loading location details..." : "Loading form..."}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ml-0 md:ml-64 bg-purple-50 dark:bg-gray-900 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {isEditMode ? "✏️ Edit Location" : "🧱 Add Location"}
          </h1>
          <p className="text-purple-500 dark:text-purple-400 text-sm">
            {isEditMode ? "Update location information" : "Create a new location profile"}
          </p>
        </div>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-white text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Information */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <Factory className="text-purple-600" size={16} />
                Location Information
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Location Name</label>
                  <div className="relative">
                    <Factory className="absolute left-3 top-2.5 text-purple-500" size={16} />
                    <input
                      type="text"
                      name="locationName"
                      value={locationNameValue}
                      onChange={handleLocationNameChange}
                      placeholder="Max 50 characters"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-purple-500" size={16} />
                    <input
                      type="text"
                      name="address"
                      value={addressValue}
                      onChange={handleAddressChange}
                      placeholder="Max 250 characters"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-purple-500" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      placeholder="+ followed by 16 digits"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Location Character</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 text-purple-500" size={16} />
                    <input
                      type="text"
                      name="character"
                      value={characterValue}
                      onChange={handleCharacterChange}
                      placeholder="1 character"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Company Information */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <Building2 className="text-purple-600" size={16} />
                Company Information
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-purple-500" size={16} />
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      className={`${inputClass} pl-9 appearance-none`}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id || company.companyId} value={company.companyId || company._id}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-purple-500 pointer-events-none" size={16} />
                  </div>
                </div>
                
                {/* Status Settings */}
                <h2 className={sectionTitleClass}>
                  <BadgeCheck className="text-purple-600" size={16} />
                  Status Settings
                </h2>
                <div className="space-y-2">
                  {[
                    { name: "isActive", label: "Active", icon: <BadgeCheck className="w-4 h-4 text-green-500" /> },
                    { name: "isDefault", label: "Default", icon: <BadgeCheck className="w-4 h-4 text-purple-500" /> },
                    { name: "isHO", label: "Head Office", icon: <BadgeCheck className="w-4 h-4 text-red-500" /> },
                  ].map(({ name, label, icon }) => (
                    <div key={name} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800">
                      {icon}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name={name}
                          checked={formData[name]}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <label className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
                          {label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className={sectionClass} style={{ gridColumn: "span 2" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-base flex items-center justify-center gap-2 ${isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    {isEditMode ? "Update Location" : "Submit Location"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;