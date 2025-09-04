import { useState, useEffect } from "react";
import {
  UserCircle, User, Lock, Image, Shield, CheckCircle, XCircle,
  Loader2, Building, MapPin, Calendar
} from "lucide-react";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    userFullName: "",
    role: "user",
    password: "",
    userPicture: null,
    isAllowed: true,
    companyId: "",
    locationId: "",
    financialYearId: "",
  });
  
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [isLoading, setIsLoading] = useState({
    companies: true,
    locations: false,
    financialYears: false
  });
  const [message, setMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasNumber: false,
    hasLetter: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });
  
  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(prev => ({ ...prev, companies: true }));
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch companies");
        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, companies: false }));
      }
    };
    
    fetchCompanies();
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
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();
        setLocations(data);
        setFinancialYears([]);
        setFormData(prev => ({ ...prev, locationId: "", financialYearId: "" }));
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, locations: false }));
      }
    };
    fetchLocations();
  }, [formData.companyId]);
  
  // Fetch financial years when location changes
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
        if (!res.ok) throw new Error("Failed to fetch financial years");
        const data = await res.json();
        setFinancialYears(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, financialYears: false }));
      }
    };
    fetchFinancialYears();
  }, [formData.companyId, formData.locationId]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "password") {
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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    if (!formData.password) {
      setMessage({ type: "error", text: "Password is required." });
      setIsSubmitting(false);
      return;
    }
    if (!formData.companyId || !formData.locationId || !formData.financialYearId) {
      setMessage({ type: "error", text: "Please select all dropdown fields." });
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
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username.trim());
      formDataToSend.append("userFullName", formData.userFullName.trim());
      formDataToSend.append("role", formData.role);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("isAllowed", formData.isAllowed);
      formDataToSend.append("companyId", formData.companyId);
      formDataToSend.append("locationId", formData.locationId);
      formDataToSend.append("financialYearId", formData.financialYearId);
      
      if (formData.userPicture) {
        formDataToSend.append("userPicture", formData.userPicture, formData.userPicture.name);
      }
      
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
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
        throw new Error(result.message || "Failed to create user.");
      }
      
      setMessage({ type: "success", text: result.message || "User created successfully!" });
      
      // Reset form
      setFormData({
        username: "",
        userFullName: "",
        role: "user",
        password: "",
        userPicture: null,
        isAllowed: true,
        companyId: "",
        locationId: "",
        financialYearId: "",
      });
      setPreviewImage(null);
      setPasswordRequirements({
        hasNumber: false,
        hasLetter: false,
        hasSpecialChar: false,
        hasMinLength: false,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage({
        type: "error",
        text: error?.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check your backend."
          : error?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const inputClass =
    "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";
    
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300">
      <div className="max-w-5xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-6 font-semibold text-center text-gray-700 dark:text-white">
          Add User Form
        </h2>
        {message && (
          <div
            className={`mb-4 p-3 text-center rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
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
                  <option key={fy._id.$oid || fy._id} value={fy.yearId}>
                    {fy.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Password */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2"
              >
                <Lock size={16} /> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password (min 6 characters)"
                className={`${inputClass} w-full`}
                minLength="6"
              />
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
                <span className="truncate">{formData.userPicture ? formData.userPicture.name : "Choose an image"}</span>
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
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex gap-2 items-center px-5 py-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition disabled:opacity-60 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  <User size={16} />
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;