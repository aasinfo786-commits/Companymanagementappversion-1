// src/pages/RegionalCoding/CustomerProfile.jsx
import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Users,
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
  Percent,
  CreditCard,
  Calendar,
  Building,
  Map,
  Edit
} from 'lucide-react';

export default function CustomerProfile() {
  const { companyId, username } = useAppContext();
  
  // Existing state for debtor accounts
  const [selectedDebtorAccount, setSelectedDebtorAccount] = useState('');
  const [selectedSubAccount, setSelectedSubAccount] = useState('');
  const [debtorAccounts, setDebtorAccounts] = useState([]);
  const [subAccounts, setSubAccounts] = useState([]);
  const [filteredSubAccounts, setFilteredSubAccounts] = useState([]);
  const [isDebtorComboboxOpen, setIsDebtorComboboxOpen] = useState(false);
  const [isSubAccountComboboxOpen, setIsSubAccountComboboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subAccountSearchTerm, setSubAccountSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isCustomerTypeOpen, setIsCustomerTypeOpen] = useState(false);
  const customerTypes = [
    { value: 'registered', label: 'Registered' },
    { value: 'un-registered', label: 'Un-Registered' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'distributer', label: 'Distributer' },
    { value: 'exempt', label: 'Exempt' }
  ];
  
  // New state for additional fields
  const [formData, setFormData] = useState({
    address: '',
    phoneNumber: '',
    contactPerson: '',
    mobileNumber: '',
    ntn: '',
    strn: '',
    cnic: '',
    rateChoice: '',
    creditLimit: '',
    creditDays: '',
    province: '',
    city: '',
    salesPerson: '',
    customerType: ''
  });
  
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSalesPersonOpen, setIsSalesPersonOpen] = useState(false);
  
  // New state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Micro compact styling with purple theme
  const inputClass = "w-full p-1 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-xs h-7";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-2 rounded-md shadow mb-2 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  
  const getSelectedCustomerType = () => {
    const selected = customerTypes.find(type => type.value === formData.customerType);
    return selected ? selected.label : 'Select Customer Type';
  };
  
  // Existing functions for debtor accounts
  const fetchDebtorAccounts = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customer-profile/debtor-accounts/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch debtor accounts');
      setDebtorAccounts(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch debtor accounts'
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };
  
  const fetchSubAccounts = async (code) => {
    if (!companyId || !code) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customer-profile/sub-accounts/${companyId}?code=${code}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch level 4 accounts');
      setSubAccounts(json);
      setFilteredSubAccounts(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch level 4 accounts'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDefaultDebtorAccount = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customer-profile/default-debtor-account/${companyId}`);
      
      if (!res.ok) {
        // Handle cases where no default account exists (404) differently
        if (res.status === 404) {
          return; // No default account is not an error case
        }
        const json = await res.json();
        throw new Error(json.error || 'Failed to fetch default debtor account');
      }
      const json = await res.json();
      if (json.defaultDebtorAccountId) {
        setSelectedDebtorAccount(json.defaultDebtorAccountId);
        const selectedDebtor = debtorAccounts.find(da => da._id === json.defaultDebtorAccountId);
        if (selectedDebtor) {
          fetchSubAccounts(selectedDebtor.code);
        }
      }
    } catch (err) {
      // Only show error if it's not a 404 (not found)
      if (err.message !== 'Not Found') {
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch default debtor account'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // New functions for additional fields
  const fetchProvinces = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customer-profile/provinces/${companyId}`);
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
  

// Update the fetchCities function to be async and return a promise
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
      `http://localhost:5000/api/customer-profile/cities/${companyId}?provinceId=${selectedProvince.code}`
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

  
  const fetchSalesPersons = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customer-profile/sales-persons/${companyId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sales persons');
      setSalesPersons(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch sales persons'
      });
    } finally {
      setLoading(false);
    }
  };
  
// In CustomerProfile.jsx, update the checkExistingProfile function
const checkExistingProfile = async (debtorAccountId, subAccountId) => {
  if (!companyId || !debtorAccountId || !subAccountId) return;
  
  setIsLoadingProfile(true);
  try {
    const res = await fetch(
      `http://localhost:5000/api/customer-profile/check-existing?companyId=${companyId}&debtorAccountId=${debtorAccountId}&subAccountId=${subAccountId}`
    );
    const json = await res.json();
    
    if (!res.ok) throw new Error(json.error || 'Failed to check existing profile');
    
    if (json.exists) {
      // Profile exists, populate form with existing data
      setIsEditMode(true);
      setExistingProfileId(json.profile._id);
      
      // First, set the province in the form data
      const provinceId = json.profile.province?._id || json.profile.province || '';
      const cityId = json.profile.city?._id || json.profile.city || '';
      
      // Set the form data with the province and city
      setFormData({
        address: json.profile.address || '',
        phoneNumber: json.profile.phoneNumber || '',
        contactPerson: json.profile.contactPerson || '',
        mobileNumber: json.profile.mobileNumber || '',
        ntn: json.profile.ntn || '',
        strn: json.profile.strn || '',
        cnic: json.profile.cnic || '',
        rateChoice: json.profile.rateChoice || '',
        creditLimit: json.profile.creditLimit || '',
        creditDays: json.profile.creditDays || '',
        province: provinceId,
        city: cityId,
        salesPerson: json.profile.salesPerson?._id || json.profile.salesPerson || '',
        customerType: json.profile.customerType || ''
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
        text: "Existing customer profile found. You can now update it."
      });
    } else {
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
        rateChoice: '',
        creditLimit: '',
        creditDays: '',
        province: '',
        city: '',
        salesPerson: '',
        customerType: ''
      });
      setMessage(null);
    }
  } catch (err) {
    setMessage({
      type: "error",
      text: err.message || 'Failed to check existing profile'
    });
  } finally {
    setIsLoadingProfile(false);
  }
};
  
  // Existing useEffect hooks
  useEffect(() => {
    if (companyId) {
      fetchDebtorAccounts();
      fetchDefaultDebtorAccount();
      fetchProvinces();
      fetchSalesPersons();
    }
  }, [companyId]);
  
  useEffect(() => {
    if (selectedDebtorAccount) {
      const selectedDebtor = debtorAccounts.find(da => da._id === selectedDebtorAccount);
      if (selectedDebtor) {
        fetchSubAccounts(selectedDebtor.code);
      }
    } else {
      setSubAccounts([]);
      setFilteredSubAccounts([]);
      setSelectedSubAccount('');
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedDebtorAccount, debtorAccounts]);
  
  // Check for existing profile when both debtor account and sub-account are selected
  useEffect(() => {
    if (selectedDebtorAccount && selectedSubAccount) {
      checkExistingProfile(selectedDebtorAccount, selectedSubAccount);
    } else {
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedDebtorAccount, selectedSubAccount]);
  
// Update the useEffect that triggers when province changes
useEffect(() => {
  if (formData.province) {
    fetchCities(formData.province);
  }
}, [formData.province]);
  
  // Fixed filter function with null checks
  useEffect(() => {
    const filtered = subAccounts.filter(sa => {
      if (!sa) return false;
      
      const title = (sa.title || '').toLowerCase();
      const fullcode = (sa.fullcode || '').toLowerCase();
      const searchTermLower = subAccountSearchTerm.toLowerCase();
      
      return title.includes(searchTermLower) || fullcode.includes(searchTermLower);
    });
    setFilteredSubAccounts(filtered);
  }, [subAccountSearchTerm, subAccounts]);
  
  // Fixed filter function for debtor accounts
  const filteredDebtorAccounts = debtorAccounts.filter(da => {
    if (!da) return false;
    
    const title = (da.title || '').toLowerCase();
    const code = (da.code || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return title.includes(searchTermLower) || code.includes(searchTermLower);
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
// In CustomerProfile.jsx, update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!companyId) {
    setMessage({
      type: "error",
      text: "Please select a company first"
    });
    return;
  }
  if (!selectedDebtorAccount || !selectedSubAccount) {
    setMessage({
      type: "error",
      text: "Please select both a debtor account and a level 4 account"
    });
    return;
  }
  if (!formData.customerType) {
    setMessage({
      type: "error",
      text: "Please select a customer type"
    });
    return;
  }
  
  setLoading(true);
  setMessage(null);
  try {
    const url = isEditMode 
      ? `http://localhost:5000/api/customer-profile/${existingProfileId}`
      : `http://localhost:5000/api/customer-profile`;
    
    const method = isEditMode ? 'PUT' : 'POST';
    
    // Get the actual code values for province, city, and salesPerson
    let provinceCode = '';
    let cityCode = '';
    let salesPersonCode = '';
    
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
    
    const selectedSalesPerson = salesPersons.find(sp => sp._id === formData.salesPerson);
    if (selectedSalesPerson) {
      salesPersonCode = selectedSalesPerson.code;
    } else if (formData.salesPerson) {
      // If not found in the options array, use the raw value (might be a code)
      salesPersonCode = formData.salesPerson;
    }
    
    // Create request body with only the fields that have values
    const requestBody = {
      companyId,
      debtorAccountId: selectedDebtorAccount,
      subAccountId: selectedSubAccount,
      customerType: formData.customerType,
      createdBy: username || "",
      updatedBy: username || ""
    };
    
    // Add optional fields only if they have values
    if (formData.address) requestBody.address = formData.address;
    if (formData.phoneNumber) requestBody.phoneNumber = formData.phoneNumber;
    if (formData.contactPerson) requestBody.contactPerson = formData.contactPerson;
    if (formData.mobileNumber) requestBody.mobileNumber = formData.mobileNumber;
    if (formData.ntn) requestBody.ntn = formData.ntn;
    if (formData.strn) requestBody.strn = formData.strn;
    if (formData.cnic) requestBody.cnic = formData.cnic;
    if (formData.rateChoice) requestBody.rateChoice = formData.rateChoice;
    if (formData.creditLimit) requestBody.creditLimit = formData.creditLimit;
    if (formData.creditDays) requestBody.creditDays = formData.creditDays;
    // Use the code values for province, city, and salesPerson
    if (provinceCode) requestBody.province = provinceCode;
    if (cityCode) requestBody.city = cityCode;
    if (salesPersonCode) requestBody.salesPerson = salesPersonCode;
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error occurred');
    
    setMessage({
      type: "success",
      text: `Customer profile ${isEditMode ? 'updated' : 'saved'} successfully!`
    });
    
    // If we were creating a new profile, switch to edit mode
    if (!isEditMode) {
      setIsEditMode(true);
      setExistingProfileId(json.profile?._id || json.customerProfile?._id);
    }
  } catch (err) {
    setMessage({
      type: "error",
      text: err.message
    });
  } finally {
    setLoading(false);
  }
};
  
  const resetForm = () => {
    setSelectedDebtorAccount('');
    setSelectedSubAccount('');
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
      rateChoice: '',
      creditLimit: '',
      creditDays: '',
      province: '',
      city: '',
      salesPerson: '',
      customerType: ''
    });
    setMessage(null);
  };
  
  // Existing combo box functions
  const getSelectedDebtorName = () => {
    const selected = debtorAccounts.find(da => da._id === selectedDebtorAccount);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Debtors Account';
  };
  
  const getSelectedSubAccountName = () => {
    const selected = subAccounts.find(sa => sa._id === selectedSubAccount);
    return selected ? `${selected.subcode} - ${selected.title}` : 'Select Level 4 Account';
  };
  
  // New combo box functions for additional fields
  const getSelectedProvinceName = () => {
    const selected = provinces.find(p => p._id === formData.province);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Province';
  };
  
  // Update getSelectedCityName
  const getSelectedCityName = () => {
    const selected = cities.find(c => c._id === formData.city);
    return selected ? `${selected.code} - ${selected.title}` : 'Select City';
  };
  
  const getSelectedSalesPersonName = () => {
    const selected = salesPersons.find(sp => sp._id === formData.salesPerson);
    return selected ? selected.name : 'Select Sales Person';
  };
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-1 md:p-2">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Customer Profile Management
          </h1>
          <p className="text-xs text-purple-500 dark:text-purple-400">
            {isEditMode ? "Update existing customer profile" : "Create a new customer profile"}
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
              <Users className="text-purple-600 w-3 h-3" />
              Account Selection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Debtor Account Combobox */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Debtors Account
                </label>
                <button
                  type="button"
                  onClick={() => setIsDebtorComboboxOpen(!isDebtorComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedDebtorName()}</span>
                  {selectedDebtorAccount ? (
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
                
                {isDebtorComboboxOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search Debtor accounts..."
                        className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredDebtorAccounts.length > 0 ? (
                      <ul>
                        {filteredDebtorAccounts.map((debtorAccount) => (
                          <li 
                            key={debtorAccount._id}
                            className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${debtorAccount._id === selectedDebtorAccount ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedDebtorAccount(debtorAccount._id);
                              setIsDebtorComboboxOpen(false);
                              setSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{debtorAccount.code} - {debtorAccount.title}</div>
                            {debtorAccount.isDefault && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Default Account
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {initialLoad ? 'Loading...' : 'No debtor accounts found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Sub Account Combobox */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Account Level 4
                </label>
                <button
                  type="button"
                  onClick={() => selectedDebtorAccount && setIsSubAccountComboboxOpen(!isSubAccountComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                    !selectedDebtorAccount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !selectedDebtorAccount}
                >
                  <span className="truncate text-xs">{getSelectedSubAccountName()}</span>
                  {selectedSubAccount ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubAccount('');
                        setIsEditMode(false);
                        setExistingProfileId(null);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isSubAccountComboboxOpen && selectedDebtorAccount && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search Level 4 accounts..."
                        className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={subAccountSearchTerm}
                        onChange={(e) => setSubAccountSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredSubAccounts.length > 0 ? (
                      <ul>
                        {filteredSubAccounts.map((subAccount) => (
                          <li 
                            key={subAccount._id}
                            className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${subAccount._id === selectedSubAccount ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedSubAccount(subAccount._id);
                              setIsSubAccountComboboxOpen(false);
                              setSubAccountSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{subAccount.subcode} - {subAccount.title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {subAccounts.length === 0 ? 'No level 4 accounts found for this debtor account' : 'No matching level 4 accounts found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Customer Information Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <User className="text-purple-600 w-3 h-3" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {/* Customer Type */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Customer Type
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomerTypeOpen(!isCustomerTypeOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                >
                  <span className="truncate text-xs">{getSelectedCustomerType()}</span>
                  {formData.customerType ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, customerType: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isCustomerTypeOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <ul>
                      {customerTypes.map((type) => (
                        <li 
                          key={type.value}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${
                            type.value === formData.customerType ? 'bg-purple-50 dark:bg-purple-900' : ''
                          }`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, customerType: type.value }));
                            setIsCustomerTypeOpen(false);
                          }}
                        >
                          <div className="font-medium">{type.label}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
          
          {/* Contact Details Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <MapPin className="text-purple-600 w-3 h-3" />
              Contact Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {/* Address */}
              <div className="md:col-span-2">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-1">
              {/* Province */}
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
              
              {/* City */}
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
              
              {/* Sales Person */}
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Sales Person
                </label>
                <button
                  type="button"
                  onClick={() => setIsSalesPersonOpen(!isSalesPersonOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedSalesPersonName()}</span>
                  {formData.salesPerson ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, salesPerson: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isSalesPersonOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                    <ul>
                      {salesPersons.map((person) => (
                        <li 
                          key={person._id}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${person._id === formData.salesPerson ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, salesPerson: person._id }));
                            setIsSalesPersonOpen(false);
                          }}
                        >
                          <div className="font-medium">{person.name}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
          
          {/* Credit Information Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <CreditCard className="text-purple-600 w-3 h-3" />
              Credit Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {/* Rate Choice */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Rate Choice
                </label>
                <div className="relative">
                  <Percent className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="number"
                    name="rateChoice"
                    value={formData.rateChoice}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Credit Limit */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Credit Limit
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Credit Days */}
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Credit Days
                </label>
                <div className="relative">
                  <Calendar className="absolute left-1 top-1 text-purple-500" size={10} />
                  <input
                    type="number"
                    name="creditDays"
                    value={formData.creditDays}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-5`}
                    placeholder="0"
                  />
                </div>
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
                disabled={loading || !companyId || !selectedDebtorAccount || !selectedSubAccount || isLoadingProfile}
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
            Please select a company to configure customer profile
          </div>
        )}
      </div>
    </div>
  );
}