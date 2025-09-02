import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import useInputMask from "../hooks/useInputMask";
import { Building2, MapPin, Phone, FileText, ShieldCheck, ChevronDown, Key } from "lucide-react";

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyId, username } = useAppContext();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    companyId: "", companyName: "", address1: "", address2: "", province: "",
    phone1: "", phone2: "", nationalTaxNumber: "", strn: "", fbrToken: "",
    createdBy: username || "", updatedBy: username || "", isActive: true,
  });
  
  const [companyIdValue, handleCompanyIdChange, setCompanyIdValue] = useInputMask("", 'companyId');
  const [companyNameValue, handleCompanyNameChange, setCompanyNameValue] = useInputMask("", 'companyName');
  const [address1Value, handleAddress1Change, setAddress1Value] = useInputMask("", 'address');
  const [address2Value, handleAddress2Change, setAddress2Value] = useInputMask("", 'address');
  const [phone1Value, handlePhone1Change, setPhone1Value] = useInputMask("", 'phone');
  const [phone2Value, handlePhone2Change, setPhone2Value] = useInputMask("", 'phone');
  const [nationalTaxNumberValue, handleNationalTaxNumberChange, setNationalTaxNumberValue] = useInputMask("", 'taxNumber');
  const [strnValue, handleStrnChange, setStrnValue] = useInputMask("", 'taxNumber');
  
  const [provinces, setProvinces] = useState([]);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [companyData, setCompanyData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      companyId: companyIdValue, companyName: companyNameValue, address1: address1Value,
      address2: address2Value, phone1: phone1Value, phone2: phone2Value,
      nationalTaxNumber: nationalTaxNumberValue, strn: strnValue,
    }));
  }, [companyIdValue, companyNameValue, address1Value, address2Value, 
      phone1Value, phone2Value, nationalTaxNumberValue, strnValue]);
      
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
    const fetchProvinces = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/provinces/${companyId}`);
        if (!res.ok) throw new Error('Failed to fetch provinces');
        setProvinces(await res.json());
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setMessage({ type: "error", text: "Failed to load provinces" });
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, [companyId]);
  
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage({ type: "error", text: "Authentication token not found. Please login." });
          return;
        }
        
        const res = await fetch(`http://localhost:5000/api/companies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Failed to fetch company data.");
        const data = await res.json();
        setCompanyData(data);
        
        setFormData({
          ...data,
          province: "",
          createdBy: data.createdBy,
          updatedBy: username || ""
        });
        
        setCompanyIdValue(data.companyId || "");
        setCompanyNameValue(data.companyName || "");
        setAddress1Value(data.address1 || "");
        setAddress2Value(data.address2 || "");
        setPhone1Value(data.phone1 || "");
        setPhone2Value(data.phone2 || "");
        setNationalTaxNumberValue(data.nationalTaxNumber || "");
        setStrnValue(data.strn || "");
        
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching company:", err);
        setMessage({ type: "error", text: err.message || "Failed to load company data." });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [id, isEditMode, username, 
      setCompanyIdValue, setCompanyNameValue, setAddress1Value, setAddress2Value,
      setPhone1Value, setPhone2Value, setNationalTaxNumberValue, setStrnValue]);
      
  useEffect(() => {
    if (!companyData || !provinces.length || !dataLoaded) return;
    
    const formattedProvince = provinces.find(p => p.code === companyData.provinceCode);
    
    if (formattedProvince) {
      setFormData(prev => ({
        ...prev,
        province: `${formattedProvince.code} - ${formattedProvince.title}`
      }));
    }
  }, [companyData, provinces, dataLoaded]);
  
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
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "Authentication token not found. Please login." });
      return;
    }
    
    let submissionData;
    if (isEditMode) {
      submissionData = {
        ...formData,
        createdBy: companyData?.createdBy || username,
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
        ? `http://localhost:5000/api/companies/${id}`
        : "http://localhost:5000/api/companies";
        
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Network error");
      }
      
      const successMessage = isEditMode 
        ? "Company updated successfully!" 
        : "Company added successfully!";
        
      setMessage({ type: "success", text: successMessage });
      
      if (!isEditMode) {
        setFormData({
          companyId: "", companyName: "", address1: "", address2: "", province: "",
          phone1: "", phone2: "", nationalTaxNumber: "", strn: "", fbrToken: "",
          createdBy: username || "", updatedBy: username || "", isActive: true,
        });
        
        setCompanyIdValue("");
        setCompanyNameValue("");
        setAddress1Value("");
        setAddress2Value("");
        setPhone1Value("");
        setPhone2Value("");
        setNationalTaxNumberValue("");
        setStrnValue("");
        
        setCompanyData(null);
        setDataLoaded(false);
      } else {
        setTimeout(() => navigate("/view_company"), 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: error.message || "Failed to save company. Try again." });
    }
    setTimeout(() => setMessage(null), 5000);
  };
  
  const inCls = "w-full p-1 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs";
  const secCls = "bg-purple-50 dark:bg-gray-800 p-2 rounded shadow mb-1 border border-purple-100 dark:border-purple-900";
  const secTitleCls = "text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  
  if (loading) {
    return (
      <div className="flex items-center justify-center  bg-purple-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mb-1"></div>
          <p className="text-purple-600 dark:text-purple-400 text-xs">
            {isEditMode ? "Loading company details..." : "Loading form..."}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ml-0 md:ml-64 bg-purple-50 dark:bg-gray-900  p-1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
            {isEditMode ? "Edit Company" : "Add Company"}
          </h1>
          <p className="text-purple-500 dark:text-purple-400 text-xs">
            {isEditMode ? "Update company information" : "Create a new company profile"}
          </p>
        </div>
        
        {message && (
          <div className={`mb-1 p-1 rounded text-white text-xs ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {/* Company Information */}
            <div className={secCls}>
              <h2 className={secTitleCls}>
                <Building2 className="text-purple-600" size={10} />
                Company Information
              </h2>
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Company ID</label>
                  <div className="relative">
                    <Building2 className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="companyId"
                      value={companyIdValue}
                      onChange={handleCompanyIdChange}
                      placeholder="2 digits"
                      className={`${inCls} pl-5`}
                      required
                      disabled={isEditMode}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="companyName"
                      value={companyNameValue}
                      onChange={handleCompanyNameChange}
                      placeholder="Max 100 characters"
                      className={`${inCls} pl-5`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className={secCls}>
              <h2 className={secTitleCls}>
                <MapPin className="text-purple-600" size={10} />
                Address Information
              </h2>
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Address Line 1</label>
                  <div className="relative">
                    <MapPin className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="address1"
                      value={address1Value}
                      onChange={handleAddress1Change}
                      placeholder="Max 250 characters"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Address Line 2</label>
                  <div className="relative">
                    <MapPin className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="address2"
                      value={address2Value}
                      onChange={handleAddress2Change}
                      placeholder="Max 250 characters"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Province</label>
                  <div className="relative">
                    <MapPin className="absolute left-1 top-1 text-purple-500" size={10} />
                    <button
                      type="button"
                      onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                      className={`${inCls} pl-5 flex items-center justify-between cursor-pointer text-left`}
                      disabled={loading || !companyId}
                    >
                      <span className="truncate">
                        {formData.province || "Select Province"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-purple-500" />
                    </button>
                    
                    {isProvinceOpen && (
                      <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                        {loading ? (
                          <div className="p-1 text-center text-purple-500 text-xs">Loading provinces...</div>
                        ) : provinces.length > 0 ? (
                          <ul>
                            {provinces.map((province) => (
                              <li 
                                key={province._id}
                                className="p-1 hover:bg-purple-50 dark:hover:bg-gray-700 cursor-pointer text-xs"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    province: `${province.code} - ${province.title}`,
                                    updatedBy: username || ""
                                  }));
                                  setIsProvinceOpen(false);
                                }}
                              >
                                {province.code} - {province.title}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                            No provinces available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className={secCls}>
              <h2 className={secTitleCls}>
                <Phone className="text-purple-600" size={10} />
                Contact Information
              </h2>
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Phone Number 1</label>
                  <div className="relative">
                    <Phone className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="tel"
                      name="phone1"
                      value={phone1Value}
                      onChange={handlePhone1Change}
                      placeholder="+ followed by 16 digits"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">Phone Number 2</label>
                  <div className="relative">
                    <Phone className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="tel"
                      name="phone2"
                      value={phone2Value}
                      onChange={handlePhone2Change}
                      placeholder="+ followed by 16 digits"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tax Information */}
            <div className={secCls}>
              <h2 className={secTitleCls}>
                <FileText className="text-purple-600" size={10} />
                Tax Information
              </h2>
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">National Tax Number</label>
                  <div className="relative">
                    <FileText className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="nationalTaxNumber"
                      value={nationalTaxNumberValue}
                      onChange={handleNationalTaxNumberChange}
                      placeholder="Max 50 characters"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">STRN</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="strn"
                      value={strnValue}
                      onChange={handleStrnChange}
                      placeholder="Max 50 characters"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-0.5">FBR Token</label>
                  <div className="relative">
                    <Key className="absolute left-1 top-1 text-purple-500" size={10} />
                    <input
                      type="text"
                      name="fbrToken"
                      value={formData.fbrToken || ""}
                      onChange={handleChange}
                      placeholder="FBR Token"
                      className={`${inCls} pl-5`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status & Submission */}
            <div className={secCls} style={{ gridColumn: "span 2" }}>
              <h2 className={secTitleCls}>
                <ShieldCheck className="text-purple-600" size={10} />
                Status & Submission
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-3 w-3 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label className="text-purple-700 dark:text-purple-300 text-xs">Mark as Active</label>
                </div>
                
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded text-xs flex items-center justify-center gap-1 disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Processing..." : (isEditMode ? "Update Company" : "Submit Company")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;