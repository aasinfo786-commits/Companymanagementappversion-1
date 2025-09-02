import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Package,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
  X,
  Info
} from 'lucide-react';

export default function ProductRateSetting() {
  const { companyId, username } = useAppContext(); // Added username from context
  
  // State for products and selection
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for account level 4 data
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [filteredAccountLevel4s, setFilteredAccountLevel4s] = useState([]);
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [selectedAccountLevel4, setSelectedAccountLevel4] = useState(null); // New state for selected account level 4
  
  // State for rates
  const [rates, setRates] = useState({});
  const [editingRate, setEditingRate] = useState(null);
  const [newRate, setNewRate] = useState({
    rate: '',
    applicableDate: getLocalDateString(new Date()),
    isActive: true
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFinishedGoodComboboxOpen, setIsFinishedGoodComboboxOpen] = useState(false);
  const [deletedRateIds, setDeletedRateIds] = useState([]);
  
  // Helper function to get local date string in YYYY-MM-DD format
  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to format date for display (MM/DD/YYYY)
  function formatDisplayDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Fetch finished goods when company changes
  useEffect(() => {
    const fetchFinishedGoods = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch finished goods');
        }
        const data = await res.json();
        setFinishedGoods(data);
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch finished goods'
        });
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchFinishedGoods();
  }, [companyId]);
  
  // Fetch account level 4 when finished good changes
  useEffect(() => {
    const fetchAccountLevel4s = async () => {
      if (!companyId || !selectedFinishedGood) return;
      setLoading(true);
      try {
        const selectedGood = finishedGoods.find(fg => fg._id === selectedFinishedGood);
        if (!selectedGood) return;
        
        const res = await fetch(
          `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${selectedGood.code}`
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch account level 4');
        }
        
        const data = await res.json();
        setAccountLevel4s(data.accounts || []);
        setFilteredAccountLevel4s(data.accounts || []);
        
        // Reset selected account level 4 and rates when finished good changes
        setSelectedAccountLevel4(null);
        setRates({});
      } catch (err) {
        console.error('Error fetching account level 4:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch account level 4'
        });
      } finally {
        setLoading(false);
      }
    };
    if (selectedFinishedGood) fetchAccountLevel4s();
  }, [selectedFinishedGood, companyId, finishedGoods]);
  
  // Filter account level 4 based on search term
  useEffect(() => {
    const filtered = accountLevel4s.filter(al4 => 
      al4.title.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()) ||
      al4.fullcode.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())
    );
    setFilteredAccountLevel4s(filtered);
  }, [accountLevel4SearchTerm, accountLevel4s]);
  
  // Fetch rates when an account level 4 is selected
  useEffect(() => {
    const fetchRatesForAccount = async () => {
      if (!companyId || !selectedAccountLevel4) return;
      
      try {
        const res = await fetch(
          `http://localhost:5000/api/product-rates/${companyId}/accounts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accountIds: [selectedAccountLevel4] })
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch rates');
        }
        
        const data = await res.json();
        
        // Convert array to object with accountLevel4Id as key
        const ratesObj = {};
        data.forEach(rate => {
          const accountId = rate.accountLevel4?._id || rate.accountLevel4;
          if (!ratesObj[accountId]) {
            ratesObj[accountId] = [];
          }
          // Ensure we only use the date part and handle potential timezone issues
          const dateOnly = rate.applicableDate.includes('T') 
            ? rate.applicableDate.split('T')[0]
            : rate.applicableDate;
            
          ratesObj[accountId].push({
            ...rate,
            id: rate._id || `temp-${Date.now()}`,
            accountLevel4Id: accountId,
            applicableDate: dateOnly,
            createdBy: rate.createdBy?.username || 'Unknown', // Add createdBy
            updatedBy: rate.updatedBy?.username || 'Unknown', // Add updatedBy
            createdAt: rate.createdAt, // Add createdAt
            updatedAt: rate.updatedAt  // Add updatedAt
          });
        });
        
        setRates(ratesObj);
      } catch (err) {
        console.error('Error fetching rates:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch rates'
        });
      }
    };
    
    if (selectedAccountLevel4) {
      fetchRatesForAccount();
    }
  }, [selectedAccountLevel4, companyId]);
  
  const handleAddRate = () => {
    if (!selectedAccountLevel4 || !newRate.rate || !newRate.applicableDate) {
      setMessage({
        type: "error",
        text: "Please select an account level 4 and enter rate information"
      });
      return;
    }
    const rateValue = parseFloat(newRate.rate);
    if (isNaN(rateValue)) {
      setMessage({
        type: "error",
        text: "Please enter a valid rate"
      });
      return;
    }
    // Create new rate object with audit fields
    const addedRate = {
      id: `temp-${Date.now()}`,
      accountLevel4Id: selectedAccountLevel4, // Use selected account level 4
      rate: rateValue,
      applicableDate: newRate.applicableDate,
      isActive: newRate.isActive,
      createdBy: username, // Add createdBy
      updatedBy: username, // Add updatedBy
      createdAt: new Date().toISOString(), // Add createdAt
      updatedAt: new Date().toISOString()  // Add updatedAt
    };
    // Update rates state
    setRates(prev => {
      const accountRates = prev[selectedAccountLevel4] || [];
      return {
        ...prev,
        [selectedAccountLevel4]: [...accountRates, addedRate].sort((a, b) => 
          a.applicableDate.localeCompare(b.applicableDate)
        )
      };
    });
    // Reset form
    setNewRate({
      rate: '',
      applicableDate: getLocalDateString(new Date()),
      isActive: true
    });
    setMessage({
      type: "success",
      text: "New rate added successfully!"
    });
  };
  
  const handleEditRate = (accountLevel4Id, rateId) => {
    const accountRates = rates[accountLevel4Id] || [];
    const rateToEdit = accountRates.find(rate => rate.id === rateId);
    if (rateToEdit) {
      setEditingRate({
        accountLevel4Id,
        id: rateId,
        rate: rateToEdit.rate.toString(),
        applicableDate: rateToEdit.applicableDate,
        isActive: rateToEdit.isActive,
        createdBy: rateToEdit.createdBy, // Preserve createdBy
        createdAt: rateToEdit.createdAt  // Preserve createdAt
      });
    }
  };
  
  const handleUpdateRate = () => {
    if (!editingRate) return;
    const rateValue = parseFloat(editingRate.rate);
    if (isNaN(rateValue)) {
      setMessage({
        type: "error",
        text: "Please enter a valid rate"
      });
      return;
    }
    // Update rates state with audit fields
    setRates(prev => {
      const accountRates = prev[editingRate.accountLevel4Id] || [];
      return {
        ...prev,
        [editingRate.accountLevel4Id]: accountRates.map(rate => 
          rate.id === editingRate.id ? {
            ...rate,
            rate: rateValue,
            applicableDate: editingRate.applicableDate,
            isActive: editingRate.isActive,
            updatedBy: username, // Update updatedBy
            updatedAt: new Date().toISOString() // Update updatedAt
          } : rate
        )
      };
    });
    // Reset editing state
    setEditingRate(null);
    setMessage({
      type: "success",
      text: "Rate updated successfully!"
    });
  };
  
  const handleDeleteRate = async (accountLevel4Id, rateId) => {
    if (window.confirm("Are you sure you want to delete this rate?")) {
      try {
        // For temporary rates (not yet saved to DB), just update state
        if (rateId.startsWith('temp-')) {
          setRates(prev => {
            const accountRates = prev[accountLevel4Id] || [];
            return {
              ...prev,
              [accountLevel4Id]: accountRates.filter(rate => rate.id !== rateId)
            };
          });
          setMessage({
            type: "success",
            text: "Rate deleted successfully!"
          });
          return;
        }
        
        // Make API call to delete from backend - FIXED URL
        const response = await fetch(`http://localhost:5000/api/product-rates/rates/${rateId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
          }
        });
        
        // Parse response to get error details if any
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete rate');
        }
        
        // Update local state after successful deletion
        setRates(prev => {
          const accountRates = prev[accountLevel4Id] || [];
          return {
            ...prev,
            [accountLevel4Id]: accountRates.filter(rate => rate.id !== rateId)
          };
        });
        
        setMessage({
          type: "success",
          text: data.message || "Rate deleted successfully!"
        });
      } catch (error) {
        console.error('Error deleting rate:', error);
        setMessage({
          type: "error",
          text: error.message || "Failed to delete rate. Please try again."
        });
      }
    }
  };
  
  const handleToggleActive = (accountLevel4Id, rateId) => {
    setRates(prev => {
      const accountRates = prev[accountLevel4Id] || [];
      return {
        ...prev,
        [accountLevel4Id]: accountRates.map(rate => 
          rate.id === rateId ? { 
            ...rate, 
            isActive: !rate.isActive,
            updatedBy: username, // Update updatedBy
            updatedAt: new Date().toISOString() // Update updatedAt
          } : rate
        )
      };
    });
  };
  
  const handleSaveAllRates = async () => {
    if (!companyId || !selectedFinishedGood) {
      setMessage({
        type: "error",
        text: "Please select a company and finished good first"
      });
      return;
    }
    setLoading(true);
    try {
      const ratesToSave = Object.entries(rates).flatMap(([accountId, rateList]) => 
        rateList
          .filter(rate => !deletedRateIds.includes(rate.id))
          .map(rate => ({
            accountLevel4Id: accountId,
            rate: rate.rate,
            applicableDate: rate.applicableDate,
            isActive: rate.isActive,
            createdBy: rate.createdBy, // Include createdBy
            updatedBy: rate.updatedBy, // Include updatedBy
            createdAt: rate.createdAt, // Include createdAt
            updatedAt: rate.updatedAt  // Include updatedAt
          }))
      );
      const res = await fetch(`http://localhost:5000/api/product-rates/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finishedGoodId: selectedFinishedGood,
          rates: ratesToSave,
          deletedRateIds,
          username // Include username in request
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save rates');
      }
      const data = await res.json();
      setDeletedRateIds([]);
      // Refresh rates for the selected account level 4
      if (selectedAccountLevel4) {
        const refreshRes = await fetch(
          `http://localhost:5000/api/product-rates/${companyId}/accounts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accountIds: [selectedAccountLevel4] })
          }
        );
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const ratesObj = {};
          refreshData.forEach(rate => {
            const accountId = rate.accountLevel4?._id || rate.accountLevel4;
            if (!ratesObj[accountId]) {
              ratesObj[accountId] = [];
            }
            const dateOnly = rate.applicableDate.includes('T') 
              ? rate.applicableDate.split('T')[0]
              : rate.applicableDate;
              
            ratesObj[accountId].push({
              ...rate,
              id: rate._id || `temp-${Date.now()}`,
              accountLevel4Id: accountId,
              applicableDate: dateOnly,
              createdBy: rate.createdBy?.username || 'Unknown',
              updatedBy: rate.updatedBy?.username || 'Unknown',
              createdAt: rate.createdAt,
              updatedAt: rate.updatedAt
            });
          });
          setRates(ratesObj);
        }
      }
      setMessage({
        type: "success",
        text: data.message || "All rates saved successfully!"
      });
    } catch (err) {
      console.error('Error saving rates:', err);
      setMessage({
        type: "error",
        text: err.message || 'Failed to save rates'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedFinishedGoodName = () => {
    const selected = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    return selected ? `${selected.code} - ${selected.level3Title}` : 'Select Finished Good';
  };
  
  // Get selected account level 4 name
  const getSelectedAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    return selected ? `${selected.fullcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  // Micro compact styling with purple theme
  const inputClass = "w-full p-1 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-xs h-7";
  const labelClass = "block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-2 rounded-md shadow mb-2 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  const buttonClass = "flex items-center justify-center gap-1 px-2 py-1 rounded-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-colors duration-200 text-xs";
  const tableHeaderClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-1 text-left font-medium text-xs";
  const tableCellClass = "p-1 border-t border-purple-200 dark:border-purple-700 text-xs";
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-1 md:p-2">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Product Rate Setting
          </h1>
          <p className="text-xs text-purple-500 dark:text-purple-400">
            Configure product rates and settings
          </p>
        </div>
        
        {message && (
          <div className={`mb-2 p-1.5 rounded-sm text-white font-medium shadow-md flex items-center gap-1 text-xs ${message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {message.text}
          </div>
        )}
        
        {/* Finished Goods Selection */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>
            <Package className="text-purple-600 w-3 h-3" />
            Select Finished Good
          </h2>
          <div className="relative">
            <label className={labelClass}>Finished Goods</label>
            <button
              type="button"
              onClick={() => setIsFinishedGoodComboboxOpen(!isFinishedGoodComboboxOpen)}
              className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
              disabled={loading || !companyId}
            >
              <span className="truncate text-xs">{getSelectedFinishedGoodName()}</span>
              {selectedFinishedGood ? (
                <X 
                  className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinishedGood(null);
                    setAccountLevel4s([]);
                    setFilteredAccountLevel4s([]);
                    setSelectedAccountLevel4(null);
                    setRates({});
                    setDeletedRateIds([]);
                  }}
                />
              ) : (
                <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
              )}
            </button>
            
            {isFinishedGoodComboboxOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                  <input
                    type="text"
                    placeholder="Search finished goods..."
                    className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {finishedGoods.filter(fg => 
                  fg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  fg.code.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 0 ? (
                  <ul>
                    {finishedGoods
                      .filter(fg => 
                        fg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        fg.code.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((finishedGood) => (
                        <li 
                          key={finishedGood._id}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${finishedGood._id === selectedFinishedGood ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                          onClick={() => {
                            setSelectedFinishedGood(finishedGood._id);
                            setIsFinishedGoodComboboxOpen(false);
                            setSearchTerm('');
                            setDeletedRateIds([]);
                          }}
                        >
                          <div className="font-medium">{finishedGood.code} - {finishedGood.level3Title}</div>
                          {finishedGood.level1Title && (
                            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                              {finishedGood.level1Title} &gt; {finishedGood.level2Title} &gt; {finishedGood.level3Title}
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                    {finishedGoods.length === 0 ? 'No finished goods found' : 'No matching finished goods found'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {selectedFinishedGood && (
          <>
            {/* Account Level 4 Selection */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <Package className="text-purple-600 w-3 h-3" />
                Select Account Level 4
              </h2>
              <div className="relative">
                <label className={labelClass}>Account Level 4</label>
                <button
                  type="button"
                  onClick={() => {
                    // Toggle the dropdown
                    const dropdown = document.getElementById('accountLevel4Dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-xs">{getSelectedAccountLevel4Name()}</span>
                  {selectedAccountLevel4 ? (
                    <X 
                      className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccountLevel4(null);
                        setRates({});
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                <div id="accountLevel4Dropdown" className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto hidden">
                  <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                    <input
                      type="text"
                      placeholder="Search account level 4..."
                      className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                      value={accountLevel4SearchTerm}
                      onChange={(e) => setAccountLevel4SearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  {filteredAccountLevel4s.length > 0 ? (
                    <ul>
                      {filteredAccountLevel4s.map((account) => (
                        <li 
                          key={account._id}
                          className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${account._id === selectedAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                          onClick={() => {
                            setSelectedAccountLevel4(account._id);
                            // Hide the dropdown
                            const dropdown = document.getElementById('accountLevel4Dropdown');
                            if (dropdown) {
                              dropdown.classList.add('hidden');
                            }
                            setAccountLevel4SearchTerm('');
                          }}
                        >
                          <div className="font-medium">{account.fullcode} - {account.title}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-xs">
                      No matching account level 4 items found
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Only show rates section when an account level 4 is selected */}
            {selectedAccountLevel4 && (
              <>
                {/* Account Level 4 Rates */}
                <div className={sectionClass}>
                  <h2 className={sectionTitleClass}>
                    <Package className="text-purple-600 w-3 h-3" />
                    Account Level 4 Rates - {getSelectedAccountLevel4Name()}
                  </h2>
                  
                  {/* Add New Rate Form */}
                  <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-sm">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                      {editingRate ? 'Edit Rate' : 'Add New Rate'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                      <div>
                        <label className={labelClass}>Rate (PKR)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={editingRate?.rate || newRate.rate}
                            onChange={(e) => 
                              editingRate 
                                ? setEditingRate({...editingRate, rate: e.target.value})
                                : setNewRate({...newRate, rate: e.target.value})
                            }
                            className={inputClass}
                            placeholder="Enter rate"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Applicable Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editingRate?.applicableDate || newRate.applicableDate}
                            onChange={(e) => 
                              editingRate 
                                ? setEditingRate({...editingRate, applicableDate: e.target.value})
                                : setNewRate({...newRate, applicableDate: e.target.value})
                            }
                            className={inputClass}
                          />
                          <div className="absolute right-1 top-1.5 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3 text-purple-400" />
                            <div className="group relative">
                              <Info className="h-3 w-3 text-purple-400 cursor-pointer" />
                              <div className="absolute right-0 bottom-full mb-1 w-48 p-1 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                Enter any date (past, present, or future)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1">
                        {editingRate ? (
                          <>
                            <button
                              type="button"
                              onClick={handleUpdateRate}
                              className={`${buttonClass} flex-1 h-7`}
                            >
                              <Save className="w-3 h-3" />
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRate(null)}
                              className="p-1 h-7 rounded-sm font-medium border border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAddRate}
                            className={`${buttonClass} flex-1 h-7`}
                          >
                            <Plus className="w-3 h-3" />
                            Add Rate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Level 4 Rates Table */}
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={tableHeaderClass}>Subcode</th>
                            <th className={tableHeaderClass}>Account Level 4</th>
                            <th className={tableHeaderClass}>Rate (PKR)</th>
                            <th className={tableHeaderClass}>Applicable Date</th>
                            <th className={tableHeaderClass}>Status</th>
                            <th className={tableHeaderClass}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAccountLevel4s
                            .filter(account => account._id === selectedAccountLevel4)
                            .map(account => {
                              const accountRates = rates[account._id] || [];
                              return (
                                <tr 
                                  key={account._id}
                                  className="hover:bg-purple-100 dark:hover:bg-purple-900/50"
                                >
                                  <td className={tableCellClass}>{account.fullcode}</td>
                                  <td className={tableCellClass}>{account.title}</td>
                                  <td className={tableCellClass}>
                                    {accountRates.length > 0 ? (
                                      <div className="space-y-1">
                                        {accountRates.map(rate => (
                                          <div key={rate.id}>{rate.rate.toLocaleString()}</div>
                                        ))}
                                      </div>
                                    ) : '-'}
                                  </td>
                                  <td className={tableCellClass}>
                                    {accountRates.length > 0 ? (
                                      <div className="space-y-1">
                                        {accountRates.map(rate => (
                                          <div key={rate.id}>
                                            {formatDisplayDate(rate.applicableDate)}
                                          </div>
                                        ))}
                                      </div>
                                    ) : '-'}
                                  </td>
                                  <td className={tableCellClass}>
                                    {accountRates.length > 0 ? (
                                      <div className="space-y-1">
                                        {accountRates.map(rate => (
                                          <div key={rate.id}>
                                            <span 
                                              className={`px-1 py-0.5 rounded-full text-xs font-medium ${
                                                rate.isActive 
                                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                              }`}
                                            >
                                              {rate.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : '-'}
                                  </td>
                                  <td className={`${tableCellClass} whitespace-nowrap`}>
                                    {accountRates.length > 0 ? (
                                      <div className="space-y-1">
                                        {accountRates.map(rate => (
                                          <div key={rate.id} className="flex gap-1">
                                            <button
                                              onClick={() => handleToggleActive(account._id, rate.id)}
                                              className="p-0.5 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                              title={rate.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                              {rate.isActive ? (
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                              ) : (
                                                <X className="w-3 h-3 text-gray-500" />
                                              )}
                                            </button>
                                            <button
                                              onClick={() => handleEditRate(account._id, rate.id)}
                                              className="p-0.5 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                              title="Edit"
                                            >
                                              <Edit2 className="w-3 h-3 text-blue-500" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteRate(account._id, rate.id)}
                                              className="p-0.5 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                              title="Delete"
                                            >
                                              <Trash2 className="w-3 h-3 text-red-500" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Save All Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAllRates}
                    disabled={loading || Object.keys(rates).length === 0}
                    className={`${buttonClass} px-3 py-1.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Save All Rates
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}