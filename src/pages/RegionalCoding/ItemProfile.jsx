// src/RegionalCoding/ItemProfile.jsx
import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Package,
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  Hash,
  Layers,
  Settings,
  Percent,
  FileText,
  Grid3X3,
  Edit
} from 'lucide-react';

export default function ItemProfile() {
  const { companyId, username } = useAppContext();
  
  const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
  const [selectedAccountLevel4, setSelectedAccountLevel4] = useState(null);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [finishedGoodDetails, setFinishedGoodDetails] = useState(null);
  const [filteredAccountLevel4s, setFilteredAccountLevel4s] = useState([]);
  const [isFinishedGoodComboboxOpen, setIsFinishedGoodComboboxOpen] = useState(false);
  const [isAccountLevel4ComboboxOpen, setIsAccountLevel4ComboboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({
    salesTaxRate: 0,
    unitMeasurement: '',
    extraTaxRate: 0,
    furtherTaxRate: 0,
    fedPercentage: 0,
    hsCode: '',
    isExempted: false
  });
  const [unitMeasurements, setUnitMeasurements] = useState([]);
  const [isUnitMeasurementOpen, setIsUnitMeasurementOpen] = useState(false);
  const [hsCodes, setHsCodes] = useState([]);
  const [isHsCodeOpen, setIsHsCodeOpen] = useState(false);
  const [hsCodeSearchTerm, setHsCodeSearchTerm] = useState('');
  const [filteredHsCodes, setFilteredHsCodes] = useState([]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  
  const inputClass = "w-full p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-sm";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow mb-4 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-base font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2";
  
  const fetchFinishedGoods = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch finished goods');
      setFinishedGoods(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch finished goods'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAccountLevel4s = async (finishedGoodCode) => {
    if (!companyId || !finishedGoodCode) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${finishedGoodCode}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch account level 4');
      
      setAccountLevel4s(json.accounts);
      setFinishedGoodDetails(json.finishedGoodDetails);
      setFilteredAccountLevel4s(json.accounts);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch account level 4'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUnitMeasurements = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/item-profile/unit-measurements/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch unit measurements');
      setUnitMeasurements(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch unit measurements'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHsCodes = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/item-description-codes/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch HS Codes');
      setHsCodes(json);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || 'Failed to fetch HS Codes'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkExistingProfile = async (finishedGoodId, accountLevel4Id) => {
    if (!companyId || !finishedGoodId || !accountLevel4Id) return;
    
    setIsLoadingProfile(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/item-profile/check-existing?companyId=${companyId}&finishedGoodId=${finishedGoodId}&accountLevel4Id=${accountLevel4Id}`
      );
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to check existing profile');
      
      if (json.exists) {
        setIsEditMode(true);
        setExistingProfileId(json.profile._id);
        setFormData({
          salesTaxRate: json.profile.salesTaxRate || 0,
          unitMeasurement: json.profile.unitMeasurement?._id || '',
          extraTaxRate: json.profile.extraTaxRate || 0,
          furtherTaxRate: json.profile.furtherTaxRate || 0,
          fedPercentage: json.profile.fedPercentage || 0,
          hsCode: json.profile.hsCode?._id || '',
          isExempted: json.profile.isExempted || false
        });
        setMessage({
          type: "info",
          text: "Existing item profile found. You can now update it."
        });
      } else {
        setIsEditMode(false);
        setExistingProfileId(null);
        setFormData({
          salesTaxRate: 0,
          unitMeasurement: '',
          extraTaxRate: 0,
          furtherTaxRate: 0,
          fedPercentage: 0,
          hsCode: '',
          isExempted: false
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
  
  useEffect(() => {
    if (companyId) {
      fetchFinishedGoods();
      fetchUnitMeasurements();
      fetchHsCodes();
    }
  }, [companyId]);
  
  useEffect(() => {
    if (selectedFinishedGood) {
      const selectedGood = finishedGoods.find(fg => fg._id === selectedFinishedGood);
      if (selectedGood) {
        fetchAccountLevel4s(selectedGood.code);
      }
    } else {
      setAccountLevel4s([]);
      setFilteredAccountLevel4s([]);
      setSelectedAccountLevel4(null);
      setFinishedGoodDetails(null);
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedFinishedGood, finishedGoods]);
  
  useEffect(() => {
    if (selectedFinishedGood && selectedAccountLevel4) {
      checkExistingProfile(selectedFinishedGood, selectedAccountLevel4);
    } else {
      setIsEditMode(false);
      setExistingProfileId(null);
    }
  }, [selectedFinishedGood, selectedAccountLevel4]);
  
  useEffect(() => {
    const filtered = accountLevel4s.filter(al4 => 
      al4.title.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()) ||
      al4.fullcode.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())
    );
    setFilteredAccountLevel4s(filtered);
  }, [accountLevel4SearchTerm, accountLevel4s]);
  
  useEffect(() => {
    const filtered = hsCodes.filter(hs => 
      hs.hsCode.toLowerCase().includes(hsCodeSearchTerm.toLowerCase()) ||
      hs.description.toLowerCase().includes(hsCodeSearchTerm.toLowerCase())
    );
    setFilteredHsCodes(filtered);
  }, [hsCodeSearchTerm, hsCodes]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'isExempted') {
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          ...(checked && {
            salesTaxRate: 0,
            extraTaxRate: 0,
            furtherTaxRate: 0,
            fedPercentage: 0
          })
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? '' : Number(value) 
      }));
    }
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
    if (!selectedFinishedGood || !selectedAccountLevel4) {
      setMessage({
        type: "error",
        text: "Please select both a finished good and an account level 4"
      });
      return;
    }
    
    const selectedGood = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    if (!selectedGood) {
      setMessage({
        type: "error",
        text: "Invalid finished good selection"
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/item-profile/${existingProfileId}`
        : `http://localhost:5000/api/item-profile`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId,
          finishedGoodId: selectedFinishedGood,
          finishedGoodCode: selectedGood.code,
          level3Title: selectedGood.level3Title,
          accountLevel4Id: selectedAccountLevel4,
          salesTaxRate: formData.salesTaxRate || 0,
          unitMeasurementId: formData.unitMeasurement,
          extraTaxRate: formData.extraTaxRate || 0,
          furtherTaxRate: formData.furtherTaxRate || 0,
          fedPercentage: formData.fedPercentage || 0,
          hsCodeId: formData.hsCode,
          isExempted: formData.isExempted,
          createdBy: username || "",
          updatedBy: username || ""
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${isEditMode ? 'updating' : 'saving'} item profile`);
      
      setMessage({
        type: "success",
        text: json.message || `Item profile ${isEditMode ? 'updated' : 'saved'} successfully!`
      });
      
      if (!isEditMode) {
        setIsEditMode(true);
        setExistingProfileId(json.itemProfile._id);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || `Failed to ${isEditMode ? 'update' : 'save'} item profile`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredFinishedGoods = finishedGoods.filter(fg => 
    (fg.level3Title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    fg.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getSelectedFinishedGoodName = () => {
    const selected = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    return selected ? `${selected.code} - ${selected.level3Title || 'Unknown Title'}` : 'Select Finished Good';
  };
  
  const getSelectedAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    return selected ? `${selected.fullcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  const getSelectedUnitMeasurementName = () => {
    const selected = unitMeasurements.find(um => um._id === formData.unitMeasurement);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Unit Measurement';
  };
  
  const getSelectedHsCodeName = () => {
    const selected = hsCodes.find(hs => hs._id === formData.hsCode);
    return selected ? `${selected.hsCode} - ${selected.description}` : 'Select HS Code';
  };
  
  const resetForm = () => {
    setSelectedFinishedGood(null);
    setSelectedAccountLevel4(null);
    setIsEditMode(false);
    setExistingProfileId(null);
    setFormData({
      salesTaxRate: 0,
      unitMeasurement: '',
      extraTaxRate: 0,
      furtherTaxRate: 0,
      fedPercentage: 0,
      hsCode: '',
      isExempted: false
    });
    setMessage(null);
  };
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 md:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Item Profile Management
          </h1>
          <p className="text-sm text-purple-500 dark:text-purple-400">
            {isEditMode ? "Update existing item profile" : "Create a new item profile"}
          </p>
        </div>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-white font-medium shadow-md flex items-center gap-2 text-sm ${
            message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
            message.type === "info" ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
            "bg-gradient-to-r from-red-500 to-rose-600"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : message.type === "info" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selection Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Package className="text-purple-600 w-4 h-4" />
              Item Selection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Finished Goods
                </label>
                <button
                  type="button"
                  onClick={() => setIsFinishedGoodComboboxOpen(!isFinishedGoodComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left h-9`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedFinishedGoodName()}</span>
                  {selectedFinishedGood ? (
                    <X 
                      className="w-4 h-4 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isFinishedGoodComboboxOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search finished goods..."
                        className="w-full p-1.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredFinishedGoods.length > 0 ? (
                      <ul>
                        {filteredFinishedGoods.map((finishedGood) => (
                          <li 
                            key={finishedGood._id}
                            className={`p-2 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${finishedGood._id === selectedFinishedGood ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedFinishedGood(finishedGood._id);
                              setIsFinishedGoodComboboxOpen(false);
                              setSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{finishedGood.code} - {finishedGood.level3Title || 'Unknown Title'}</div>
                            {finishedGood.level1Code && (
                              <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                                {finishedGood.level1Code} &gt; {finishedGood.level2Code} &gt; {finishedGood.level3Code}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {finishedGoods.length === 0 ? 'No finished goods found' : 'No matching finished goods found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Account Level 4
                </label>
                <button
                  type="button"
                  onClick={() => selectedFinishedGood && setIsAccountLevel4ComboboxOpen(!isAccountLevel4ComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left h-9 ${
                    !selectedFinishedGood ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !selectedFinishedGood}
                >
                  <span className="truncate text-xs">{getSelectedAccountLevel4Name()}</span>
                  {selectedAccountLevel4 ? (
                    <X 
                      className="w-4 h-4 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccountLevel4(null);
                        setIsEditMode(false);
                        setExistingProfileId(null);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isAccountLevel4ComboboxOpen && selectedFinishedGood && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search account level 4..."
                        className="w-full p-1.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
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
                            className={`p-2 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${accountLevel4._id === selectedAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedAccountLevel4(accountLevel4._id);
                              setIsAccountLevel4ComboboxOpen(false);
                              setAccountLevel4SearchTerm('');
                            }}
                          >
                            <div className="font-medium">{accountLevel4.fullcode} - {accountLevel4.title}</div>
                            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                              {accountLevel4.parentLevel1Code} &gt; {accountLevel4.parentLevel2Code} &gt; {accountLevel4.parentLevel3Code}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {accountLevel4s.length === 0 ? 'No account level 4 found for this finished good' : 'No matching account level 4 found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Information Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <FileText className="text-purple-600 w-4 h-4" />
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  HS Code
                </label>
                <button
                  type="button"
                  onClick={() => setIsHsCodeOpen(!isHsCodeOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left h-9`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedHsCodeName()}</span>
                  {formData.hsCode ? (
                    <X 
                      className="w-4 h-4 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, hsCode: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isHsCodeOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search HS Codes..."
                        className="w-full p-1.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                        value={hsCodeSearchTerm}
                        onChange={(e) => setHsCodeSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredHsCodes.length > 0 ? (
                      <ul>
                        {filteredHsCodes.map((hs) => (
                          <li 
                            key={hs._id}
                            className={`p-2 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${hs._id === formData.hsCode ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, hsCode: hs._id }));
                              setIsHsCodeOpen(false);
                              setHsCodeSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{hs.hsCode} - {hs.description}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-purple-500 dark:text-purple-400 text-xs">
                        {hsCodes.length === 0 ? 'No HS Codes found' : 'No matching HS Codes found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Unit Measurement
                </label>
                <button
                  type="button"
                  onClick={() => setIsUnitMeasurementOpen(!isUnitMeasurementOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left h-9`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedUnitMeasurementName()}</span>
                  {formData.unitMeasurement ? (
                    <X 
                      className="w-4 h-4 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, unitMeasurement: '' }));
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isUnitMeasurementOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 max-h-60 overflow-auto">
                    <ul>
                      {unitMeasurements.map((unit) => (
                        <li 
                          key={unit._id}
                          className={`p-2 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${unit._id === formData.unitMeasurement ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, unitMeasurement: unit._id }));
                            setIsUnitMeasurementOpen(false);
                          }}
                        >
                          <div className="font-medium">{unit.code} - {unit.title}</div>
                          {unit.symbol && (
                            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                              Symbol: {unit.symbol}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tax Rates Section */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Percent className="text-purple-600 w-4 h-4" />
              Tax Rates
            </h2>
            
            {/* Exempted Goods Checkbox */}
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isExempted"
                  checked={formData.isExempted}
                  onChange={handleInputChange}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Exempted Goods
                </span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Sales Tax (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-2 top-2 text-purple-500" size={14} />
                  <input
                    type="number"
                    name="salesTaxRate"
                    value={formData.salesTaxRate}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7 h-9 ${formData.isExempted ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    disabled={formData.isExempted}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Extra Tax (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-2 top-2 text-purple-500" size={14} />
                  <input
                    type="number"
                    name="extraTaxRate"
                    value={formData.extraTaxRate}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7 h-9 ${formData.isExempted ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    disabled={formData.isExempted}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Further Tax (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-2 top-2 text-purple-500" size={14} />
                  <input
                    type="number"
                    name="furtherTaxRate"
                    value={formData.furtherTaxRate}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7 h-9 ${formData.isExempted ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    disabled={formData.isExempted}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  FED (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-2 top-2 text-purple-500" size={14} />
                  <input
                    type="number"
                    name="fedPercentage"
                    value={formData.fedPercentage}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7 h-9 ${formData.isExempted ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    disabled={formData.isExempted}
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
                className="flex gap-1 items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-300 text-sm hover:from-gray-600 hover:to-gray-700"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <div className={isEditMode ? "" : "ml-auto"}>
              <button
                type="submit"
                disabled={loading || !companyId || !selectedFinishedGood || !selectedAccountLevel4 || isLoadingProfile}
                className={`flex gap-1 items-center px-4 py-2 rounded-lg text-white transition-all duration-300 text-sm ${(loading || isLoadingProfile) ? 'bg-gradient-to-r from-purple-400 to-indigo-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
              >
                {(loading || isLoadingProfile) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isEditMode ? (
                  <Edit className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoadingProfile ? "Loading..." : isEditMode ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
        
        {!companyId && (
          <div className="mt-4 p-4 text-center text-purple-500 dark:text-purple-400 bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 text-sm">
            Please select a company to configure item profile
          </div>
        )}
      </div>
    </div>
  );
}