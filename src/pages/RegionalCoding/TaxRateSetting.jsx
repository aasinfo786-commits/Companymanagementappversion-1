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
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
export default function TaxRateSetting() {
  const { companyId, username } = useAppContext(); // Added username from AppContext
  
  // State for combined items (finished goods and raw materials)
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [isItemComboboxOpen, setIsItemComboboxOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);
  
  // State for account level 4
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [filteredAccountLevel4s, setFilteredAccountLevel4s] = useState([]);
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [selectedAccountLevel4, setSelectedAccountLevel4] = useState('');
  const [isAccountLevel4ComboboxOpen, setIsAccountLevel4ComboboxOpen] = useState(false);
  
  // State for tax rates
  const [taxRates, setTaxRates] = useState([]);
  const [editingTaxRate, setEditingTaxRate] = useState(null);
  const [newTaxRate, setNewTaxRate] = useState({
    applicableDate: new Date().toISOString().split('T')[0],
    isActive: true,
    isExempted: false, 
    createdBy: username, // Added createdBy
    updatedBy: username, // Added updatedBy
    createdAt: new Date().toISOString(), // Added createdAt
    updatedAt: new Date().toISOString() // Added updatedAt
  });
  
  // State for default tax rates
  const [defaultTaxes, setDefaultTaxes] = useState([]);
  const [taxRateValues, setTaxRateValues] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Fetch items when company changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        // Fetch finished goods
        const fgRes = await fetch(`http://localhost:5000/api/defaults/finishedGoods/${companyId}`);
        if (!fgRes.ok) throw new Error('Failed to fetch finished goods');
        const fgData = await fgRes.json();
        const finishedGoods = Array.isArray(fgData) ? fgData : (fgData.data || []);
        
        // Fetch raw materials
        const rmRes = await fetch(`http://localhost:5000/api/defaults/rawMaterials/${companyId}`);
        if (!rmRes.ok) throw new Error('Failed to fetch raw materials');
        const rmData = await rmRes.json();
        const rawMaterials = Array.isArray(rmData) ? rmData : (rmData.data || []);
        
        // Combine both with type identifiers
        const combinedItems = [
          ...finishedGoods.map(item => ({ ...item, type: 'finishedGood' })),
          ...rawMaterials.map(item => ({ ...item, type: 'rawMaterial' }))
        ];
        
        // Fetch titles for each item from AccountLevel3
        const itemsWithTitles = await Promise.all(
          combinedItems.map(async (item) => {
            try {
              // Fetch AccountLevel3 data for this item
              const al3Res = await fetch(
                `http://localhost:5000/api/accounts/level3/${companyId}/${item.level1Id}/${item.level2Id}`
              );
              if (!al3Res.ok) throw new Error('Failed to fetch account level 3');
              const al3Data = await al3Res.json();
              const accountLevel3s = Array.isArray(al3Data) ? al3Data : (al3Data.data || []);
              
              // Find the matching AccountLevel3 record
              const matchingAL3 = accountLevel3s.find(al3 => al3._id === item.level3Id);
              
              // Return the item with the title from AccountLevel3
              return {
                ...item,
                title: matchingAL3 ? matchingAL3.title : item.title || ''
              };
            } catch (err) {
              console.error(`Error fetching title for item ${item.code}:`, err);
              // Return the item with its existing title (or empty string if none exists)
              return {
                ...item,
                title: item.title || ''
              };
            }
          })
        );
        
        setItems(itemsWithTitles);
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch items'
        });
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchItems();
  }, [companyId]);
  
  // Fetch default tax rates when company changes
  useEffect(() => {
    const fetchDefaultTaxes = async () => {
      if (!companyId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/defaults/govt_taxes/${companyId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch default taxes');
        }
        const data = await res.json();
        setDefaultTaxes(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error('Error fetching default taxes:', err);
      }
    };
    if (companyId) fetchDefaultTaxes();
  }, [companyId]);
  
  // Fetch account level 4 for selected item
  useEffect(() => {
    const fetchAccountLevel4s = async () => {
      if (!companyId || !selectedItem) return;
      setLoading(true);
      try {
        const selected = items.find(item => item._id === selectedItem);
        if (!selected) return;
        
        const res = await fetch(
          `http://localhost:5000/api/accounts/level4/${companyId}/${selected.level1Id}/${selected.level2Id}/${selected.level3Id}`
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch account level 4');
        }
        const data = await res.json();
        setAccountLevel4s(data.data || []);
        setFilteredAccountLevel4s(data.data || []);
        setSelectedItemType(selected.type);
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
    if (selectedItem) fetchAccountLevel4s();
  }, [selectedItem, companyId, items]);
  
  // Filter account level 4 based on search term
  useEffect(() => {
    const filtered = accountLevel4s.filter(al4 => {
      if (!al4) return false;
      const title = al4.title || '';
      const subcode = al4.subcode || '';
      return (
        title.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()) ||
        subcode.toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())
      );
    });
    setFilteredAccountLevel4s(filtered);
  }, [accountLevel4SearchTerm, accountLevel4s]);
  
  // Fetch tax rates when item or account changes
  useEffect(() => {
    const fetchTaxRates = async () => {
      if (!companyId || !selectedItem || !selectedAccountLevel4) {
        setTaxRates([]);
        return;
      }
      setLoading(true);
      try {
        const selected = items.find(item => item._id === selectedItem);
        if (!selected) return;
        
        const res = await fetch(
          `http://localhost:5000/api/tax-rates/${companyId}/filtered`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              itemId: selectedItem,
              itemType: selected.type,
              accountLevel4Id: selectedAccountLevel4
            })
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch tax rates');
        }
        const data = await res.json();
        
        const mappedTaxRates = data.map(taxRate => {
          const accountLevel4 = accountLevel4s.find(al4 => 
            al4._id === taxRate[selected.type + 'AccountLevel4']?._id || 
            al4._id === taxRate[selected.type + 'AccountLevel4']
          ) || {
            _id: taxRate[selected.type + 'AccountLevel4']?._id || taxRate[selected.type + 'AccountLevel4'],
            subcode: taxRate[selected.type + 'AccountCode'] || '',
            title: taxRate[selected.type + 'AccountLevel4']?.title || ''
          };
          
          return {
            ...taxRate,
            id: taxRate._id || taxRate.id,
            itemId: selectedItem,
            itemType: selected.type,
            accountLevel4Id: selectedAccountLevel4,
            taxRates: Array.isArray(taxRate.taxRates) ?
              taxRate.taxRates.map(rate => ({
                ...rate,
                taxTypeId: rate.taxTypeId?._id || rate.taxTypeId,
                isEditable: rate.isEditable || false,
                transactionType: rate.transactionType || 'sale',
                registeredValue: rate.registeredValue || 0,
                unregisteredValue: rate.unregisteredValue || 0
              })) : [],
            accountLevel4: accountLevel4,
            createdBy: taxRate.createdBy?.username || 'Unknown', // Added createdBy
            updatedBy: taxRate.updatedBy?.username || 'Unknown', // Added updatedBy
            createdAt: taxRate.createdAt, // Added createdAt
            updatedAt: taxRate.updatedAt  // Added updatedAt
          };
        });
        
        setTaxRates(mappedTaxRates.sort((a, b) =>
          new Date(a.applicableDate) - new Date(b.applicableDate)
        ));
      } catch (err) {
        console.error('Error fetching tax rates:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch tax rates'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTaxRates();
  }, [companyId, selectedItem, selectedAccountLevel4, accountLevel4s, items]);
  
  // Handle tax rate value changes
  const handleTaxRateValueChange = (typeId, field, value) => {
    setTaxRateValues(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value
      }
    }));
  };
  
  // Toggle editable status for a tax rate
  const toggleTaxRateEditable = (typeId) => {
    setTaxRateValues(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        isEditable: !prev[typeId]?.isEditable
      }
    }));
  };
  
  // Handle transaction type change
  const handleTransactionTypeChange = (typeId, value) => {
    setTaxRateValues(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        transactionType: value
      }
    }));
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Handle adding a new tax rate
  const handleAddTaxRate = () => {
    if (!selectedItem || !selectedAccountLevel4 || !newTaxRate.applicableDate) {
      setMessage({
        type: "error",
        text: "Please select all required fields and enter applicable date"
      });
      return;
    }
    
    // Validate values
    const hasInvalidValues = Object.entries(taxRateValues).some(([_, rate]) => {
      if (!rate) return false;
      if (rate.registeredValue === undefined || rate.registeredValue === '' ||
        rate.unregisteredValue === undefined || rate.unregisteredValue === '') {
        return true;
      }
      const numRegistered = parseFloat(rate.registeredValue);
      const numUnregistered = parseFloat(rate.unregisteredValue);
      if (isNaN(numRegistered)) return true;
      if (isNaN(numUnregistered)) return true;
      if (numRegistered < 0) return true;
      if (numUnregistered < 0) return true;
      return false;
    });
    
    if (hasInvalidValues) {
      setMessage({
        type: "error",
        text: "Please enter valid registered/unregistered values (positive numbers)"
      });
      return;
    }
    
    const selected = items.find(item => item._id === selectedItem);
    if (!selected) return;
    
    const addedTaxRate = {
      id: `temp-${Date.now()}`,
      itemId: selectedItem,
      itemType: selected.type,
      accountLevel4Id: selectedAccountLevel4,
      applicableDate: newTaxRate.applicableDate,
      isActive: newTaxRate.isActive,
    isExempted: newTaxRate.isExempted,
      createdBy: username, // Added createdBy
      updatedBy: username, // Added updatedBy
      createdAt: new Date().toISOString(), // Added createdAt
      updatedAt: new Date().toISOString(), // Added updatedAt
      taxRates: Object.entries(taxRateValues)
        .filter(([_, rate]) => rate &&
          (rate.registeredValue !== undefined && rate.registeredValue !== '') &&
          (rate.unregisteredValue !== undefined && rate.unregisteredValue !== ''))
        .map(([typeId, rate]) => ({
          taxTypeId: typeId,
          type: rate.type || 'percentage',
          title: defaultTaxes.find(dt => dt._id === typeId)?.level4Title || '',
          isEditable: rate.isEditable || false,
          transactionType: rate.transactionType || 'sale',
          registeredValue: parseFloat(rate.registeredValue) || 0,
          unregisteredValue: parseFloat(rate.unregisteredValue) || 0
        }))
    };
    
    setTaxRates(prev => [...prev, addedTaxRate].sort((a, b) =>
      new Date(a.applicableDate) - new Date(b.applicableDate)
    ));
    
    // Reset form
    setNewTaxRate({
      applicableDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdBy: username, // Added createdBy
      updatedBy: username, // Added updatedBy
      createdAt: new Date().toISOString(), // Added createdAt
      updatedAt: new Date().toISOString(), // Added updatedAt
      transactionType: 'sale'
    });
    setTaxRateValues({});
    setMessage({
      type: "success",
      text: "New tax rate added successfully!"
    });
  };
  
