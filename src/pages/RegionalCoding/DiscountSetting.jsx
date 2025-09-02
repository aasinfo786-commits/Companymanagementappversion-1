import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Package,
  Percent,
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
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
export default function DiscountSetting() {
  const { companyId, username } = useAppContext(); // Added username from AppContext
  
  // State for debtors and selection
  const [debtorAccounts, setDebtorAccounts] = useState([]);
  const [selectedDebtorAccount, setSelectedDebtorAccount] = useState('');
  const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
  const [isDebtorComboboxOpen, setIsDebtorComboboxOpen] = useState(false);
  
  // State for account level 4 of debtors
  const [debtorAccountLevel4s, setDebtorAccountLevel4s] = useState([]);
  const [filteredDebtorAccountLevel4s, setFilteredDebtorAccountLevel4s] = useState([]);
  const [debtorAccountLevel4SearchTerm, setDebtorAccountLevel4SearchTerm] = useState('');
  const [selectedDebtorAccountLevel4, setSelectedDebtorAccountLevel4] = useState('');
  const [isDebtorAccountLevel4ComboboxOpen, setIsDebtorAccountLevel4ComboboxOpen] = useState(false);
  
  // State for products and selection
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for account level 4 data
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [filteredAccountLevel4s, setFilteredAccountLevel4s] = useState([]);
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [selectedFinishedGoodAccountLevel4, setSelectedFinishedGoodAccountLevel4] = useState(null); // New state for selected finished good account level 4
  
  // State for discounts
  const [discounts, setDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [newDiscount, setNewDiscount] = useState({
    applicableDate: new Date().toISOString().split('T')[0],
    isActive: true,
    createdBy: username, // Added createdBy
    updatedBy: username, // Added updatedBy
    createdAt: new Date().toISOString(), // Added createdAt
    updatedAt: new Date().toISOString() // Added updatedAt
  });
  
  // State for default discount rates
  const [defaultDiscounts, setDefaultDiscounts] = useState([]);
  const [discountRates, setDiscountRates] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFinishedGoodComboboxOpen, setIsFinishedGoodComboboxOpen] = useState(false);
  const [isFinishedGoodAccountLevel4ComboboxOpen, setIsFinishedGoodAccountLevel4ComboboxOpen] = useState(false); // New state for dropdown
  
  // Fetch debtor accounts when company changes
  useEffect(() => {
    const fetchDebtorAccounts = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/customer-profile/debtor-accounts/${companyId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch debtor accounts');
        }
        const data = await res.json();
        setDebtorAccounts(data);
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch debtor accounts'
        });
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchDebtorAccounts();
  }, [companyId]);
  
  // Fetch default discount rates when company changes
  useEffect(() => {
    const fetchDefaultDiscounts = async () => {
      if (!companyId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/defaults/discounts/${companyId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch default discounts');
        }
        const data = await res.json();
        setDefaultDiscounts(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error('Error fetching default discounts:', err);
      }
    };
    if (companyId) fetchDefaultDiscounts();
  }, [companyId]);
  
  // Fetch account level 4 for selected debtor account
  useEffect(() => {
    const fetchDebtorAccountLevel4s = async () => {
      if (!companyId || !selectedDebtorAccount) return;
      setLoading(true);
      try {
        const selectedDebtor = debtorAccounts.find(da => da._id === selectedDebtorAccount);
        if (!selectedDebtor) return;
        
        const res = await fetch(
          `http://localhost:5000/api/customer-profile/sub-accounts/${companyId}?code=${selectedDebtor.code}`
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch account level 4');
        }
        
        const data = await res.json();
        setDebtorAccountLevel4s(data);
        setFilteredDebtorAccountLevel4s(data);
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
    if (selectedDebtorAccount) fetchDebtorAccountLevel4s();
  }, [selectedDebtorAccount, companyId, debtorAccounts]);
  
  // Filter debtor account level 4 based on search term
  useEffect(() => {
    const filtered = debtorAccountLevel4s.filter(al4 => 
      al4.title.toLowerCase().includes(debtorAccountLevel4SearchTerm.toLowerCase()) ||
      al4.fullcode.toLowerCase().includes(debtorAccountLevel4SearchTerm.toLowerCase())
    );
    setFilteredDebtorAccountLevel4s(filtered);
  }, [debtorAccountLevel4SearchTerm, debtorAccountLevel4s]);
  
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
        setSelectedFinishedGoodAccountLevel4(null); // Reset selected finished good account level 4
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
  
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (!companyId || !selectedDebtorAccount || !selectedDebtorAccountLevel4 || !selectedFinishedGood || !selectedFinishedGoodAccountLevel4) {
        setDiscounts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/product-discounts/${companyId}/filtered`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              debtorAccountId: selectedDebtorAccount,
              debtorAccountLevel4Id: selectedDebtorAccountLevel4,
              finishedGoodId: selectedFinishedGood,
              accountLevel4Id: selectedFinishedGoodAccountLevel4
            })
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch discounts');
        }
        
        const data = await res.json();
        
        const mappedDiscounts = data.map(discount => {
          // Find the matching account level 4 from our local state
          const accountLevel4 = accountLevel4s.find(al4 => al4._id === discount.accountLevel4?._id || al4._id === discount.accountLevel4) || 
                              { 
                                _id: discount.accountLevel4?._id || discount.accountLevel4,
                                fullcode: discount.accountCode || '',
                                title: discount.accountLevel4?.title || ''
                              };
          return {
            ...discount,
            id: discount._id || discount.id,
            debtorAccountId: selectedDebtorAccount,
            debtorAccountLevel4Id: selectedDebtorAccountLevel4,
            finishedGoodId: selectedFinishedGood,
            accountLevel4Id: accountLevel4._id,
            discountRates: Array.isArray(discount.discountRates) ? 
              discount.discountRates.map(rate => ({
                ...rate,
                discountTypeId: rate.discountTypeId?._id || rate.discountTypeId,
                isEditable: rate.isEditable || false // Add isEditable field
              })) : [],
            accountLevel4: accountLevel4,
            createdBy: discount.createdBy?.username || 'Unknown', // Updated to handle populated user object
            updatedBy: discount.updatedBy?.username || 'Unknown', // Updated to handle populated user object
            createdAt: discount.createdAt, // Added createdAt
            updatedAt: discount.updatedAt  // Added updatedAt
          };
        });
        setDiscounts(mappedDiscounts.sort((a, b) => 
          new Date(a.applicableDate) - new Date(b.applicableDate)
        ));
      } catch (err) {
        console.error('Error fetching discounts:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch discounts'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, [companyId, selectedDebtorAccount, selectedDebtorAccountLevel4, selectedFinishedGood, selectedFinishedGoodAccountLevel4, accountLevel4s]);
  
  // Filter account level 4 based on search term
  useEffect(() => {
    const filtered = accountLevel4s.filter(al4 => 
      al4.title.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()) ||
      al4.fullcode.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())
    );
    setFilteredAccountLevel4s(filtered);
  }, [accountLevel4SearchTerm, accountLevel4s]);
  
  // Handle discount rate change
  const handleDiscountRateChange = (typeId, field, value) => {
    setDiscountRates(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value
      }
    }));
  };
  
  // Toggle editable status for a discount rate
  const toggleDiscountEditable = (typeId) => {
    setDiscountRates(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        isEditable: !prev[typeId]?.isEditable
      }
    }));
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const handleAddDiscount = () => {
    if (!selectedDebtorAccount || !selectedDebtorAccountLevel4 || !selectedFinishedGood || !selectedFinishedGoodAccountLevel4 || !newDiscount.applicableDate) {
      setMessage({
        type: "error",
        text: "Please select all required fields and enter applicable date"
      });
      return;
    }
    const selectedDate = new Date(newDiscount.applicableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setMessage({
        type: "error",
        text: "Applicable date cannot be in the past"
      });
      return;
    }
    // Validate discount rates
    const hasInvalidRates = Object.entries(discountRates).some(([_, rate]) => {
      if (!rate || rate.value === undefined || rate.value === '') return false;
      const numValue = parseFloat(rate.value);
      if (isNaN(numValue)) return true;
      if (rate.type === 'percentage' && (numValue < 0 || numValue > 100)) return true;
      if ((rate.type === 'quantity' || rate.type === 'flat') && numValue < 0) return true;
      return false;
    });
    if (hasInvalidRates) {
      setMessage({
        type: "error",
        text: "Please enter valid discount rates (0-100% for percentages, positive numbers for others)"
      });
      return;
    }
    const addedDiscount = {
      id: `temp-${Date.now()}`,
      debtorAccountId: selectedDebtorAccount,
      debtorAccountLevel4Id: selectedDebtorAccountLevel4,
      finishedGoodId: selectedFinishedGood,
      accountLevel4Id: selectedFinishedGoodAccountLevel4,
      applicableDate: newDiscount.applicableDate,
      isActive: newDiscount.isActive,
      createdBy: username, // Added createdBy
      updatedBy: username, // Added updatedBy
      createdAt: new Date().toISOString(), // Added createdAt
      updatedAt: new Date().toISOString(), // Added updatedAt
      discountRates: Object.entries(discountRates)
        .filter(([_, rate]) => rate && rate.value !== undefined && rate.value !== '')
        .map(([typeId, rate]) => ({
          discountTypeId: typeId,
          rate: parseFloat(rate.value),
          type: rate.type || 'percentage',
          title: defaultDiscounts.find(dd => dd._id === typeId)?.level4Title || '',
          isEditable: rate.isEditable || false
        }))
    };
    setDiscounts(prev => [...prev, addedDiscount].sort((a, b) =>
      new Date(a.applicableDate) - new Date(b.applicableDate)
    ));
    setNewDiscount({
      applicableDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdBy: username, // Added createdBy
      updatedBy: username, // Added updatedBy
      createdAt: new Date().toISOString(), // Added createdAt
      updatedAt: new Date().toISOString() // Added updatedAt
    });
    setDiscountRates({});
    setMessage({
      type: "success",
      text: "New discount added successfully!"
    });
  };
  
  // Handle editing a discount
  const handleEditDiscount = (discountId) => {
    const discountToEdit = discounts.find(discount => discount.id === discountId);
    if (discountToEdit) {
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDate = discountToEdit.applicableDate;
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      
      setEditingDiscount({
        ...discountToEdit,
        applicableDate: formattedDate
      });
      
      // Set discount rates for editing
      const rates = {};
      discountToEdit.discountRates.forEach(rate => {
        rates[rate.discountTypeId] = {
          value: rate.rate.toString(),
          type: rate.type,
          isEditable: rate.isEditable
        };
      });
      setDiscountRates(rates);
    }
  };
  
  const handleUpdateDiscount = () => {
    if (!editingDiscount) return;
    const selectedDate = new Date(editingDiscount.applicableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setMessage({
        type: "error",
        text: "Applicable date cannot be in the past"
      });
      return;
    }
    // Validate discount rates
    const hasInvalidRates = Object.entries(discountRates).some(([_, rate]) => {
      if (!rate || rate.value === undefined || rate.value === '') return false;
      const numValue = parseFloat(rate.value);
      if (isNaN(numValue)) return true;
      if (rate.type === 'percentage' && (numValue < 0 || numValue > 100)) return true;
      if ((rate.type === 'quantity' || rate.type === 'flat') && numValue < 0) return true;
      return false;
    });
    if (hasInvalidRates) {
      setMessage({
        type: "error",
        text: "Please enter valid discount rates (0-100% for percentages, positive numbers for others)"
      });
      return;
    }
    setDiscounts(prev => 
      prev.map(discount =>
        discount.id === editingDiscount.id ? {
          ...discount,
          applicableDate: editingDiscount.applicableDate,
          isActive: editingDiscount.isActive,
          updatedBy: username, // Updated updatedBy
          updatedAt: new Date().toISOString(), // Updated updatedAt
          discountRates: Object.entries(discountRates)
            .filter(([_, rate]) => rate && rate.value !== undefined && rate.value !== '')
            .map(([typeId, rate]) => ({
              discountTypeId: typeId,
              rate: parseFloat(rate.value),
              type: rate.type || 'percentage',
              title: defaultDiscounts.find(dd => dd._id === typeId)?.level4Title || '',
              isEditable: rate.isEditable || false
            }))
        } : discount
      )
    );
    setEditingDiscount(null);
    setDiscountRates({});
    setMessage({
      type: "success",
      text: "Discount updated successfully!"
    });
  };
  
  // Handle deleting a discount
  const handleDeleteDiscount = async (discountId) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        // For temporary discounts (not yet saved to DB), just update state
        if (discountId.startsWith('temp-')) {
          setDiscounts(prev => prev.filter(discount => discount.id !== discountId));
          setMessage({
            type: "success",
            text: "Discount deleted successfully!"
          });
          return;
        }
        
        // Make API call to delete from backend
        const response = await fetch(`http://localhost:5000/api/product-discounts/${discountId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
          }
        });
        
        // Parse response to get error details if any
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete discount');
        }
        
        // Update local state after successful deletion
        setDiscounts(prev => prev.filter(discount => discount.id !== discountId));
        
        setMessage({
          type: "success",
          text: data.message || "Discount deleted successfully!"
        });
      } catch (error) {
        console.error('Error deleting discount:', error);
        setMessage({
          type: "error",
          text: error.message || "Failed to delete discount. Please try again."
        });
      }
    }
  };
  
  // Handle toggling discount active status
  const handleToggleActive = (discountId) => {
    setDiscounts(prev => 
      prev.map(discount => 
        discount.id === discountId ? { 
          ...discount, 
          isActive: !discount.isActive,
          updatedBy: username, // Updated updatedBy
          updatedAt: new Date().toISOString() // Updated updatedAt
        } : discount
      )
    );
  };
  
  const handleSaveAllDiscounts = async () => {
    if (!companyId || !selectedDebtorAccount || !selectedDebtorAccountLevel4 || !selectedFinishedGood || !selectedFinishedGoodAccountLevel4) {
      setMessage({
        type: "error",
        text: "Please select all required fields first"
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/product-discounts/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          debtorAccountId: selectedDebtorAccount,
          debtorAccountLevel4Id: selectedDebtorAccountLevel4,
          finishedGoodId: selectedFinishedGood,
          accountLevel4Id: selectedFinishedGoodAccountLevel4,
          username, // Include username
          discounts: discounts.map(discount => ({
            id: discount.id.startsWith('temp-') ? undefined : discount.id,
            accountLevel4Id: discount.accountLevel4Id,
            applicableDate: discount.applicableDate,
            isActive: discount.isActive,
            createdBy: discount.createdBy, // Include createdBy
            updatedBy: discount.updatedBy, // Include updatedBy
            createdAt: discount.createdAt, // Include createdAt
            updatedAt: discount.updatedAt, // Include updatedAt
            discountRates: discount.discountRates.map(rate => ({
              ...rate,
              isEditable: rate.isEditable || false
            }))
          }))
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save discounts');
      }
      const result = await res.json();
      
      // Map the response data to match our frontend structure
      const updatedDiscounts = result.discounts.map(discount => {
        // Use accountLevel4 from response if available, otherwise fall back to accountDetails
        const accountLevel4 = discount.accountLevel4 || discount.accountDetails;
        
        return {
          ...discount,
          id: discount._id || discount.id,
          debtorAccountId: selectedDebtorAccount,
          debtorAccountLevel4Id: selectedDebtorAccountLevel4,
          finishedGoodId: selectedFinishedGood,
          accountLevel4Id: accountLevel4._id,
          accountLevel4: accountLevel4 || { _id: discount.accountLevel4Id },
          createdBy: discount.createdBy || username, // Added createdBy
          updatedBy: discount.updatedBy || username, // Added updatedBy
          createdAt: discount.createdAt, // Added createdAt
          updatedAt: discount.updatedAt, // Added updatedAt
          discountRates: Array.isArray(discount.discountRates) ? 
            discount.discountRates.map(rate => ({
              ...rate,
              isEditable: rate.isEditable || false
            })) : []
        };
      });
      // Sort discounts by date
      const sortedDiscounts = updatedDiscounts.sort((a, b) => 
        new Date(a.applicableDate) - new Date(b.applicableDate)
      );
      setDiscounts(sortedDiscounts);
      setMessage({
        type: "success",
        text: "All discounts saved successfully!"
      });
    } catch (err) {
      console.error('Error saving discounts:', err);
      setMessage({
        type: "error",
        text: err.message || 'Failed to save discounts'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions for display
  const getSelectedDebtorAccountName = () => {
    const selected = debtorAccounts.find(da => da._id === selectedDebtorAccount);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Debtors Account';
  };
  
  const getSelectedDebtorAccountLevel4Name = () => {
    const selected = debtorAccountLevel4s.find(al4 => al4._id === selectedDebtorAccountLevel4);
    return selected ? `${selected.subcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  const getSelectedFinishedGoodName = () => {
    const selected = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    return selected ? `${selected.code} - ${selected.level3Title || 'No Title'}` : 'Select Finished Good';
  };
  
  const getSelectedFinishedGoodAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedFinishedGoodAccountLevel4);
    return selected ? `${selected.fullcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  // Ultra compact styling with purple theme - Increased by 5%
  const inputClass = "w-full p-[2.1px] rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-[10.5px] h-[25.2px]";
  const labelClass = "block text-[10.5px] font-medium text-purple-700 dark:text-purple-300 mb-[2.1px]";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-[4.2px] rounded-sm shadow mb-[4.2px] border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-[10.5px] font-semibold text-purple-800 dark:text-purple-300 mb-[2.1px] flex items-center gap-[2.1px]";
  const buttonClass = "flex items-center justify-center gap-[2.1px] px-[4.2px] py-[2.1px] rounded-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-colors duration-200 text-[10.5px]";
  const tableHeaderClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-[2.1px] text-left font-medium text-[10.5px]";
  const tableCellClass = "p-[2.1px] border-t border-purple-200 dark:border-purple-700 text-[10.5px]";
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-[2.1px]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-[4.2px]">
          <h1 className="text-[14.7px] md:text-[16.8px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-[2.1px] flex items-center justify-center gap-[2.1px]">
            <Percent className="w-[3.15px] h-[3.15px]" />
            Product Discount Setting
          </h1>
          <p className="text-[10.5px] text-purple-500 dark:text-purple-400">
            Configure product discounts and settings
          </p>
        </div>
        
        <div className="flex justify-end mb-[4.2px]">
          <button
            onClick={handleRefresh}
            className={`${buttonClass} h-[25.2px]`}
          >
            <RefreshCw className="w-[2.63px] h-[2.63px]" />
            Refresh
          </button>
        </div>
        
        {message && (
          <div className={`mb-[4.2px] p-[4.2px] rounded-sm text-white font-medium shadow-md flex items-center gap-[2.1px] text-[10.5px] ${message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-[2.63px] h-[2.63px]" />
            ) : (
              <AlertCircle className="w-[2.63px] h-[2.63px]" />
            )}
            {message.text}
          </div>
        )}
        
        {/* Debtor Account and Finished Goods Selection in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[4.2px]">
          {/* Debtor Account Selection */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Users className="text-purple-600 w-[2.63px] h-[2.63px]" />
              Select Debtor Account
            </h2>
            <div className="grid grid-cols-1 gap-[4.2px]">
              {/* Debtor Account Combobox */}
              <div className="relative">
                <label className={labelClass}>Debtors Account</label>
                <button
                  type="button"
                  onClick={() => setIsDebtorComboboxOpen(!isDebtorComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-[10.5px]">{getSelectedDebtorAccountName()}</span>
                  {selectedDebtorAccount ? (
                    <X 
                      className="w-[2.63px] h-[2.63px] text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDebtorAccount('');
                        setSelectedDebtorAccountLevel4('');
                        setDebtorAccountLevel4s([]);
                        setDiscounts([]);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-[2.63px] h-[2.63px] text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isDebtorComboboxOpen && (
                  <div className="absolute z-20 mt-[2.1px] w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-[126px] overflow-auto">
                    <div className="p-[2.1px] sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search debtor accounts..."
                        className="w-full p-[2.1px] rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[10.5px]"
                        value={debtorSearchTerm}
                        onChange={(e) => setDebtorSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {debtorAccounts.filter(da => 
                      da.title.toLowerCase().includes(debtorSearchTerm.toLowerCase()) ||
                      da.code.toLowerCase().includes(debtorSearchTerm.toLowerCase())
                    ).length > 0 ? (
                      <ul>
                        {debtorAccounts
                          .filter(da => 
                            da.title.toLowerCase().includes(debtorSearchTerm.toLowerCase()) ||
                            da.code.toLowerCase().includes(debtorSearchTerm.toLowerCase())
                          )
                          .map((debtorAccount) => (
                            <li 
                              key={debtorAccount._id}
                              className={`p-[2.1px] hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[10.5px] ${debtorAccount._id === selectedDebtorAccount ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                              onClick={() => {
                                setSelectedDebtorAccount(debtorAccount._id);
                                setIsDebtorComboboxOpen(false);
                                setDebtorSearchTerm('');
                                setSelectedDebtorAccountLevel4('');
                                setDiscounts([]);
                              }}
                            >
                              <div className="font-medium">{debtorAccount.code} - {debtorAccount.title}</div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="p-[2.1px] text-center text-purple-500 dark:text-purple-400 text-[10.5px]">
                        {debtorAccounts.length === 0 ? 'No debtor accounts found' : 'No matching debtor accounts found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Debtor Account Level 4 Combobox */}
              <div className="relative">
                <label className={labelClass}>Debtor Account Level 4</label>
                <button
                  type="button"
                  onClick={() => selectedDebtorAccount && setIsDebtorAccountLevel4ComboboxOpen(!isDebtorAccountLevel4ComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                    !selectedDebtorAccount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !selectedDebtorAccount}
                >
                  <span className="truncate text-[10.5px]">{getSelectedDebtorAccountLevel4Name()}</span>
                  {selectedDebtorAccountLevel4 ? (
                    <X 
                      className="w-[2.63px] h-[2.63px] text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDebtorAccountLevel4('');
                        setDiscounts([]);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-[2.63px] h-[2.63px] text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isDebtorAccountLevel4ComboboxOpen && selectedDebtorAccount && (
                  <div className="absolute z-20 mt-[2.1px] w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-[126px] overflow-auto">
                    <div className="p-[2.1px] sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search account level 4..."
                        className="w-full p-[2.1px] rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[10.5px]"
                        value={debtorAccountLevel4SearchTerm}
                        onChange={(e) => setDebtorAccountLevel4SearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {filteredDebtorAccountLevel4s.length > 0 ? (
                      <ul>
                        {filteredDebtorAccountLevel4s.map((accountLevel4) => (
                          <li 
                            key={accountLevel4._id}
                            className={`p-[2.1px] hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[10.5px] ${accountLevel4._id === selectedDebtorAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedDebtorAccountLevel4(accountLevel4._id);
                              setIsDebtorAccountLevel4ComboboxOpen(false);
                              setDebtorAccountLevel4SearchTerm('');
                            }}
                          >
                            <div className="font-medium">{accountLevel4.subcode} - {accountLevel4.title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-[2.1px] text-center text-purple-500 dark:text-purple-400 text-[10.5px]">
                        {debtorAccountLevel4s.length === 0 ? 'No account level 4 found for this debtor' : 'No matching account level 4 found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Finished Goods Selection */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Package className="text-purple-600 w-[2.63px] h-[2.63px]" />
              Select Finished Good
            </h2>
            <div className="grid grid-cols-1 gap-[4.2px]">
              {/* Finished Good Combobox */}
              <div className="relative">
                <label className={labelClass}>Finished Goods</label>
                <button
                  type="button"
                  onClick={() => setIsFinishedGoodComboboxOpen(!isFinishedGoodComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                  disabled={loading || !companyId}
                >
                  <span className="truncate text-[10.5px]">{getSelectedFinishedGoodName()}</span>
                  {selectedFinishedGood ? (
                    <X 
                      className="w-[2.63px] h-[2.63px] text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinishedGood(null);
                        setAccountLevel4s([]);
                        setFilteredAccountLevel4s([]);
                        setSelectedFinishedGoodAccountLevel4(null);
                        setDiscounts([]);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-[2.63px] h-[2.63px] text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isFinishedGoodComboboxOpen && (
                  <div className="absolute z-20 mt-[2.1px] w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-[126px] overflow-auto">
                    <div className="p-[2.1px] sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search finished goods..."
                        className="w-full p-[2.1px] rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[10.5px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    {finishedGoods.filter(fg => 
                      (fg.level3Title && fg.level3Title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (fg.code && fg.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length > 0 ? (
                      <ul>
                        {finishedGoods
                          .filter(fg => 
                            (fg.level3Title && fg.level3Title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (fg.code && fg.code.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((finishedGood) => (
                            <li 
                              key={finishedGood._id}
                              className={`p-[2.1px] hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[10.5px] ${finishedGood._id === selectedFinishedGood ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                              onClick={() => {
                                setSelectedFinishedGood(finishedGood._id);
                                setIsFinishedGoodComboboxOpen(false);
                                setSearchTerm('');
                                setSelectedFinishedGoodAccountLevel4(null);
                                setDiscounts([]);
                              }}
                            >
                              <div className="font-medium">{finishedGood.code} - {finishedGood.level3Title || 'No Title'}</div>
                              {finishedGood.level1Title && (
                                <div className="text-[9.45px] text-purple-500 dark:text-purple-400">
                                  {finishedGood.level1Title} &gt; {finishedGood.level2Title} &gt; {finishedGood.level3Title}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="p-[2.1px] text-center text-purple-500 dark:text-purple-400 text-[10.5px]">
                        {finishedGoods.length === 0 ? 'No finished goods found' : 'No matching finished goods found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Finished Good Account Level 4 Combobox */}
              <div className="relative">
                <label className={labelClass}>Finished Good Account Level 4</label>
                <button
                  type="button"
                  onClick={() => selectedFinishedGood && setIsFinishedGoodAccountLevel4ComboboxOpen(!isFinishedGoodAccountLevel4ComboboxOpen)}
                  className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                    !selectedFinishedGood ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !companyId || !selectedFinishedGood}
                >
                  <span className="truncate text-[10.5px]">{getSelectedFinishedGoodAccountLevel4Name()}</span>
                  {selectedFinishedGoodAccountLevel4 ? (
                    <X 
                      className="w-[2.63px] h-[2.63px] text-purple-500 hover:text-purple-700 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinishedGoodAccountLevel4(null);
                        setDiscounts([]);
                      }}
                    />
                  ) : (
                    <ChevronDown className="w-[2.63px] h-[2.63px] text-purple-500 flex-shrink-0" />
                  )}
                </button>
                
                {isFinishedGoodAccountLevel4ComboboxOpen && selectedFinishedGood && (
                  <div className="absolute z-20 mt-[2.1px] w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-[126px] overflow-auto">
                    <div className="p-[2.1px] sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                      <input
                        type="text"
                        placeholder="Search account level 4..."
                        className="w-full p-[2.1px] rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[10.5px]"
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
                            className={`p-[2.1px] hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[10.5px] ${accountLevel4._id === selectedFinishedGoodAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                            onClick={() => {
                              setSelectedFinishedGoodAccountLevel4(accountLevel4._id);
                              setIsFinishedGoodAccountLevel4ComboboxOpen(false);
                              setAccountLevel4SearchTerm('');
                            }}
                          >
                            <div className="font-medium">{accountLevel4.fullcode} - {accountLevel4.title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-[2.1px] text-center text-purple-500 dark:text-purple-400 text-[10.5px]">
                        {accountLevel4s.length === 0 ? 'No account level 4 found for this finished good' : 'No matching account level 4 found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {selectedDebtorAccount && selectedDebtorAccountLevel4 && selectedFinishedGood && selectedFinishedGoodAccountLevel4 && (
          <>
            {/* Account Level 4 Discounts */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <Percent className="text-purple-600 w-[2.63px] h-[2.63px]" />
                Account Level 4 Discounts - {getSelectedFinishedGoodAccountLevel4Name()}
              </h2>
              
              {/* Add New Discount Form */}
              <div className="mb-[4.2px] p-[4.2px] bg-purple-100 dark:bg-purple-900/30 rounded-sm">
                <h3 className="text-[11.55px] font-medium text-purple-800 dark:text-purple-200 mb-[2.1px]">
                  {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                </h3>
                
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.1px] mb-[2.1px]">
                  {/* Applicable Date */}
                  <div>
                    <label className={labelClass}>Applicable Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editingDiscount?.applicableDate || newDiscount.applicableDate}
                        onChange={(e) =>
                          editingDiscount
                            ? setEditingDiscount({ ...editingDiscount, applicableDate: e.target.value })
                            : setNewDiscount({ ...newDiscount, applicableDate: e.target.value })
                        }
                        className={inputClass}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <CalendarIcon className="absolute right-[2.1px] top-[2.1px] h-[2.63px] w-[2.63px] text-purple-400" />
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className={labelClass}>Status</label>
                    <div className="flex items-center h-[25.2px]">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingDiscount?.isActive !== false}
                          onChange={(e) =>
                            editingDiscount
                              ? setEditingDiscount({ ...editingDiscount, isActive: e.target.checked })
                              : setNewDiscount({ ...newDiscount, isActive: e.target.checked })
                          }
                          className="rounded border-purple-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-[2.1px] text-[10.5px]">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Discount Rates - More Compact */}
                {defaultDiscounts.length > 0 && (
                  <div className="mt-[2.1px]">
                    <label className={labelClass}>Discount Rates</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[2.1px]">
                      {defaultDiscounts.map(dd => (
                        <div key={dd._id} className="p-[2.1px] border rounded-sm dark:border-purple-700 bg-white dark:bg-gray-800">
                          <p className="text-[9.45px] font-medium text-purple-800 dark:text-purple-200 mb-[2.1px] truncate" title={dd.level4Title}>{dd.level4Title}</p>
                          <div className="flex items-center gap-[2.1px] mb-[2.1px]">
                            <select
                              value={discountRates[dd._id]?.type || 'percentage'}
                              onChange={(e) => handleDiscountRateChange(dd._id, 'type', e.target.value)}
                              className="w-2/5 rounded-sm border border-purple-300 dark:border-purple-600 px-[2.1px] py-0 text-[9.45px] dark:bg-gray-900"
                            >
                              <option value="percentage">%</option>
                              <option value="quantity">Qty</option>
                              <option value="flat">Flat</option>
                            </select>
                            <div className="relative w-3/5">
                              <input
                                type="number"
                                value={discountRates[dd._id]?.value || ''}
                                onChange={(e) => handleDiscountRateChange(dd._id, 'value', e.target.value)}
                                className="w-full rounded-sm border border-purple-300 dark:border-purple-600 px-[2.1px] py-0 text-[9.45px] dark:bg-gray-900"
                                placeholder="0"
                                min="0"
                                max={discountRates[dd._id]?.type === 'percentage' ? "100" : undefined}
                                step={discountRates[dd._id]?.type === 'percentage' ? "0.01" : "1"}
                              />
                              {discountRates[dd._id]?.type === 'percentage' && (
                                <Percent className="absolute right-[2.1px] top-[2.1px] h-[2.1px] w-[2.1px] text-purple-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[7.35px] text-purple-500 dark:text-purple-400">
                              {discountRates[dd._id]?.type === 'quantity'
                                ? 'Per piece'
                                : discountRates[dd._id]?.type === 'flat'
                                ? 'Invoice level'
                                : ''}
                            </p>
                            <label className="inline-flex items-center gap-[2.1px] text-[9.45px]">
                              <input
                                type="checkbox"
                                checked={discountRates[dd._id]?.isEditable || false}
                                onChange={() => toggleDiscountEditable(dd._id)}
                                className="rounded border-purple-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                              />
                              <span>Editable</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="mt-[2.1px] flex items-center gap-[2.1px]">
                  {editingDiscount ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateDiscount}
                        className={`${buttonClass} flex-1 h-[25.2px]`}
                      >
                        <Save className="w-[2.63px] h-[2.63px]" />
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDiscount(null);
                          setDiscountRates({});
                        }}
                        className="p-[2.1px] h-[25.2px] rounded-sm font-medium border border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-700"
                      >
                        <X className="w-[2.63px] h-[2.63px]" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddDiscount}
                      className={`${buttonClass} flex-1 h-[25.2px]`}
                    >
                      <Plus className="w-[2.63px] h-[2.63px]" />
                      Add Discount
                    </button>
                  )}
                </div>
              </div>
              
              {/* Account Level 4 Discounts Table */}
              {loading ? (
                <div className="flex justify-center py-[8.4px]">
                  <RefreshCw className="w-[4.2px] h-[4.2px] animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={tableHeaderClass}>Subcode</th>
                        <th className={tableHeaderClass}>Account Level 4</th>
                        <th
                          className={tableHeaderClass}
                          colSpan={defaultDiscounts.length || 1}
                        >
                          Discount Rates
                        </th>
                        <th className={tableHeaderClass}>Applicable Date</th>
                        <th className={tableHeaderClass}>Status</th>
                        <th className={tableHeaderClass}>Actions</th>
                      </tr>
                      {defaultDiscounts.length > 0 && (
                        <tr>
                          <th className="p-[2.1px]"></th>
                          <th className="p-[2.1px]"></th>
                          {defaultDiscounts.map(dd => (
                            <th
                              key={dd._id}
                              className="p-[2.1px] text-center text-[8.4px] font-normal text-purple-600 dark:text-purple-400"
                            >
                              {dd.level4Title.length > 10 ? dd.level4Title.substring(0, 10) + '...' : dd.level4Title}
                            </th>
                          ))}
                          <th className="p-[2.1px]"></th>
                          <th className="p-[2.1px]"></th>
                          <th className="p-[2.1px]"></th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {/* Only show the selected finished good account level 4 */}
                      {filteredAccountLevel4s
                        .filter(account => account._id === selectedFinishedGoodAccountLevel4)
                        .map(account => {
                          const accountDiscounts = discounts.filter(d => 
                            d.accountLevel4Id === account._id &&
                            d.debtorAccountId === selectedDebtorAccount &&
                            d.debtorAccountLevel4Id === selectedDebtorAccountLevel4 &&
                            d.finishedGoodId === selectedFinishedGood
                          );
                          
                          return (
                            <tr
                              key={account._id}
                              className="hover:bg-purple-100 dark:hover:bg-purple-900/50"
                            >
                              <td className={tableCellClass}>{account.fullcode}</td>
                              <td className={tableCellClass}>{account.title}</td>
                              {defaultDiscounts.length > 0 ? (
                                defaultDiscounts.map(dd => {
                                  const rate = accountDiscounts.length > 0 && 
                                    accountDiscounts[0].discountRates?.find(r => r.discountTypeId === dd._id);
                                  return (
                                    <td key={dd._id} className={tableCellClass}>
                                      {rate ? (
                                        <div className="flex flex-col items-center justify-center gap-[2.1px]">
                                          <span className="text-[9.45px] px-[2.1px] py-0 border border-purple-200 dark:border-purple-700 rounded whitespace-nowrap">
                                            {parseFloat(rate.rate).toFixed(
                                              rate.type === 'percentage' ? 2 : 0
                                            )}
                                            {rate.type === 'percentage'
                                              ? '%'
                                              : rate.type === 'quantity'
                                              ? '/pc'
                                              : ''}
                                          </span>
                                          {rate.isEditable && (
                                            <span className="text-[7.35px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-[2.1px] py-0 rounded-full">
                                              Editable
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                  );
                                })
                              ) : (
                                <td className={tableCellClass}>-</td>
                              )}
                              <td className={tableCellClass}>
                                {accountDiscounts.length > 0 ? (
                                  <div className="flex flex-col gap-[2.1px]">
                                    {accountDiscounts.map(discount => (
                                      <div key={discount.id} className="text-[9.45px]">
                                        {new Date(discount.applicableDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className={tableCellClass}>
                                {accountDiscounts.length > 0 ? (
                                  <div className="flex flex-col gap-[2.1px]">
                                    {accountDiscounts.map(discount => (
                                      <div key={discount.id}>
                                        <span
                                          className={`px-[2.1px] py-0 rounded-full text-[7.35px] font-medium ${
                                            discount.isActive
                                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                          }`}
                                        >
                                          {discount.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className={`${tableCellClass} whitespace-nowrap`}>
                                {accountDiscounts.length > 0 ? (
                                  <div className="flex flex-col gap-[2.1px]">
                                    {accountDiscounts.map(discount => (
                                      <div key={discount.id} className="flex gap-[2.1px]">
                                        <button
                                          onClick={() => handleToggleActive(discount.id)}
                                          className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                          title={discount.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                          {discount.isActive ? (
                                            <CheckCircle2 className="w-[2.63px] h-[2.63px] text-green-500" />
                                          ) : (
                                            <X className="w-[2.63px] h-[2.63px] text-gray-500" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleEditDiscount(discount.id)}
                                          className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-[2.63px] h-[2.63px] text-blue-500" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDiscount(discount.id)}
                                          className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-[2.63px] h-[2.63px] text-red-500" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
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
                onClick={handleSaveAllDiscounts}
                disabled={loading || discounts.length === 0}
                className={`${buttonClass} px-[4.2px] py-[2.1px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <RefreshCw className="w-[2.63px] h-[2.63px] animate-spin" />
                ) : (
                  <Save className="w-[2.63px] h-[2.63px]" />
                )}
                Save All Discounts
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}