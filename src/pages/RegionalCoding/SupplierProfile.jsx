// src/pages/RegionalCoding/SupplierProfile.jsx
import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Truck,
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  MapPin,
  Phone,
  User,
  Smartphone,
  FileText,
  Hash,
  Edit
} from 'lucide-react';

export default function SupplierProfile() {
  const { companyId, username } = useAppContext();
  
  // State for creditor accounts
  const [selectedCreditorAccount, setSelectedCreditorAccount] = useState('');
  const [selectedAccountLevel4, setSelectedAccountLevel4] = useState('');
  const [creditorAccounts, setCreditorAccounts] = useState([]);
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [filteredAccountLevel4s, setFilteredAccountLevel4s] = useState([]);
  const [isCreditorComboboxOpen, setIsCreditorComboboxOpen] = useState(false);
  const [isAccountLevel4ComboboxOpen, setIsAccountLevel4ComboboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Form data state
  const [formData, setFormData] = useState({
    address: '',
    phoneNumber: '',
    contactPerson: '',
    mobileNumber: '',
    ntn: '',
    strn: '',
    cnic: '',
    province: '',
    city: ''
  });
  
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Micro compact styling with purple theme
  const inputClass = "w-full p-1 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-xs h-7";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-2 rounded-md shadow mb-2 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  
  // Fetch creditor accounts
  const fetchCreditorAccounts = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/supplier-profile/creditor-accounts/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch creditor accounts');
      setCreditorAccounts(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch creditor accounts'
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };
  
  const fetchAccountLevel4s = async (code) => {
    if (!companyId || !code) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/supplier-profile/account-level4s/${companyId}?code=${code}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch account level 4s');
      setAccountLevel4s(json);
      setFilteredAccountLevel4s(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch account level 4s'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDefaultCreditorAccount = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/supplier-profile/default-creditor-account/${companyId}`);
      
      if (!res.ok) {
        if (res.status === 404) return;
        const json = await res.json();
        throw new Error(json.error || 'Failed to fetch default creditor account');
      }
      const json = await res.json();
      if (json.defaultCreditorAccountId) {
        setSelectedCreditorAccount(json.defaultCreditorAccountId);
        const selectedCreditor = creditorAccounts.find(ca => ca._id === json.defaultCreditorAccountId);
        if (selectedCreditor) {
          fetchAccountLevel4s(selectedCreditor.code);
        }
      }
    } catch (err) {
      if (err.message !== 'Not Found') {
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch default creditor account'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProvinces = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/supplier-profile/provinces/${companyId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch provinces');
      setProvinces(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch provinces'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update fetchCities to use provinceId
  const fetchCities = async (provinceId) => {
    if (!companyId || !provinceId) {
      setCities([]);
      setFilteredCities([]);
      return;
    }
    
    // Find the selected province to get its code
    const selectedProvince = provinces.find(p => p._id === provinceId);
    if (!selectedProvince) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/supplier-profile/cities/${companyId}?provinceId=${selectedProvince.code}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch cities');
      
      const data = await res.json();
      setCities(data);
      setFilteredCities(data);
      return data; // Return the data so we can use it
    } catch (err) {
      console.error('Error fetching cities:', err);
      setMessage({
        type: "error",
        text: 'Failed to load cities. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // New function to check if a supplier profile exists
  const checkExistingProfile = async (creditorAccountId, accountLevel4Id) => {
    if (!companyId || !creditorAccountId || !accountLevel4Id) return;
    
    setIsLoadingProfile(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/supplier-profile/by-account/${companyId}/${creditorAccountId}/${accountLevel4Id}`
      );
      const json = await res.json();
      
      if (!res.ok) {
        if (res.status === 404) {
          // No existing profile, reset form for new entry
          setIsEditMode(false);
          setExistingProfileId(null);
          setFormData({
            address: '',
            phoneNumber: '',
            contactPerson: '',
            mobileNumber: '',
            ntn: '',
            strn: '',
            cnic: '',
            province: '',
            city: ''
          });
          setMessage(null);
          return;
        }
        throw new Error(json.error || 'Failed to check existing profile');
      }
      
      // Profile exists, populate form with existing data
      setIsEditMode(true);
      setExistingProfileId(json._id);
      
      // First, set the province in the form data
      const provinceId = json.province?._id || json.province || '';
      const cityId = json.city?._id || json.city || '';
      
      // Set the form data with the province and city
      setFormData({
        address: json.address || '',
        phoneNumber: json.phoneNumber || '',
        contactPerson: json.contactPerson || '',
        mobileNumber: json.mobileNumber || '',
        ntn: json.ntn || '',
        strn: json.strn || '',
        cnic: json.cnic || '',
        province: provinceId,
        city: cityId
      });
      
      // If province is set, fetch cities for that province
      if (provinceId) {
        // We need to wait for the cities to be fetched
        await fetchCities(provinceId);
        
        // After fetching cities, make sure the selected city is in the list
        // If the city is not found by ID, try to find it by code
        if (cityId && !cities.some(c => c._id === cityId)) {
          const cityByCode = cities.find(c => c.code === cityId);
          if (cityByCode) {
            setFormData(prev => ({ ...prev, city: cityByCode._id }));
          }
        }
      }
      
      setMessage({
        type: "info",
        text: "Existing supplier profile found. You can now update it."
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to check existing profile'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  useEffect(() => {
    if (companyId) {
      fetchCreditorAccounts();
      fetchProvinces();
    }
  }, [companyId]);
  
  useEffect(() => {
    if (creditorAccounts.length > 0 && !selectedCreditorAccount) {
      fetchDefaultCreditorAccount();
    }
  }, [creditorAccounts]);
  
  useEffect(() => {
    if (selectedCreditorAccount) {
      const selectedCreditor = creditorAccounts.find(ca => ca._id === selectedCreditorAccount);
      if (selectedCreditor) {
        fetchAccountLevel4s(selectedCreditor.code);
      }
    } else {
      setAccountLevel4s([]);
      setFilteredAccountLevel4s([]);
      setSelectedAccountLevel4('');
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedCreditorAccount, creditorAccounts]);
  
  // Check for existing profile when both creditor account and account level 4 are selected
  useEffect(() => {
    if (selectedCreditorAccount && selectedAccountLevel4) {
      checkExistingProfile(selectedCreditorAccount, selectedAccountLevel4);
    } else {
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedCreditorAccount, selectedAccountLevel4]);
  
  useEffect(() => {
    const filtered = accountLevel4s.filter(al4 => 
      (al4.title && al4.title.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())) ||
      (al4.fullcode && al4.fullcode.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()))
    );
    setFilteredAccountLevel4s(filtered);
  }, [accountLevel4SearchTerm, accountLevel4s]);
  
  // Add a useEffect to handle city filtering and selection
  useEffect(() => {
    if (formData.province) {
      const selectedProvince = provinces.find(p => p._id === formData.province);
      if (selectedProvince) {
        const filtered = cities.filter(city => city.provinceId === selectedProvince.code);
        setFilteredCities(filtered);
        
        // Check if the selected city is in the filtered cities
        if (formData.city && !filtered.some(c => c._id === formData.city)) {
          // If not, try to find the city by code
          const cityByCode = cities.find(c => c.code === formData.city);
          if (cityByCode) {
            setFormData(prev => ({ ...prev, city: cityByCode._id }));
          }
        }
      }
    } else {
      setFilteredCities(cities);
    }
  }, [formData.province, formData.city, cities, provinces]);
  
  // Update the useEffect that triggers when province changes
  useEffect(() => {
    if (formData.province) {
      fetchCities(formData.province);
    }
  }, [formData.province]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!selectedCreditorAccount || !selectedAccountLevel4) {
      setMessage({
        type: "error",
        text: "Please select both a creditor account and an account level 4"
      });
      return;
    }
    
    // Validate required fields
    if (!username || username.trim() === '') {
      setMessage({
        type: "error",
        text: "User information not available. Please log in again."
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      // Get the actual code values for province and city
      let provinceCode = '';
      let cityCode = '';
      
      // Try to find the selected items in the options arrays
      const selectedProvince = provinces.find(p => p._id === formData.province);
      if (selectedProvince) {
        provinceCode = selectedProvince.code;
      } else if (formData.province) {
        // If not found in the options array, use the raw value (might be a code)
        provinceCode = formData.province;
      }
      
      const selectedCity = cities.find(c => c._id === formData.city);
      if (selectedCity) {
        cityCode = selectedCity.code;
      } else if (formData.city) {
        // If not found in the options array, use the raw value (might be a code)
        cityCode = formData.city;
      }
      
      const payload = {
        companyId,
        creditorAccountId: selectedCreditorAccount,
        accountLevel4Id: selectedAccountLevel4,
        address: formData.address || '',
        phoneNumber: formData.phoneNumber || '',
        contactPerson: formData.contactPerson || '',
        mobileNumber: formData.mobileNumber || '',
        ntn: formData.ntn || '',
        strn: formData.strn || '',
        cnic: formData.cnic || '',
        // Use the code values for province and city
        province: provinceCode,
        city: cityCode,
        createdBy: username.trim(),
        updatedBy: username.trim()
      };
      
      let url = `http://localhost:5000/api/supplier-profile`;
      let method = 'POST';
      
      // If in edit mode, use the update endpoint
      if (isEditMode && existingProfileId) {
        url = `http://localhost:5000/api/supplier-profile/${existingProfileId}`;
        method = 'PUT';
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || responseData.message || 'Error occurred');
      }
      
      setMessage({
        type: "success",
        text: responseData.message || `Supplier profile ${isEditMode ? 'updated' : 'saved'} successfully!`
      });
      
      // If we were creating a new profile, switch to edit mode
      if (!isEditMode) {
        setIsEditMode(true);
        setExistingProfileId(responseData.profile?._id || responseData._id);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || `Failed to ${isEditMode ? 'update' : 'save'} supplier profile`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedCreditorAccount('');
    setSelectedAccountLevel4('');
    setIsEditMode(false);
    setExistingProfileId(null);
    setFormData({
      address: '',
      phoneNumber: '',
      contactPerson: '',
      mobileNumber: '',
      ntn: '',
      strn: '',
      cnic: '',
      province: '',
      city: ''
    });
    setMessage(null);
  };
  
  const filteredCreditorAccounts = creditorAccounts.filter(ca => 
    (ca.title && ca.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ca.code && ca.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getSelectedCreditorName = () => {
    const selected = creditorAccounts.find(ca => ca._id === selectedCreditorAccount);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Creditors Account';
  };
  
  const getSelectedAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    return selected ? `${selected.subcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  const getSelectedProvinceName = () => {
    const selected = provinces.find(p => p._id === formData.province);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Province';
  };
  
  const getSelectedCityName = () => {
    const selected = cities.find(c => c._id === formData.city);
    return selected ? `${selected.code} - ${selected.title}` : 'Select City';
  };
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-1 md:p-2">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Supplier Profile Management
          </h1>
          <p className="text-xs text-purple-500 dark:text-purple-400">
            {isEditMode ? "Update existing supplier profile" : "Create a new supplier profile"}
          </p>
        </div>
        
        {message && (
          <div className={`mb-2 p-1.5 rounded-sm text-white font-medium shadow-md flex items-center gap-1 text-xs ${
            message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
            message.type === "info" ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
            "bg-gradient-to-r from-red-500 to-rose-600"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : message.type === "info" ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Account Selection Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Truck className="text-purple-600 w-3 h-3" />
              Account Selection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Creditor Account Combobox */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Creditors Account
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreditorComboboxOpen(!isCreditorComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedCreditorName()}</span>
                  {selectedCreditorAccount ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isCreditorComboboxOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search Creditor accounts..."
                        className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredCreditorAccounts.length > 0 ? (
                      <ul>
                        {filteredCreditorAccounts.map((creditorAccount) => (
                          <li 
                            key={creditorAccount._id}
                            className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${creditorAccount._id === selectedCreditorAccount ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedCreditorAccount(creditorAccount._id);
                              setIsCreditorComboboxOpen(false);
                              setSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{creditorAccount.code} - {creditorAccount.title}</div>
                            {creditorAccount.isDefault && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Default Account
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {initialLoad ? 'Loading...' : 'No creditor accounts found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Account Level 4 Combobox */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Account Level 4
                </label>
                <button
                  type="button"
                  onClick={() => selectedCreditorAccount && setIsAccountLevel4ComboboxOpen(!isAccountLevel4ComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                    !selectedCreditorAccount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !selectedCreditorAccount}
                >
                  <span className="truncate text-xs">{getSelectedAccountLevel4Name()}</span>
                  {selectedAccountLevel4 ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccountLevel4('');
                        setIsEditMode(false);
                        setExistingProfileId(null);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isAccountLevel4ComboboxOpen && selectedCreditorAccount && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search account level 4s..."
                        className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={accountLevel4SearchTerm}
                        onChange={(e) => setAccountLevel4SearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredAccountLevel4s.length > 0 ? (
                      <ul>
                        {filteredAccountLevel4s.map((accountLevel4) => (
                          <li 
                            key={accountLevel4._id}
                            className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${accountLevel4._id === selectedAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedAccountLevel4(accountLevel4._id);
                              setIsAccountLevel4ComboboxOpen(false);
                              setAccountLevel4SearchTerm('');
                            }}
                          >
                            <div className="font-medium">{accountLevel4.subcode} - {accountLevel4.title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {accountLevel4s.length === 0 ? 'No account level 4s found for this creditor account' : 'No matching account level 4s found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Supplier Information Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <User className="text-purple-600 w-3 h-3" />
              Supplier Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="Street address"
                  />
                </div>
              </div>
              
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="Phone"
                  />
                </div>
              </div>
              
              {/* Contact Person */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="Name"
                  />
                </div>
              </div>
              
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="Mobile"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tax Information Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <FileText className="text-purple-600 w-3 h-3" />
              Tax Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {/* NTN */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  NTN
                </label>
                <div className="relative">
                  <FileText className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="ntn"
                    value={formData.ntn}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="NTN number"
                  />
                </div>
              </div>
              
              {/* STRN */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  STRN
                </label>
                <div className="relative">
                  <FileText className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="strn"
                    value={formData.strn}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="STRN number"
                  />
                </div>
              </div>
              
              {/* CNIC */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  CNIC
                </label>
                <div className="relative">
                  <Hash className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="ID card number"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Location Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <MapPin className="text-purple-600 w-3 h-3" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {/* Province Combo */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Province
                </label>
                <button
                  type="button"
                  onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedProvinceName()}</span>
                  {formData.province ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, province: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isProvinceOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <ul>
                      {provinces.map((province) => (
                        <li 
                          key={province._id}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${province._id === formData.province ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, province: province._id }));
                            setIsProvinceOpen(false);
                          }}
                        >
                          <div className="font-medium">{province.code} - {province.title}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* City Combo */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  City
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.province) {
                      setIsCityOpen(!isCityOpen);
                      fetchCities(formData.province);
                    }
                  }}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                    !formData.province ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !formData.province}
                >
                  <span className="truncate text-xs">{getSelectedCityName()}</span>
                  {formData.city ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, city: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isCityOpen && formData.province && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    {loading ? (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        Loading cities...
                      </div>
                    ) : cities.length > 0 ? (
                      <ul>
                        {cities.map((city) => (
                          <li 
                            key={city._id}
                            className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${city._id === formData.city ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, city: city._id }));
                              setIsCityOpen(false);
                            }}
                          >
                            <div className="font-medium">{city.code} - {city.title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        No cities found for selected province
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-between">
            {isEditMode && (
              <button
                type="button"
                onClick={resetForm}
                className="flex gap-1 items-center px-2 py-1 rounded-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-300 text-xs hover:from-gray-600 hover:to-gray-700"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            )}
            <div className={isEditMode ? "" : "ml-auto"}>
              <button
                type="submit"
                disabled={loading || !companyId || !selectedCreditorAccount || !selectedAccountLevel4 || isLoadingProfile}
                className={`flex gap-1 items-center px-2 py-1 rounded-sm text-white transition-all duration-300 text-xs ${(loading || isLoadingProfile) ? 'bg-gradient-to-r from-purple-400 to-indigo-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
              >
                {(loading || isLoadingProfile) ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : isEditMode ? (
                  <Edit className="w-3 h-3" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {isLoadingProfile ? "Loading..." : isEditMode ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
        
        {!companyId && (
          <div className="mt-2 p-2 text-center text-purple-500 dark:text-purple-400 bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 text-xs">
            Please select a company to configure supplier profile
          </div>
        )}
      </div>
    </div>
  );
}