// Handle editing a tax rate
const handleEditTaxRate = (taxRateId) => {
  const taxRateToEdit = taxRates.find(taxRate => taxRate.id === taxRateId);
  if (taxRateToEdit) {
    // Create a copy of the tax rate to edit
    const editingTaxRateCopy = {
      ...taxRateToEdit,
      applicableDate: taxRateToEdit.applicableDate ? 
        new Date(taxRateToEdit.applicableDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    };
    
    setEditingTaxRate(editingTaxRateCopy);
    
    const rates = {};
    taxRateToEdit.taxRates.forEach(rate => {
      rates[rate.taxTypeId] = {
        type: rate.type || 'percentage',
        isEditable: rate.isEditable || false,
        transactionType: rate.transactionType || 'sale',
        registeredValue: rate.registeredValue?.toString() || '0',
        unregisteredValue: rate.unregisteredValue?.toString() || '0'
      };
    });
    
    defaultTaxes.forEach(dt => {
      if (!rates[dt._id]) {
        rates[dt._id] = {
          type: 'percentage',
          isEditable: false,
          transactionType: 'sale',
          registeredValue: '0',
          unregisteredValue: '0'
        };
      }
    });
    
    setTaxRateValues(rates);
  }
};
  
// Handle updating a tax rate
const handleUpdateTaxRate = () => {
  if (!editingTaxRate) return;
  
  // Validate values
  const hasInvalidValues = Object.entries(taxRateValues).some(([_, rate]) => {
    if (!rate) return false;
    if (rate.registeredValue === undefined || rate.registeredValue === '' ||
      rate.unregisteredValue === undefined || rate.unregisteredValue === '') {
      return true;
    }
    const numRegistered = parseFloat(rate.registeredValue);
    const numUnregistered = parseFloat(rate.unregisteredValue);
    if (isNaN(numRegistered)) return true;
    if (isNaN(numUnregistered)) return true;
    if (numRegistered < 0) return true;
    if (numUnregistered < 0) return true;
    return false;
  });
  
  if (hasInvalidValues) {
    setMessage({
      type: "error",
      text: "Please enter valid registered/unregistered values (positive numbers)"
    });
    return;
  }
  
  setTaxRates(prev =>
    prev.map(taxRate =>
      taxRate.id === editingTaxRate.id ? {
        ...taxRate,
        applicableDate: editingTaxRate.applicableDate,
        isActive: editingTaxRate.isActive,
        isExempted: editingTaxRate.isExempted, 
        updatedBy: username, // Updated updatedBy
        updatedAt: new Date().toISOString(), // Updated updatedAt
        taxRates: Object.entries(taxRateValues)
          .filter(([_, rate]) => rate &&
            (rate.registeredValue !== undefined && rate.registeredValue !== '') &&
            (rate.unregisteredValue !== undefined && rate.unregisteredValue !== ''))
          .map(([typeId, rate]) => ({
            taxTypeId: typeId,
            type: rate.type || 'percentage',
            title: defaultTaxes.find(dt => dt._id === typeId)?.level4Title || '',
            isEditable: rate.isEditable || false,
            transactionType: rate.transactionType || 'sale',
            registeredValue: parseFloat(rate.registeredValue) || 0,
            unregisteredValue: parseFloat(rate.unregisteredValue) || 0
          }))
      } : taxRate
    )
  );
  
  // Reset editing state and newTaxRate to initial state
  setEditingTaxRate(null);
  setTaxRateValues({});
  setNewTaxRate({
    applicableDate: new Date().toISOString().split('T')[0],
    isActive: true,
    createdBy: username,
    updatedBy: username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  setMessage({
    type: "success",
    text: "Tax rate updated successfully!"
  });
};
  
  // Handle deleting a tax rate
  const handleDeleteTaxRate = async (taxRateId) => {
    if (window.confirm("Are you sure you want to delete this tax rate?")) {
      try {
        // Skip API call for temporary IDs (client-side only entries)
        if (!taxRateId.startsWith('temp-')) {
          const res = await fetch(`http://localhost:5000/api/tax-rates/${taxRateId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to delete tax rate');
          }
        }
        
        // Update client state
        setTaxRates(prev => prev.filter(taxRate => taxRate.id !== taxRateId));
        setMessage({
          type: "success",
          text: "Tax rate deleted successfully!"
        });
      } catch (err) {
        console.error('Error deleting tax rate:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to delete tax rate'
        });
      }
    }
  };
  
  // Toggle tax rate active status
  const handleToggleActive = (taxRateId) => {
    setTaxRates(prev =>
      prev.map(taxRate =>
        taxRate.id === taxRateId ? { 
          ...taxRate, 
          isActive: !taxRate.isActive,
          updatedBy: username, // Updated updatedBy
          updatedAt: new Date().toISOString() // Updated updatedAt
        } : taxRate
      )
    );
  };
  
// Handle saving all tax rates to the server
const handleSaveAllTaxRates = async () => {
  try {
    const selected = items.find(item => item._id === selectedItem);
    if (!selected) return;
    
    const res = await fetch(`http://localhost:5000/api/tax-rates/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        itemId: selectedItem,
        itemType: selected.type,
        accountLevel4Id: selectedAccountLevel4,
        username, // Include username
        taxRates: taxRates.map(taxRate => ({
          id: taxRate.id.startsWith('temp-') ? undefined : taxRate.id,
          applicableDate: taxRate.applicableDate,
          isActive: taxRate.isActive,
          isExempted: taxRate.isExempted, // Add this line
          createdBy: taxRate.createdBy,
          updatedBy: taxRate.updatedBy,
          createdAt: taxRate.createdAt,
          updatedAt: taxRate.updatedAt,
          taxRates: taxRate.taxRates.map(rate => ({
            taxTypeId: rate.taxTypeId,
            type: rate.type,
            isEditable: rate.isEditable || false,
            transactionType: rate.transactionType || 'sale',
            registeredValue: rate.registeredValue || 0,
            unregisteredValue: rate.unregisteredValue || 0
          }))
        }))
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to save tax rates');
    }
    
    setMessage({
      type: "success",
      text: "Tax rates saved successfully!"
    });
  } catch (err) {
    console.error('Error saving tax rates:', err);
    setMessage({
      type: "error",
      text: err.message || 'Failed to save tax rates'
    });
  }
};
  
  // Helper functions for display
  const getSelectedItemName = () => {
    const selected = items.find(item => item._id === selectedItem);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Item';
  };
  
  const getSelectedAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    return selected ? `${selected.subcode} - ${selected.title}` : 'Select Account Level 4';
  };
  
  // Ultra compact styling with purple theme
  const inputClass = "w-full p-1 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-xs h-7";
  const labelClass = "block text-[10px] font-medium text-purple-700 dark:text-purple-300 mb-0.5";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-sm shadow mb-1.5 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-[10px] font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1";
  const buttonClass = "flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-colors duration-200 text-xs";
  const tableHeaderClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-1 text-left font-medium text-xs";
  const tableCellClass = "p-1 border-t border-purple-200 dark:border-purple-700 text-xs";
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-1">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-1">
          <h1 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-0.5 flex items-center justify-center gap-0.5">
            <Percent className="w-3 h-3" />
            Product Tax Rate Setting
          </h1>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">
            Configure product tax rates and settings
          </p>
        </div>
        
{(editingTaxRate?.isExempted || newTaxRate.isExempted) && (
  <div className="mb-1 p-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-sm border border-yellow-200 dark:border-yellow-700">
    <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      This item is marked as exempted - tax rates will not be applied
    </p>
  </div>
)}
        <div className="flex justify-end mb-1">
          <button
            onClick={handleRefresh}
            className={`${buttonClass} h-7`}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
        
        {message && (
          <div className={`mb-1.5 p-1 rounded-sm text-white font-medium shadow-md flex items-center gap-0.5 text-xs ${message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {message.text}
          </div>
        )}
        
        {/* Combined Item Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {/* Item Combobox */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Package className="text-purple-600 w-3 h-3" />
              Select Item
            </h2>
            <div className="relative">
              <label className={labelClass}>Items (Finished Goods/Raw Materials)</label>
              <button
                type="button"
                onClick={() => setIsItemComboboxOpen(!isItemComboboxOpen)}
                className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                disabled={loading || !companyId}
              >
                <span className="truncate text-xs">{getSelectedItemName()}</span>
                {selectedItem ? (
                  <X 
                    className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem('');
                      setSelectedAccountLevel4('');
                      setAccountLevel4s([]);
                      setTaxRates([]);
                    }}
                  />
                ) : (
                  <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                )}
              </button>
              
              {isItemComboboxOpen && (
                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
                  <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="w-full p-1 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="divide-y divide-purple-200 dark:divide-purple-700">
                    <div className="px-1 py-0.5 text-[8px] font-medium text-purple-500 dark:text-purple-400 uppercase tracking-wider">
                      Finished Goods
                    </div>
                    {items.filter(item =>
                      item.type === 'finishedGood' && (
                        (item.title && item.title.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
                        (item.code && item.code.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                      )
                    ).length > 0 ? (
                      <ul>
                        {items
                          .filter(item =>
                            item.type === 'finishedGood' && (
                              (item.title && item.title.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
                              (item.code && item.code.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                            )
                          )
                          .map((item) => (
                            <li 
                              key={item._id}
                              className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${item._id === selectedItem ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                              onClick={() => {
                                setSelectedItem(item._id);
                                setIsItemComboboxOpen(false);
                                setItemSearchTerm('');
                                setSelectedAccountLevel4('');
                                setTaxRates([]);
                              }}
                            >
                              <div className="font-medium">{item.code} - {item.title}</div>
                              <div className="text-[8px] text-purple-500 dark:text-purple-400">Finished Good</div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-[9px]">
                        No finished goods found
                      </div>
                    )}
                    
                    <div className="px-1 py-0.5 text-[8px] font-medium text-purple-500 dark:text-purple-400 uppercase tracking-wider">
                      Raw Materials
                    </div>
                    {items.filter(item =>
                      item.type === 'rawMaterial' && (
                        (item.title && item.title.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
                        (item.code && item.code.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                      )
                    ).length > 0 ? (
                      <ul>
                        {items
                          .filter(item =>
                            item.type === 'rawMaterial' && (
                              (item.title && item.title.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
                              (item.code && item.code.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                            )
                          )
                          .map((item) => (
                            <li 
                              key={item._id}
                              className={`p-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-xs ${item._id === selectedItem ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                              onClick={() => {
                                setSelectedItem(item._id);
                                setIsItemComboboxOpen(false);
                                setItemSearchTerm('');
                                setSelectedAccountLevel4('');
                                setTaxRates([]);
                              }}
                            >
                              <div className="font-medium">{item.code} - {item.title}</div>
                              <div className="text-[8px] text-purple-500 dark:text-purple-400">Raw Material</div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-[9px]">
                        No raw materials found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Level 4 Combobox */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>
              <Layers className="text-purple-600 w-3 h-3" />
              Select Account Level 4
            </h2>
            <div className="relative">
              <label className={labelClass}>Account Level 4</label>
              <button
                type="button"
                onClick={() => selectedItem && setIsAccountLevel4ComboboxOpen(!isAccountLevel4ComboboxOpen)}
                className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${
                  !selectedItem ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading || !companyId || !selectedItem}
              >
                <span className="truncate text-xs">{getSelectedAccountLevel4Name()}</span>
                {selectedAccountLevel4 ? (
                  <X 
                    className="w-3 h-3 text-purple-500 hover:text-purple-700 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAccountLevel4('');
                      setTaxRates([]);
                    }}
                  />
                ) : (
                  <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
                )}
              </button>
              
              {isAccountLevel4ComboboxOpen && selectedItem && (
                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-32 overflow-auto">
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
                    <div className="p-1 text-center text-purple-500 dark:text-purple-400 text-[9px]">
                      {accountLevel4s.length === 0 ? 'No account level 4 found for this item' : 'No matching account level 4 found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {selectedItem && selectedAccountLevel4 && (
          <>
            {/* Tax Rate Configuration */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <Percent className="text-purple-600 w-3 h-3" />
                Tax Rate Configuration
              </h2>
              
              {/* Add New Tax Rate Form */}
              <div className="mb-1.5 p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-sm">
                <h3 className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">
                  {editingTaxRate ? 'Edit Tax Rate' : 'Add New Tax Rate'}
                </h3>
                
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1">
                  {/* Applicable Date */}
<div>
  <label className={labelClass}>Applicable Date</label>
  <div className="relative">
    <input
      type="date"
      value={editingTaxRate ? editingTaxRate.applicableDate : newTaxRate.applicableDate}
      onChange={(e) => {
        const dateValue = e.target.value;
        if (editingTaxRate) {
          // Update editingTaxRate when in edit mode
          setEditingTaxRate({ ...editingTaxRate, applicableDate: dateValue });
        } else {
          // Update newTaxRate when in add mode
          setNewTaxRate({ ...newTaxRate, applicableDate: dateValue });
        }
      }}
      className={inputClass}
    />
    <CalendarIcon className="absolute right-1 top-1.5 h-3 w-3 text-purple-400" />
  </div>
</div>
                </div>
{/* Add this after the Applicable Date field */}
<div className="flex items-center gap-0.5 mb-1">
  <input
    type="checkbox"
    id="exemptedGoods"
    checked={editingTaxRate ? editingTaxRate.isExempted : newTaxRate.isExempted}
    onChange={(e) => {
      const checked = e.target.checked;
      if (editingTaxRate) {
        setEditingTaxRate({ ...editingTaxRate, isExempted: checked });
      } else {
        setNewTaxRate({ ...newTaxRate, isExempted: checked });
      }
    }}
    className="rounded border-purple-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
  />
  <label htmlFor="exemptedGoods" className="text-xs text-purple-700 dark:text-purple-300">
    Exempted Goods
  </label>
</div>
{defaultTaxes.length > 0 && (
  <div className="mt-1">
    <label className={labelClass}>Tax Rates</label>
    <div className="flex flex-wrap gap-1">
      {defaultTaxes.map(dt => (
        <div key={dt._id} className="min-w-[160px] flex-1 p-1 border rounded-sm dark:border-purple-700 bg-white dark:bg-gray-800">
          <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-0.5 truncate" title={dt.level4Title}>{dt.level4Title}</p>
          
          {/* First Row: Transaction Type and Tax Type selectors */}
          <div className="flex gap-0.5 mb-0.5">
            {/* Transaction Type Selector */}
            <select
              value={taxRateValues[dt._id]?.transactionType || 'sale'}
              onChange={(e) => handleTransactionTypeChange(dt._id, e.target.value)}
              className="w-1/2 rounded-sm border border-purple-300 dark:border-purple-600 px-1 py-0 text-xs dark:bg-gray-900"
            >
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
              <option value="none">None</option>
            </select>
            
            {/* Tax Type Selector */}
            <select
              value={taxRateValues[dt._id]?.type || 'percentage'}
              onChange={(e) => handleTaxRateValueChange(dt._id, 'type', e.target.value)}
              className="w-1/2 rounded-sm border border-purple-300 dark:border-purple-600 px-1 py-0 text-xs dark:bg-gray-900"
            >
              <option value="percentage">%</option>
              <option value="fixed">Fixed</option>
              <option value="formula">Formula</option>
              <option value="quantity">Qty</option>
            </select>
          </div>
          
          {/* Second Row: Registered and Unregistered inputs */}
          <div className="flex gap-0.5 mb-0.5">
            {/* Registered Value Input */}
            <div className="relative w-1/2">
              <input
                type="number"
                value={taxRateValues[dt._id]?.registeredValue || ''}
                onChange={(e) => handleTaxRateValueChange(dt._id, 'registeredValue', e.target.value)}
                className="w-full rounded-sm border border-purple-300 dark:border-purple-600 px-1 py-0 text-xs dark:bg-gray-900"
                placeholder="Registered"
                min="0"
                step="0.01"
                disabled={editingTaxRate ? editingTaxRate.isExempted : newTaxRate.isExempted}
              />
              {taxRateValues[dt._id]?.type === 'percentage' && (
                <Percent className="absolute right-1 top-1 h-3 w-3 text-purple-400" />
              )}
            </div>
            
            {/* Unregistered Value Input */}
            <div className="relative w-1/2">
              <input
                type="number"
                value={taxRateValues[dt._id]?.unregisteredValue || ''}
                onChange={(e) => handleTaxRateValueChange(dt._id, 'unregisteredValue', e.target.value)}
                className="w-full rounded-sm border border-purple-300 dark:border-purple-600 px-1 py-0 text-xs dark:bg-gray-900"
                placeholder="Unregistered"
                min="0"
                step="0.01"
              />
              {taxRateValues[dt._id]?.type === 'percentage' && (
                <Percent className="absolute right-1 top-1 h-3 w-3 text-purple-400" />
              )}
            </div>
          </div>
          
          {/* Third Row: Type description and Editable checkbox */}
          <div className="flex items-center justify-between">
            <p className="text-[7px] text-purple-500 dark:text-purple-400">
              {taxRateValues[dt._id]?.type === 'fixed'
                ? 'Fixed tax amount'
                : taxRateValues[dt._id]?.type === 'formula'
                  ? 'Custom formula'
                  : taxRateValues[dt._id]?.type === 'quantity'
                    ? 'Quantity based'
                    : 'Percentage based'}
            </p>
            <label className="inline-flex items-center gap-0.5 text-xs">
              <input
                type="checkbox"
                checked={taxRateValues[dt._id]?.isEditable || false}
                onChange={() => toggleTaxRateEditable(dt._id)}
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
                <div className="mt-1 flex items-center gap-0.5">
                  {editingTaxRate ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateTaxRate}
                        className={`${buttonClass} flex-1 h-7`}
                      >
                        <Save className="w-3 h-3" />
                        Update
                      </button>
<button
  type="button"
  onClick={() => {
    setEditingTaxRate(null);
    setTaxRateValues({});
    // Reset newTaxRate to initial state
    setNewTaxRate({
      applicableDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdBy: username,
      updatedBy: username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }}
  className="p-0.5 h-7 rounded-sm font-medium border border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-700"
>
  <X className="w-3 h-3" />
</button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddTaxRate}
                      className={`${buttonClass} flex-1 h-7`}
                    >
                      <Plus className="w-3 h-3" />
                      Add Tax Rate
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tax Rates Table */}
              {loading ? (
                <div className="flex justify-center py-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                </div>
              ) : taxRates.length === 0 ? (
                <div className="text-center py-3 text-purple-500 dark:text-purple-400 text-xs">
                  No tax rates found for the selected item and account
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={tableHeaderClass}>Item</th>
                        <th className={tableHeaderClass}>Account</th>
                        <th
                          className={tableHeaderClass}
                          colSpan={defaultTaxes.length || 1}
                        >
                          Tax Rates
                        </th>
                        <th className={tableHeaderClass}>Date</th>
                        <th className={tableHeaderClass}>Status</th>
                        <th className={tableHeaderClass}>Exempted</th>
                        <th className={tableHeaderClass}>Actions</th>
                      </tr>
                      {defaultTaxes.length > 0 && (
                        <tr>
                          <th className="p-1"></th>
                          <th className="p-1"></th>
                          {defaultTaxes.map(dt => (
                            <th
                              key={dt._id}
                              className="p-1 text-center text-[8px] font-normal text-purple-600 dark:text-purple-400"
                            >
                              {dt.level4Title.length > 8 ? dt.level4Title.substring(0, 8) + '...' : dt.level4Title}
                            </th>
                          ))}
                          <th className="p-1"></th>
                          <th className="p-1"></th>
                          <th className="p-1"></th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {taxRates.map((taxRate) => (
                        <tr
                          key={taxRate.id}
                          className="hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        >
                          <td className={tableCellClass}>
                            <div className="flex items-center gap-1">
                              {taxRate.itemType === 'finishedGood' ? (
                                <Package className="w-3 h-3 text-purple-500 flex-shrink-0" />
                              ) : (
                                <Layers className="w-3 h-3 text-purple-500 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-xs">
                                  {items.find(item => item._id === taxRate.itemId)?.code || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="min-w-0">
                              <p className="truncate text-xs">
                                {accountLevel4s.find(al4 => al4._id === taxRate.accountLevel4Id)?.subcode || 'N/A'}
                              </p>
                            </div>
                          </td>
                          
                          {/* Tax rate values */}
                          {defaultTaxes.map(dt => {
                            const rate = taxRate.taxRates.find(r => r.taxTypeId === dt._id);
                            return (
                              <td key={dt._id} className={tableCellClass}>
                                {rate ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] px-1 py-0 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full capitalize">
                                      {rate.transactionType}
                                    </span>
                                    <div className="grid grid-cols-2 gap-0.5 w-full max-w-[100px]">
                                      <div className="px-1 py-0 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-[9px]">
                                        Reg: {rate.registeredValue}
                                        {rate.type === 'percentage' ? '%' : rate.type === 'fixed' ? ' fx' : rate.type === 'quantity' ? ' qty' : ''}
                                      </div>
                                      <div className="px-1 py-0 bg-purple-50 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded text-[9px]">
                                        Unreg: {rate.unregisteredValue}
                                        {rate.type === 'percentage' ? '%' : rate.type === 'fixed' ? ' fx' : rate.type === 'quantity' ? ' qty' : ''}
                                      </div>
                                    </div>
                                    {rate.isEditable && (
                                      <span className="text-[7px] px-1 py-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full">
                                        Editable
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-purple-400 dark:text-purple-500 text-[9px]">-</span>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className={tableCellClass}>
                            <div className="text-xs">
                              {new Date(taxRate.applicableDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          
                          <td className={tableCellClass}>
                            <span
                              className={`px-1 py-0 rounded-full text-[8px] font-medium ${
                                taxRate.isActive
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {taxRate.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className={tableCellClass}>
  {taxRate.isExempted ? (
    <span className="text-green-500">Yes</span>
  ) : (
    <span className="text-red-500">No</span>
  )}
</td>
                          
                          <td className={`${tableCellClass} whitespace-nowrap`}>
                            <div className="flex gap-0.5">
                              <button
                                onClick={() => handleToggleActive(taxRate.id)}
                                className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                title={taxRate.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {taxRate.isActive ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <X className="w-3 h-3 text-gray-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditTaxRate(taxRate.id)}
                                className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3 text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteTaxRate(taxRate.id)}
                                className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
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
            
            {/* Save All Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveAllTaxRates}
                disabled={loading || taxRates.length === 0}
                className={`${buttonClass} px-2 py-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Save All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}