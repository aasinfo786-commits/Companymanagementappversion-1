import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Minus,
  ChevronDown,
  Search,
  X,
  FileDigit,
  CalendarDays,
  Percent,
  List,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';

const AccountLookup = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  onEnterKeyPress,
  onFocus,
  onBlur
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value, option);
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('', null);
    setSelectedOption(null);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(true);
        inputRef.current?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        scrollToHighlighted();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollToHighlighted();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const scrollToHighlighted = () => {
    if (dropdownRef.current && highlightedIndex >= 0) {
      const highlightedItem = dropdownRef.current.children[1]?.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    }
  }, [isOpen, filteredOptions]);


  return (
    <div className="relative">
      <div
        className={`${disabled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} 
        p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white 
        cursor-pointer flex items-center justify-between text-sm`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {selectedOption ? (
          <div className="flex-1 truncate">{selectedOption.label}</div>
        ) : (
          <div className="text-gray-400">{placeholder}</div>
        )}

        {selectedOption ? (
          <X
            className="w-3 h-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto"
          ref={dropdownRef}
        >
          <div className="p-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>

          {filteredOptions.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">No options found</div>
          ) : (
            <ul className="text-sm">
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${value === option.value ? 'bg-blue-100 dark:bg-blue-900/50' :
                    highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default function VoucherEntry() {
  const { companyId, locationId, financialYearId } = useAppContext();
  const [parentCenterOptions, setParentCenterOptions] = useState([]);
  const [childCenterOptions, setChildCenterOptions] = useState([]);
  const [error, setError] = useState(null);
  const [voucherType, setVoucherType] = useState('receipt');
  const [voucherDate, setVoucherDate] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [description, setDescription] = useState('');
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [tempEntries, setTempEntries] = useState([]);
  const [additionalEntries, setAdditionalEntries] = useState([]);
  const [entry, setEntry] = useState({
    type: 'credit',
    level3Id: '',
    level4Id: '',
    parentCenterId: '',
    childCenterId: '',
    parentCenterCode: '',
    childCenterCode: '',
    amount: '',
    description: ''
  });

  const [additionalEntry, setAdditionalEntry] = useState({
    level3Id: '',
    level4Id: '',
    description: '',
    amount: '',
    rate: '',
    isTaxAccount: false,
    taxAccountId: '',
    parentCenterCode: '',
    childCenterCode: ''
  });

  const [cashAccount, setCashAccount] = useState({
    level3Id: '',
    level4Id: '',
    accountTitle: '',
    accountCode: '',
    parentCenterCode: '',
    childCenterCode: ''
  });
  const [debitLevel3Options, setDebitLevel3Options] = useState([]);
  const [debitLevel4Options, setDebitLevel4Options] = useState([]);
  const [creditLevel3Options, setCreditLevel3Options] = useState([]);
  const [creditLevel4Options, setCreditLevel4Options] = useState([]);
  const [additionalLevel3Options, setAdditionalLevel3Options] = useState([]);
  const [additionalLevel4Options, setAdditionalLevel4Options] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [allVouchers, setAllVouchers] = useState([]);
  const [voucherFilter, setVoucherFilter] = useState({
    type: '',
    search: ''
  });
  const [currentVoucherIndex, setCurrentVoucherIndex] = useState(-1);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCounts, setVoucherCounts] = useState({
    all: 0,
    receipt: 0,
    payment: 0
  });

  // Refs for form fields
  const voucherDateRef = useRef(null);
  const descriptionRef = useRef(null);
  const cashAccountLevel3Ref = useRef(null);
  const cashAccountLevel4Ref = useRef(null);
  const entryLevel3Ref = useRef(null);
  const entryLevel4Ref = useRef(null);
  const entryDescriptionRef = useRef(null);
  const entryAmountRef = useRef(null);
  const taxAccountLevel3Ref = useRef(null);
  const taxAccountLevel4Ref = useRef(null);
  const taxRateRef = useRef(null);
  const taxDescriptionRef = useRef(null);

  const formatDate = (date) => {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  const inputClass = "w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  // Function to reload the page for new voucher
  const handleNewVoucher = () => {
    window.location.reload();
  };

  const fetchAllVouchers = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/all/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch vouchers');

      setAllVouchers(json.vouchers || json);
      setVoucherCounts({
        all: json.counts?.all || 0,
        receipt: json.counts?.receipt || 0,
        payment: json.counts?.payment || 0
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      console.error('Error fetching vouchers:', err);
    }
  };

  const fetchDebitLevel3Options = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/debit/level3-options/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch debit accounts');
      setDebitLevel3Options(json);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const fetchCreditLevel3Options = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/credit/level3-options/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch credit accounts');
      setCreditLevel3Options(json);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const fetchAdditionalLevel3Options = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/additional/level3-options/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch additional accounts');

      const mappedOptions = json.map(option => ({
        value: option.value,
        label: option.label,
        code: option.code,
        title: option.title,
        parentLevel3Code: option.parentLevel3Code,
        level3Title: option.level3Title
      }));

      setAdditionalLevel3Options(mappedOptions);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const fetchDebitLevel4Options = async (level3Id) => {
    if (!companyId || !level3Id) {
      setDebitLevel4Options([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/debit/level4-options/${companyId}/${level3Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch debit sub-accounts');
      setDebitLevel4Options(json);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const fetchCreditLevel4Options = async (level3Id) => {
    if (!companyId || !level3Id) {
      setCreditLevel4Options([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/credit/level4-options/${companyId}/${level3Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch credit sub-accounts');
      setCreditLevel4Options(json);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const fetchAdditionalLevel4Options = async (level3Id) => {
    if (!companyId || !level3Id) {
      setAdditionalLevel4Options([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/additional/level4-options/${companyId}/${level3Id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch additional sub-accounts');

      const mappedOptions = json.map(option => ({
        value: option.value,
        accountId: option.accountId,
        label: option.label,
        code: option.code,
        title: option.title,
        rate: option.rate,
        isTaxAccount: option.isTaxAccount,
        taxAccountId: option.taxAccountId,
        parentLevel3Code: option.parentLevel3Code,
        level3Title: option.level3Title,
        level4Subcode: option.level4Subcode,
        level4Title: option.level4Title
      }));

      setAdditionalLevel4Options(mappedOptions);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const getNextVoucherNumber = async () => {
    if (!companyId || !locationId || !financialYearId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/vouchers/next-number/${companyId}/${locationId}/${financialYearId}/${voucherType}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to get voucher number');
      setVoucherNumber(json.nextNumber);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Initialize form
  useEffect(() => {
    setVoucherDate(formatDate());
    fetchDebitLevel3Options();
    fetchCreditLevel3Options();
    fetchAdditionalLevel3Options();
    fetchAllVouchers();
  }, [companyId]);

   // Fetch parent centers
  useEffect(() => {
    const fetchParentCenters = async () => {
      if (!companyId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/parent-centers/company/${companyId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json();

        if (res.ok) {
          setParentCenterOptions(data.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParentCenters();
  }, [companyId]);

  // Fetch child centers
  const fetchChildCenters = async (parentCenterId) => {
    if (!companyId || !parentCenterId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/child-centers/company/${companyId}?parentCenterId=${parentCenterId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();

      if (res.ok) {
        const options = (data.data || []).map(center => ({
          _id: center._id,
          childCode: center.childCode,
          title: center.title,
          value: center._id,
          label: `${center.childCode} - ${center.title}`
        }));
        setChildCenterOptions(options);
      } else {
        throw new Error(data.error || "Failed to fetch child centers");
      }
    } catch (err) {
      setError(err.message);
      setChildCenterOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle center selection changes
  const handleParentCenterChange = (value, option) => {
    setEntry(prev => ({
      ...prev,
      parentCenterId: value,
      parentCenterCode: option?.code || '',
      childCenterId: '',
      childCenterCode: ''
    }));
    fetchChildCenters(value);
  };

  const handleChildCenterChange = (value, option) => {
    setEntry(prev => ({
      ...prev,
      childCenterId: value,
      childCenterCode: option?.childCode || ''
    }));
  };

  // Update voucher number when type changes
  useEffect(() => {
    getNextVoucherNumber();
    setEntry({
      type: voucherType === 'receipt' ? 'credit' : 'debit',
      level3Id: '',
      level4Id: '',
      amount: '',
      description: ''
    });
    setAdditionalEntry({
      level3Id: '',
      level4Id: '',
      description: '',
      amount: '',
      rate: '',
      isTaxAccount: false,
      taxAccountId: ''
    });
    setTempEntries([]);
    setAdditionalEntries([]);
  }, [voucherType, companyId, locationId, financialYearId]);

  const handleEntryChange = (field, value) => {
  const newEntry = { ...entry, [field]: value };
  if (field === 'level3Id') {
    newEntry.level4Id = '';
    fetchCreditLevel4Options(value);
  }
  setEntry(newEntry);
};


  const handleAdditionalEntryChange = (field, value, option) => {
    const newEntry = { ...additionalEntry, [field]: value };

    if (field === 'level3Id') {
      newEntry.level4Id = '';
      fetchAdditionalLevel4Options(value);
    }

    if (field === 'level4Id' && option) {
      newEntry.isTaxAccount = option.isTaxAccount || false;
      newEntry.taxAccountId = option.taxAccountId || '';

      if (option.isTaxAccount && option.rate) {
        newEntry.rate = option.rate;
      }
    }

    setAdditionalEntry(newEntry);
  };

  const handleCashAccountChange = (field, value, option) => {
    const newCashAccount = {
      ...cashAccount,
      [field]: value,
      accountTitle: option?.label || '',
      accountCode: option?.code || ''
    };
    setCashAccount(newCashAccount);
    if (field === 'level3Id') fetchDebitLevel4Options(value);
  };

  const safeParseFloat = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeReduce = (array, callback, initialValue = 0) => {
    if (!Array.isArray(array)) return initialValue;
    return array.reduce(callback, initialValue);
  };

  const calculateGrossAmount = () => {
    return safeReduce(tempEntries, (sum, entry) => sum + safeParseFloat(entry.amount), 0);
  };

  const calculateTaxAmount = () => {
    return safeReduce(additionalEntries, (sum, entry) => sum + safeParseFloat(entry.amount), 0);
  };

  const calculateNetAmount = () => {
    return calculateGrossAmount() - calculateTaxAmount();
  };

  const calculateCashAccountAmount = () => {
    const grossAmount = calculateGrossAmount();
    const taxAmount = calculateTaxAmount();
    return grossAmount - taxAmount;
  };

   // Updated addToPreview function
  const addToPreview = () => {
    if (!entry.level3Id || !entry.amount) {
      setMessage({ type: "error", text: "Please select account and enter amount" });
      return;
    }

    const grossAmount = safeParseFloat(entry.amount);
    const newTempEntry = {
      ...entry,
      id: Date.now(),
      amount: grossAmount,
      accountTitle: creditLevel3Options.find(opt => opt.value === entry.level3Id)?.label || '',
      subAccountTitle: creditLevel4Options.find(opt => opt.value === entry.level4Id)?.label || '',
      isGrossAmount: true
    };

    setTempEntries(prev => [...prev, newTempEntry]);

    // Reset entry but preserve center selections
    setEntry(prev => ({
      type: voucherType === 'receipt' ? 'credit' : 'debit',
      level3Id: '',
      level4Id: '',
      parentCenterId: prev.parentCenterId,
      childCenterId: prev.childCenterId,
      parentCenterCode: prev.parentCenterCode,
      childCenterCode: prev.childCenterCode,
      amount: '',
      description: ''
    }));
  };

  const removeFromPreview = (id) => {
    setTempEntries(prev => prev.filter(entry => entry.id !== id));
    setAdditionalEntries(prev => prev.filter(entry => !entry.description.includes(`for entry ${id}`)));
  };

  const removeAdditionalEntry = (id) => {
    setAdditionalEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

// Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId || !locationId || !financialYearId) {
      setMessage({ type: "error", text: "Please select company, location and financial year first" });
      return;
    }

    if (!cashAccount.level3Id) {
      setMessage({ type: "error", text: "Please select a cash account" });
      return;
    }

    const grossAmount = calculateGrossAmount();
    const taxAmount = calculateTaxAmount();
    const netAmount = grossAmount - taxAmount;

    if (grossAmount <= 0) {
      setMessage({ type: "error", text: "No entries to save" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const allEntries = [
        {
          level3Id: cashAccount.level3Id,
          level4Id: cashAccount.level4Id,
          parentCenterCode: entry.parentCenterCode || '',
          childCenterCode: entry.childCenterCode || '',
          amount: netAmount,
          type: voucherType === 'receipt' ? 'debit' : 'credit',
          description: description || (voucherType === 'receipt' ? 'Cash received (net)' : 'Cash paid (net)'),
          accountTitle: cashAccount.accountTitle,
          accountCode: cashAccount.accountCode
        },
        ...additionalEntries.map(entry => ({
          level3Id: entry.level3Id,
          level4Id: entry.level4Id,
          parentCenterCode: entry.parentCenterCode || '',
          childCenterCode: entry.childCenterCode || '',
          amount: parseFloat(entry.amount) || 0,
          type: voucherType === 'receipt' ? 'debit' : 'credit',
          description: entry.description || `Tax @ ${entry.rate}%`,
          accountTitle: entry.accountTitle,
          subAccountTitle: entry.subAccountTitle,
          rate: parseFloat(entry.rate) || 0,
          isTaxAccount: entry.isTaxAccount,
          taxAccountId: entry.taxAccountId
        })),
        ...tempEntries.map(entry => ({
          level3Id: entry.level3Id,
          level4Id: entry.level4Id,
          parentCenterCode: entry.parentCenterCode || '',
          childCenterCode: entry.childCenterCode || '',
          amount: parseFloat(entry.amount) || 0,
          type: voucherType === 'receipt' ? 'credit' : 'debit',
          description: entry.description || description || (voucherType === 'receipt' ? 'Income received' : 'Expense paid'),
          accountTitle: entry.accountTitle,
          subAccountTitle: entry.subAccountTitle,
          isGrossAmount: true
        }))
      ];

      const res = await fetch('http://localhost:5000/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          locationId,
          financialYearId,
          voucherType,
          voucherDate: parseDate(voucherDate).toISOString(),
          voucherNumber,
          description,
          amount: grossAmount,
          entries: allEntries
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save voucher');

      setMessage({ type: "success", text: `Voucher ${voucherNumber} saved!` });
      setSavedVouchers(prev => [json.voucher, ...prev].slice(0, 5));
      
      // Reset form but preserve company/location context
      setVoucherDate(formatDate(new Date()));
      setDescription('');
      setEntry({
        type: voucherType === 'receipt' ? 'credit' : 'debit',
        level3Id: '',
        level4Id: '',
        parentCenterId: '',
        childCenterId: '',
        parentCenterCode: '',
        childCenterCode: '',
        amount: '',
        description: ''
      });
      setTempEntries([]);
      setAdditionalEntries([]);
      setCashAccount({
        level3Id: '',
        level4Id: '',
        accountTitle: '',
        accountCode: '',
        parentCenterCode: '',
        childCenterCode: ''
      });

      await getNextVoucherNumber();
      await fetchAllVouchers();

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };


  const filteredVouchers = (Array.isArray(allVouchers) ? allVouchers : []).filter(voucher => {
    if (!voucher) return false;

    if (voucherFilter.type && voucher.voucherType !== voucherFilter.type) {
      return false;
    }

    if (voucherFilter.search) {
      const searchTerm = voucherFilter.search.toLowerCase();
      const matchesNumber = String(voucher.voucherNumber || '').toLowerCase().includes(searchTerm);
      const matchesDescription = String(voucher.description || '').toLowerCase().includes(searchTerm);
      const matchesAccount = Array.isArray(voucher.entries) && voucher.entries.some(entry =>
        String(entry.accountTitle || '').toLowerCase().includes(searchTerm) ||
        String(entry.subAccountTitle || '').toLowerCase().includes(searchTerm)
      );

      if (!matchesNumber && !matchesDescription && !matchesAccount) {
        return false;
      }
    }

    return true;
  });

  const getFilteredCount = () => {
    if (voucherFilter.type === 'receipt') return voucherCounts.receipt;
    if (voucherFilter.type === 'payment') return voucherCounts.payment;
    return voucherCounts.all;
  };

  const goToFirstVoucher = async () => {
    if (filteredVouchers.length > 0) {
      const newIndex = 0;
      setCurrentVoucherIndex(newIndex);
      await loadVoucherData(filteredVouchers[newIndex]);
    }
  };

  const goToPreviousVoucher = async () => {
    if (currentVoucherIndex > 0) {
      const newIndex = currentVoucherIndex - 1;
      setCurrentVoucherIndex(newIndex);
      await loadVoucherData(filteredVouchers[newIndex]);
    }
  };

  const goToNextVoucher = async () => {
    if (currentVoucherIndex < filteredVouchers.length - 1) {
      const newIndex = currentVoucherIndex + 1;
      setCurrentVoucherIndex(newIndex);
      await loadVoucherData(filteredVouchers[newIndex]);
    }
  };

  const goToLastVoucher = async () => {
    if (filteredVouchers.length > 0) {
      const lastIndex = filteredVouchers.length - 1;
      setCurrentVoucherIndex(lastIndex);
      await loadVoucherData(filteredVouchers[lastIndex]);
    }
  };

  const loadVoucherData = async (voucher) => {
    if (!voucher) return;

    setSelectedVoucher(voucher);
    setVoucherType(voucher.voucherType);
    setVoucherDate(formatDate(new Date(voucher.voucherDate)));
    setVoucherNumber(voucher.voucherNumber);
    setDescription(voucher.description || '');

    // Reset all entries
    setTempEntries([]);
    setAdditionalEntries([]);
    setCashAccount({ level3Id: '', level4Id: '', accountTitle: '', accountCode: '' });

    if (Array.isArray(voucher.entries)) {
      const newTempEntries = [];
      const newAdditionalEntries = [];
      let newCashAccount = { level3Id: '', level4Id: '', accountTitle: '', accountCode: '' };

      // First identify all entry types
      for (const entry of voucher.entries) {
        if (entry.type === (voucher.voucherType === 'receipt' ? 'debit' : 'credit') &&
          !entry.isTaxAccount) {
          // This is the cash account entry
          newCashAccount = {
            level3Id: entry.level3Id,
            level4Id: entry.level4Id,
            accountTitle: entry.accountTitle,
            accountCode: entry.accountCode
          };
        } else if (entry.isTaxAccount) {
          // Tax entry
          newAdditionalEntries.push({
            level3Id: entry.level3Id,
            level4Id: entry.level4Id,
            amount: Math.abs(entry.amount),
            description: entry.description,
            rate: entry.rate,
            isTaxAccount: true,
            taxAccountId: entry.taxAccountId,
            id: Date.now() + Math.random(),
            accountTitle: entry.accountTitle,
            subAccountTitle: entry.subAccountTitle,
            parentLevel3Code: entry.parentLevel3Code,
            level3Title: entry.level3Title,
            level4Subcode: entry.level4Subcode
          });
        } else {
          // Main income/expense entry
          newTempEntries.push({
            type: entry.type,
            level3Id: entry.level3Id,
            level4Id: entry.level4Id,
            amount: Math.abs(entry.amount),
            description: entry.description,
            id: Date.now() + Math.random(),
            accountTitle: entry.accountTitle,
            subAccountTitle: entry.subAccountTitle,
            isGrossAmount: true
          });
        }
      }

      // Now fetch all necessary options
      try {
        // Fetch options for cash account
        if (newCashAccount.level3Id) {
          await fetchDebitLevel4Options(newCashAccount.level3Id);
        }

        // Fetch options for tax entries
        for (const entry of newAdditionalEntries) {
          await fetchAdditionalLevel4Options(entry.level3Id);
        }

        // Fetch options for main entries
        for (const entry of newTempEntries) {
          await fetchCreditLevel4Options(entry.level3Id);
        }

        // Finally update state
        setTempEntries(newTempEntries);
        setAdditionalEntries(newAdditionalEntries);
        setCashAccount(newCashAccount);
      } catch (err) {
        console.error('Error loading voucher data:', err);
        setMessage({ type: "error", text: "Failed to load voucher data" });
      }
    }
  };

  // Filter navigation functions
  const filterByReceipt = () => {
    setVoucherFilter({ ...voucherFilter, type: 'receipt' });
    setCurrentVoucherIndex(-1);
    setSelectedVoucher(null);
  };

  const filterByPayment = () => {
    setVoucherFilter({ ...voucherFilter, type: 'payment' });
    setCurrentVoucherIndex(-1);
    setSelectedVoucher(null);
  };

  const clearFilter = () => {
    setVoucherFilter({ ...voucherFilter, type: '' });
    setCurrentVoucherIndex(-1);
    setSelectedVoucher(null);
  };

  // Handle Enter key press to move between fields
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // Handle Enter key in AccountLookup to move to next field
  const handleAccountLookupEnter = (nextFieldRef) => {
    if (nextFieldRef && nextFieldRef.current) {
      nextFieldRef.current.focus();
    }
  };

  return (
    <div className="ml-0 md:ml-64 transition-all duration-300">
      <div className="max-w-6xl mx-auto mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-center text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            {voucherType === 'receipt' ? 'Cash Receipt Voucher' : 'Cash Payment Voucher'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleNewVoucher}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              New Voucher
            </button>
            <button
              onClick={() => setShowVoucherList(!showVoucherList)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-sm"
            >
              <List className="w-4 h-4" />
              {showVoucherList ? 'Hide Vouchers' : 'View Vouchers'}
            </button>
          </div>
        </div>

        {showVoucherList ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Vouchers
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={clearFilter}
                className={`px-3 py-1 rounded text-xs flex items-center ${voucherFilter.type === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                All Vouchers ({voucherCounts.all})
              </button>
              <button
                onClick={filterByReceipt}
                className={`px-3 py-1 rounded text-xs flex items-center ${voucherFilter.type === 'receipt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                <ArrowDownCircle className="mr-1 w-3 h-3" />
                Receipts ({voucherCounts.receipt})
              </button>
              <button
                onClick={filterByPayment}
                className={`px-3 py-1 rounded text-xs flex items-center ${voucherFilter.type === 'payment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                <ArrowUpCircle className="mr-1 w-3 h-3" />
                Payments ({voucherCounts.payment})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-gray-700 dark:text-gray-300 text-xs">
                <thead className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase font-semibold tracking-wide">
                  <tr>
                    <th className="py-2 px-2 text-left">Voucher#</th>
                    <th className="py-2 px-2 text-left">Type</th>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Description</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                    <th className="py-2 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.length > 0 ? (
                    filteredVouchers.map((voucher, index) => (
                      <tr
                        key={voucher._id || index}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedVoucher?._id === voucher._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <td className="py-2 px-2 font-medium">{voucher.voucherNumber}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${voucher.voucherType === 'receipt'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                            {voucher.voucherType}
                          </span>
                        </td>
                        <td className="py-2 px-2">{formatDate(new Date(voucher.voucherDate))}</td>
                        <td className="py-2 px-2">{voucher.description || '-'}</td>
                        <td className="py-2 px-2 text-right font-medium">
                          {formatCurrency(voucher.amount)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={async () => {
                              setShowVoucherList(false);
                              setCurrentVoucherIndex(index);
                              await loadVoucherData(voucher);
                            }}
                            className="p-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        No vouchers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="inline-flex rounded-md shadow-sm text-xs">
                <button
                  type="button"
                  onClick={() => setVoucherType('receipt')}
                  className={`px-3 py-1.5 rounded-l-lg flex items-center ${voucherType === 'receipt' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  <ArrowDownCircle className="mr-1 w-3 h-3" />
                  Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherType('payment')}
                  className={`px-3 py-1.5 rounded-r-lg flex items-center ${voucherType === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  <ArrowUpCircle className="mr-1 w-3 h-3" />
                  Payment
                </button>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={goToFirstVoucher}
                  disabled={currentVoucherIndex <= 0 || filteredVouchers.length === 0}
                  className={`p-1.5 rounded ${currentVoucherIndex <= 0 || filteredVouchers.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToPreviousVoucher}
                  disabled={currentVoucherIndex <= 0 || filteredVouchers.length === 0}
                  className={`p-1.5 rounded ${currentVoucherIndex <= 0 || filteredVouchers.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 mx-1">
                  {currentVoucherIndex >= 0 && filteredVouchers.length > 0
                    ? `${currentVoucherIndex + 1} of ${getFilteredCount()}`
                    : '0 of 0'}
                </span>
                <button
                  type="button"
                  onClick={goToNextVoucher}
                  disabled={currentVoucherIndex >= filteredVouchers.length - 1 || filteredVouchers.length === 0}
                  className={`p-1.5 rounded ${currentVoucherIndex >= filteredVouchers.length - 1 || filteredVouchers.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToLastVoucher}
                  disabled={currentVoucherIndex >= filteredVouchers.length - 1 || filteredVouchers.length === 0}
                  className={`p-1.5 rounded ${currentVoucherIndex >= filteredVouchers.length - 1 || filteredVouchers.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {message && (
              <div className={`mb-4 p-2 rounded-lg text-white text-sm font-medium flex items-center gap-1 ${message.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}>
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Voucher Number</label>
                  <input
                    type="text"
                    value={voucherNumber}
                    readOnly
                    className={`${inputClass} bg-gray-100 dark:bg-gray-800`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Voucher Date</label>
                  <input
                    ref={voucherDateRef}
                    type="text"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
                    placeholder="dd-mm-yyyy"
                    pattern="\d{2}-\d{2}-\d{4}"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-600 dark:text-purple-300 mb-1">Total Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCurrency(calculateGrossAmount())}
                      readOnly
                      className="block w-full pl-7 pr-2 py-2 rounded-lg border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-purple-200 dark:ring-purple-900/50 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${voucherType === 'receipt' ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50'
                : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    {voucherType === 'receipt' ? (
                      <>
                        <ArrowDownCircle className="text-blue-500 w-4 h-4" />
                        <span>Cash Account (Debit)</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="text-green-500 w-4 h-4" />
                        <span>Cash Account (Credit)</span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Level 3</label>
                    <AccountLookup
                      ref={cashAccountLevel3Ref}
                      options={debitLevel3Options}
                      value={cashAccount.level3Id}
                      onChange={(value, option) => handleCashAccountChange('level3Id', value, option)}
                      placeholder="Search Cash Account"
                      onEnterKeyPress={() => cashAccountLevel4Ref.current?.focus()}
                      onFocus={() => cashAccountLevel3Ref.current?.focus()}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Account Level 4</label>
                    <AccountLookup
                      ref={cashAccountLevel4Ref}
                      options={debitLevel4Options}
                      value={cashAccount.level4Id}
                      onChange={(value, option) => handleCashAccountChange('level4Id', value, option)}
                      placeholder="Search Sub-Account"
                      disabled={!cashAccount.level3Id}
                      onEnterKeyPress={() => descriptionRef.current?.focus()}
                      onFocus={() => cashAccountLevel4Ref.current?.focus()}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <input
                    ref={descriptionRef}
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, entryLevel3Ref)}
                    placeholder="Enter description"
                    className={inputClass}
                  />
                </div>
              </div>


              <div className={`p-3 rounded-lg ${voucherType === 'receipt' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50'
                : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50'
                }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    {voucherType === 'receipt' ? (
                      <>
                        <ArrowUpCircle className="text-green-500 w-4 h-4" />
                        <span>Income Sources (Credit)</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="text-blue-500 w-4 h-4" />
                        <span>Expenses (Debit)</span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

                  {/* Parent Center Dropdown */}
      <div>
        <label className="block text-xs font-medium mb-1">Parent Center</label>
        <AccountLookup
          options={parentCenterOptions.map(pc => ({
            value: pc._id,
            label: `${pc.parentCode} - ${pc.title}`,
            code: pc.parentCode
          }))}
          value={entry.parentCenterId}
          onChange={handleParentCenterChange}
          placeholder="Search Parent Center"
        />
      </div>

      {/* Child Center Dropdown */}
      <div>
        <label className="block text-xs font-medium mb-1">Child Center</label>
        <AccountLookup
          options={childCenterOptions}
          value={entry.childCenterId}
          onChange={handleChildCenterChange}
          placeholder={entry.parentCenterId ? "Search Child Center" : "Select parent center first"}
          disabled={!entry.parentCenterId}
        />
        {loading && <div className="text-xs text-gray-500 mt-1">Loading...</div>}
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>

{/* Account Level 3 Dropdown */}
<div>
  <label className="block text-xs font-medium mb-1">Account Level 3</label>
  <AccountLookup
    ref={entryLevel3Ref}
    options={creditLevel3Options}
    value={entry.level3Id}
    onChange={(value) => {
      handleEntryChange('level3Id', value); // This calls fetchCreditLevel4Options(value)
    }}
    placeholder="Search Account"
    onEnterKeyPress={() => entryLevel4Ref.current?.focus()}
    onFocus={() => entryLevel3Ref.current?.focus()}
  />
</div>

{/* Account Level 4 Dropdown */}
<div>
  <label className="block text-xs font-medium mb-1">Account Level 4</label>
  <AccountLookup
    ref={entryLevel4Ref}
    options={creditLevel4Options}
    value={entry.level4Id}
    onChange={(value) => handleEntryChange('level4Id', value)}
    placeholder="Search Sub-Account"
    disabled={!entry.level3Id}
    onEnterKeyPress={() => entryDescriptionRef.current?.focus()}
    onFocus={() => entryLevel4Ref.current?.focus()}
  />
</div>


                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      ref={entryDescriptionRef}
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleEntryChange('description', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, entryAmountRef)}
                      placeholder="Description"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Amount</label>
                    <div className="flex gap-1">
                      <div className="relative flex-1">
                        <input
                          ref={entryAmountRef}
                          type="number"
                          value={entry.amount}
                          onChange={(e) => handleEntryChange('amount', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addToPreview();
                            }
                          }}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`${inputClass} pl-7`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    <Percent className="text-yellow-600 dark:text-yellow-400 w-4 h-4" />
                    <span>Tax Deductions</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Tax Account Level 3</label>
                    <AccountLookup
                      ref={taxAccountLevel3Ref}
                      options={additionalLevel3Options}
                      value={additionalEntry.level3Id}
                      onChange={(value, option) => {
                        handleAdditionalEntryChange('level3Id', value, option);
                      }}
                      placeholder="Search Tax Account"
                      onEnterKeyPress={() => taxAccountLevel4Ref.current?.focus()}
                      onFocus={() => taxAccountLevel3Ref.current?.focus()}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Tax Account Level 4</label>
                    <AccountLookup
                      ref={taxAccountLevel4Ref}
                      options={additionalLevel4Options}
                      value={additionalEntry.level4Id}
                      onChange={(value, option) => {
                        handleAdditionalEntryChange('level4Id', value, option);
                      }}
                      placeholder="Search Tax Sub-Account"
                      disabled={additionalLevel4Options.length === 0}
                      onEnterKeyPress={() => taxRateRef.current?.focus()}
                      onFocus={() => taxAccountLevel4Ref.current?.focus()}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Tax Rate</label>
                    <div className="relative">
                      <input
                        ref={taxRateRef}
                        type="number"
                        value={additionalEntry.rate}
                        onChange={(e) => handleAdditionalEntryChange('rate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, taxDescriptionRef)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`${inputClass} pl-7`}
                      />
                      <Percent className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Tax Description</label>
                    <input
                      ref={taxDescriptionRef}
                      type="text"
                      value={additionalEntry.description}
                      onChange={(e) => handleAdditionalEntryChange('description', e.target.value)}
                      placeholder="Tax description"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Tax Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={calculateTaxAmount().toFixed(2)}
                        readOnly
                        className={`${inputClass} pl-7 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Net Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={calculateNetAmount().toFixed(2)}
                        readOnly
                        className={`${inputClass} pl-7 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-300`}
                      />
                    </div>

                  </div>

                </div>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={addToPreview}
                  className="p-2 w-1/2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
                >
                  + Add Voucher
                </button>
                <button
                  type="submit"
                  disabled={loading || (tempEntries.length === 0 && additionalEntries.length === 0)}
                  className={`w-1/2 p-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 shadow transition bg-blue-600 hover:bg-blue-700 text-white ${loading || (tempEntries.length === 0 && additionalEntries.length === 0)
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                    }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Voucher
                </button>
              </div>

              {(tempEntries.length > 0 || additionalEntries.length > 0) && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm mb-2">Entries to be Saved</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse text-gray-700 dark:text-gray-300 text-xs">
                      <thead className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase font-semibold tracking-wide">
                        <tr>
                          <th className="py-2 px-1 text-left">Type</th>
                          <th className="py-2 px-1 text-left">Account</th>
                          <th className="py-2 px-1 text-left">Sub-Account</th>
                          <th className="py-2 px-1 text-left">Description</th>
                          <th className="py-2 px-1 text-right">Amount</th>
                          <th className="py-2 px-1 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 1. Show cash account entry (always debit for receipt) */}
                        {cashAccount.level3Id && (
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/10">
                            <td className="py-2 px-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${voucherType === 'receipt'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                }`}>
                                {voucherType === 'receipt' ? 'debit' : 'credit'}
                              </span>
                            </td>
                            <td className="py-2 px-1">{cashAccount.accountTitle}</td>
                            <td className="py-2 px-1">
                              {debitLevel4Options.find(opt => opt.value === cashAccount.level4Id)?.label || '-'}
                            </td>
                            <td className="py-2 px-1">{description || (voucherType === 'receipt' ? 'Cash received (net)' : 'Cash paid (net)')}</td>
                            <td className="py-2 px-1 text-right font-medium">
                              {formatCurrency(calculateCashAccountAmount())}
                            </td>
                            <td className="py-2 px-1 text-center"></td>
                          </tr>
                        )}

                        {/* 2. Show tax entries (always debit for receipt) */}
                        {additionalEntries.map((entry) => (
                          <tr key={entry.id} className={`border-b border-gray-200 dark:border-gray-700 ${entry.isTaxAccount ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'
                            }`}>
                            <td className="py-2 px-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${voucherType === 'receipt'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                }`}>
                                {voucherType === 'receipt' ? 'debit' : 'credit'}
                              </span>
                            </td>
                            <td className="py-2 px-1">
                              {entry.accountTitle}
                              {entry.isTaxAccount && (
                                <div className="text-xxs text-red-500 dark:text-red-300">Tax Account</div>
                              )}
                            </td>
                            <td className="py-2 px-1">{entry.subAccountTitle || '-'}</td>
                            <td className="py-2 px-1">
                              {entry.description || '-'}
                              {entry.rate && (
                                <div className="text-xxs text-gray-500">
                                  {`${entry.rate}%`}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-1 text-right">
                              {formatCurrency(entry.amount)}
                            </td>
                            <td className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeAdditionalEntry(entry.id)}
                                className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* 3. Show gross amount entries (credit for receipt) */}
                        {tempEntries.map((tempEntry) => (
                          <tr key={tempEntry.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 px-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${tempEntry.type === 'debit'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                }`}>
                                {tempEntry.type}
                              </span>
                            </td>
                            <td className="py-2 px-1">{tempEntry.accountTitle}</td>
                            <td className="py-2 px-1">{tempEntry.subAccountTitle || '-'}</td>
                            <td className="py-2 px-1">{tempEntry.description || '-'}</td>
                            <td className="py-2 px-1 text-right">
                              {formatCurrency(tempEntry.amount)}
                            </td>
                            <td className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeFromPreview(tempEntry.id)}
                                className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <td colSpan="4" className="py-1 px-1 text-right font-medium">Total Debit</td>
                          <td className="py-1 px-1 text-right font-medium text-blue-600 dark:text-blue-400">
                            {formatCurrency(
                              (cashAccount.level3Id ? calculateCashAccountAmount() : 0) +
                              calculateTaxAmount()
                            )}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="py-1 px-1 text-right font-medium">Total Credit</td>
                          <td className="py-1 px-1 text-right font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(calculateGrossAmount())}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-2">


                {savedVouchers.length > 0 && (
                  <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Recent Vouchers
                      </h3>
                      <button
                        onClick={() => setSavedVouchers([])}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border-collapse text-gray-700 dark:text-gray-300 text-xs">
                        <thead className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase font-semibold tracking-wide">
                          <tr>
                            <th className="py-1 px-1 text-left">Voucher#</th>
                            <th className="py-1 px-1 text-left">Account</th>
                            <th className="py-1 px-1 text-left">Description</th>
                            <th className="py-1 px-1 text-right">Debit</th>
                            <th className="py-1 px-1 text-right">Credit</th>
                          </tr>
                        </thead>

                        <tbody>
                          {savedVouchers.map((voucher, voucherIndex) =>
                            voucher.entries.map((entry, entryIndex) => (
                              <tr key={`${voucher.voucherNumber}-${entryIndex}`} className="border-b border-indigo-200 dark:border-indigo-700">
                                <td className="py-1 px-1">{voucher.voucherNumber}</td>
                                <td className="py-1 px-1">
                                  <div className="font-medium">{entry.accountTitle || entry.level3Title}</div>
                                  {entry.subAccountTitle && (
                                    <div className="text-gray-500 text-xxs">{entry.subAccountTitle}</div>
                                  )}
                                </td>
                                <td className="py-1 px-1">{entry.description || voucher.description || '-'}</td>
                                <td className="py-1 px-1 text-right font-medium text-blue-600 dark:text-blue-400">
                                  {entry.type === 'debit' ? formatCurrency(entry.amount) : '-'}
                                </td>
                                <td className="py-1 px-1 text-right font-medium text-green-600 dark:text-green-400">
                                  {entry.type === 'credit' ? formatCurrency(entry.amount) : '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}