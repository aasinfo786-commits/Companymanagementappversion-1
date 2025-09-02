// 📁 src/pages/EditUserForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserCircle,
  User,
  Lock,
  Image,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Building,
  MapPin,
  Calendar,
  ArrowLeft,
  Eye,
  EyeOff,
  Menu
} from "lucide-react";

const EditUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    userFullName: "",
    role: "user",
    userPicture: null,
    isAllowed: true,
    companyId: "",
    locationId: "",
    financialYearId: "",
    accessibleMenus: [], // New field for menu permissions
    // Password fields
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [menus, setMenus] = useState([]); // New state for menus
  const [isLoading, setIsLoading] = useState({
    user: true,
    companies: true,
    locations: false,
    financialYears: false,
    menus: true // New loading state for menus
  });
  const [message, setMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImage, setExistingImage] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasNumber: false,
    hasLetter: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });
  const [changePassword, setChangePassword] = useState(false);
  
  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(prev => ({ ...prev, user: true }));
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch user");
        }
        const userData = await res.json();
        
        // Set form data with user data
        setFormData({
          username: userData.username,
          userFullName: userData.userFullName,
          role: userData.role,
          isAllowed: userData.isAllowed,
          companyId: userData.companyId || "",
          locationId: userData.locationId || "",
          financialYearId: userData.financialYearId || "",
          accessibleMenus: userData.accessibleMenus ? userData.accessibleMenus.map(menu => menu._id) : [], // Set accessible menus
          // Initialize password fields as empty
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        // Set existing image if available
        if (userData.userPicture) {
          setExistingImage(`http://localhost:5000${userData.userPicture}`);
          setPreviewImage(`http://localhost:5000${userData.userPicture}`);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, user: false }));
      }
    };
    
    fetchUser();
  }, [id]);
  
  // Fetch companies and menus on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(prev => ({ ...prev, companies: true }));
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch companies");
        }
        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, companies: false }));
      }
    };
    
    const fetchMenus = async () => {
      try {
        setIsLoading(prev => ({ ...prev, menus: true }));
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/menus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch menus");
        }
        const data = await res.json();
        setMenus(data);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, menus: false }));
      }
    };
    
    fetchCompanies();
    fetchMenus();
  }, []);
  
  // Fetch locations when company changes
  useEffect(() => {
    if (!formData.companyId) {
      setLocations([]);
      setFinancialYears([]);
      setFormData(prev => ({ ...prev, locationId: "", financialYearId: "" }));
      return;
    }
    const fetchLocations = async () => {
      try {
        setIsLoading(prev => ({ ...prev, locations: true }));
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/locations?companyId=${formData.companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch locations");
        }
        const data = await res.json();
        setLocations(data);
        setFinancialYears([]);
        // Don't reset locationId if it's already set and exists in the new list
        if (!data.some(loc => loc.locationId === formData.locationId)) {
          setFormData(prev => ({ ...prev, locationId: "", financialYearId: "" }));
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, locations: false }));
      }
    };
    fetchLocations();
  }, [formData.companyId]);
  
  // Fetch financial years when location changes OR when user data is loaded
  useEffect(() => {
    if (!formData.companyId || !formData.locationId) {
      setFinancialYears([]);
      setFormData(prev => ({ ...prev, financialYearId: "" }));
      return;
    }
    
    const fetchFinancialYears = async () => {
      try {
        setIsLoading(prev => ({ ...prev, financialYears: true }));
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/financial-years?companyId=${formData.companyId}&locationId=${formData.locationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch financial years");
        }
        const data = await res.json();
        setFinancialYears(data);
        // Don't reset financialYearId if it's already set and exists in the new list
        if (!data.some(fy => fy.yearId === formData.financialYearId)) {
          setFormData(prev => ({ ...prev, financialYearId: "" }));
        }
      } catch (err) {
        console.error("Error fetching financial years:", err);
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, financialYears: false }));
      }
    };
    fetchFinancialYears();
  }, [formData.companyId, formData.locationId]);
  
  // Additional useEffect to fetch financial years when user data is loaded
  useEffect(() => {
    if (!isLoading.user && formData.companyId && formData.locationId && financialYears.length === 0) {
      const fetchFinancialYears = async () => {
        try {
          setIsLoading(prev => ({ ...prev, financialYears: true }));
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/api/financial-years?companyId=${formData.companyId}&locationId=${formData.locationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch financial years");
          }
          const data = await res.json();
          setFinancialYears(data);
        } catch (err) {
          console.error("Error fetching financial years:", err);
          setMessage({ type: "error", text: err.message });
        } finally {
          setIsLoading(prev => ({ ...prev, financialYears: false }));
        }
      };
      fetchFinancialYears();
    }
  }, [isLoading.user, formData.companyId, formData.locationId, financialYears.length]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "newPassword") {
      const hasNumber = /\d/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 6;
      setPasswordRequirements({
        hasNumber,
        hasLetter,
        hasSpecialChar,
        hasMinLength,
      });
    }
    
    // Handle menu selection
    if (name === "accessibleMenus") {
      const menuId = value;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          accessibleMenus: [...prev.accessibleMenus, menuId]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          accessibleMenus: prev.accessibleMenus.filter(id => id !== menuId)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Only image files are allowed." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 5MB." });
      return;
    }
    setFormData(prev => ({ ...prev, userPicture: file }));
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    // Basic Validation
    if (!formData.username.trim()) {
      setMessage({ type: "error", text: "Username is required." });
      setIsSubmitting(false);
      return;
    }
    if (!formData.userFullName.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      setIsSubmitting(false);
      return;
    }
    
    // Password validation if password change is requested
    if (changePassword) {
      if (!formData.oldPassword) {
        setMessage({ type: "error", text: "Old password is required to change password." });
        setIsSubmitting(false);
        return;
      }
      if (!formData.newPassword) {
        setMessage({ type: "error", text: "New password is required." });
        setIsSubmitting(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "New password and confirm password do not match." });
        setIsSubmitting(false);
        return;
      }
      if (!passwordRequirements.hasMinLength) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        setIsSubmitting(false);
        return;
      }
      if (
        !passwordRequirements.hasNumber ||
        !passwordRequirements.hasLetter ||
        !passwordRequirements.hasSpecialChar
      ) {
        setMessage({
          type: "error",
          text: "Password must include number, letter, and special character.",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username.trim());
      formDataToSend.append("userFullName", formData.userFullName.trim());
      formDataToSend.append("role", formData.role);
      formDataToSend.append("isAllowed", formData.isAllowed);
      formDataToSend.append("companyId", formData.companyId);
      formDataToSend.append("locationId", formData.locationId);
      formDataToSend.append("financialYearId", formData.financialYearId);
      
      // Add accessible menus to form data
      formData.accessibleMenus.forEach(menuId => {
        formDataToSend.append("accessibleMenus", menuId);
      });
      
      // Add password fields if password change is requested
      if (changePassword) {
        formDataToSend.append("oldPassword", formData.oldPassword);
        formDataToSend.append("newPassword", formData.newPassword);
      }
      
      if (formData.userPicture) {
        formDataToSend.append("userPicture", formData.userPicture, formData.userPicture.name);
      }
      
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      const contentType = response.headers.get("content-type");
      let result = null;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Server returned an unexpected response.");
      }
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to update user.");
      }
      
      setMessage({ type: "success", text: result.message || "User updated successfully!" });
      
      // Navigate back to users list after successful update
      setTimeout(() => {
        navigate("/users");
      }, 1500);
      
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({
        type: "error",
        text:
          error?.message === "Failed to fetch"
            ? "Cannot connect to the server. Please check your backend."
            : error?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    navigate("/users");
  };
  
  const inputClass =
    "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";
    
  // Helper function to get company name for display
  const getCompanyName = (id) => {
    const company = companies.find(c => c.companyId === id);
    return company ? company.companyName : "";
  };
  
  // Helper function to get location name for display
  const getLocationName = (id) => {
    const location = locations.find(l => l.locationId === id);
    return location ? location.locationName : "";
  };
  
  // Helper function to get financial year title for display
  const getFinancialYearTitle = (id) => {
    const fy = financialYears.find(f => f.yearId === id);
    return fy ? fy.title : "";
  };
  
  // Recursive function to render menu checkboxes
  const renderMenuCheckboxes = (menuItems, level = 0) => {
    return menuItems.map((menu) => (
      <div key={menu._id} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 py-1">
          <input
            type="checkbox"
            id={`menu-${menu._id}`}
            name="accessibleMenus"
            value={menu._id}
            checked={formData.accessibleMenus.includes(menu._id)}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`menu-${menu._id}`} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
            {menu.title}
          </label>
        </div>
        {menu.children && menu.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            {renderMenuCheckboxes(menu.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  if (isLoading.user) {
    return (
      <div className="ml-0 md:ml-64 transition-all duration-300 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300">
      <div className="max-w-5xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white">
            Edit User
          </h2>
        </div>
        
        {message && (
          <div
            className={`mb-4 p-3 text-center rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
          >
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            {/* Username */}
            <div className="col-span-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <User size={16} /> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Username"
                className={`${inputClass} w-full`}
              />
            </div>
            
            {/* Full Name */}
            <div className="col-span-1">
              <label
                htmlFor="userFullName"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <UserCircle size={16} /> Full Name
              </label>
              <input
                type="text"
                id="userFullName"
                name="userFullName"
                value={formData.userFullName}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className={`${inputClass} w-full`}
              />
            </div>
            
            {/* Role */}
            <div className="col-span-1">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Shield size={16} /> Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={`${inputClass} w-full`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Company Dropdown */}
            <div className="col-span-1">
              <label
                htmlFor="companyId"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Building size={16} /> Company
              </label>
              <select
                id="companyId"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                required
                className={`${inputClass} w-full`}
                disabled={isLoading.companies}
              >
                <option value="">{isLoading.companies ? "Loading companies..." : "Select Company"}</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Location Dropdown */}
            <div className="col-span-1">
              <label
                htmlFor="locationId"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <MapPin size={16} /> Location
              </label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                className={`${inputClass} w-full`}
                disabled={!formData.companyId || isLoading.locations}
              >
                <option value="">
                  {isLoading.locations
                    ? "Loading locations..."
                    : Array.isArray(locations) && locations.length === 0
                      ? "No locations available"
                      : "Select Location"}
                </option>
                {Array.isArray(locations) ? (
                  locations.map((location) => (
                    <option key={location.locationId} value={location.locationId}>
                      {location.locationName}
                    </option>
                  ))
                ) : (
                  <option disabled>Locations data unavailable</option>
                )}
              </select>
            </div>
            
            {/* Financial Year Dropdown */}
            <div className="col-span-1">
              <label
                htmlFor="financialYearId"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Calendar size={16} /> Financial Year
              </label>
              <select
                id="financialYearId"
                name="financialYearId"
                value={formData.financialYearId}
                onChange={handleChange}
                required
                className={`${inputClass} w-full`}
                disabled={!formData.locationId || isLoading.financialYears}
              >
                <option value="">
                  {isLoading.financialYears
                    ? "Loading financial years..."
                    : financialYears.length === 0
                      ? "No financial years available"
                      : "Select Financial Year"}
                </option>
                {financialYears.map((fy) => (
                  <option key={fy._id || fy.yearId} value={fy.yearId}>
                    {fy.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* User Picture */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="userPicture"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Image size={16} /> User Picture (optional)
              </label>
              <input
                type="file"
                id="userPicture"
                name="userPicture"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="userPicture"
                className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
              >
                <Image size={16} />
                <span className="truncate">
                  {formData.userPicture ? formData.userPicture.name : "Choose a new image"}
                </span>
              </label>
              {previewImage && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
            
            {/* Menu Permissions */}
            <div className="col-span-1 md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Menu size={16} /> Menu Permissions
              </label>
              <div className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 max-h-60 overflow-y-auto">
                {isLoading.menus ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
                    <span className="ml-2 text-gray-500 dark:text-gray-400">Loading menus...</span>
                  </div>
                ) : menus.length > 0 ? (
                  renderMenuCheckboxes(menus)
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No menus available</p>
                )}
              </div>
            </div>
            
            {/* Is Allowed */}
            <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isAllowed"
                name="isAllowed"
                checked={formData.isAllowed}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAllowed" className="text-sm text-gray-700 dark:text-gray-300 select-none">
                Allowed to Login
              </label>
            </div>
            
            {/* Password Change Section */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="changePassword" className="text-sm text-gray-700 dark:text-gray-300 select-none">
                  Change Password
                </label>
              </div>
              
              {changePassword && (
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {/* Old Password */}
                  <div className="col-span-1">
                    <label
                      htmlFor="oldPassword"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
                    >
                      <Lock size={16} /> Old Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required={changePassword}
                        placeholder="Enter old password"
                        className={`${inputClass} w-full pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={() => togglePasswordVisibility('old')}
                      >
                        {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* New Password */}
                  <div className="col-span-1">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
                    >
                      <Lock size={16} /> New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required={changePassword}
                        placeholder="Enter new password"
                        className={`${inputClass} w-full pr-10`}
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {/* Password requirements */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        {passwordRequirements.hasNumber ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasNumber ? "text-green-500" : "text-red-500"}>
                          Contains number
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordRequirements.hasLetter ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasLetter ? "text-green-500" : "text-red-500"}>
                          Contains letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordRequirements.hasSpecialChar ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                          Contains special char
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordRequirements.hasMinLength ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasMinLength ? "text-green-500" : "text-red-500"}>
                          Min 6 characters
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="col-span-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
                    >
                      <Lock size={16} /> Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={changePassword}
                        placeholder="Confirm new password"
                        className={`${inputClass} w-full pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex gap-2 items-center px-5 py-2.5 bg-gray-500 rounded-full text-white hover:bg-gray-600 transition text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex gap-2 items-center px-5 py-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition disabled:opacity-60 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Updating...
                </>
              ) : (
                <>
                  <User size={16} />
                  Update User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;