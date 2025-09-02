import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Truck,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Folder,
  Home,
  Hash,
  Plus,
  Minus,
  Percent,
  Edit,
  Check,
  Info,
  Loader2,
  CheckSquare,
  Square,
  Search,
  MapPin,
  MessageSquare,
  Ban,
  Filter,
  Download,
  FileBarChart,
  XCircle,
  Printer
} from 'lucide-react';

import { FiFileText, FiPlus, FiTrash2, FiPrinter, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function SalesVoucher() {
  const { companyId } = useAppContext();
  const [isInvoicePosted, setIsInvoicePosted] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [invoiceType, setInvoiceType] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [fbrInvoiceNumber, setfbrInvoiceNumber] = useState('');
  const [address, setAddress] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [ogpNumber, setOgpNumber] = useState('');
  const [ogpDate, setOgpDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dcNumber, setDcNumber] = useState('');
  const [dcDate, setDcDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [invoicesData, setInvoicesData] = useState([]);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [originalInvoicesData, setOriginalInvoicesData] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState('');
  const [isSearchingInvoice, setIsSearchingInvoice] = useState(false);
  const [existingInvoiceData, setExistingInvoiceData] = useState(false);
  const [selectedGoDown, setSelectedGoDown] = useState('');
  const [goDowns, setGoDowns] = useState([]);
  const [isGoDownComboboxOpen, setIsGoDownComboboxOpen] = useState(false);
  const [goDownSearchTerm, setGoDownSearchTerm] = useState('');
  const [selectedDebtorAccount, setSelectedDebtorAccount] = useState('');
  const [selectedSubAccount, setSelectedSubAccount] = useState('');
  const [debtorAccounts, setDebtorAccounts] = useState([]);
  const [subAccounts, setSubAccounts] = useState([]);
  const [isDebtorComboboxOpen, setIsDebtorComboboxOpen] = useState(false);
  const [isSubAccountComboboxOpen, setIsSubAccountComboboxOpen] = useState(false);
  const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedParentCenter, setSelectedParentCenter] = useState('');
  const [selectedChildCenter, setSelectedChildCenter] = useState('');
  const [parentCenters, setParentCenters] = useState([]);
  const [childCenters, setChildCenters] = useState([]);
  const [isParentCenterComboboxOpen, setIsParentCenterComboboxOpen] = useState(false);
  const [isChildCenterComboboxOpen, setIsChildCenterComboboxOpen] = useState(false);
  const [parentCenterSearchTerm, setParentCenterSearchTerm] = useState('');
  const [childCenterSearchTerm, setChildCenterSearchTerm] = useState('');
  const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
  const [selectedAccountLevel4, setSelectedAccountLevel4] = useState(null);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [accountLevel4s, setAccountLevel4s] = useState([]);
  const [isFinishedGoodComboboxOpen, setIsFinishedGoodComboboxOpen] = useState(false);
  const [isAccountLevel4ComboboxOpen, setIsAccountLevel4ComboboxOpen] = useState(false);
  const [finishedGoodSearchTerm, setFinishedGoodSearchTerm] = useState('');
  const [accountLevel4SearchTerm, setAccountLevel4SearchTerm] = useState('');
  const [selectedUnitMeasurement, setSelectedUnitMeasurement] = useState(null);
  const [unitMeasurements, setUnitMeasurements] = useState([]);
  const [isUnitMeasurementComboboxOpen, setIsUnitMeasurementComboboxOpen] = useState(false);
  const [unitMeasurementSearchTerm, setUnitMeasurementSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(0);
  const [rateInfo, setRateInfo] = useState(null);
  const [showDiscountSection, setShowDiscountSection] = useState(true);
  const [showTaxSection, setShowTaxSection] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [discountValues, setDiscountValues] = useState({});
  const [netAmountBeforeTax, setNetAmountBeforeTax] = useState(0);
  const [discountBreakdown, setDiscountBreakdown] = useState([]);
  const [editableDiscounts, setEditableDiscounts] = useState({});
  const [editedDiscountValues, setEditedDiscountValues] = useState({});
  const [editedDiscountRates, setEditedDiscountRates] = useState({});
  const [taxRates, setTaxRates] = useState([]);
  const [taxValues, setTaxValues] = useState({});
  const [editableTaxes, setEditableTaxes] = useState({});
  const [editedTaxValues, setEditedTaxValues] = useState({});
  const [editedTaxRates, setEditedTaxRates] = useState({});
  const [taxBreakdown, setTaxBreakdown] = useState([]);
  const [defaultTaxes, setDefaultTaxes] = useState([]);
  const [netAmount, setNetAmount] = useState(0);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [showDebitCredit, setShowDebitCredit] = useState(false);
  const [fbrToken, setFbrToken] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    poNumber: false,
    poDate: false,
    ogpNumber: false,
    ogpDate: false,
    dcNumber: false,
    dcDate: false,
    vehicleNumber: false
  });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [comboboxHighlightedIndex, setComboboxHighlightedIndex] = useState(0);

  const invoiceTypes = ['Sale Invoice', 'Tax Invoice', 'Retail Invoice', 'Export Invoice', 'Proforma Invoice'];
  const comboboxRef = useRef(null);

  const [showSalesReportModal, 
    setShowSalesReportModal] = useState(false);
const [reportFromDate, setReportFromDate] = useState('');
const [reportToDate, setReportToDate] = useState('');
const [selectedReportDebtor, setSelectedReportDebtor] = useState('');
const [selectedReportSubAccount, setSelectedReportSubAccount] = useState('');
const [selectedReportParentCenter, setSelectedReportParentCenter] = useState('');
const [selectedReportChildCenter, setSelectedReportChildCenter] = useState('');
const [selectedReportFinishedGood, setSelectedReportFinishedGood] = useState('');
const [selectedReportAccountLevel4, setSelectedReportAccountLevel4] = useState('');
const [reportData, setReportData] = useState([]);
const [summaryData, setSummaryData] = useState(null);
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [showReportResults, setShowReportResults] = useState(false);
const [reportType, setReportType] = useState('detailed'); // 'detailed' or 'summary'

// Add these state variables to your SalesVoucher component
const [reportDebtorAccounts, setReportDebtorAccounts] = useState([]);
const [reportSubAccounts, setReportSubAccounts] = useState([]);
const [reportParentCenters, setReportParentCenters] = useState([]);
const [reportChildCenters, setReportChildCenters] = useState([]);
const [reportFinishedGoods, setReportFinishedGoods] = useState([]);
const [reportAccountLevel4s, setReportAccountLevel4s] = useState([]);
const [isReportDataLoading, setIsReportDataLoading] = useState(false);

// Fetch debtor accounts for report
useEffect(() => {
  const fetchDebtorAccounts = async () => {
    if (!companyId) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/debtor-accounts`);
      if (!response.ok) throw new Error('Failed to fetch debtor accounts');
      const data = await response.json();
      setReportDebtorAccounts(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch debtor accounts' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchDebtorAccounts();
}, [companyId]);

// Fetch sub accounts for report
useEffect(() => {
  const fetchSubAccounts = async () => {
    if (!companyId || !selectedReportDebtor) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/sub-accounts/${selectedReportDebtor}`);
      if (!response.ok) throw new Error('Failed to fetch sub accounts');
      const data = await response.json();
      setReportSubAccounts(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch sub accounts' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchSubAccounts();
}, [selectedReportDebtor, companyId]);

// Fetch parent centers for report
useEffect(() => {
  const fetchParentCenters = async () => {
    if (!companyId) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/parent-centers/company/${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch parent centers');
      const data = await response.json();
      setReportParentCenters(data.data || []);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch parent centers' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchParentCenters();
}, [companyId]);

// Fetch child centers for report
useEffect(() => {
  const fetchChildCenters = async () => {
    if (!companyId || !selectedReportParentCenter) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/child-centers/company/${companyId}?parentCenterId=${selectedReportParentCenter}`);
      if (!response.ok) throw new Error('Failed to fetch child centers');
      const data = await response.json();
      setReportChildCenters(data.data || []);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch child centers' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchChildCenters();
}, [selectedReportParentCenter, companyId]);

// Fetch finished goods for report
useEffect(() => {
  const fetchFinishedGoods = async () => {
    if (!companyId) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch finished goods');
      const data = await response.json();
      setReportFinishedGoods(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch finished goods' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchFinishedGoods();
}, [companyId]);

// Fetch account level 4 for report
useEffect(() => {
  const fetchAccountLevel4s = async () => {
    if (!companyId || !selectedReportFinishedGood) return;
    const selectedGood = reportFinishedGoods.find(fg => fg._id === selectedReportFinishedGood);
    if (!selectedGood) return;
    setIsReportDataLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${selectedGood.code}`
      );
      if (!response.ok) throw new Error('Failed to fetch account level 4');
      const data = await response.json();
      setReportAccountLevel4s(data.accounts);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch account level 4' });
    } finally {
      setIsReportDataLoading(false);
    }
  };
  fetchAccountLevel4s();
}, [selectedReportFinishedGood, companyId, reportFinishedGoods]);

const fetchSalesReport = async (isSummary = false) => {
  if (!companyId) {
    setMessage({ type: "error", text: "Company ID is required" });
    return;
  }
  setIsGeneratingReport(true);
  setMessage(null);
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (reportFromDate) params.append('fromDate', reportFromDate);
    if (reportToDate) params.append('toDate', reportToDate);
    if (selectedReportDebtor) params.append('debtorAccountId', selectedReportDebtor);
    if (selectedReportSubAccount) params.append('subAccountId', selectedReportSubAccount);
    if (selectedReportParentCenter) params.append('parentCenterId', selectedReportParentCenter);
    if (selectedReportChildCenter) params.append('childCenterId', selectedReportChildCenter);
    if (selectedReportFinishedGood) params.append('finishedGoodId', selectedReportFinishedGood);
    if (selectedReportAccountLevel4) params.append('itemId', selectedReportAccountLevel4);
    
    // Add cache-busting parameter to prevent 304 responses
    params.append('_', Date.now());
    
    const endpoint = isSummary 
      ? `http://localhost:5000/api/sales-vouchers/${companyId}/sales-summary-report?${params.toString()}`
      : `http://localhost:5000/api/sales-vouchers/${companyId}/sales-checklist-report?${params.toString()}`;
    const response = await fetch(endpoint);
    // Handle 304 Not Modified response
    if (response.status === 304) {
      setMessage({ type: "info", text: "Report data has not changed since the last request." });
      // Keep existing data visible
      setShowReportResults(true);
      return;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate report');
    }
    const data = await response.json();
    
    console.log('Original report data received:', data); // Add this for debugging
    
    // Enrich the data with additional details
    let finalData = data; // Initialize with original data
    let enrichedData = []; // Declare enrichedData here to fix the scoping issue
    
    if (!isSummary && Array.isArray(data)) {
      // Fetch all debtor accounts for mapping
      const debtorResponse = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/debtor-accounts`);
      const allDebtors = await debtorResponse.json();
      
      // Fetch all finished goods for mapping
      const finishedGoodsResponse = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
      const allFinishedGoods = await finishedGoodsResponse.json();
      
      // Create mapping objects
      const debtorMap = {};
      allDebtors.forEach(debtor => {
        debtorMap[debtor.code] = debtor;
      });
      
      const finishedGoodMap = {};
      allFinishedGoods.forEach(finishedGood => {
        finishedGoodMap[finishedGood.code] = finishedGood;
      });
      
      // Fetch all sub-accounts for all debtors to have a complete mapping
      const allSubAccountsMap = {};
      for (const debtor of allDebtors) {
        try {
          const subAccountResponse = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/sub-accounts/${debtor._id}`);
          if (subAccountResponse.ok) {
            const subAccounts = await subAccountResponse.json();
            subAccounts.forEach(subAccount => {
              allSubAccountsMap[subAccount.subcode] = subAccount;
              // Also map by fullcode if available
              if (subAccount.fullcode) {
                allSubAccountsMap[subAccount.fullcode] = subAccount;
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching sub-accounts for debtor ${debtor.code}:`, err);
        }
      }
      
      // Create a map to store account level 4 items for each finished good
      const accountLevel4Map = {};
      
      // Fetch account level 4 items for each finished good
      for (const finishedGood of allFinishedGoods) {
        try {
          const accountLevel4Response = await fetch(
            `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${finishedGood.code}`
          );
          if (accountLevel4Response.ok) {
            const accountLevel4Data = await accountLevel4Response.json();
            accountLevel4Map[finishedGood.code] = accountLevel4Data.accounts || [];
            
            // Also create a direct map by fullcode for easier lookup
            accountLevel4Data.accounts.forEach(account => {
              if (account.fullcode) {
                if (!accountLevel4Map.byFullcode) {
                  accountLevel4Map.byFullcode = {};
                }
                accountLevel4Map.byFullcode[account.fullcode] = account;
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching account level 4 items for finished good ${finishedGood.code}:`, err);
        }
      }
      
      // Try to get all invoices in one request to avoid individual API calls
      let allInvoices = [];
      try {
        const allInvoicesResponse = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/all?_=${Date.now()}`);
        if (allInvoicesResponse.ok) {
          allInvoices = await allInvoicesResponse.json();
          console.log('Fetched all invoices:', allInvoices.length);
        }
      } catch (err) {
        console.error('Error fetching all invoices:', err);
      }
      
      // Create a map of invoices by invoice number for quick lookup
      const invoiceMap = {};
      allInvoices.forEach(invoice => {
        invoiceMap[invoice.invoiceNumber] = invoice;
      });
      
      // Create sets to track processed invoice numbers and FBR invoice numbers
      const processedInvoiceNumbers = new Set();
      const processedFbrInvoiceNumbers = new Set();
      
      // Process the report data to create a separate entry for each item in each invoice
      enrichedData = [];
      
      data.forEach(item => {
        // Skip if we've already processed this invoice number
        if (processedInvoiceNumbers.has(item.invNo)) {
          return;
        }
        
        // Check for duplicate FBR invoice number
        if (item.fbrInvoiceNumber && processedFbrInvoiceNumbers.has(item.fbrInvoiceNumber)) {
          console.warn(`Duplicate FBR invoice number found: ${item.fbrInvoiceNumber}`);
          // You can decide whether to skip duplicates or handle them differently
          // For now, we'll log a warning but still process the invoice
        }
        
        // Mark this invoice as processed
        processedInvoiceNumbers.add(item.invNo);
        
        // Mark FBR invoice number as processed if it exists
        if (item.fbrInvoiceNumber) {
          processedFbrInvoiceNumbers.add(item.fbrInvoiceNumber);
        }
        
        // Find debtor details using debtorCode
        const debtor = debtorMap[item.debtorCode] || {};
        
        // Try to get the invoice from our map
        const invoice = invoiceMap[item.invNo];
        
        if (invoice && invoice.items && invoice.items.length > 0) {
          console.log(`Found invoice with ${invoice.items.length} items for ${item.invNo}`);
          
          // Create a separate entry for each item in the invoice
          invoice.items.forEach((invoiceItem, itemIndex) => {
            // Initialize default values for this item
            let subAccount = {};
            let finishedGood = {};
            let accountLevel4 = {};
            
            // Get subaccount from invoice item
            if (invoiceItem.subAccountFullCode) {
              subAccount = allSubAccountsMap[invoiceItem.subAccountFullCode] || {};
            } else if (invoiceItem.subAccountId) {
              // Find subaccount by ID
              subAccount = Object.values(allSubAccountsMap).find(sa => sa._id === invoiceItem.subAccountId) || {};
            } else if (invoice.subAccountFullCode) {
              // Fall back to invoice level
              subAccount = allSubAccountsMap[invoice.subAccountFullCode] || {};
            } else if (invoice.subAccountId) {
              // Fall back to invoice level
              subAccount = Object.values(allSubAccountsMap).find(sa => sa._id === invoice.subAccountId) || {};
            }
            
            // Get finished good and account level 4 from invoice item
            if (invoiceItem.productCode) {
              const productCode = invoiceItem.productCode;
              
              // Extract finished good code from product code (first 7 characters)
              const finishedGoodCode = productCode.substring(0, 7);
              finishedGood = finishedGoodMap[finishedGoodCode] || {};
              
              // Use the full product code to find account level 4
              if (accountLevel4Map.byFullcode && accountLevel4Map.byFullcode[productCode]) {
                accountLevel4 = accountLevel4Map.byFullcode[productCode] || {};
              } else if (finishedGood.code && accountLevel4Map[finishedGood.code]) {
                // If not found by fullcode, try to find by ID in the finished good's account level 4 items
                accountLevel4 = accountLevel4Map[finishedGood.code].find(al4 => al4.fullcode === productCode) || {};
              }
            } else if (invoiceItem.finishedGoodId) {
              finishedGood = allFinishedGoods.find(fg => fg._id === invoiceItem.finishedGoodId) || {};
              
              if (invoiceItem.accountLevel4Id && finishedGood.code && accountLevel4Map[finishedGood.code]) {
                accountLevel4 = accountLevel4Map[finishedGood.code].find(al4 => al4._id === invoiceItem.accountLevel4Id) || {};
              }
            }
            
            // Create a new entry for this item
            const enrichedItem = {
              ...item,
              // Override with item-specific values
              qty: invoiceItem.quantity || item.qty,
              rate: invoiceItem.rate || item.rate,
              amount: invoiceItem.amount || item.amount,
              // Override center information if available at item level
              parentCode: invoiceItem.parentCode || item.parentCode,
              childCode: invoiceItem.childCode || item.childCode,
              parentTitle: invoiceItem.parentTitle || item.parentTitle,
              childTitle: invoiceItem.childTitle || item.childTitle,
              // Add debtor details
              debtorTitle: debtor.title || '',
              // Add subaccount details
              subAccountCode: subAccount.subcode || '',
              subAccountTitle: subAccount.title || '',
              // Add finished good details
              finishedGoodCode: finishedGood.code || '',
              finishedGoodTitle: finishedGood.title || '',
              // Add account level 4 details
              accountLevel4Code: accountLevel4.fullcode || '',
              accountLevel4Title: accountLevel4.title || '',
              // Add item index for reference
              itemIndex: itemIndex,
              // Flag to indicate if this is the first row for the invoice
              isFirstRow: itemIndex === 0
            };
            
            // For subsequent rows, clear out the common invoice information
            if (itemIndex > 0) {
              enrichedItem.invNo = ''; // Clear invoice number for subsequent rows
              enrichedItem.invDate = ''; // Clear invoice date for subsequent rows
              enrichedItem.debtorCode = ''; // Clear debtor code for subsequent rows
              enrichedItem.debtorTitle = ''; // Clear debtor title for subsequent rows
              enrichedItem.subAccountCode = ''; // Clear subaccount code for subsequent rows
              enrichedItem.subAccountTitle = ''; // Clear subaccount title for subsequent rows
              enrichedItem.remarks = ''; // Clear remarks for subsequent rows
              enrichedItem.vhn = ''; // Clear vehicle number for subsequent rows
              enrichedItem.fbrInvoiceNumber = ''; // Clear FBR invoice number for subsequent rows
            }
            
            enrichedData.push(enrichedItem);
          });
        } else {
          // If we can't find the invoice or it has no items, create a single entry with the original data
          console.log(`Invoice not found or has no items for ${item.invNo}`);
          
          enrichedData.push({
            ...item,
            // Add debtor details
            debtorTitle: debtor.title || '',
            // Add empty details for other fields
            subAccountCode: '',
            subAccountTitle: '',
            finishedGoodCode: '',
            finishedGoodTitle: '',
            accountLevel4Code: '',
            accountLevel4Title: '',
            // Add item index for reference
            itemIndex: 0,
            // Flag to indicate if this is the first row for the invoice
            isFirstRow: true
          });
        }
      });
      
      finalData = enrichedData; // Update finalData with enriched data
    } else if (isSummary) {
      setSummaryData(data);
      finalData = data;
    } else {
      finalData = data;
    }
    
    console.log('Enriched report data:', finalData);
    setReportData(finalData);
    setReportType(isSummary ? 'summary' : 'detailed');
    setShowReportResults(true);
    setMessage({ type: "success", text: `Report generated successfully! Found ${finalData.length} records.` });
  } catch (err) {
    console.error('Error generating report:', err);
    setMessage({ type: "error", text: err.message || 'Failed to generate report' });
  } finally {
    setIsGeneratingReport(false);
  }
};

const resetReportFilters = () => {
  setReportFromDate('');
  setReportToDate('');
  setSelectedReportDebtor('');
  setSelectedReportSubAccount('');
  setSelectedReportParentCenter('');
  setSelectedReportChildCenter('');
  setSelectedReportFinishedGood('');
  setSelectedReportAccountLevel4('');
  setReportData([]);
  setSummaryData(null);
  setShowReportResults(false);
};

// Add this function to export report to CSV
const exportReportToCSV = () => {
  if (reportType === 'detailed' && reportData.length === 0) {
    setMessage({ type: "error", text: "No data to export" });
    return;
  }

  if (reportType === 'summary' && !summaryData) {
    setMessage({ type: "error", text: "No data to export" });
    return;
  }

  let csvContent = '';
  let headers = [];
  let rows = [];

  if (reportType === 'detailed') {
    headers = [
      'Invoice No', 'FBR Invoice No', 'Invoice Date', 'Sub Account Full Code',
      'Debtor Title - Sub Account Title', 'Remarks', 'Vehicle Number',
      'Account Level 4 Code', 'Finished Good Title - Account Level 4 Title',
      'UOM', 'Qty', 'Rate', 'Amount', 'Parent Center Code',
      'Child Center Code', 'Parent Center Title', 'Child Center Title'
    ];

    rows = reportData.map(item => [
      item.invNo || '',
      item.fbrInvoiceNumber || '',
      item.invDate ? new Date(item.invDate).toLocaleDateString() : '',
      item.subAccountFullCode || '',
      `${item.debtorAccountTitle || ''} - ${item.subAccountTitle || ''}`,
      item.remarks || '',
      item.vhn || '',
      item.itemCode || '',
      `${item.finishedGoodTitle || ''} - ${item.itemTitle || ''}`,
      item.unitOfMeasurement || '',
      item.qty || '',
      item.rate || '',
      item.amount || '',
      item.parentCode || '',
      item.childCode || '',
      item.parentTitle || '',
      item.childTitle || ''
    ]);
  } else {
    headers = [
      'Debtor Account ID', 'Debtor Account Title', 'Finished Good ID',
      'Finished Good Title', 'Total Quantity', 'Total Amount', 'Count'
    ];

    rows = summaryData.byDebtorAndGood.map(item => [
      item.debtorAccountId || '',
      item.debtorAccountTitle || '',
      item.finishedGoodId || '',
      item.finishedGoodTitle || '',
      item.totalQuantity || '',
      item.totalAmount || '',
      item.count || ''
    ]);

    // Add totals row
    rows.push([
      'TOTAL',
      '',
      '',
      '',
      summaryData.totalQuantity || '',
      summaryData.totalAmount || '',
      summaryData.totalInvoices || ''
    ]);
  }

  csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sales_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Refs for each field
const fieldRefs = {
  invoiceType: useRef(null),
  invoiceNumber: useRef(null),
  invoiceDate: useRef(null),
  debtorAccount: useRef(null),
  subAccount: useRef(null),
  fbrInvoiceNumber: useRef(null),
  address: useRef(null),
  poNumber: useRef(null),
  poDate: useRef(null),
  ogpNumber: useRef(null),
  ogpDate: useRef(null),
  dcNumber: useRef(null),
  dcDate: useRef(null),
  remarks: useRef(null),
  vehicleNumber: useRef(null),
  parentCenter: useRef(null),
  childCenter: useRef(null),
  finishedGood: useRef(null),
  accountLevel4: useRef(null),
  goDown: useRef(null),
  unit: useRef(null),
  quantity: useRef(null),
  rate: useRef(null),
  amount: useRef(null),
};
// Order of fields for navigation
const fieldOrder = Object.keys(fieldRefs);
// State for sub account search term (add this if it doesn't exist)
const [subAccountSearchTerm, setSubAccountSearchTerm] = useState('');
// Filter sub accounts based on search term (add this if it doesn't exist)
const filteredSubAccounts = subAccounts.filter(subAccount =>
  subAccount.title.toLowerCase().includes(subAccountSearchTerm.toLowerCase()) ||
  subAccount.subcode.toLowerCase().includes(subAccountSearchTerm.toLowerCase()) ||
  (subAccount.fullcode && subAccount.fullcode.toLowerCase().includes(subAccountSearchTerm.toLowerCase()))
);
// Move to the next field
const focusNextField = (currentField) => {
  const currentIndex = fieldOrder.indexOf(currentField);
  if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
    const nextField = fieldOrder[currentIndex + 1];
    const nextRef = fieldRefs[nextField];
    if (nextRef?.current) {
      setTimeout(() => nextRef.current.focus(), 50);
    }
  }
};
// Handle Enter on regular input field
const handleEnterKey = (e, fieldName) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    focusNextField(fieldName);
  }
};
// Open a combobox by type
const openCombobox = (type) => {
  const setterMap = {
    debtorAccount: setIsDebtorComboboxOpen,
    subAccount: setIsSubAccountComboboxOpen,
    parentCenter: setIsParentCenterComboboxOpen,
    childCenter: setIsChildCenterComboboxOpen,
    finishedGood: setIsFinishedGoodComboboxOpen,
    accountLevel4: setIsAccountLevel4ComboboxOpen,
    goDown: setIsGoDownComboboxOpen,
    unit: setIsUnitMeasurementComboboxOpen,
  };
  const setter = setterMap[type];
  if (setter) setter(true);
  setComboboxHighlightedIndex(0);
};
// Close a combobox
const closeCombobox = (type) => {
  const setterMap = {
    debtorAccount: setIsDebtorComboboxOpen,
    subAccount: setIsSubAccountComboboxOpen,
    parentCenter: setIsParentCenterComboboxOpen,
    childCenter: setIsChildCenterComboboxOpen,
    finishedGood: setIsFinishedGoodComboboxOpen,
    accountLevel4: setIsAccountLevel4ComboboxOpen,
    goDown: setIsGoDownComboboxOpen,
    unit: setIsUnitMeasurementComboboxOpen,
  };
  const setter = setterMap[type];
  if (setter) setter(false);
  setComboboxHighlightedIndex(0);
};
// Return filtered options for a combobox
const getFilteredOptions = (type) => {
  const optionMap = {
    debtorAccount: filteredDebtorAccounts,
    subAccount: subAccountSearchTerm ? filteredSubAccounts : subAccounts,
    parentCenter: filteredParentCenters,
    childCenter: filteredChildCenters,
    finishedGood: filteredFinishedGoods,
    accountLevel4: filteredAccountLevel4s,
    goDown: filteredGoDowns,
    unit: filteredUnitMeasurements,
  };
  return optionMap[type] || [];
};
// Track if a combobox is open
const isComboboxOpen = (type) => {
  const stateMap = {
    debtorAccount: isDebtorComboboxOpen,
    subAccount: isSubAccountComboboxOpen,
    parentCenter: isParentCenterComboboxOpen,
    childCenter: isChildCenterComboboxOpen,
    finishedGood: isFinishedGoodComboboxOpen,
    accountLevel4: isAccountLevel4ComboboxOpen,
    goDown: isGoDownComboboxOpen,
    unit: isUnitMeasurementComboboxOpen,
  };
  return stateMap[type] || false;
};
// Keyboard handling for combobox dropdowns
const handleComboboxKeyDown = (e, comboboxType) => {
  const isOpen = isComboboxOpen(comboboxType);
  const options = getFilteredOptions(comboboxType);
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen) openCombobox(comboboxType);
      else {
        setComboboxHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (!isOpen) return;
      setComboboxHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : options.length - 1
      );
      break;
    case 'Enter':
      e.preventDefault();
      if (!isOpen) {
        openCombobox(comboboxType);
        return;
      }
      if (options.length === 0) {
        focusNextField(comboboxType);
        return;
      }
      const selected = options[comboboxHighlightedIndex];
      if (selected) {
        selectComboboxOption(comboboxType, selected);
        closeCombobox(comboboxType);
        focusNextField(comboboxType);
      }
      break;
    case 'Escape':
      e.preventDefault();
      closeCombobox(comboboxType);
      fieldRefs[comboboxType]?.current?.focus();
      break;
    default:
      break;
  }
};
const selectComboboxOption = (type, option) => {
  if (!option) return;
  switch (type) {
    case 'debtorAccount':
      setSelectedDebtorAccount(option._id);
      setDebtorSearchTerm('');
      // Focus and open subAccount combobox with highlighted index and focusedField
      const nextField = 'subAccount';
      const nextRef = fieldRefs[nextField];
      if (nextRef?.current) {
        setTimeout(() => {
          nextRef.current.focus();
          setFocusedField(nextField);             // Set focusedField here!
          openCombobox(nextField);
          setComboboxHighlightedIndex(0);         // Highlight first item
        }, 50);
      }
      break;
    case 'subAccount':
      setSelectedSubAccount(option._id);
      setSubAccountSearchTerm(''); // Clear search term when selecting
      handleSubAccountChange(option._id);
      break;
    case 'parentCenter':
      setSelectedParentCenter(option._id);
      setParentCenterSearchTerm('');
      setSelectedChildCenter(''); // Clear child center when parent changes
      
      // Focus and open childCenter combobox with highlighted index and focusedField
      const childCenterField = 'childCenter';
      const childCenterRef = fieldRefs[childCenterField];
      if (childCenterRef?.current) {
        setTimeout(() => {
          childCenterRef.current.focus();
          setFocusedField(childCenterField);     // Set focusedField here!
          openCombobox(childCenterField);
          setComboboxHighlightedIndex(0);        // Highlight first item
        }, 50);
      }
      break;
    case 'childCenter':
      setSelectedChildCenter(option._id);
      setChildCenterSearchTerm('');
      break;
    case 'finishedGood':
      setSelectedFinishedGood(option._id);
      setFinishedGoodSearchTerm('');
      setSelectedAccountLevel4(null); // Clear account level 4 when finished good changes
      setRate(0);
      setRateInfo(null);
      
      // Focus and open accountLevel4 combobox with highlighted index and focusedField
      const accountLevel4Field = 'accountLevel4';
      const accountLevel4Ref = fieldRefs[accountLevel4Field];
      if (accountLevel4Ref?.current) {
        setTimeout(() => {
          accountLevel4Ref.current.focus();
          setFocusedField(accountLevel4Field);     // Set focusedField here!
          openCombobox(accountLevel4Field);
          setComboboxHighlightedIndex(0);           // Highlight first item
        }, 50);
      }
      break;
    case 'accountLevel4':
      setSelectedAccountLevel4(option._id);
      setAccountLevel4SearchTerm('');
      setRate(0);
      setRateInfo(null);
      
      // Focus and open goDown combobox with highlighted index and focusedField
      const goDownField = 'goDown';
      const goDownRef = fieldRefs[goDownField];
      if (goDownRef?.current) {
        setTimeout(() => {
          goDownRef.current.focus();
          setFocusedField(goDownField);            // Set focusedField here!
          openCombobox(goDownField);
          setComboboxHighlightedIndex(0);          // Highlight first item
        }, 50);
      }
      break;
    case 'goDown':
      setSelectedGoDown(option._id);
      setGoDownSearchTerm('');
      
      // Focus and open unit combobox with highlighted index and focusedField
      const unitField = 'unit';
      const unitRef = fieldRefs[unitField];
      if (unitRef?.current) {
        setTimeout(() => {
          unitRef.current.focus();
          setFocusedField(unitField);              // Set focusedField here!
          openCombobox(unitField);
          setComboboxHighlightedIndex(0);          // Highlight first item
        }, 50);
      }
      break;
    case 'unit':
      setSelectedUnitMeasurement(option._id);
      setUnitMeasurementSearchTerm('');
      break;
    default:
      break;
  }
};
// Close all comboboxes when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
      closeCombobox('debtorAccount');
      closeCombobox('subAccount');
      closeCombobox('parentCenter');
      closeCombobox('childCenter');
      closeCombobox('finishedGood');
      closeCombobox('accountLevel4');
      closeCombobox('goDown');
      closeCombobox('unit');
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);




  // Ultra compact styling with purple theme
  const inputClass = "w-full p-0.5 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-[10px] h-6";
  const focusedInputClass = "w-full p-0.5 rounded-sm border-2 border-purple-500 dark:border-purple-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-[10px] h-6";
  const labelClass = "block text-[8px] font-medium text-purple-700 dark:text-purple-300 mb-0";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-1 rounded-sm shadow mb-1 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-[9px] font-semibold text-purple-800 dark:text-purple-300 mb-0.5 flex items-center gap-0.5";
  const buttonClass = "flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-colors duration-200 text-[10px]";
  const tableHeaderClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-0.5 text-left font-medium text-[9px]";
  const tableCellClass = "p-0.5 border-t border-purple-200 dark:border-purple-700 text-[9px]";

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    finishedGoodId: null,
    accountLevel4Id: null,
    unitMeasurementId: null,
    quantity: 1,
    rate: 0,
    amount: 0,
    netAmountBeforeTax: 0,
    netAmount: 0,
    discountBreakdown: [],
    taxBreakdown: [],
    rateInfo: null
  });

  const addItem = () => {
    // Validate form data
    if (!selectedGoDown) {
      setMessage({ type: "error", text: 'Please select a GoDown' });
      return;
    }
    if (!selectedDebtorAccount || !selectedSubAccount) {
      setMessage({ type: "error", text: 'Please select both a debtor account and a level 4 account' });
      return;
    }
    if (quantity <= 0) {
      setMessage({ type: "error", text: 'Quantity must be greater than 0' });
      return;
    }
    if (rate <= 0) {
      setMessage({ type: "error", text: 'Rate must be greater than 0' });
      return;
    }

    const selectedFinishedGoodObj = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    const newItem = {
      finishedGoodId: selectedFinishedGood,
      finishedGoodCode: selectedFinishedGoodObj?.code || '',
      finishedGoodTitle: selectedFinishedGoodObj?.title || '',
      accountLevel4Id: selectedAccountLevel4,
      unitMeasurementId: selectedUnitMeasurement,
      quantity: quantity,
      rate: rate,
      amount: amount,
      netAmountBeforeTax: netAmountBeforeTax,
      netAmount: netAmount,
      discountBreakdown: discountBreakdown,
      taxBreakdown: taxBreakdown,
      rateInfo: rateInfo,
      productName: getSelectedAccountLevel4Name(),
      unitMeasurementCode: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[0] : '',
      unitMeasurementTitle: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[1] : ''
    };
    setItems([...items, newItem]);
    setMessage({ type: "success", text: "Item added to invoice! You can add more or save the invoice." });
    // Reset form for next item
    resetForm();
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`http://localhost:5000/api/companies/company/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch company details');
        const data = await response.json();
        setCompanyDetails(data);
      } catch (err) {
        console.error('Error fetching company details:', err);
        setMessage({ type: "error", text: err.message || 'Failed to fetch company details' });
      }
    };
    fetchCompanyDetails();
  }, [companyId]);

  const fetchFbrToken = async () => {
    if (!companyId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/companies/company/${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch company details');
      const data = await response.json();

      // Extract the FBR token from the company data
      const token = data.fbrToken;
      if (!token) {
        throw new Error('FBR token not found in company data');
      }

      setFbrToken(token);
      return token;
    } catch (err) {
      console.error('Error fetching FBR token:', err);
      setMessage({ type: "error", text: err.message || 'Failed to fetch FBR token' });
      return null;
    }
  };

  const transformInvoiceToFBRFormat = () => {
    // Get seller information from company details
    const sellerBusinessName = companyDetails?.companyName || '';
    const sellerNTNCNIC = companyDetails?.nationalTaxNumber || '';
    const sellerAddress = companyDetails?.address1 || '';

    // Get buyer information
    const subAccountObj = subAccounts.find(sa => sa._id === selectedSubAccount);
    const buyerBusinessName = subAccountObj ? subAccountObj.title : '';
    const buyerNTNCNIC = customerProfile?.ntn || '';
    const buyerAddress = address || '';
    const buyerRegistrationType = customerProfile?.customerType === 'registered' ? 'Registered' : 'Unregistered';

    // Transform items
    const transformedItems = items.map(item => {
      // Calculate total discount for this item
      const totalDiscount = item.discountBreakdown?.reduce((sum, d) => sum + d.value, 0) || 0;

      // Calculate total tax for this item
      const totalTax = item.taxBreakdown?.reduce((sum, t) => sum + t.value, 0) || 0;

      // Get tax rate percentage (first tax rate)
      const taxRate = item.taxBreakdown && item.taxBreakdown.length > 0
        ? `${item.taxBreakdown[0].registeredValue || item.taxBreakdown[0].unregisteredValue}%`
        : '0%';

      return {
        hsCode: item.hsCode || '',
        productDescription: item.productName || '',
        // rate: taxRate,
        rate: "Exempt",
        uoM: 'KG',
        // uoM: item.unitMeasurementTitle || '',
        quantity: item.quantity,
        totalValues: item.netAmount,
        valueSalesExcludingST: item.netAmount - totalTax || 0,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: totalTax,
        salesTaxWithheldAtSource: 0,
        extraTax: "",
        furtherTax: 0,
        sroScheduleNo: "6th Schd Table I",
        fedPayable: 0,
        discount: totalDiscount,
        saleType: "Exempt goods",
        sroItemSerialNo: "100"
      };
    });

    return {
      invoiceType: invoiceType,
      invoiceDate: invoiceDate,
      sellerBusinessName: sellerBusinessName,
      sellerProvince: "Punjab", // Default value, adjust as needed
      sellerNTNCNIC: sellerNTNCNIC,
      sellerAddress: sellerAddress,
      buyerNTNCNIC: buyerNTNCNIC,
      buyerBusinessName: buyerBusinessName,
      buyerProvince: "Punjab", // Default value, adjust as needed
      buyerAddress: buyerAddress,
      invoiceRefNo: invoiceNumber,
      scenarioId: "SN006", // Default value
      buyerRegistrationType: buyerRegistrationType,
      items: transformedItems
    };
  };

  const handlePostInvoice = async () => {
  if (!existingInvoiceData || !existingInvoiceData._id || !companyId) {
    setMessage({ type: "error", text: "No invoice selected to post." });
    return;
  }
  
  try {
    setLoading(true);
    const invoiceId = existingInvoiceData._id.$oid || existingInvoiceData._id;
    const response = await fetch(
      `http://localhost:5000/api/sales-vouchers/${companyId}/${invoiceId}/post`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to post invoice');
    }
    
    const data = await response.json();
    // Update the existingInvoiceData to set isPosted to true
    setExistingInvoiceData(prev => ({
      ...prev,
      isPosted: true
    }));
    setIsInvoicePosted(true);
    setMessage({ type: "success", text: "Invoice posted successfully! It is now locked." });
  } catch (err) {
    setMessage({ type: "error", text: err.message || "Failed to post invoice" });
  } finally {
    setLoading(false);
  }
};


  // Add this function to validate the invoice with FBR
  const validateInvoiceWithFBR = async () => {
    if (!companyId) {
      setMessage({ type: "error", text: "Company ID is required" });
      return;
    }

    if (items.length === 0) {
      setMessage({ type: "error", text: "No items to validate" });
      return;
    }

    setValidating(true);
    setMessage(null);

    try {
      // Get FBR token
      let token = fbrToken;
      if (!token) {
        token = await fetchFbrToken();
        if (!token) {
          setMessage({ type: "error", text: "Failed to get FBR token" });
          setValidating(false);
          return;
        }
      }

      // Transform invoice data
      const fbrInvoiceData = transformInvoiceToFBRFormat();
      console.log('FBR Invoice Data:', fbrInvoiceData);
      // Call FBR validation API
      const response = await fetch("https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fbrInvoiceData)
      });
      const result = await response.json();
      if (response.ok) {
        setValidationResult({
          success: true,
          message: "Invoice validated successfully with FBR",
          data: result
        });
      } else {
        setValidationResult({
          success: false,
          message: result.message || "Invoice validation failed",
          data: result
        });
      }

      setShowValidationModal(true);
    } catch (err) {
      console.error('Error validating invoice with FBR:', err);
      setValidationResult({
        success: false,
        message: err.message || "Error validating invoice with FBR"
      });
      setShowValidationModal(true);
    } finally {
      setValidating(false);
    }
  };

  // Fetch godowns
  useEffect(() => {
    const fetchGoDowns = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/godown/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch godowns');
        const data = await response.json();
        setGoDowns(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch godowns' });
      } finally {
        setLoading(false);
      }
    };
    fetchGoDowns();
  }, [companyId]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!companyId || !selectedDebtorAccount || !selectedSubAccount) {
        setCustomerProfile(null);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/api/customer-profile/${companyId}/${encodeURIComponent(selectedDebtorAccount)}/${encodeURIComponent(selectedSubAccount)}`
        );
        if (!response.ok) {
          // If no profile found, reset to null
          if (response.status === 404) {
            setCustomerProfile(null);
            return;
          }
          throw new Error('Failed to fetch customer profile');
        }
        const data = await response.json();
        setCustomerProfile(data);
      } catch (err) {
        console.error('Error fetching customer profile:', err);
        setCustomerProfile(null);
      }
    };
    fetchCustomerProfile();
  }, [companyId, selectedDebtorAccount, selectedSubAccount]);

  useEffect(() => {
    if (customerProfile?.address) {
      setAddress(customerProfile.address);
    }
  }, [customerProfile]);

  // Add this useEffect to fetch default taxes
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

  // Fetch debtor accounts
  useEffect(() => {
    const fetchDebtorAccounts = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/debtor-accounts`);
        if (!response.ok) throw new Error('Failed to fetch debtor accounts');
        const data = await response.json();
        setDebtorAccounts(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch debtor accounts' });
      } finally {
        setLoading(false);
      }
    };
    fetchDebtorAccounts();
  }, [companyId]);

  // Fetch sub accounts
  useEffect(() => {
    const fetchSubAccounts = async () => {
      if (!companyId || !selectedDebtorAccount) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/sub-accounts/${selectedDebtorAccount}`);
        if (!response.ok) throw new Error('Failed to fetch sub accounts');
        const data = await response.json();
        setSubAccounts(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch sub accounts' });
      } finally {
        setLoading(false);
      }
    };
    fetchSubAccounts();
  }, [selectedDebtorAccount, companyId]);

  // Fetch parent centers
  useEffect(() => {
    const fetchParentCenters = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/parent-centers/company/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch parent centers');
        const data = await response.json();
        setParentCenters(data.data || []);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch parent centers' });
      } finally {
        setLoading(false);
      }
    };
    fetchParentCenters();
  }, [companyId]);

  // Fetch child centers when parent center is selected
  useEffect(() => {
    const fetchChildCenters = async () => {
      if (!companyId || !selectedParentCenter) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/child-centers/company/${companyId}?parentCenterId=${selectedParentCenter}`);
        if (!response.ok) throw new Error('Failed to fetch child centers');
        const data = await response.json();
        setChildCenters(data.data || []);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch child centers' });
      } finally {
        setLoading(false);
      }
    };
    fetchChildCenters();
  }, [selectedParentCenter, companyId]);

  // Fetch finished goods
  useEffect(() => {
    const fetchFinishedGoods = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch finished goods');
        const data = await response.json();
        setFinishedGoods(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch finished goods' });
      } finally {
        setLoading(false);
      }
    };
    fetchFinishedGoods();
  }, [companyId]);

  // Fetch account level 4 based on selected finished good
  useEffect(() => {
    const fetchAccountLevel4s = async () => {
      if (!companyId || !selectedFinishedGood) return;
      const selectedGood = finishedGoods.find(fg => fg._id === selectedFinishedGood);
      if (!selectedGood) return;
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${selectedGood.code}`
        );
        if (!response.ok) throw new Error('Failed to fetch account level 4');
        const data = await response.json();
        setAccountLevel4s(data.accounts);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch account level 4' });
      } finally {
        setLoading(false);
      }
    };
    fetchAccountLevel4s();
  }, [selectedFinishedGood, companyId, finishedGoods]);

  // Fetch unit measurements
  useEffect(() => {
    const fetchUnitMeasurements = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/unit-measurement/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch unit measurements');
        const data = await response.json();
        setUnitMeasurements(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message || 'Failed to fetch unit measurements' });
      } finally {
        setLoading(false);
      }
    };
    fetchUnitMeasurements();
  }, [companyId]);

  // Fetch product rate when account level 4 is selected
  useEffect(() => {
    const fetchProductRate = async () => {
      if (!companyId || !selectedAccountLevel4 || !invoiceDate) {
        setRate(0);
        setRateInfo(null);
        return;
      }
      setLoading(true);
      try {
        const formattedDate = new Date(invoiceDate).toISOString().split('T')[0];
        const invoiceDateObj = new Date(formattedDate);
        // Fetch all rates that are <= invoice date
        const response = await fetch(
          `http://localhost:5000/api/product-rates/${companyId}/account/${selectedAccountLevel4}/dates`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              dates: [formattedDate] // We'll use this to get all rates <= this date
            })
          }
        );
        if (!response.ok) {
          if (response.status === 404) {
            setRate(0);
            setRateInfo(null);
            setMessage({
              type: "warning",
              text: "No rates found for this item"
            });
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch product rates');
        }
        const ratesData = await response.json();
        if (ratesData && ratesData.length > 0) {
          // Find the most recent rate (already sorted by date descending)
          const mostRecentRate = ratesData[0];
          setRate(mostRecentRate.rate);
          setRateInfo({
            rate: mostRecentRate.rate,
            applicableDate: mostRecentRate.applicableDate,
            isActive: mostRecentRate.isActive,
            allRates: ratesData,
            isFallbackRate: new Date(mostRecentRate.applicableDate).toISOString().split('T')[0] !== formattedDate
          });
          if (new Date(mostRecentRate.applicableDate).toISOString().split('T')[0] !== formattedDate) {
            setMessage(null);
          } else {
            setMessage(null);
          }
        } else {
          setRate(0);
          setRateInfo(null);
          setMessage({
            type: "warning",
            text: "No applicable rates found for this item"
          });
        }
      } catch (err) {
        console.error('Error fetching product rates:', err);
        setRate(0);
        setRateInfo(null);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch product rates'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProductRate();
  }, [selectedAccountLevel4, companyId, invoiceDate]);

  // Fetch discounts when debtor account, sub account, and finished good are selected
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (!companyId || !selectedDebtorAccount || !selectedSubAccount || !selectedFinishedGood) {
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
              debtorAccountLevel4Id: selectedSubAccount,
              finishedGoodId: selectedFinishedGood
            })
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch discounts');
        }
        const data = await res.json();
        setDiscounts(data);
        const initialEditable = {};
        data.forEach(discount => {
          if (discount.discountRates) {
            discount.discountRates.forEach(rate => {
              initialEditable[rate.discountTypeId] = rate.isEditable || false;
            });
          }
        });
        setEditableDiscounts(initialEditable);
        setEditedDiscountValues({});
        setEditedDiscountRates({});
      } catch (err) {
        console.error('Error fetching discounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, [companyId, selectedDebtorAccount, selectedSubAccount, selectedFinishedGood]);

  // Fetch tax rates when finished good and account level 4 are selected
  useEffect(() => {
    // Inside the fetchTaxRates useEffect in SalesVoucher.jsx
    const fetchTaxRates = async () => {
      if (!companyId || !selectedFinishedGood || !selectedAccountLevel4) {
        setTaxRates([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/tax-rates/${companyId}/filtered`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              itemId: selectedFinishedGood,
              itemType: 'finishedGood',
              accountLevel4Id: selectedAccountLevel4
            })
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch tax rates');
        }
        const data = await res.json();
        // Find the most recent active tax rate
        const activeTaxRate = data.find(taxRate =>
          new Date(taxRate.applicableDate) <= new Date(invoiceDate) &&
          taxRate.isActive
        );
        if (activeTaxRate) {
          // Map tax rates with their titles and filter for sales only
          const mappedTaxRates = activeTaxRate.taxRates
            .filter(rate => rate.transactionType === 'sale') // Only include sales taxes
            .map(rate => {
              const taxType = defaultTaxes.find(tax => tax._id === rate.taxTypeId);
              return {
                ...rate,
                title: taxType ? taxType.level4Title : 'Tax',
                taxTypeId: rate.taxTypeId?._id || rate.taxTypeId,
                isEditable: rate.isEditable || false,
                transactionType: rate.transactionType || 'sale',
                registeredValue: rate.registeredValue || 0,
                unregisteredValue: rate.unregisteredValue || 0,
                type: rate.type || 'percentage' // Add this line to include the type
              };
            });
          setTaxRates(mappedTaxRates);
          // Initialize editable status for each tax rate
          const initialEditable = {};
          mappedTaxRates.forEach(rate => {
            initialEditable[rate.taxTypeId] = rate.isEditable || false;
          });
          setEditableTaxes(initialEditable);
          setEditedTaxValues({});
          setEditedTaxRates({});
        } else {
          setTaxRates([]);
        }
      } catch (err) {
        console.error('Error fetching tax rates:', err);
        setTaxRates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxRates();
  }, [companyId, selectedFinishedGood, selectedAccountLevel4, invoiceDate]);

  // Calculate amount when quantity or rate changes
  useEffect(() => {
    const calculatedAmount = quantity * rate;
    setAmount(parseFloat(calculatedAmount.toFixed(2)));
  }, [quantity, rate]);

  // Calculate discounts and net amount when amount or discounts change
  useEffect(() => {
    if (discounts.length === 0 || amount === 0) {
      setNetAmountBeforeTax(amount);
      setDiscountBreakdown([]);
      return;
    }
    let currentAmount = amount;
    const breakdown = [];
    const newDiscountValues = {};
    const activeDiscount = discounts.find(d => d.isActive);
    if (activeDiscount && activeDiscount.discountRates) {
      activeDiscount.discountRates.forEach(rate => {
        let discountValue = 0;
        let discountRate = rate.rate;
        // Check if we have edited values for this discount
        if (editableDiscounts[rate.discountTypeId]) {
          // Use edited rate if available
          if (editedDiscountRates[rate.discountTypeId] !== undefined) {
            discountRate = parseFloat(editedDiscountRates[rate.discountTypeId]);
          }
          // Calculate value based on edited rate or use edited value directly
          if (editedDiscountValues[rate.discountTypeId] !== undefined) {
            discountValue = parseFloat(editedDiscountValues[rate.discountTypeId]);
            // If amount was edited, recalculate the rate based on the amount
            if (rate.type === 'percentage') {
              discountRate = (discountValue / amount) * 100;
              setEditedDiscountRates(prev => ({
                ...prev,
                [rate.discountTypeId]: parseFloat(discountRate.toFixed(2))
              }));
            } else if (rate.type === 'quantity') {
              discountRate = discountValue / quantity;
              setEditedDiscountRates(prev => ({
                ...prev,
                [rate.discountTypeId]: parseFloat(discountRate.toFixed(2))
              }));
            }
          } else {
            // Calculate value based on rate
            if (rate.type === 'percentage') {
              discountValue = amount * (discountRate / 100);
            } else if (rate.type === 'quantity') {
              discountValue = quantity * discountRate;
            } else if (rate.type === 'flat') {
              discountValue = discountRate;
            }
          }
        } else {
          // Use original calculation
          if (rate.type === 'percentage') {
            discountValue = amount * (rate.rate / 100);
          } else if (rate.type === 'quantity') {
            discountValue = quantity * rate.rate;
          } else if (rate.type === 'flat') {
            discountValue = rate.rate;
          }
        }
        currentAmount -= discountValue;
        breakdown.push({
          title: rate.title,
          type: rate.type,
          rate: discountRate, // Use the current rate (edited or original)
          value: parseFloat(discountValue.toFixed(2)),
          discountTypeId: rate.discountTypeId,
          originalRate: rate.rate,
          originalValue: rate.type === 'percentage' ?
            amount * (rate.rate / 100) :
            rate.type === 'quantity' ?
              quantity * rate.rate :
              rate.rate,
          isEditable: rate.isEditable || false
        });
        newDiscountValues[rate.discountTypeId] = {
          value: discountValue,
          type: rate.type,
          rate: discountRate
        };
      });
    }
    setDiscountValues(newDiscountValues);
    setDiscountBreakdown(breakdown);
    setNetAmountBeforeTax(parseFloat(currentAmount.toFixed(2)));
  }, [amount, discounts, quantity, editableDiscounts, editedDiscountValues, editedDiscountRates]);

  // In the tax calculation useEffect in SalesVoucher.jsx
  // Update the tax calculation useEffect
  useEffect(() => {
    if (taxRates.length === 0 || netAmountBeforeTax === 0) {
      setTaxBreakdown([]);
      setNetAmount(netAmountBeforeTax);
      return;
    }
    let currentAmount = netAmountBeforeTax;
    const breakdown = [];
    const newTaxValues = {};
    const newTaxRates = {};
    taxRates.forEach(tax => {
      // Default to un-registered if no customer profile exists
      const customerType = customerProfile?.customerType || 'un-registered';
      // Determine which tax rate to use - check for edited rates first
      let taxRate = customerType === 'registered'
        ? (editedTaxRates[tax.taxTypeId]?.registeredValue !== undefined
          ? editedTaxRates[tax.taxTypeId].registeredValue
          : tax.registeredValue)
        : (editedTaxRates[tax.taxTypeId]?.unregisteredValue !== undefined
          ? editedTaxRates[tax.taxTypeId].unregisteredValue
          : tax.unregisteredValue);
      // Skip if the applicable tax rate is 0
      if (taxRate <= 0) return;
      // Calculate tax value based on type
      let taxValue = 0;
      if (tax.type === 'quantity') {
        taxValue = quantity * taxRate;
      } else {
        taxValue = netAmountBeforeTax * (taxRate / 100);
      }
      // If we have an edited value, use that instead
      if (editableTaxes[tax.taxTypeId] && editedTaxValues[tax.taxTypeId] !== undefined) {
        taxValue = parseFloat(editedTaxValues[tax.taxTypeId]);
        // Recalculate the rate based on the edited value
        if (tax.type === 'quantity') {
          taxRate = taxValue / quantity;
        } else {
          taxRate = (taxValue / netAmountBeforeTax) * 100;
        }
      }
      currentAmount += taxValue;
      breakdown.push({
        title: tax.title,
        registeredValue: tax.registeredValue,
        unregisteredValue: tax.unregisteredValue,
        value: parseFloat(taxValue.toFixed(2)),
        taxTypeId: tax.taxTypeId,
        transactionType: tax.transactionType || 'sale',
        originalRegisteredValue: tax.registeredValue,
        originalUnregisteredValue: tax.unregisteredValue,
        originalValue: tax.type === 'quantity'
          ? quantity * (customerType === 'registered' ? tax.registeredValue : tax.unregisteredValue)
          : netAmountBeforeTax * ((customerType === 'registered' ? tax.registeredValue : tax.unregisteredValue) / 100),
        isEditable: tax.isEditable || false,
        type: tax.type || 'percentage',
        currentRate: taxRate // Add current rate to breakdown
      });
      newTaxValues[tax.taxTypeId] = {
        value: taxValue,
        registeredValue: customerType === 'registered' ? taxRate : tax.registeredValue,
        unregisteredValue: customerType === 'un-registered' ? taxRate : tax.unregisteredValue,
        transactionType: tax.transactionType || 'sale',
        type: tax.type || 'percentage'
      };
      newTaxRates[tax.taxTypeId] = {
        registeredValue: customerType === 'registered' ? taxRate : tax.registeredValue,
        unregisteredValue: customerType === 'un-registered' ? taxRate : tax.unregisteredValue,
        transactionType: tax.transactionType || 'sale',
        type: tax.type || 'percentage'
      };
    });
    setTaxValues(newTaxValues);
    // setEditedTaxRates(newTaxRates);
    setTaxBreakdown(breakdown);
    setNetAmount(parseFloat(currentAmount.toFixed(2)));
  }, [netAmountBeforeTax, taxRates, editableTaxes, editedTaxValues, editedTaxRates, customerProfile, quantity]);

  // Generate invoice number (fetch from backend for sequential numbering)
// Generate invoice number (fetch from backend for sequential numbering)
useEffect(() => {
  async function fetchInvoiceNumber() {
    // Skip generation if we're viewing an existing invoice or if invoice type isn't selected
    if (existingInvoiceData || !invoiceType || !companyId || !invoiceDate) return;
    const now = new Date(invoiceDate);
    const year = now.getFullYear().toString();
    const prefix = invoiceType.charAt(0).toUpperCase();
    try {
      // Updated API call to remove month parameter
      const res = await fetch(
        `http://localhost:5000/api/sales-vouchers/${companyId}/latest-invoice-number?invoiceType=${invoiceType}&year=${year}`
      );
      const data = await res.json();
      const seq = data.nextSeq || 1;
      // Updated invoice number format without month
      setInvoiceNumber(`${prefix}${year}${seq.toString().padStart(4, '0')}`);
    } catch (err) {
      // Updated fallback format without month
      setInvoiceNumber(`${prefix}${year}0001`);
    }
  }
  // Only fetch new invoice number if we're not editing an existing invoice
  if (!isEditingInvoice) {
    fetchInvoiceNumber();
  }
}, [invoiceType, companyId, invoiceDate, existingInvoiceData, isEditingInvoice]);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!showInvoicesModal || !companyId) return;
      setLoading(true);
      setMessage(null);
      try {
        const response = await fetch(`http://localhost:5000/api/sales-vouchers/${companyId}/all`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch invoices');
        }
        const data = await response.json();
        const validatedInvoices = data.map(invoice => ({
          ...invoice,
          netAmount: invoice.netAmount || 0,
          items: (invoice.items || []).map(item => ({
            ...item,
            quantity: item.quantity || 0,
            rate: item.rate || 0,
            discountBreakdown: item.discountBreakdown || [],
            taxBreakdown: item.taxBreakdown || [],
            unitMeasurementTitle: item.unitMeasurementTitle || '',
            unitMeasurementCode: item.unitMeasurementCode || '',
            productName: item.productName || 'Unknown Product'
          }))
        }));
        setInvoicesData(validatedInvoices);
        setOriginalInvoicesData(validatedInvoices); // Store the original data
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setMessage({
          type: "error",
          text: err.message || 'Failed to fetch invoices. Please check your connection.'
        });
        setInvoicesData([]);
        setOriginalInvoicesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [showInvoicesModal, companyId]);

  const fetchInvoiceByNumber = async () => {
    if (!searchInvoiceNumber || !companyId) return;
    setIsSearchingInvoice(true);
    setIsDataLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/sales-vouchers/${companyId}/search/?invoiceNumber=${searchInvoiceNumber}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          setMessage({ type: "error", text: "Invoice not found" });
          return;
        }
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      setExistingInvoiceData(data);
      setIsEditingInvoice(true);
      setIsInvoicePosted(data.isPosted || false); // Set the posted status


      // Populate all form fields with existing invoice data
      setInvoiceType(data.invoiceType);
      setInvoiceNumber(data.invoiceNumber);
      setInvoiceDate(new Date(data.invoiceDate).toISOString().split('T')[0]);
      setfbrInvoiceNumber(data.fbrInvoiceNumber || '');

      // Fix: Use customerAddress instead of address
      setAddress(data.customerAddress || '');

      setPoNumber(data.poNumber || '');
      setPoDate(data.poDate ? new Date(data.poDate).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0]);
      setOgpNumber(data.ogpNumber || '');
      setOgpDate(data.ogpDate ? new Date(data.ogpDate).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0]);
      setDcNumber(data.dcNumber || '');
      setDcDate(data.dcDate ? new Date(data.dcDate).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0]);
      setVehicleNumber(data.vehicleNumber || '');
      setRemarks(data.remarks || '');

      // Set debtor account and sub account
      setSelectedDebtorAccount(
        data.debtorAccount?._id ||
        (typeof data.debtorAccount === 'string' ? data.debtorAccount :
          (data.debtorAccountId || ''))
      );
      setSelectedSubAccount(
        data.subAccount?._id ||
        (typeof data.subAccount === 'string' ? data.subAccount :
          (data.subAccountId || ''))
      );

      // Set parent and child centers
      setSelectedParentCenter(
        data.parentCenterId?._id ||
        (typeof data.parentCenterId === 'string' ? data.parentCenterId : '')
      );
      setSelectedChildCenter(
        data.childCenterId?._id ||
        (typeof data.childCenterId === 'string' ? data.childCenterId : '')
      );

      // Set GoDown ID
      const goDownId = data.goDownId?._id || (typeof data.goDownId === 'string' ? data.goDownId : '');
      setSelectedGoDown(goDownId);

      // Ensure GoDowns are loaded if not already
      if (goDowns.length === 0) {
        try {
          const goDownResponse = await fetch(`http://localhost:5000/api/godown/${companyId}`);
          if (goDownResponse.ok) {
            const goDownData = await goDownResponse.json();
            setGoDowns(goDownData);
          }
        } catch (err) {
          console.error('Error fetching godowns:', err);
        }
      }

      // Ensure unit measurements are loaded if not already
      if (unitMeasurements.length === 0) {
        try {
          const unitResponse = await fetch(`http://localhost:5000/api/unit-measurement/${companyId}`);
          if (unitResponse.ok) {
            const unitData = await unitResponse.json();
            setUnitMeasurements(unitData);
          }
        } catch (err) {
          console.error('Error fetching unit measurements:', err);
        }
      }

      // Set items from the invoice data with proper unit measurement mapping
      const mappedItems = data.items.map(item => {
        // Get unit measurement ID from various possible sources
        const unitMeasurementId = item.unitMeasurementId?._id ||
          item.unitMeasurementId ||
          (item.unitMeasurement && typeof item.unitMeasurement === 'object' ? item.unitMeasurement._id : null);

        // Get unit measurement title and code from various possible sources
        let unitMeasurementTitle = item.unitMeasurementId?.title ||
          item.unitMeasurementTitle ||
          (item.unitMeasurement && typeof item.unitMeasurement === 'object' ? item.unitMeasurement.title : '');

        let unitMeasurementCode = item.unitMeasurementId?.code ||
          item.unitMeasurementCode ||
          (item.unitMeasurement && typeof item.unitMeasurement === 'object' ? item.unitMeasurement.code : '');

        // If we still don't have title/code, try to find in unitMeasurements state
        if ((!unitMeasurementTitle || !unitMeasurementCode) && unitMeasurementId) {
          const unit = unitMeasurements.find(um => um._id === unitMeasurementId);
          if (unit) {
            unitMeasurementTitle = unit.title;
            unitMeasurementCode = unit.code;
          }
        }

        return {
          ...item,
          finishedGoodId: item.finishedGoodId?._id || item.finishedGoodId,
          finishedGoodCode: item.finishedGoodId?.code || item.finishedGoodCode || '',
          finishedGoodTitle: item.finishedGoodId?.title || item.finishedGoodTitle || '',
          accountLevel4Id: item.accountLevel4Id?._id || item.accountLevel4Id,
          unitMeasurementId,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          netAmountBeforeTax: item.netAmountBeforeTax,
          netAmount: item.netAmount,
          discountBreakdown: item.discountBreakdown,
          taxBreakdown: item.taxBreakdown,
          productName: item.productName,
          unitMeasurementCode: unitMeasurementCode || '',
          unitMeasurementTitle: unitMeasurementTitle || ''
        };
      });
      setItems(mappedItems);

      // If there are items, set quantity from the first item
      if (mappedItems.length > 0) {
        setQuantity(mappedItems[0].quantity);

        // Also set the unit measurement for the first item in the form
        if (mappedItems[0].unitMeasurementId) {
          setSelectedUnitMeasurement(mappedItems[0].unitMeasurementId);
        }
      }

      // Fetch finished goods and account level 4 data
      try {
        // Fetch finished goods if not already loaded
        if (finishedGoods.length === 0) {
          const fgResponse = await fetch(`http://localhost:5000/api/item-profile/finished-goods/${companyId}`);
          if (fgResponse.ok) {
            const fgData = await fgResponse.json();
            setFinishedGoods(fgData);
          }
        }

        // Set finished good from invoice data
        if (data.finishedGoodId) {
          const fgId = data.finishedGoodId._id || data.finishedGoodId;
          setSelectedFinishedGood(fgId);

          // Fetch account level 4 data for this finished good
          const selectedGood = finishedGoods.find(fg => fg._id === fgId) ||
            (data.finishedGoodId.code ? { code: data.finishedGoodId.code } : null);

          if (selectedGood && selectedGood.code) {
            const al4Response = await fetch(
              `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${selectedGood.code}`
            );
            if (al4Response.ok) {
              const al4Data = await al4Response.json();
              setAccountLevel4s(al4Data.accounts);

              // Set account level 4 from invoice data
              if (data.accountLevel4Id) {
                const al4Id = data.accountLevel4Id._id || data.accountLevel4Id;
                setSelectedAccountLevel4(al4Id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setMessage({ type: "error", text: "Error loading product data" });
      }

      setMessage({ type: "success", text: "Invoice loaded successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to fetch invoice' });
    } finally {
      setIsSearchingInvoice(false);
      setIsDataLoading(false);
    }
  };


  const handleViewInvoicesClick = () => {
    setShowInvoicesModal(true);
  };

  const handleDiscountEditToggle = (discountTypeId) => {
    setEditableDiscounts(prev => ({
      ...prev,
      [discountTypeId]: !prev[discountTypeId]
    }));
  };

  const handleDiscountValueChange = (discountTypeId, value) => {
    const numValue = parseFloat(value) || 0;
    setEditedDiscountValues(prev => ({
      ...prev,
      [discountTypeId]: numValue
    }));
  };

  const handleDiscountRateChange = (discountTypeId, value) => {
    const numValue = parseFloat(value) || 0;
    setEditedDiscountRates(prev => ({
      ...prev,
      [discountTypeId]: numValue
    }));
    // Find the discount to get its type
    const discount = discountBreakdown.find(d => d.discountTypeId === discountTypeId);
    if (!discount) return;
    // Calculate the new value based on the rate
    let newValue = 0;
    if (discount.type === 'percentage') {
      newValue = amount * (numValue / 100);
    } else if (discount.type === 'quantity') {
      newValue = quantity * numValue;
    } else if (discount.type === 'flat') {
      newValue = numValue;
    }
    setEditedDiscountValues(prev => ({
      ...prev,
      [discountTypeId]: parseFloat(newValue.toFixed(2))
    }));
  };

  const resetDiscountEdit = (discountTypeId) => {
    setEditableDiscounts(prev => ({
      ...prev,
      [discountTypeId]: false
    }));
    setEditedDiscountValues(prev => {
      const newValues = { ...prev };
      delete newValues[discountTypeId];
      return newValues;
    });
    setEditedDiscountRates(prev => {
      const newRates = { ...prev };
      delete newRates[discountTypeId];
      return newRates;
    });
  };

  const handleTaxEditToggle = (taxTypeId) => {
    setEditableTaxes(prev => ({
      ...prev,
      [taxTypeId]: !prev[taxTypeId]
    }));
  };

  const handleTaxValueChange = (taxTypeId, value) => {
    const numValue = parseFloat(value) || 0;
    setEditedTaxValues(prev => ({
      ...prev,
      [taxTypeId]: numValue
    }));
  };

  const handleTaxRateChange = (taxTypeId, value) => {
    const numValue = parseFloat(value) || 0;
    setEditedTaxRates(prev => {
      const currentRates = prev[taxTypeId] || {};
      const customerType = customerProfile?.customerType || 'un-registered';
      return {
        ...prev,
        [taxTypeId]: {
          ...currentRates,
          [customerType === 'registered' ? 'registeredValue' : 'unregisteredValue']: numValue
        }
      };
    });
    // Find the tax to get its type
    const tax = taxRates.find(t => t.taxTypeId === taxTypeId);
    if (!tax) return;
    // Calculate the new value based on the rate and type
    let newValue = 0;
    if (tax.type === 'quantity') {
      newValue = quantity * numValue;
    } else {
      newValue = netAmountBeforeTax * (numValue / 100);
    }
    setEditedTaxValues(prev => ({
      ...prev,
      [taxTypeId]: parseFloat(newValue.toFixed(2))
    }));
  };

  const resetTaxEdit = (taxTypeId) => {
    setEditableTaxes(prev => ({
      ...prev,
      [taxTypeId]: false
    }));
    setEditedTaxValues(prev => {
      const newValues = { ...prev };
      delete newValues[taxTypeId];
      return newValues;
    });
    setEditedTaxRates(prev => {
      const newRates = { ...prev };
      delete newRates[taxTypeId];
      return newRates;
    });
  };

  const getSelectedGoDownName = () => {
    const selected = goDowns.find(gd => gd._id === selectedGoDown);
    return selected ? `${selected.code} - ${selected.name}` : 'Select GoDown';
  };

  const getSelectedDebtorName = () => {
    const selected = debtorAccounts.find(da => da._id === selectedDebtorAccount);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Debtors Account';
  };

  const getSelectedSubAccountName = () => {
    const selected = subAccounts.find(sa => sa._id === selectedSubAccount);
    return selected ? `${selected.subcode} - ${selected.title}` : 'Select Level 4 Account';
  };

  const getSelectedParentCenterName = () => {
    const selected = parentCenters.find(pc => pc._id === selectedParentCenter);
    return selected ? `${selected.parentCode} - ${selected.title}` : 'Select Revenue Center (Parents)';
  };

  const getSelectedChildCenterName = () => {
    const selected = childCenters.find(cc => cc._id === selectedChildCenter);
    return selected ? `${selected.parentCode}.${selected.childCode} - ${selected.title}` : 'Select Child Center';
  };

  const getSelectedFinishedGoodName = () => {
    const selected = finishedGoods.find(fg => fg._id === selectedFinishedGood);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Finished Good';
  };

  const getSelectedAccountLevel4Name = () => {
    const selected = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    return selected ? `${selected.fullcode} - ${selected.title}` : 'Select Account Level 4';
  };

  const getSelectedUnitMeasurementName = () => {
    const selected = unitMeasurements.find(um => um._id === selectedUnitMeasurement);
    return selected ? `${selected.code} - ${selected.title}` : 'Select Unit';
  };

  const filteredGoDowns = goDowns.filter(gd =>
    (gd.name ?? "").toLowerCase().includes(goDownSearchTerm.toLowerCase()) ||
    (gd.code ?? "").toString().toLowerCase().includes(goDownSearchTerm.toLowerCase())
  );

  const filteredDebtorAccounts = debtorAccounts.filter(da =>
    (da.title ?? "").toLowerCase().includes(debtorSearchTerm.toLowerCase()) ||
    (da.code ?? "").toLowerCase().includes(debtorSearchTerm.toLowerCase())
  );

  const filteredParentCenters = parentCenters.filter(pc =>
    (pc.title ?? "").toLowerCase().includes(parentCenterSearchTerm.toLowerCase()) ||
    (pc.parentCode ?? "").toLowerCase().includes(parentCenterSearchTerm.toLowerCase())
  );

  const filteredChildCenters = childCenters.filter(cc =>
    (cc.title ?? "").toLowerCase().includes(childCenterSearchTerm.toLowerCase()) ||
    (cc.childCode ?? "").toLowerCase().includes(childCenterSearchTerm.toLowerCase()) ||
    (cc.parentCode ?? "").toLowerCase().includes(childCenterSearchTerm.toLowerCase())
  );

  const filteredFinishedGoods = finishedGoods.filter(fg =>
    (fg.title ?? "").toLowerCase().includes(finishedGoodSearchTerm.toLowerCase()) ||
    (fg.code ?? "").toLowerCase().includes(finishedGoodSearchTerm.toLowerCase())
  );

  const filteredAccountLevel4s = accountLevel4s.filter(al4 =>
    (al4.title ?? "").toLowerCase().includes(accountLevel4SearchTerm.toLowerCase()) ||
    (al4.fullcode ?? "").toLowerCase().includes(accountLevel4SearchTerm.toLowerCase())
  );

  const filteredUnitMeasurements = unitMeasurements.filter(um =>
    (um.title ?? "").toLowerCase().includes(unitMeasurementSearchTerm.toLowerCase()) ||
    (um.code ?? "").toLowerCase().includes(unitMeasurementSearchTerm.toLowerCase())
  );


  const createVoucherFromForm = () => {
    // Get the HS Code for the selected account level 4
    const selectedAccountLevel4Obj = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    const hsCode = selectedAccountLevel4Obj?.hsCode || '';
    return {
      goDownId: selectedGoDown,
      invoiceType,
      invoiceNumber,
      invoiceDate,
      fbrInvoiceNumber,
      debtorAccountId: selectedDebtorAccount,
      subAccountId: selectedSubAccount,
      parentCenterId: selectedParentCenter,
      childCenterId: selectedChildCenter,
      finishedGoodId: selectedFinishedGood,
      accountLevel4Id: selectedAccountLevel4,
      unitMeasurementId: selectedUnitMeasurement,
      items: [{
        productId: selectedAccountLevel4 || '',
        productName: selectedAccountLevel4 ? getSelectedAccountLevel4Name() : '',
        quantity,
        rate,
        discount: amount - netAmountBeforeTax,
        amount: netAmountBeforeTax,
        tax: netAmount - netAmountBeforeTax,
        netAmount,
        unitMeasurementId: selectedUnitMeasurement || '',
        unitMeasurementCode: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[0] : '',
        unitMeasurementTitle: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[1] : '',
        discountBreakdown: discountBreakdown.map(d => ({
          title: d.title,
          type: d.type,
          rate: d.rate,
          value: d.value,
          isEdited: editableDiscounts[d.discountTypeId] || false,
          originalValue: d.originalValue,
          discountTypeId: d.discountTypeId
        })),
        taxBreakdown: taxBreakdown.map(t => ({
          title: t.title,
          rate: customerProfile?.customerType === 'registered' ? t.registeredValue : t.unregisteredValue,
          value: t.value,
          isEdited: editableTaxes[t.taxTypeId] || false,
          originalValue: t.originalValue,
          taxTypeId: t.taxTypeId,
          transactionType: t.transactionType || 'sale',
          registeredValue: t.registeredValue,
          unregisteredValue: t.unregisteredValue
        })),
        rateInfo: rateInfo ? {
          applicableDate: rateInfo.applicableDate,
          isActive: rateInfo.isActive,
          isFallbackRate: rateInfo.isFallbackRate || false
        } : null,
        hsCode // Add the HS Code to each item
      }],
      totalAmount: amount,
      discountAmount: amount - netAmountBeforeTax,
      taxAmount: netAmount - netAmountBeforeTax,
      netAmount: netAmount,
      netAmountBeforeTax: netAmountBeforeTax,
      customerProfile
    };
  };

  const resetForm = () => {
    // Don't reset these fields when editing an invoice
    if (!isEditingInvoice) {
      setSelectedFinishedGood(null);
      setSelectedAccountLevel4(null);
    }
    setSelectedUnitMeasurement(null);
    setQuantity(1);
    setRate(0);
    setAmount(0);
    setNetAmountBeforeTax(0);
    setNetAmount(0);
    setDiscountBreakdown([]);
    setTaxBreakdown([]);
    setEditableDiscounts({});
    setEditedDiscountValues({});
    setEditedDiscountRates({});
    setEditableTaxes({});
    setEditedTaxValues({});
    setEditedTaxRates({});
    setRateInfo(null);
    setIsEditingItem(false);
    setEditingItemIndex(null);
  };

  const addVoucher = () => {
    // Validate form data
    if (!selectedGoDown) {
      setMessage({ type: "error", text: 'Please select a GoDown' });
      return;
    }
    if (!selectedDebtorAccount || !selectedSubAccount) {
      setMessage({ type: "error", text: 'Please select both a debtor account and a level 4 account' });
      return;
    }
    if (quantity <= 0) {
      setMessage({ type: "error", text: 'Quantity must be greater than 0' });
      return;
    }
    if (rate <= 0) {
      setMessage({ type: "error", text: 'Rate must be greater than 0' });
      return;
    }
    // Create voucher object and add to list
    const newVoucher = createVoucherFromForm();
    setVouchers([...vouchers, newVoucher]);
    // Show success message
    setMessage({ type: "success", text: "Voucher added to list! You can add more or save all." });
    // Reset form for next voucher
    resetForm();
  };

  const removeVoucher = (index) => {
    const updatedVouchers = [...vouchers];
    updatedVouchers.splice(index, 1);
    setVouchers(updatedVouchers);
  };

  const handleDeleteItem = async (index) => {

      if (isInvoicePosted) {
      setMessage({ type: "error", text: "This invoice is posted and cannot be deleted." });
      return;
    }

    if (!companyId || !items[index]?._id) {
      setMessage({ type: "error", text: "Unable to delete item - missing required information" });
      return;
    }
    try {
      setLoading(true);
      // Make API call to delete the item
      const response = await fetch(
        `http://localhost:5000/api/sales-vouchers/${companyId}/items/${items[index]._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      const result = await response.json();
      if (result.deletedVoucher) {
        // If the entire voucher was deleted, reset the form
        setItems([]);
        resetForm();
        setMessage({ type: "success", text: "Voucher deleted successfully as it had no remaining items" });
      } else {
        // Create a new array without the deleted item
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        // Update the state with the new array
        setItems(updatedItems);
        // Show success message
        setMessage({ type: "success", text: "Item deleted successfully" });
        // If we're deleting the item currently being edited, reset the form
        if (isEditingItem && editingItemIndex === index) {
          resetForm();
          setIsEditingItem(false);
          setEditingItemIndex(null);
        } else if (isEditingItem && editingItemIndex > index) {
          // Adjust the editing index if we deleted an item before it
          setEditingItemIndex(editingItemIndex - 1);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to delete item' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubAccountDetails = async (subAccountId) => {
    if (!companyId || !subAccountId) return { discounts: [], taxes: [] };

    try {
      const response = await fetch(
        `http://localhost:5000/api/sales-vouchers/${companyId}/sub-account-details/${subAccountId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sub-account details');
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching sub-account details:', err);
      return { discounts: [], taxes: [] };
    }
  };

  const handleSubAccountChange = async (newSubAccount) => {
    if (!newSubAccount || !companyId) return;
    try {
      setLoading(true);

      // Fetch the new sub-account details including discounts and taxes
      const response = await fetch(
        `http://localhost:5000/api/sales-vouchers/${companyId}/sub-account-details/${newSubAccount}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sub-account details');
      }

      const subAccountDetails = await response.json();

      // Update ALL items based on the new sub-account's settings
      const updatedItems = items.map(item => {
        // Calculate the base amount for this item
        const itemAmount = item.quantity * item.rate;

        // Apply new discounts if available, otherwise clear existing discounts
        const discountBreakdown = subAccountDetails.discounts && subAccountDetails.discounts.length > 0
          ? subAccountDetails.discounts.map(discount => {
            const value = discount.type === 'percentage'
              ? itemAmount * (discount.rate / 100)
              : discount.type === 'quantity'
                ? item.quantity * discount.rate
                : discount.rate;

            return {
              ...discount,
              title: discount.title,
              value,
              isEditable: discount.isEditable || false,
              originalValue: value,
              originalRate: discount.rate,
              discountTypeId: discount._id || discount.discountTypeId,
              type: discount.type
            };
          })
          : []; // Clear all discounts if new sub-account has none

        // Apply new taxes if available, otherwise keep existing taxes
        const taxBreakdown = subAccountDetails.taxes && subAccountDetails.taxes.length > 0
          ? subAccountDetails.taxes.map(tax => {
            const customerType = customerProfile?.customerType || 'un-registered';
            const taxRate = customerType === 'registered' ? tax.registeredValue : tax.unregisteredValue;
            const value = tax.type === 'quantity'
              ? item.quantity * taxRate
              : itemAmount * (taxRate / 100);

            return {
              ...tax,
              title: tax.title,
              value,
              isEditable: tax.isEditable || false,
              originalValue: value,
              originalRate: taxRate,
              taxTypeId: tax._id || tax.taxTypeId,
              transactionType: tax.transactionType || 'sale',
              registeredValue: tax.registeredValue,
              unregisteredValue: tax.unregisteredValue,
              type: tax.type || 'percentage'
            };
          })
          : item.taxBreakdown || []; // Keep existing taxes if new sub-account has none

        // Calculate totals
        const totalDiscount = discountBreakdown.reduce((sum, d) => sum + d.value, 0);
        const netAmountBeforeTax = itemAmount - totalDiscount;
        const totalTax = taxBreakdown.reduce((sum, t) => sum + t.value, 0);
        const netAmount = netAmountBeforeTax + totalTax;

        return {
          ...item,
          amount: itemAmount,
          discountBreakdown,
          taxBreakdown,
          discount: totalDiscount,
          tax: totalTax,
          netAmountBeforeTax,
          netAmount
        };
      });

      setItems(updatedItems);

      // If editing an item, update the form fields
      if (isEditingItem) {
        const currentItem = updatedItems[editingItemIndex];
        setDiscountBreakdown(currentItem.discountBreakdown);
        setTaxBreakdown(currentItem.taxBreakdown);
        setNetAmountBeforeTax(currentItem.netAmountBeforeTax);
        setNetAmount(currentItem.netAmount);
      }

      setMessage(null);
    } catch (err) {
      console.error('Error updating items:', err);
      setMessage({ type: "error", text: err.message || 'Failed to update items' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (index) => {
    const itemToEdit = items[index];

      if (isInvoicePosted) {
      setMessage({ type: "error", text: "This invoice is posted and cannot be edited." });
      return;
    }

    // Get the finished good ID from multiple possible sources
    let finishedGoodId = itemToEdit.finishedGoodId;

    // If not available in the item, try to get it from the product code
    if (!finishedGoodId && itemToEdit.productCode) {
      // Extract the finished good code from the product code
      // For example, if productCode is "040100300001", the finished good code might be "0401003"
      const productCodeParts = itemToEdit.productCode.split('');
      if (productCodeParts.length >= 7) {
        const possibleFinishedGoodCode = productCodeParts.slice(0, 7).join('');
        const matchingFinishedGood = finishedGoods.find(fg => fg.code === possibleFinishedGoodCode);
        if (matchingFinishedGood) {
          finishedGoodId = matchingFinishedGood._id;
        }
      }
    }

    // If still not available, get it from the existing invoice data
    if (!finishedGoodId && existingInvoiceData) {
      finishedGoodId = existingInvoiceData.finishedGoodId?._id || existingInvoiceData.finishedGoodId;
    }

    // Check if the finished good exists in the finishedGoods array
    const finishedGoodExists = finishedGoods.some(fg => fg._id === finishedGoodId);

    // If it doesn't exist, add it to the finishedGoods array
    if (!finishedGoodExists && finishedGoodId) {
      try {
        // Fetch the finished good details from the server
        const response = await fetch(`http://localhost:5000/api/item-profile/finished-good/${finishedGoodId}`);
        if (response.ok) {
          const finishedGoodData = await response.json();
          setFinishedGoods(prev => [...prev, finishedGoodData]);
        }
      } catch (err) {
        console.error('Error fetching finished good:', err);
        // If fetch fails, create a minimal entry with available data
        setFinishedGoods(prev => [...prev, {
          _id: finishedGoodId,
          code: existingInvoiceData?.finishedGoodCode || itemToEdit.productCode?.substring(0, 7) || 'N/A',
          title: existingInvoiceData?.finishedGoodTitle || itemToEdit.productName || 'Unknown Product'
        }]);
      }
    }

    // Get the account level 4 ID from the item
    const accountLevel4Id = itemToEdit.productId || itemToEdit.accountLevel4Id;

    // Fetch account level 4 data for this finished good if needed
    if (finishedGoodId && accountLevel4s.length === 0) {
      try {
        // Get the finished good code
        const finishedGood = finishedGoods.find(fg => fg._id === finishedGoodId);
        if (finishedGood && finishedGood.code) {
          const al4Response = await fetch(
            `http://localhost:5000/api/item-profile/${companyId}/account-level4?finishedGoodCode=${finishedGood.code}`
          );
          if (al4Response.ok) {
            const al4Data = await al4Response.json();
            setAccountLevel4s(al4Data.accounts);
          }
        }
      } catch (err) {
        console.error('Error fetching account level 4 data:', err);
      }
    }

    // Ensure unit measurements are loaded
    if (unitMeasurements.length === 0) {
      try {
        const unitResponse = await fetch(`http://localhost:5000/api/unit-measurement/${companyId}`);
        if (unitResponse.ok) {
          const unitData = await unitResponse.json();
          setUnitMeasurements(unitData);
        }
      } catch (err) {
        console.error('Error fetching unit measurements:', err);
      }
    }

    // Wait a moment for state updates to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate all values first
    const quantityValue = itemToEdit.quantity || 1;
    const rateValue = itemToEdit.rate || 0;
    const amountValue = quantityValue * rateValue;
    const netAmountBeforeTaxValue = itemToEdit.netAmountBeforeTax || amountValue;
    const netAmountValue = itemToEdit.netAmount || amountValue;

    // Create rate info object
    const rateInfoValue = itemToEdit.rateInfo || {
      rate: rateValue,
      applicableDate: invoiceDate,
      isActive: true,
      isFallbackRate: false
    };

    // Set all form fields in a single batch
    setSelectedFinishedGood(finishedGoodId || null);
    setSelectedAccountLevel4(accountLevel4Id || null);
    setSelectedUnitMeasurement(itemToEdit.unitMeasurementId || null);
    setQuantity(quantityValue);
    setRate(rateValue);
    setAmount(amountValue);
    setNetAmountBeforeTax(netAmountBeforeTaxValue);
    setNetAmount(netAmountValue);
    setRateInfo(rateInfoValue);
    setDiscountBreakdown(itemToEdit.discountBreakdown || []);
    setTaxBreakdown(itemToEdit.taxBreakdown || []);

    // Set edit mode
    setIsEditingItem(true);
    setEditingItemIndex(index);

    // Mark the item as being edited
    const updatedItems = [...items];
    updatedItems[index] = {
      ...itemToEdit,
      isBeingEdited: true,
      finishedGoodId: finishedGoodId // Add the finished good ID to the item
    };
    setItems(updatedItems);

    // Force a re-render to ensure all values are displayed
    setTimeout(() => {
      // This will trigger a re-render after all state updates have been processed
      setQuantity(prev => prev);
      setRate(prev => prev);
    }, 50);

    setMessage({ type: "success", text: "Item loaded for editing. Make changes and click 'Update Item'." });
  };

  const handleUpdateItem = () => {
    if (editingItemIndex === null || editingItemIndex === undefined) return;
    // Validate form data
    if (!selectedGoDown) {
      setMessage({ type: "error", text: 'Please select a GoDown' });
      return;
    }
    if (!selectedDebtorAccount || !selectedSubAccount) {
      setMessage({ type: "error", text: 'Please select both a debtor account and a level 4 account' });
      return;
    }
    if (quantity <= 0) {
      setMessage({ type: "error", text: 'Quantity must be greater than 0' });
      return;
    }
    if (rate <= 0) {
      setMessage({ type: "error", text: 'Rate must be greater than 0' });
      return;
    }

    // Create the updated item
    const updatedItem = {
      ...items[editingItemIndex], // Preserve existing properties like _id
      finishedGoodId: selectedFinishedGood,
      accountLevel4Id: selectedAccountLevel4,
      unitMeasurementId: selectedUnitMeasurement,
      quantity: quantity,
      rate: rate,
      amount: amount,
      netAmountBeforeTax: netAmountBeforeTax,
      netAmount: netAmount,
      discountBreakdown: discountBreakdown.map(d => ({
        ...d,
        isEdited: editableDiscounts[d.discountTypeId] || false
      })),
      taxBreakdown: taxBreakdown.map(t => ({
        ...t,
        isEdited: editableTaxes[t.taxTypeId] || false
      })),
      rateInfo: rateInfo,
      productName: getSelectedAccountLevel4Name(),
      unitMeasurementCode: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[0] : '',
      unitMeasurementTitle: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[1] : '',
      isEdited: true, // Mark the item as edited
      isBeingEdited: false // No longer being edited
    };

    // Update the items array - only update the specific item that was edited
    const updatedItems = [...items];
    updatedItems[editingItemIndex] = updatedItem;
    setItems(updatedItems);

    // If we're editing an existing invoice, update the existingInvoiceData as well
    if (existingInvoiceData) {
      // Create a copy of the existing items array
      const updatedExistingItems = [...existingInvoiceData.items];

      // Update only the specific item that was edited
      updatedExistingItems[editingItemIndex] = {
        ...existingInvoiceData.items[editingItemIndex],
        // Update only the fields that were changed
        productId: selectedAccountLevel4,
        productName: getSelectedAccountLevel4Name(),
        quantity: quantity,
        rate: rate,
        amount: amount,
        discount: amount - netAmountBeforeTax,
        tax: netAmount - netAmountBeforeTax,
        netAmount: netAmount,
        unitMeasurementId: selectedUnitMeasurement,
        unitMeasurementCode: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[0] : '',
        unitMeasurementTitle: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[1] : '',
        discountBreakdown: discountBreakdown.map(d => ({
          title: d.title,
          type: d.type,
          rate: d.rate,
          value: d.value,
          isEdited: editableDiscounts[d.discountTypeId] || false,
          originalValue: d.originalValue,
          discountTypeId: d.discountTypeId
        })),
        taxBreakdown: taxBreakdown.map(t => ({
          title: t.title,
          rate: customerProfile?.customerType === 'registered' ? t.registeredValue : t.unregisteredValue,
          value: t.value,
          isEdited: editableTaxes[t.taxTypeId] || false,
          originalValue: t.originalValue,
          taxTypeId: t.taxTypeId,
          transactionType: t.transactionType || 'sale',
          registeredValue: t.registeredValue,
          unregisteredValue: t.unregisteredValue
        })),
        rateInfo: rateInfo ? {
          applicableDate: rateInfo.applicableDate,
          isActive: rateInfo.isActive,
          isFallbackRate: rateInfo.isFallbackRate || false
        } : null,
        finishedGoodId: selectedFinishedGood,
        accountLevel4Id: selectedAccountLevel4,
        hsCode: existingInvoiceData.items[editingItemIndex].hsCode // Preserve the original HS Code
      };

      // Update the existingInvoiceData with the updated items
      setExistingInvoiceData(prev => ({
        ...prev,
        items: updatedExistingItems,
        // Update other fields that might have changed
        goDownId: selectedGoDown,
        debtorAccountId: selectedDebtorAccount,
        subAccountId: selectedSubAccount,
        parentCenterId: selectedParentCenter,
        childCenterId: selectedChildCenter,
        fbrInvoiceNumber: fbrInvoiceNumber
        // Note: We don't recalculate totals here as they should be calculated when submitting
      }));
    }

    setIsEditingItem(false);
    setEditingItemIndex(null);
    resetForm();
    setMessage({ type: "success", text: "Item updated successfully!" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

      // Check if invoice is already posted
    if (isInvoicePosted) {
      setMessage({ type: "error", text: "This invoice is already posted and cannot be modified." });
      return;
    }

    // Check if user is currently editing an item
    if (isEditingItem) {
      setMessage({ type: "error", text: "Please finish editing the current item before updating the invoice." });
      return;
    }

    // If updating an existing invoice, check if any item has been edited
    if (isEditingInvoice) {
      const hasEditedItems = items.some(item =>
        item.isEdited ||
        item.isBeingEdited ||
        item.discountBreakdown?.some(d => d.isEdited) ||
        item.taxBreakdown?.some(t => t.isEdited)
      );

      if (!hasEditedItems) {
        setMessage({ type: "error", text: "Please edit at least one item before updating the invoice." });
        return;
      }
    }

    // If there are no items in the list and the form has data, add current form data as an item
    if (items.length === 0 && selectedGoDown && selectedDebtorAccount && selectedSubAccount) {
      const currentItem = createItemFromForm();
      setItems([currentItem]);
    }

    // Check if there are items to save
    if (items.length === 0) {
      setMessage({ type: "error", text: "Please add at least one item to the invoice" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Calculate totals based on all items
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      const totalDiscount = items.reduce((sum, item) => sum + (item.amount - item.netAmountBeforeTax), 0);
      const totalTax = items.reduce((sum, item) => sum + (item.netAmount - item.netAmountBeforeTax), 0);
      const totalNetAmount = items.reduce((sum, item) => sum + item.netAmount, 0);

      // Get HS Code from the selected account level 4
      const selectedAccountLevel4Obj = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
      const hsCode = selectedAccountLevel4Obj?.hsCode || '';

      // Prepare items data - only include edited items when updating
      const itemsData = isEditingInvoice
        ? items.filter(item =>
          item.isEdited ||
          item.isBeingEdited ||
          item.discountBreakdown?.some(d => d.isEdited) ||
          item.taxBreakdown?.some(t => t.isEdited)
        ).map(item => ({
          ...item,
          productId: item.accountLevel4Id,
          productName: item.productName,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          discount: item.amount - item.netAmountBeforeTax,
          tax: item.netAmount - item.netAmountBeforeTax,
          netAmount: item.netAmount,
          unitMeasurementId: item.unitMeasurementId,
          unitMeasurementCode: item.unitMeasurementCode,
          unitMeasurementTitle: item.unitMeasurementTitle,
          discountBreakdown: item.discountBreakdown,
          taxBreakdown: item.taxBreakdown,
          rateInfo: item.rateInfo,
          finishedGoodId: item.finishedGoodId || selectedFinishedGood,
          accountLevel4Id: item.accountLevel4Id || selectedAccountLevel4,
          hsCode: item.hsCode || hsCode
        }))
        : items.map(item => ({
          ...item,
          productId: item.accountLevel4Id,
          productName: item.productName,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          discount: item.amount - item.netAmountBeforeTax,
          tax: item.netAmount - item.netAmountBeforeTax,
          netAmount: item.netAmount,
          unitMeasurementId: item.unitMeasurementId,
          unitMeasurementCode: item.unitMeasurementCode,
          unitMeasurementTitle: item.unitMeasurementTitle,
          discountBreakdown: item.discountBreakdown,
          taxBreakdown: item.taxBreakdown,
          rateInfo: item.rateInfo,
          finishedGoodId: item.finishedGoodId || selectedFinishedGood,
          accountLevel4Id: item.accountLevel4Id || selectedAccountLevel4,
          hsCode: item.hsCode || hsCode
        }));

      const voucherData = {
        goDownId: selectedGoDown,
        invoiceType,
        // Always use the existing invoice number when updating
        invoiceNumber: existingInvoiceData ? existingInvoiceData.invoiceNumber : invoiceNumber,
        invoiceDate,
        fbrInvoiceNumber,
        customerAddress: address,
        poNumber,
        poDate,
        ogpNumber,
        ogpDate,
        dcNumber,
        dcDate,
        vehicleNumber,
        remarks,
        debtorAccountId: selectedDebtorAccount,
        subAccountId: selectedSubAccount,
        parentCenterId: selectedParentCenter,
        childCenterId: selectedChildCenter,
        finishedGoodId: selectedFinishedGood,
        accountLevel4Id: selectedAccountLevel4,
        items: itemsData,
        totalAmount: totalAmount,
        discountAmount: totalDiscount,
        taxAmount: totalTax,
        netAmount: totalNetAmount,
        netAmountBeforeTax: totalAmount - totalDiscount,
        customerProfile
      };

      // Determine if we're updating an existing invoice or creating a new one
      const method = existingInvoiceData ? 'PUT' : 'POST';
      // Extract the ID correctly from the nested structure
      const invoiceId = existingInvoiceData && existingInvoiceData._id ?
        (existingInvoiceData._id.$oid || existingInvoiceData._id) : null;
      const url = invoiceId
        ? `http://localhost:5000/api/sales-vouchers/${companyId}/${invoiceId}`
        : `http://localhost:5000/api/sales-vouchers/${companyId}`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save sales voucher');
      }

      const responseData = await response.json();
      setMessage({ type: "success", text: existingInvoiceData ? "Invoice updated successfully!" : "Invoice created successfully!" });

      // Reset form and items only if it's a new invoice
      if (!existingInvoiceData) {
        setItems([]);
        resetForm();
        setSelectedGoDown('');
        setInvoiceType('');
        setSelectedDebtorAccount('');
        setSelectedSubAccount('');
        setSelectedParentCenter('');
        setSelectedChildCenter('');
        setCustomerProfile(null);
        setInvoiceNumber('');
      }

      // Always reset editing states
      setIsEditingInvoice(false);
      setIsEditingItem(false);
      setEditingItemIndex(null);

      // Clear existing invoice data after successful update
      setExistingInvoiceData(null);
    } catch (err) {
      setMessage({ type: "error", text: err.message || 'Failed to save invoice' });
    } finally {
      setLoading(false);
    }
  };
  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      if (!companyId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/cities/${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();
        setCities(data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, [companyId]);

  const getCityTitle = (city) => {
    if (!city) return 'N/A';

    // If city is a string (ID), find the city object
    if (typeof city === 'string') {
      const cityObj = cities.find(c => c.code === city);
      return cityObj ? cityObj.title : city;
    }

    // If city is an object, return its title property
    if (city && city.title) {
      return city.title;
    }

    // Fallback if neither condition is met
    return 'N/A';
  };

  const createItemFromForm = () => {
    // Get the HS Code for the selected account level 4
    const selectedAccountLevel4Obj = accountLevel4s.find(al4 => al4._id === selectedAccountLevel4);
    const hsCode = selectedAccountLevel4Obj?.hsCode || '';
    return {
      finishedGoodId: selectedFinishedGood,
      accountLevel4Id: selectedAccountLevel4,
      unitMeasurementId: selectedUnitMeasurement,
      quantity: quantity,
      rate: rate,
      amount: amount,
      netAmountBeforeTax: netAmountBeforeTax,
      netAmount: netAmount,
      discountBreakdown: discountBreakdown.map(d => ({
        title: d.title,
        type: d.type,
        rate: d.rate,
        value: d.value,
        isEdited: editableDiscounts[d.discountTypeId] || false,
        originalValue: d.originalValue,
        discountTypeId: d.discountTypeId
      })),
      taxBreakdown: taxBreakdown.map(t => ({
        title: t.title,
        rate: customerProfile?.customerType === 'registered' ? t.registeredValue : t.unregisteredValue,
        value: t.value,
        isEdited: editableTaxes[t.taxTypeId] || false,
        originalValue: t.originalValue,
        taxTypeId: t.taxTypeId,
        transactionType: t.transactionType || 'sale',
        registeredValue: t.registeredValue,
        unregisteredValue: t.unregisteredValue
      })),
      rateInfo: rateInfo ? {
        applicableDate: rateInfo.applicableDate,
        isActive: rateInfo.isActive,
        isFallbackRate: rateInfo.isFallbackRate || false
      } : null,
      productName: getSelectedAccountLevel4Name(),
      unitMeasurementCode: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[0] : '',
      unitMeasurementTitle: selectedUnitMeasurement ? getSelectedUnitMeasurementName().split(' - ')[1] : '',
      hsCode // Include the HS Code
    };
  };


const handlePrintReport = () => {
  const title =
    reportType === "detailed"
      ? "Sales Checklist Report"
      : "Sales Summary Report";
  // Decide orientation: landscape if too many columns, otherwise portrait
  let isLandscape = false;
  if (reportType === "detailed") {
    const columnCount = 22; // total number of columns in detailed table
    if (columnCount > 8) {
      isLandscape = true;
    }
  }
  let content = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: ${isLandscape ? "landscape" : "portrait"}; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
          th { background: #f4f4f4; text-align: left; }
          tr:nth-child(even) { background: #fafafa; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .summary-card {
            border: 1px solid #ccc;
            padding: 12px;
            border-radius: 6px;
            background: #f9f9f9;
            text-align: center;
          }
          .summary-card h4 { margin: 0 0 6px; font-size: 14px; }
          .summary-card p { margin: 0; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
  `;
  if (reportType === "detailed") {
    content += `
      <table>
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>FBR Invoice No</th>
            <th>Date</th>
            <th>Debtor Code</th>
            <th>Debtor Title</th>
            <th>Sub Account Code</th>
            <th>Sub Account Title</th>
            <th>Remarks</th>
            <th>Vehicle No</th>
            <th>Finished Good Code</th>
            <th>Finished Good Title</th>
            <th>Account Level 4 Code</th>
            <th>Account Level 4 Title</th>
            <th>UOM</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Parent Code</th>
            <th>Child Code</th>
            <th>Parent Title</th>
            <th>Child Title</th>
          </tr>
        </thead>
        <tbody>
          ${reportData
            .map(
              (item) => `
            <tr>
              <td>${item.invNo || ""}</td>
              <td>${item.fbrInvoiceNumber || ""}</td>
              <td>${
                item.invDate
                  ? new Date(item.invDate).toLocaleDateString()
                  : ""
              }</td>
              <td>${item.debtorCode || ""}</td>
              <td>${item.debtorTitle || ""}</td>
              <td>${item.subAccountCode || ""}</td>
              <td>${item.subAccountTitle || ""}</td>
              <td>${item.remarks || ""}</td>
              <td>${item.vhn || ""}</td>
              <td>${item.finishedGoodCode || ""}</td>
              <td>${item.finishedGoodTitle || ""}</td>
              <td>${item.accountLevel4Code || ""}</td>
              <td>${item.accountLevel4Title || ""}</td>
              <td>${item.unitOfMeasurement || ""}</td>
              <td>${item.qty ? parseFloat(item.qty).toFixed(3) : ""}</td>
              <td>${item.rate ? parseFloat(item.rate).toFixed(3) : ""}</td>
              <td>${item.amount || ""}</td>
              <td>${item.parentCode || ""}</td>
              <td>${item.childCode || ""}</td>
              <td>${item.parentTitle || ""}</td>
              <td>${item.childTitle || ""}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } else if (reportType === "summary" && summaryData) {
    content += `
      <div class="summary-grid">
        <div class="summary-card">
          <h4>Total Quantity</h4>
          <p>${summaryData.totalQuantity || 0}</p>
        </div>
        <div class="summary-card">
          <h4>Total Amount</h4>
          <p>${(summaryData.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card">
          <h4>Total Invoices</h4>
          <p>${summaryData.totalInvoices || 0}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Debtor</th>
            <th>Finished Good</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${
            summaryData.byDebtorAndGood?.length > 0
              ? summaryData.byDebtorAndGood
                  .map(
                    (item) => `
              <tr>
                <td>${item.debtorAccountTitle || "N/A"}</td>
                <td>${item.finishedGoodTitle || "N/A"}</td>
                <td>${item.totalQuantity || 0}</td>
                <td>${(item.totalAmount || 0).toFixed(2)}</td>
                <td>${item.count || 0}</td>
              </tr>
            `
                  )
                  .join("")
              : `<tr><td colspan="5" style="text-align:center;">No data found</td></tr>`
          }
        </tbody>
      </table>
    `;
  }
  content += `</body></html>`;
  const printWindow = window.open("", "_blank");
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};


  const handlePrintInvoice = (options = {}) => {
    // Get debtor account name
    const debtorAccountObj = debtorAccounts.find(da => da._id === selectedDebtorAccount);
    const debtorAccountName = debtorAccountObj ? debtorAccountObj.title : '';

    // Get customer name from sub account
    const subAccountObj = subAccounts.find(sa => sa._id === selectedSubAccount);
    const customerName = subAccountObj ? subAccountObj.title : '';

    // Calculate totals
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Collect all unique tax titles
    const allTaxTitles = new Set();
    items.forEach(item => {
      if (item.taxBreakdown) {
        item.taxBreakdown.forEach(tax => {
          allTaxTitles.add(tax.title);
        });
      }
    });
    const taxTitles = Array.from(allTaxTitles);

    // Calculate total for each tax type
    const taxTotals = {};
    taxTitles.forEach(title => {
      taxTotals[title] = items.reduce((sum, item) => {
        const tax = item.taxBreakdown?.find(t => t.title === title);
        return sum + (tax ? tax.value : 0);
      }, 0);
    });

    const totalTaxes = Object.values(taxTotals).reduce((sum, value) => sum + value, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.netAmount, 0);

    // Function to convert number to words
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

      const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        let result = '';

        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n = n % 100;
        }

        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
          n = n % 10;
        } else if (n >= 10) {
          result += teens[n - 10] + ' ';
          n = 0;
        }

        if (n > 0) {
          result += ones[n] + ' ';
        }

        return result.trim();
      };

      if (num === 0) return 'Zero';

      let integerPart = Math.floor(num);
      const decimalPart = Math.round((num - integerPart) * 100);

      let result = '';

      if (integerPart >= 1000000) {
        result += convertLessThanThousand(Math.floor(integerPart / 1000000)) + ' Million ';
        integerPart = integerPart % 1000000;
      }

      if (integerPart >= 1000) {
        result += convertLessThanThousand(Math.floor(integerPart / 1000)) + ' Thousand ';
        integerPart = integerPart % 1000;
      }

      if (integerPart > 0) {
        result += convertLessThanThousand(integerPart) + ' ';
      }

      result += 'Dollars';

      if (decimalPart > 0) {
        result += ' and ' + convertLessThanThousand(decimalPart) + ' Cents';
      }

      return result.trim();
    };

    // Generate additional fields HTML based on options
    let additionalFieldsHtml = '';
    if (options.poNumber && poNumber) {
      additionalFieldsHtml += `<p><strong>PO Number:</strong> ${poNumber}</p>`;
    }
    if (options.poDate && poDate) {
      additionalFieldsHtml += `<p><strong>PO Date:</strong> ${new Date(poDate).toLocaleDateString()}</p>`;
    }
    if (options.ogpNumber && ogpNumber) {
      additionalFieldsHtml += `<p><strong>OGP Number:</strong> ${ogpNumber}</p>`;
    }
    if (options.ogpDate && ogpDate) {
      additionalFieldsHtml += `<p><strong>OGP Date:</strong> ${new Date(ogpDate).toLocaleDateString()}</p>`;
    }
    if (options.dcNumber && dcNumber) {
      additionalFieldsHtml += `<p><strong>DC Number:</strong> ${dcNumber}</p>`;
    }
    if (options.dcDate && dcDate) {
      additionalFieldsHtml += `<p><strong>DC Date:</strong> ${new Date(dcDate).toLocaleDateString()}</p>`;
    }
    if (options.vehicleNumber && vehicleNumber) {
      additionalFieldsHtml += `<p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>`;
    }

    // Create additional section HTML if any field is selected
    let additionalSectionHtml = '';
    if (additionalFieldsHtml) {
      additionalSectionHtml = `
      <div>
        <h3>Additional Information</h3>
        ${additionalFieldsHtml}
      </div>
    `;
    }

    // Create print content
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Montserrat', sans-serif;
          color: #333;
          line-height: 1.4;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          padding: 10px;
        }
        
        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .invoice-header {
          background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
          color: white;
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .invoice-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.05);
          transform: rotate(30deg);
        }
        
        .invoice-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
          position: relative;
          z-index: 1;
        }
        
        .invoice-header p {
          font-size: 14px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .invoice-body {
          padding: 15px;
        }
        
        .company-info {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .company-info h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1a2980;
          margin-bottom: 5px;
        }
        
        .company-info p {
          font-size: 12px;
          color: #666;
          margin: 3px 0;
        }
        
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .invoice-details div {
          flex: 1;
          min-width: 200px;
          margin-bottom: 10px;
        }
        
        .invoice-details h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1a2980;
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 2px solid #26d0ce;
        }
        
        .invoice-details p {
          font-size: 12px;
          margin: 5px 0;
          display: flex;
        }
        
        .invoice-details p strong {
          min-width: 100px;
          color: #555;
        }
        
        .invoice-table {
          margin-bottom: 15px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        th {
          background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 8px 10px;
          position: sticky;
          top: 0;
          font-size: 12px;
        }
        
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          font-size: 11px;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        tr:hover {
          background-color: #f1f9ff;
        }
        
        .tax-column {
          min-width: 80px;
        }
        
        .tax-breakdown {
          margin-top: 5px;
        }
        
        .tax-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 10px;
        }
        
        .tax-item .tax-title {
          font-weight: 500;
        }
        
        .tax-item .tax-value {
          font-weight: 600;
        }
        
        .totals-section {
          background: linear-gradient(to right, #f9f9f9, #f1f1f1);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }
        
        .totals-row p {
          font-size: 12px;
        }
        
        .totals-row .amount {
          font-weight: 600;
        }
        
        .grand-total {
          font-size: 14px;
          font-weight: 700;
          color: #1a2980;
          border-top: 1px dashed #ccc;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .amount-in-words {
          background: #f0f7ff;
          padding: 10px;
          border-radius: 6px;
          border-left: 3px solid #26d0ce;
          margin-bottom: 15px;
        }
        
        .amount-in-words p {
          font-size: 11px;
          color: #555;
        }
        
        .amount-in-words strong {
          color: #1a2980;
        }
        
        .terms-conditions {
          margin-bottom: 15px;
        }
        
        .terms-conditions h3 {
          font-size: 12px;
          font-weight: 600;
          color: #1a2980;
          margin-bottom: 5px;
        }
        
        .terms-conditions ul {
          padding-left: 15px;
        }
        
        .terms-conditions li {
          font-size: 10px;
          margin-bottom: 3px;
          color: #666;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .signature-box {
          text-align: center;
          width: 45%;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          margin: 20px 0 5px;
        }
        
        .signature-box p {
          font-size: 11px;
          color: #666;
        }
        
        .footer {
          text-align: center;
          padding: 10px;
          background: #f9f9f9;
          font-size: 10px;
          color: #888;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(0, 0, 0, 0.03);
          font-weight: 700;
          z-index: 0;
          pointer-events: none;
          white-space: nowrap;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
            font-size: 10px;
          }
          
          .invoice-container {
            box-shadow: none;
            margin: 0;
            max-width: 100%;
          }
          
          .invoice-body {
            padding: 10px;
          }
          
          .table-container {
            overflow-x: visible;
          }
          
          table {
            page-break-inside: auto;
            font-size: 9px;
          }
          
          th {
            font-size: 9px;
            padding: 5px 6px;
          }
          
          td {
            font-size: 8px;
            padding: 5px 6px;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          .tax-breakdown {
            display: flex;
            flex-wrap: wrap;
          }
          
          .tax-item {
            flex: 1 0 50%;
            margin-bottom: 2px;
            font-size: 8px;
          }
          
          .invoice-details {
            flex-direction: column;
          }
          
          .invoice-details div {
            margin-bottom: 8px;
          }
          
          .invoice-details h3 {
            font-size: 11px;
          }
          
          .invoice-details p {
            font-size: 9px;
          }
          
          .signature-section {
            flex-direction: column;
            align-items: center;
          }
          
          .signature-box {
            width: 80%;
            margin-bottom: 15px;
          }
          
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 8px;
          }
          
          .company-info h2 {
            font-size: 14px;
          }
          
          .company-info p {
            font-size: 9px;
          }
          
          .totals-row p {
            font-size: 10px;
          }
          
          .grand-total {
            font-size: 11px;
          }
          
          .amount-in-words p {
            font-size: 9px;
          }
          
          .terms-conditions h3 {
            font-size: 10px;
          }
          
          .terms-conditions li {
            font-size: 8px;
          }
          
          .signature-box p {
            font-size: 9px;
          }
        }
        
        @media screen and (max-width: 768px) {
          .invoice-header h1 {
            font-size: 24px;
          }
          
          .invoice-body {
            padding: 15px;
          }
          
          .invoice-details {
            flex-direction: column;
          }
          
          .invoice-details div {
            margin-bottom: 10px;
          }
          
          .tax-breakdown {
            display: flex;
            flex-wrap: wrap;
          }
          
          .tax-item {
            flex: 1 0 50%;
            margin-bottom: 3px;
          }
          
          .signature-section {
            flex-direction: column;
            align-items: center;
          }
          
          .signature-box {
            width: 80%;
            margin-bottom: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="watermark">${companyDetails?.companyName || debtorAccountName}</div>
        
        <div class="invoice-header">
          <h1>SALES INVOICE</h1>
          <p>Original for Recipient</p>
        </div>
        
        <div class="invoice-body">
          <div class="company-info">
            <h2>${companyDetails?.companyName || ''}</h2>
            <p>Address: ${companyDetails?.address1 || ''}</p>
            <p>Phone: ${companyDetails?.phone1 || ''}</p>
            <p>NTRN: ${companyDetails?.nationalTaxNumber || ''}</p>
            <p>STRN: ${companyDetails?.strn || ''}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoiceDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(new Date(invoiceDate).setDate(new Date(invoiceDate).getDate() + 30)).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Address:</strong> ${address || 'N/A'}</p>
              <p><strong>Customer ID:</strong> ${selectedSubAccount || 'N/A'}</p>
            </div>
            
            ${additionalSectionHtml}
          </div>
          
          <div class="invoice-table">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Tax Breakdown</th>
                    <th>Total Taxes</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item, index) => {
      const itemTaxes = {};
      let totalItemTax = 0;

      // Initialize all tax values to 0
      taxTitles.forEach(title => {
        itemTaxes[title] = 0;
      });

      // Fill in actual tax values
      if (item.taxBreakdown) {
        item.taxBreakdown.forEach(tax => {
          if (taxTitles.includes(tax.title)) {
            itemTaxes[tax.title] = tax.value;
            totalItemTax += tax.value;
          }
        });
      }

      // Create tax breakdown HTML
      const taxBreakdownHtml = taxTitles.map(title =>
        `<div class="tax-item">
                        <span class="tax-title">${title}:</span>
                        <span class="tax-value">$${itemTaxes[title].toFixed(2)}</span>
                      </div>`
      ).join('');

      return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.rate.toFixed(2)}</td>
                        <td>
                          <div class="tax-breakdown">
                            ${taxBreakdownHtml}
                          </div>
                        </td>
                        <td>$${totalItemTax.toFixed(2)}</td>
                        <td>$${item.netAmount.toFixed(2)}</td>
                      </tr>
                    `;
    }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>$${totalAmount.toFixed(2)}</strong></td>
                    <td>
                      <div class="tax-breakdown">
                        ${taxTitles.map(title =>
      `<div class="tax-item">
                            <span class="tax-title">${title}:</span>
                            <span class="tax-value"><strong>$${taxTotals[title].toFixed(2)}</strong></span>
                          </div>`
    ).join('')}
                      </div>
                    </td>
                    <td><strong>$${totalTaxes.toFixed(2)}</strong></td>
                    <td><strong>$${grandTotal.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div class="totals-section">
            <div class="totals-row">
              <p>Total Quantity:</p>
              <p class="amount">${totalQuantity}</p>
            </div>
            <div class="totals-row">
              <p>Total Rate:</p>
              <p class="amount">$${totalAmount.toFixed(2)}</p>
            </div>
            <div class="totals-row">
              <p>Total Taxes:</p>
              <p class="amount">$${totalTaxes.toFixed(2)}</p>
            </div>
            <div class="totals-row grand-total">
              <p>Grand Total:</p>
              <p class="amount">$${grandTotal.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="amount-in-words">
            <p><strong>Amount in Words:</strong> ${numberToWords(grandTotal)}</p>
          </div>
          
          <div class="terms-conditions">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>Payment is due within 30 days of invoice date</li>
              <li>Late payments are subject to a 5% monthly fee</li>
              <li>All goods remain the property of ${companyDetails?.companyName || debtorAccountName} until paid in full</li>
              <li>This is a computer-generated invoice and requires no signature</li>
            </ul>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Authorized Signature</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Customer Signature</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business! | Page 1 of 1 | ${companyDetails?.companyName || debtorAccountName} © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Print automatically
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-0.5"
    >
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-0.5"
        >
          <h1 className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-0 flex items-center justify-center gap-0.5">
            <FileText className="w-2 h-2" />
            Sales Voucher
          </h1>
          <p className="text-[8px] text-purple-500 dark:text-purple-400">
            Create and manage sales invoices
          </p>
        </motion.div>

{isInvoicePosted && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700"
  >
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span className="text-sm font-medium text-green-800 dark:text-green-200">
        This invoice is posted and locked. No further modifications can be made.
      </span>
    </div>
  </motion.div>
)}

        {/* Compact Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-1 p-0.5 rounded-sm text-white font-medium shadow-md flex items-center gap-0.5 text-[9px] ${message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                message.type === "warning" ? "bg-gradient-to-r from-yellow-500 to-amber-600" : "bg-gradient-to-r from-red-500 to-rose-600"
                }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-2 h-2" />
              ) : message.type === "warning" ? (
                <AlertCircle className="w-2 h-2" />
              ) : (
                <AlertCircle className="w-2 h-2" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Action Buttons */}
        <div className="flex flex-wrap gap-1 mb-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleViewInvoicesClick}
            disabled={loading}
            className={`${buttonClass} h-6`}
          >
            <FiFileText className="w-2 h-2" />
            View Invoices
          </motion.button>

<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  type="button"
  onClick={() => setShowSalesReportModal(true)}
  className={`${buttonClass} h-6`}
>
  <FileBarChart className="w-2 h-2" />
  Sales Checklist Report
</motion.button>

<AnimatePresence>
  {showSalesReportModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setShowSalesReportModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="lg:ml-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Sales Checklist Report
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowSalesReportModal(false);
              resetReportFilters();
            }}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Date Range */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Date Range</label>
              <div className="flex space-x-1">
                <input
                  type="date"
                  className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                  value={reportFromDate}
                  onChange={(e) => setReportFromDate(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                  value={reportToDate}
                  onChange={(e) => setReportToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Debtor Account */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Debtor Account</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportDebtor}
                onChange={(e) => setSelectedReportDebtor(e.target.value)}
              >
                <option value="">All Debtors</option>
                {reportDebtorAccounts.map((da) => (
                  <option key={da._id} value={da._id}>
                    {da.code} - {da.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Account */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Sub Account</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportSubAccount}
                onChange={(e) => setSelectedReportSubAccount(e.target.value)}
                disabled={!selectedReportDebtor}
              >
                <option value="">All Sub Accounts</option>
                {reportSubAccounts.map((sa) => (
                  <option key={sa._id} value={sa._id}>
                    {sa.subcode} - {sa.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Center */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Parent Center</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportParentCenter}
                onChange={(e) => setSelectedReportParentCenter(e.target.value)}
              >
                <option value="">All Parent Centers</option>
                {reportParentCenters.map((pc) => (
                  <option key={pc._id} value={pc._id}>
                    {pc.parentCode} - {pc.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Child Center */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Child Center</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportChildCenter}
                onChange={(e) => setSelectedReportChildCenter(e.target.value)}
                disabled={!selectedReportParentCenter}
              >
                <option value="">All Child Centers</option>
                {reportChildCenters.map((cc) => (
                  <option key={cc._id} value={cc._id}>
                    {cc.childCode} - {cc.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Finished Good */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Finished Good</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportFinishedGood}
                onChange={(e) => setSelectedReportFinishedGood(e.target.value)}
              >
                <option value="">All Finished Goods</option>
                {reportFinishedGoods.map((fg) => (
                  <option key={fg._id} value={fg._id}>
                    {fg.code} - {fg.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Level 4 */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 dark:text-gray-300">Account Level 4</label>
              <select
                className="w-full p-1 border rounded-md text-xs dark:bg-gray-600 dark:border-gray-500"
                value={selectedReportAccountLevel4}
                onChange={(e) => setSelectedReportAccountLevel4(e.target.value)}
                disabled={!selectedReportFinishedGood}
              >
                <option value="">All Account Level 4</option>
                {reportAccountLevel4s.map((al4) => (
                  <option key={al4._id} value={al4._id}>
                    {al4.fullcode} - {al4.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-3">
            <button
              type="button"
              onClick={resetReportFilters}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => fetchSalesReport(false)}
              disabled={isGeneratingReport}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700 disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              ) : (
                <FileBarChart className="w-3 h-3 inline mr-1" />
              )}
              Generate
            </button>
            <button
              type="button"
              onClick={() => fetchSalesReport(true)}
              disabled={isGeneratingReport}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              ) : (
                <FileBarChart className="w-3 h-3 inline mr-1" />
              )}
              Summary
            </button>
          </div>
        </div>

        {/* Report Results */}
        {showReportResults && (
          <div className="p-3 overflow-y-auto max-h-[calc(90vh-230px)]">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                {reportType === "detailed"
                  ? "Sales Checklist Report"
                  : "Sales Summary Report"}
              </h4>
              <button
                type="button"
                onClick={exportReportToCSV}
                className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 flex items-center"
                disabled={reportType === "detailed" ? reportData.length === 0 : !summaryData}
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </button>
                  <button
      type="button"
      onClick={handlePrintReport}
      className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 flex items-center"
    >
      <Printer className="w-3 h-3 mr-1" />
      Print
    </button>
            </div>

            {/* Detailed Report */}
            {reportType === "detailed" ? (
              reportData.length > 0 ? (
                <div className="overflow-auto">
<table className="min-w-full table-auto text-xs border-collapse">
  <thead>
    <tr>
      {[
        "Invoice No",
        "FBR Invoice No",
        "Invoice Date",
        "Debtor Code",
        "Debtor Title",
        "Sub Account Code",
        "Sub Account Title",
        "Remarks",
        "Vehicle No",
        "Finished Good Code",
        "Finished Good Title",
        "Account Level 4 Code",
        "Account Level 4 Title",
        "UOM",
        "Qty",
        "Rate",
        "Amount",
        "Parent Code",
        "Child Code",
        "Parent Title",
        "Child Title",
      ].map((h, i) => (
        <th key={i} className="px-1 py-1 text-left font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
          {h}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    {reportData.map((item, index) => (
      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        {/* Invoice No - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.invNo || "") : ""}
        </td>
        {/* FBR Invoice No - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.fbrInvoiceNumber || "") : ""}
        </td>
        {/* Invoice Date - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false && item.invDate ? new Date(item.invDate).toLocaleDateString() : ""}
        </td>
        {/* Debtor Details - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.debtorCode || "") : ""}
        </td>
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.debtorTitle || "") : ""}
        </td>
        {/* Subaccount Details - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.subAccountCode || "") : ""}
        </td>
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.subAccountTitle || "") : ""}
        </td>
        {/* Remarks and Vehicle No - only show in first row */}
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.remarks || "") : ""}
        </td>
        <td className="px-1 py-1 truncate">
          {item.isFirstRow !== false ? (item.vhn || "") : ""}
        </td>
        {/* Finished Good Details - show in all rows */}
        <td className="px-1 py-1 truncate">{item.finishedGoodCode || ""}</td>
        <td className="px-1 py-1 truncate">{item.finishedGoodTitle || ""}</td>
        {/* Account Level 4 Details - show in all rows */}
        <td className="px-1 py-1 truncate">{item.accountLevel4Code || ""}</td>
        <td className="px-1 py-1 truncate">{item.accountLevel4Title || ""}</td>
        <td className="px-1 py-1 truncate">{item.unitOfMeasurement || ""}</td>
        <td className="px-1 py-1 truncate">{item.qty ? parseFloat(item.qty).toFixed(3) : ""}</td>
        {/* Rate column with max 3 decimal places */}
        <td className="px-1 py-1 truncate">
          {item.rate ? parseFloat(item.rate).toFixed(3) : ""}
        </td>
        <td className="px-1 py-1 truncate">{item.amount || ""}</td>
        <td className="px-1 py-1 truncate">{item.parentCode || ""}</td>
        <td className="px-1 py-1 truncate">{item.childCode || ""}</td>
        <td className="px-1 py-1 truncate">{item.parentTitle || ""}</td>
        <td className="px-1 py-1 truncate">{item.childTitle || ""}</td>
      </tr>
    ))}
  </tbody>
</table>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                  No data found for the selected filters
                </div>
              )
            ) : (
              // Summary Report
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                    <p className="font-medium text-gray-600 dark:text-gray-300">Total Qty</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {summaryData?.totalQuantity || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                    <p className="font-medium text-gray-600 dark:text-gray-300">Total Amount</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${(summaryData?.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded">
                    <p className="font-medium text-gray-600 dark:text-gray-300">Total Invoices</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {summaryData?.totalInvoices || 0}
                    </p>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Debtor</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Finished Good</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Qty</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Count</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {summaryData?.byDebtorAndGood?.length > 0 ? (
                        summaryData.byDebtorAndGood.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-2 py-1 truncate">{item.debtorAccountTitle || "N/A"}</td>
                            <td className="px-2 py-1 truncate">{item.finishedGoodTitle || "N/A"}</td>
                            <td className="px-2 py-1">{item.totalQuantity || 0}</td>
                            <td className="px-2 py-1">${(item.totalAmount || 0).toFixed(2)}</td>
                            <td className="px-2 py-1">{item.count || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-2 py-3 text-center text-gray-500 dark:text-gray-400">
                            No data found for the selected filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


          {/* FBR Validation Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={validateInvoiceWithFBR}
            disabled={validating || items.length === 0}
            className={`${buttonClass} h-6 ${validating || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {validating ? (
              <Loader2 className="w-2 h-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-2 h-2" />
            )}
            Validate with FBR
          </motion.button>

{isEditingInvoice && !isInvoicePosted && (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={handlePostInvoice}
      disabled={loading}
      className={`${buttonClass} h-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-2 h-2 animate-spin" />
      ) : (
        <CheckCircle2 className="w-2 h-2" />
      )}
      Post Invoice
    </motion.button>
  )}
  
          {isEditingInvoice && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setItems([]);
                resetForm();
                setIsEditingItem(false);
                setIsEditingInvoice(false);
                setEditingItemIndex(null);
                setExistingInvoiceData(null);
                setInvoiceNumber('');
                setInvoiceType('');
                setSelectedGoDown('');
                setSelectedDebtorAccount('');
                setSelectedSubAccount('');
                setSelectedParentCenter('');
                setSelectedChildCenter('');
                setCustomerProfile(null);
                setInvoiceDate('');
                setfbrInvoiceNumber('');
                setAddress('');
                setPoNumber('');
                setPoDate('');
                setOgpNumber('');
                setOgpDate('');
                setDcNumber('');
                setDcDate('');
                setVehicleNumber('');
                setRemarks('');
                setSelectedFinishedGood(null);
                setSelectedAccountLevel4(null);
                setSelectedUnitMeasurement(null);
                setQuantity('');
                setNetAmount(0);
                setAmount(0);
                setDiscountBreakdown([]);
                setTaxBreakdown([]);
                setMessage({ type: "success", text: "Ready for new invoice entry." });
              }}
              className={`${buttonClass} h-6`}
            >
              <FiPlus className="w-2 h-2" />
              New Invoice
            </motion.button>
          )}

          {isEditingInvoice && (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    disabled={!existingInvoiceData || loading}
    onClick={async () => {
      // Check if invoice is posted first
      if (isInvoicePosted) {
        setMessage({ type: "error", text: "This invoice is posted and cannot be deleted." });
        return;
      }
      
      if (!existingInvoiceData || !existingInvoiceData._id || !companyId) {
        setMessage({ type: "error", text: "No invoice selected to delete." });
        return;
      }
      
      if (!window.confirm("Are you sure you want to delete this invoice?")) return;
      
      try {
        setLoading(true);
        const invoiceId = existingInvoiceData._id.$oid || existingInvoiceData._id;
        const response = await fetch(
          `http://localhost:5000/api/sales-vouchers/${companyId}/${invoiceId}`,
          { method: "DELETE" }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete invoice");
        }
        
        setItems([]);
        resetForm();
        setIsEditingItem(false);
        setIsEditingInvoice(false);
        setEditingItemIndex(null);
        setExistingInvoiceData(null);
        setInvoiceNumber('');
        setInvoiceType('');
        setSelectedGoDown('');
        setSelectedDebtorAccount('');
        setSelectedSubAccount('');
        setSelectedParentCenter('');
        setSelectedChildCenter('');
        setCustomerProfile(null);
        setInvoiceDate('');
        setfbrInvoiceNumber('');
        setAddress('');
        setPoNumber('');
        setPoDate('');
        setOgpNumber('');
        setOgpDate('');
        setDcNumber('');
        setDcDate('');
        setVehicleNumber('');
        setRemarks('');
        setSelectedFinishedGood(null);
        setSelectedAccountLevel4(null);
        setSelectedUnitMeasurement(null);
        setQuantity('');
        setNetAmount(0);
        setAmount(0);
        setDiscountBreakdown([]);
        setTaxBreakdown([]);
        setMessage({ type: "success", text: "Invoice deleted successfully!" });
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to delete invoice" });
      } finally {
        setLoading(false);
      }
    }}
    className={`${buttonClass} h-6 ${!existingInvoiceData || loading || isInvoicePosted ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <FiTrash2 className="w-2 h-2" />
    Delete Invoice
  </motion.button>
)}
          {isEditingInvoice && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowPrintOptions(true)}
              className={`${buttonClass} h-6`}
            >
              <FiPrinter className="w-2 h-2" />
              Print Invoice
            </motion.button>
          )}
          {showPrintOptions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Select Additional Fields to Print</h3>

                <div className="space-y-3 mb-6">
                  {Object.entries(printOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPrintOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPrintOptions(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handlePrintInvoice(printOptions);
                      setShowPrintOptions(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          )}
          {isEditingInvoice && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                const subAccountTitle = existingInvoiceData
                  ? (existingInvoiceData.subAccount?.title || existingInvoiceData.subAccountTitle || 'N/A')
                  : (selectedSubAccount && subAccounts.find(sa => sa._id === selectedSubAccount)?.title) || 'N/A';

                const subAccountCode = existingInvoiceData
                  ? (existingInvoiceData.subAccount?.subcode || '')
                  : (selectedSubAccount && subAccounts.find(sa => sa._id === selectedSubAccount)?.subcode) || '';

                const accountLevel4Title = existingInvoiceData
                  ? (existingInvoiceData.accountLevel4?.title || existingInvoiceData.accountLevel4Title || 'N/A')
                  : (selectedAccountLevel4 && accountLevel4s.find(al4 => al4._id === selectedAccountLevel4)?.title) || 'N/A';

                const accountLevel4Code = existingInvoiceData
                  ? (existingInvoiceData.accountLevel4?.subcode || '')
                  : (selectedAccountLevel4 && accountLevel4s.find(al4 => al4._id === selectedAccountLevel4)?.subcode) || '';

                const netAmountValue = existingInvoiceData ? existingInvoiceData.netAmount : netAmount;
                const totalAmountValue = existingInvoiceData ? existingInvoiceData.totalAmount : amount;

                const discounts = existingInvoiceData
                  ? (existingInvoiceData.items || []).flatMap(item => item.discountBreakdown || [])
                  : discountBreakdown;

                const taxes = existingInvoiceData
                  ? (existingInvoiceData.items || []).flatMap(item => item.taxBreakdown || [])
                  : taxBreakdown;

                const totalDebit = existingInvoiceData
                  ? (existingInvoiceData.netAmount + existingInvoiceData.discountAmount)
                  : (netAmount + discountBreakdown.reduce((sum, d) => sum + d.value, 0));

                const totalCredit = existingInvoiceData
                  ? (existingInvoiceData.totalAmount + existingInvoiceData.taxAmount)
                  : (amount + taxBreakdown.reduce((sum, t) => sum + t.value, 0));

                const printContent = `
                  <div style="font-family: Arial, sans-serif; margin: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">SALES Voucher</div>
                      <div style="font-size: 14px; color: #555; margin-bottom: 20px;">
                        Date: ${new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                      <thead>
                        <tr>
                          <th style="text-align: left; background-color: #f5f5f5; padding: 8px; border: 1px solid #ddd;">Particulars</th>
                          <th style="text-align: right; background-color: #f5f5f5; padding: 8px; border: 1px solid #ddd;">Debit (Rs.)</th>
                          <th style="text-align: right; background-color: #f5f5f5; padding: 8px; border: 1px solid #ddd;">Credit (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">
                            ${subAccountCode ? subAccountCode + ' - ' : ''}${subAccountTitle}
                          </td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                            ${netAmountValue.toFixed(2)}
                          </td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">-</td>
                        </tr>
                        ${discounts.map(discount => `
                          <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; padding-left: 28px !important;">
                              ${discount.title}
                            </td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                              ${discount.value.toFixed(2)}
                            </td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">-</td>
                          </tr>
                        `).join('')}
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">
                            ${accountLevel4Code ? accountLevel4Code + ' - ' : ''}${accountLevel4Title}
                          </td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">-</td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                            ${totalAmountValue.toFixed(2)}
                          </td>
                        </tr>
                        ${taxes.map(tax => `
                          <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; padding-left: 28px !important;">
                              ${tax.title} (${tax.type === 'quantity' ? 'Per Unit' : 'Percentage'})
                            </td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">-</td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                              ${tax.value.toFixed(2)}
                            </td>
                          </tr>
                        `).join('')}
                        <tr style="font-weight: bold; background-color: #f9f9f9;">
                          <td style="padding: 8px; border: 1px solid #ddd;">Total</td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                            ${totalDebit.toFixed(2)}
                          </td>
                          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                            ${totalCredit.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                `;
                const printWindow = window.open('', '_blank');
                printWindow.document.open();
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Print Voucher</title>
                      <style>
                        @media print {
                          body { margin: 0; padding: 0; }
                        }
                      </style>
                    </head>
                    <body>
                      ${printContent}
                      <script>
                        window.onload = function() {
                          setTimeout(function() {
                            window.print();
                            window.close();
                          }, 100);
                        };
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }}
              className={`${buttonClass} h-6`}
            >
              <FiFile className="w-2 h-2" />
              Print Voucher
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
            <fieldset disabled={isInvoicePosted} className="border-0 p-0 m-0">

          {/* Compact Invoice Information */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${sectionClass}`}
          >
            <h2 className={sectionTitleClass}>
              <FileText className="text-purple-600 w-2 h-2" />
              Invoice Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              <div>
                <label htmlFor="invoiceType" className={labelClass}>
                  Invoice Type*
                </label>
                <div className="relative">
                  <select
                    id="invoiceType"
                    ref={fieldRefs.invoiceType}
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                    onFocus={() => setFocusedField('invoiceType')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => handleEnterKey(e, 'invoiceType')}
                    className={focusedField === 'invoiceType' ? focusedInputClass : inputClass}
                    required
                  >
                    <option value="">Select Type</option>
                    {invoiceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0.5 top-1 h-2 w-2 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="invoiceNumber" className={labelClass}>
                  Invoice No. {invoiceType ? '(Auto-generated)' : '(Search existing)'}
                </label>
                {invoiceType ? (
                  <input
                    type="text"
                    id="invoiceNumber"
                    ref={fieldRefs.invoiceNumber}
                    value={invoiceNumber}
                    readOnly
                    onFocus={() => setFocusedField('invoiceNumber')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => handleEnterKey(e, 'invoiceNumber')}
                    className={`${focusedField === 'invoiceNumber' ? focusedInputClass : inputClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                  />
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      id="searchInvoiceNumber"
                      ref={fieldRefs.invoiceNumber}
                      value={searchInvoiceNumber}
                      onChange={(e) => setSearchInvoiceNumber(e.target.value)}
                      onFocus={() => setFocusedField('invoiceNumber')}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={(e) => handleEnterKey(e, 'invoiceNumber')}
                      className={`${focusedField === 'invoiceNumber' ? focusedInputClass : inputClass} flex-1`}
                      placeholder="Enter invoice number to search"
                    />
                    <button
                      type="button"
                      onClick={fetchInvoiceByNumber}
                      disabled={isSearchingInvoice || !searchInvoiceNumber}
                      className={`${buttonClass} ${isSearchingInvoice || !searchInvoiceNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSearchingInvoice ? (
                        <Loader2 className="w-2 h-2 animate-spin" />
                      ) : (
                        <Search className="w-2 h-2" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="invoiceDate" className={labelClass}>
                  Date*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="invoiceDate"
                    ref={fieldRefs.invoiceDate}
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    onFocus={() => setFocusedField('invoiceDate')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => handleEnterKey(e, 'invoiceDate')}
                    className={focusedField === 'invoiceDate' ? focusedInputClass : inputClass}
                    required
                  />
                  <Calendar className="absolute right-0.5 top-1 h-2 w-2 text-purple-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compact Customer Information */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${sectionClass}`}
          >
            <h2 className={sectionTitleClass}>
              <User className="text-purple-600 w-2 h-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
  {/* ---------- Customer Account (debtorAccount) ---------- */}
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>Customer Account*</label>
    <button
      type="button"
      ref={fieldRefs.debtorAccount}
      onClick={() => setIsDebtorComboboxOpen(!isDebtorComboboxOpen)}
      onFocus={() => {
        setFocusedField('debtorAccount');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'debtorAccount')}
      className={`${focusedField === 'debtorAccount' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${loading || !companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId}
    >
      <span className="truncate text-[10px]">{getSelectedDebtorName()}</span>
      {selectedDebtorAccount ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDebtorAccount('');
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isDebtorComboboxOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={debtorSearchTerm}
              onChange={(e) => setDebtorSearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'debtorAccount')}
            />
          </div>
          {filteredDebtorAccounts.length > 0 ? (
            <ul>
              {filteredDebtorAccounts.map((debtorAccount, index) => (
                <motion.li
                  key={debtorAccount._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${debtorAccount._id === selectedDebtorAccount ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={() => {
                    selectComboboxOption('debtorAccount', debtorAccount);
                    closeCombobox('debtorAccount');
                  }}
                >
                  <div className="font-medium">{debtorAccount.code} - {debtorAccount.title}</div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No accounts found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  
  {/* ---------- Account Level 4 (subAccount) ---------- */}
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>Account Level 4*</label>
    <button
      type="button"
      ref={fieldRefs.subAccount}
      onClick={() => {
        if (selectedDebtorAccount) {
          setIsSubAccountComboboxOpen(!isSubAccountComboboxOpen);
          if (!isSubAccountComboboxOpen) setComboboxHighlightedIndex(0);
        }
      }}
      onFocus={() => {
        setFocusedField('subAccount');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'subAccount')}
      className={`${focusedField === 'subAccount' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedDebtorAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId || !selectedDebtorAccount}
    >
      <span className="truncate text-[10px]">{getSelectedSubAccountName()}</span>
      {selectedSubAccount ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSubAccount('');
            setItems(items.map(item => ({
              ...item,
              discountBreakdown: [],
              discount: 0,
              netAmountBeforeTax: item.amount,
              netAmount: item.amount + (item.tax || 0),
            })));
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isSubAccountComboboxOpen && selectedDebtorAccount && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          {/* Added search input for sub accounts */}
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={subAccountSearchTerm || ''}
              onChange={(e) => setSubAccountSearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'subAccount')}
            />
          </div>
          {(subAccountSearchTerm ? filteredSubAccounts : subAccounts).length > 0 ? (
            <ul>
              {(subAccountSearchTerm ? filteredSubAccounts : subAccounts).map((subAccount, index) => (
                <motion.li
                  key={subAccount._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${subAccount._id === selectedSubAccount ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={async () => {
                    selectComboboxOption('subAccount', subAccount);
                    closeCombobox('subAccount');
                    await handleSubAccountChange(subAccount._id);
                    focusNextField('subAccount');
                  }}
                >
                  <div className="font-medium">{subAccount.subcode} - {subAccount.title}</div>
                  <div className="text-[8px] text-purple-500 dark:text-purple-400">{subAccount.fullcode}</div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No accounts found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>



              <div>
                <label htmlFor="fbrInvoiceNumber" className={labelClass}>
                  Fbr Invoice Number
                </label>
                <input
                  type="text"
                  id="fbrInvoiceNumber"
                  ref={fieldRefs.fbrInvoiceNumber}
                  value={fbrInvoiceNumber}
                  onChange={(e) => setfbrInvoiceNumber(e.target.value)}
                  onFocus={() => setFocusedField('fbrInvoiceNumber')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'fbrInvoiceNumber')}
                  className={focusedField === 'fbrInvoiceNumber' ? focusedInputClass : inputClass}
                  placeholder="FBR Invoice Number"
                />
              </div>
            </div>
          </motion.div>

          {customerProfile && (
            <div className="mt-1 px-1 py-0.5 rounded text-[8px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
              <div className="flex items-center gap-0.5">
                <span className="font-semibold">Type:</span>
                <span>
                  {customerProfile.customerType
                    ? customerProfile.customerType.charAt(0).toUpperCase() + customerProfile.customerType.slice(1)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="font-semibold">City:</span>
                <span>
                  {customerProfile.city
                    ? (typeof customerProfile.city === 'string'
                      ? getCityTitle(customerProfile.city)
                      : customerProfile.city.title || 'N/A')
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* Compact Additional Information */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${sectionClass}`}
          >
            <h2 className={sectionTitleClass}>
              <Truck className="text-purple-600 w-2 h-2" />
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-1">
              <div className="md:col-span-6">
                <label htmlFor="address" className={labelClass}>
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  ref={fieldRefs.address}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'address')}
                  className={focusedField === 'address' ? focusedInputClass : inputClass}
                  placeholder="Customer address"
                />
              </div>
              <div>
                <label htmlFor="poNumber" className={labelClass}>
                  PO Number
                </label>
                <input
                  type="text"
                  id="poNumber"
                  ref={fieldRefs.poNumber}
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  onFocus={() => setFocusedField('poNumber')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'poNumber')}
                  className={focusedField === 'poNumber' ? focusedInputClass : inputClass}
                  placeholder="PO Number"
                />
              </div>
              <div>
                <label htmlFor="poDate" className={labelClass}>
                  PO Date
                </label>
                <input
                  type="date"
                  id="poDate"
                  ref={fieldRefs.poDate}
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  onFocus={() => setFocusedField('poDate')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'poDate')}
                  className={focusedField === 'poDate' ? focusedInputClass : inputClass}
                />
              </div>
              <div>
                <label htmlFor="ogpNumber" className={labelClass}>
                  OGP Number
                </label>
                <input
                  type="text"
                  id="ogpNumber"
                  ref={fieldRefs.ogpNumber}
                  value={ogpNumber}
                  onChange={(e) => setOgpNumber(e.target.value)}
                  onFocus={() => setFocusedField('ogpNumber')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'ogpNumber')}
                  className={focusedField === 'ogpNumber' ? focusedInputClass : inputClass}
                  placeholder="OGP Number"
                />
              </div>
              <div>
                <label htmlFor="ogpDate" className={labelClass}>
                  OGP Date
                </label>
                <input
                  type="date"
                  id="ogpDate"
                  ref={fieldRefs.ogpDate}
                  value={ogpDate}
                  onChange={(e) => setOgpDate(e.target.value)}
                  onFocus={() => setFocusedField('ogpDate')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'ogpDate')}
                  className={focusedField === 'ogpDate' ? focusedInputClass : inputClass}
                />
              </div>
              <div>
                <label htmlFor="dcNumber" className={labelClass}>
                  DC Number
                </label>
                <input
                  type="text"
                  id="dcNumber"
                  ref={fieldRefs.dcNumber}
                  value={dcNumber}
                  onChange={(e) => setDcNumber(e.target.value)}
                  onFocus={() => setFocusedField('dcNumber')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'dcNumber')}
                  className={focusedField === 'dcNumber' ? focusedInputClass : inputClass}
                  placeholder="DC Number"
                />
              </div>
              <div>
                <label htmlFor="dcDate" className={labelClass}>
                  DC Date
                </label>
                <input
                  type="date"
                  id="dcDate"
                  ref={fieldRefs.dcDate}
                  value={dcDate}
                  onChange={(e) => setDcDate(e.target.value)}
                  onFocus={() => setFocusedField('dcDate')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'dcDate')}
                  className={focusedField === 'dcDate' ? focusedInputClass : inputClass}
                />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="remarks" className={labelClass}>
                  Remarks
                </label>
                <input
                  id="remarks"
                  ref={fieldRefs.remarks}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  onFocus={() => setFocusedField('remarks')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'remarks')}
                  className={focusedField === 'remarks' ? focusedInputClass : inputClass}
                  placeholder="Additional notes or remarks"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="vehicleNumber" className={labelClass}>
                  Vehicle Number
                </label>
                <input
                  type="text"
                  id="vehicleNumber"
                  ref={fieldRefs.vehicleNumber}
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  onFocus={() => setFocusedField('vehicleNumber')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => handleEnterKey(e, 'vehicleNumber')}
                  className={focusedField === 'vehicleNumber' ? focusedInputClass : inputClass}
                  placeholder="Vehicle Number"
                />
              </div>
            </div>
          </motion.div>

          {/* Compact Revenue Centers */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${sectionClass}`}
          >
            <h2 className={sectionTitleClass}>
              <Folder className="text-purple-600 w-2 h-2" />
              Revenue Centers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>
      Revenue Center (Parent)
    </label>
    <button
      type="button"
      ref={fieldRefs.parentCenter}
      onClick={() => setIsParentCenterComboboxOpen(!isParentCenterComboboxOpen)}
      onFocus={() => {
        setFocusedField('parentCenter');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'parentCenter')}
      className={`${focusedField === 'parentCenter' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${loading || !companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId}
    >
      <span className="truncate text-[10px]">{getSelectedParentCenterName()}</span>
      {selectedParentCenter ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedParentCenter('');
            setSelectedChildCenter('');
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isParentCenterComboboxOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search parent centers..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={parentCenterSearchTerm}
              onChange={(e) => setParentCenterSearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'parentCenter')}
            />
          </div>
          {filteredParentCenters.length > 0 ? (
            <ul>
              {filteredParentCenters.map((parentCenter, index) => (
                <motion.li
                  key={parentCenter._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${parentCenter._id === selectedParentCenter ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={() => {
                    selectComboboxOption('parentCenter', parentCenter);
                    closeCombobox('parentCenter');
                    focusNextField('parentCenter');
                  }}
                >
                  <div className="truncate">{parentCenter.parentCode} - {parentCenter.title}</div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No parent centers found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>
      Child Center
    </label>
    <button
      type="button"
      ref={fieldRefs.childCenter}
      onClick={() => selectedParentCenter && setIsChildCenterComboboxOpen(!isChildCenterComboboxOpen)}
      onFocus={() => {
        setFocusedField('childCenter');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'childCenter')}
      className={`${focusedField === 'childCenter' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedParentCenter ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId || !selectedParentCenter}
    >
      <span className="truncate text-[10px]">{getSelectedChildCenterName()}</span>
      {selectedChildCenter ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedChildCenter(''); 
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isChildCenterComboboxOpen && selectedParentCenter && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search child centers..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={childCenterSearchTerm}
              onChange={(e) => setChildCenterSearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'childCenter')}
            />
          </div>
          {filteredChildCenters.length > 0 ? (
            <ul>
              {filteredChildCenters.map((childCenter, index) => (
                <motion.li
                  key={childCenter._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${childCenter._id === selectedChildCenter ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={() => {
                    selectComboboxOption('childCenter', childCenter);
                    closeCombobox('childCenter');
                    focusNextField('childCenter');
                  }}
                >
                  <div className="font-medium">{childCenter.childCode} - {childCenter.title}</div>
                  <div className="text-[8px] text-purple-500 dark:text-purple-400">
                    {childCenter.startDate ? new Date(childCenter.startDate).toLocaleDateString() : 'No date'}
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No child centers found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
          </motion.div>

          {/* Compact Product Information */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${sectionClass}`}
          >
            <h2 className={sectionTitleClass}>
              <Package className="text-purple-600 w-2 h-2" />
              Product Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>
      Finished Goods
    </label>
    <button
      type="button"
      ref={fieldRefs.finishedGood}
      onClick={() => setIsFinishedGoodComboboxOpen(!isFinishedGoodComboboxOpen)}
      onFocus={() => {
        setFocusedField('finishedGood');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'finishedGood')}
      className={`${focusedField === 'finishedGood' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${loading || !companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId}
    >
      <span className="truncate text-[10px]">{getSelectedFinishedGoodName()}</span>
      {selectedFinishedGood ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFinishedGood(null);
            setSelectedAccountLevel4(null);
            setRate(0);
            setRateInfo(null);
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isFinishedGoodComboboxOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search finished goods..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={finishedGoodSearchTerm}
              onChange={(e) => setFinishedGoodSearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'finishedGood')}
            />
          </div>
          {filteredFinishedGoods.length > 0 ? (
            <ul>
              {filteredFinishedGoods.map((finishedGood, index) => (
                <motion.li
                  key={finishedGood._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${finishedGood._id === selectedFinishedGood ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={() => {
                    selectComboboxOption('finishedGood', finishedGood);
                    closeCombobox('finishedGood');
                    focusNextField('finishedGood');
                  }}
                >
                  <div className="truncate">{finishedGood.code} - {finishedGood.title}</div>
                  {finishedGood.level1Title && (
                    <div className="text-[8px] text-purple-500 dark:text-purple-400">
                      {finishedGood.level1Title} &gt; {finishedGood.level2Title} &gt; {finishedGood.level3Title}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No finished goods found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  
  <div className="relative" ref={comboboxRef}>
    <label className={labelClass}>
      Account Level 4
    </label>
    <button
      type="button"
      ref={fieldRefs.accountLevel4}
      onClick={() => selectedFinishedGood && setIsAccountLevel4ComboboxOpen(!isAccountLevel4ComboboxOpen)}
      onFocus={() => {
        setFocusedField('accountLevel4');
        setComboboxHighlightedIndex(0);
      }}
      onBlur={() => setFocusedField(null)}
      onKeyDown={(e) => handleComboboxKeyDown(e, 'accountLevel4')}
      className={`${focusedField === 'accountLevel4' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedFinishedGood ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading || !companyId || !selectedFinishedGood}
    >
      <span className="truncate text-[10px]">{getSelectedAccountLevel4Name()}</span>
      {selectedAccountLevel4 ? (
        <X
          className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAccountLevel4(null);
            setRate(0);
            setRateInfo(null);
          }}
        />
      ) : (
        <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isAccountLevel4ComboboxOpen && selectedFinishedGood && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
          tabIndex={-1}
        >
          <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
            <input
              type="text"
              placeholder="Search account level 4..."
              className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
              value={accountLevel4SearchTerm}
              onChange={(e) => setAccountLevel4SearchTerm(e.target.value)}
              autoFocus
              onKeyDown={(e) => handleComboboxKeyDown(e, 'accountLevel4')}
            />
          </div>
          {filteredAccountLevel4s.length > 0 ? (
            <ul>
              {filteredAccountLevel4s.map((accountLevel4, index) => (
                <motion.li
                  key={accountLevel4._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${accountLevel4._id === selectedAccountLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                  onClick={() => {
                    selectComboboxOption('accountLevel4', accountLevel4);
                    closeCombobox('accountLevel4');
                    focusNextField('accountLevel4');
                  }}
                >
                  <div className="font-medium">{accountLevel4.fullcode} - {accountLevel4.title}</div>
                  <div className="text-[8px] text-purple-500 dark:text-purple-400">
                    {accountLevel4.parentLevel1Code} &gt; {accountLevel4.parentLevel2Code} &gt; {accountLevel4.parentLevel3Code}
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
              No accounts found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-1 mt-1">
  <div className="md:col-span-3 min-w-0">
    <div className="relative" ref={comboboxRef}>
      <label className={`${labelClass} text-[8px]`}>
        GoDown*
      </label>
      <button
        type="button"
        ref={fieldRefs.goDown}
        onClick={() => setIsGoDownComboboxOpen(!isGoDownComboboxOpen)}
        onFocus={() => {
          setFocusedField('goDown');
          setComboboxHighlightedIndex(0);
        }}
        onBlur={() => setFocusedField(null)}
        onKeyDown={(e) => handleComboboxKeyDown(e, 'goDown')}
        className={`${focusedField === 'goDown' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${loading || !companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading || !companyId}
      >
        <span className="truncate flex items-center gap-0.5 text-[10px]">
          {getSelectedGoDownName()}
        </span>
        {selectedGoDown ? (
          <X
            className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setSelectedGoDown(''); }}
          />
        ) : (
          <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isGoDownComboboxOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
            tabIndex={-1}
          >
            <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
              <input
                type="text"
                placeholder="Search godowns..."
                className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                value={goDownSearchTerm}
                onChange={(e) => setGoDownSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => handleComboboxKeyDown(e, 'goDown')}
              />
            </div>
            {filteredGoDowns.length > 0 ? (
              <ul>
                {filteredGoDowns.map((goDown, index) => (
                  <motion.li
                    key={goDown._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${goDown._id === selectedGoDown ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                    onClick={() => {
                      selectComboboxOption('goDown', goDown);
                      closeCombobox('goDown');
                      focusNextField('goDown');
                    }}
                  >
                    <div className="truncate">{goDown.code} - {goDown.name}</div>
                    <div className="text-[8px] text-purple-500 dark:text-purple-400">{goDown.alphabet}</div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                No godowns found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  <div className="md:col-span-2 min-w-0">
    <div className="relative" ref={comboboxRef}>
      <label className={`${labelClass} text-[8px]`}>
        Unit
      </label>
      <button
        type="button"
        ref={fieldRefs.unit}
        onClick={() => setIsUnitMeasurementComboboxOpen(!isUnitMeasurementComboboxOpen)}
        onFocus={() => {
          setFocusedField('unit');
          setComboboxHighlightedIndex(0);
        }}
        onBlur={() => setFocusedField(null)}
        onKeyDown={(e) => handleComboboxKeyDown(e, 'unit')}
        className={`${focusedField === 'unit' ? focusedInputClass : inputClass} flex items-center justify-between cursor-pointer text-left ${loading || !companyId ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading || !companyId}
      >
        <span className="truncate flex items-center gap-0.5 text-[10px]">
          {getSelectedUnitMeasurementName()}
        </span>
        {selectedUnitMeasurement ? (
          <X
            className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setSelectedUnitMeasurement(null); }}
          />
        ) : (
          <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isUnitMeasurementComboboxOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto"
            tabIndex={-1}
          >
            <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
              <input
                type="text"
                placeholder="Search units..."
                className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                value={unitMeasurementSearchTerm}
                onChange={(e) => setUnitMeasurementSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => handleComboboxKeyDown(e, 'unit')}
              />
            </div>
            {filteredUnitMeasurements.length > 0 ? (
              <ul>
                {filteredUnitMeasurements.map((unit, index) => (
                  <motion.li
                    key={unit._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${unit._id === selectedUnitMeasurement ? 'bg-purple-50 dark:bg-purple-900' : ''} ${index === comboboxHighlightedIndex ? 'bg-purple-200 dark:bg-purple-800' : ''}`}
                    onClick={() => {
                      selectComboboxOption('unit', unit);
                      closeCombobox('unit');
                      focusNextField('unit');
                    }}
                  >
                    <div className="truncate">{unit.code} - {unit.title}</div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                No units found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
              <div className="md:col-span-2 min-w-0">
                <label htmlFor="quantity" className={`${labelClass} text-[8px]`}>
                  Qty*
                </label>
                <div className="relative flex items-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-0.5 rounded-l-sm border border-purple-300 dark:border-purple-700 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Minus className="w-2 h-2" />
                  </motion.button>
                  <input
                    type="number"
                    id="quantity"
                    ref={fieldRefs.quantity}
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                    onFocus={() => setFocusedField('quantity')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => handleEnterKey(e, 'quantity')}
                    className="flex-1 p-0.5 text-[10px] border-t border-b border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none text-center"
                    required
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-0.5 rounded-r-sm border border-purple-300 dark:border-purple-700 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Plus className="w-2 h-2" />
                  </motion.button>
                </div>
              </div>
              <div className="md:col-span-3 min-w-0">
                <label htmlFor="rate" className={`${labelClass} text-[8px]`}>
                  Rate*
                </label>
                <div className="relative">
                  <div className="absolute left-1 top-1 text-purple-500 text-[10px]">$</div>
                  <input
                    type="number"
                    id="rate"
                    ref={fieldRefs.rate}
                    step="0.01"
                    value={rate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRate(value === "" ? "" : parseFloat(value));
                    }}
                    onFocus={() => setFocusedField('rate')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => handleEnterKey(e, 'rate')}
                    className={`${focusedField === 'rate' ? focusedInputClass : inputClass} pl-4 text-[10px]`}
                  />
                  {rateInfo && (
                    <div className="absolute right-1 top-1 group">
                      <Info className="w-2 h-2 text-purple-500 cursor-pointer hover:text-purple-600 transition-colors" />
                      <div className="absolute right-0 bottom-full mb-1 w-48 p-1 text-[8px] bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="font-medium">Rate Information</div>
                        <div>Applicable Date: {new Date(rateInfo.applicableDate).toLocaleDateString()}</div>
                        <div>Status: {rateInfo.isActive ? 'Active' : 'Inactive'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 min-w-0">
                <label htmlFor="amount" className={`${labelClass} text-[8px]`}>
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute left-1 top-1 text-purple-500 text-[10px]">$</div>
                  <input
                    type="number"
                    id="amount"
                    ref={fieldRefs.amount}
                    value={amount}
                    readOnly
                    className={`${focusedField === 'amount' ? focusedInputClass : inputClass} pl-4 text-[10px] bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compact Discount Section */}
          <AnimatePresence>
            {discountBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={sectionClass}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={sectionTitleClass}>
                    <Percent className="text-purple-600 w-2 h-2" />
                    Discounts Applied
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDiscountSection(!showDiscountSection)}
                    className="text-[8px] text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {showDiscountSection ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showDiscountSection && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
                      {discountBreakdown.map((discount, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-1 border rounded-sm dark:border-purple-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[8px] font-medium text-purple-700 dark:text-purple-300">
                              {discount.title}
                            </span>
                            <span className="text-[8px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 py-0 rounded-full">
                              {discount.type === 'percentage' ? 'Percentage' :
                                discount.type === 'quantity' ? 'Per Piece' : 'Flat'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] text-purple-500 dark:text-purple-400">
                              {discount.type === 'percentage' ? `${discount.rate}%` :
                                discount.type === 'quantity' ? `${discount.rate} per piece` :
                                  'Flat amount'}
                            </span>
                            <span className="text-[8px] font-semibold text-purple-600 dark:text-purple-400">
                              -${discount.value.toFixed(2)}
                            </span>
                          </div>
                          {discount.isEditable && (
                            <>
                              <div className="mt-0.5 flex items-center justify-between">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={editableDiscounts[discount.discountTypeId] || false}
                                    onChange={() => handleDiscountEditToggle(discount.discountTypeId)}
                                    className="rounded border-purple-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                  />
                                  <span className="ml-0.5 text-[8px] text-purple-600 dark:text-purple-300">Edit</span>
                                </label>
                                {editableDiscounts[discount.discountTypeId] && (
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => resetDiscountEdit(discount.discountTypeId)}
                                      className="p-0.5 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                      title="Reset to original"
                                    >
                                      <RefreshCw className="w-2 h-2" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editableDiscounts[discount.discountTypeId] && (
                                <div className="mt-0.5 space-y-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <span className="text-[8px] text-purple-600 dark:text-purple-300 w-8">Rate:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step={discount.type === 'percentage' ? '0.1' : '0.01'}
                                      value={editedDiscountRates[discount.discountTypeId] !== undefined ?
                                        editedDiscountRates[discount.discountTypeId] :
                                        discount.rate}
                                      onChange={(e) => handleDiscountRateChange(discount.discountTypeId, e.target.value)}
                                      className="flex-1 p-0.5 text-[8px] rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                    {discount.type === 'percentage' && (
                                      <span className="text-[8px] text-purple-500">%</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <span className="text-[8px] text-purple-600 dark:text-purple-300 w-8">Amount:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={editedDiscountValues[discount.discountTypeId] !== undefined ?
                                        editedDiscountValues[discount.discountTypeId] :
                                        discount.value}
                                      onChange={(e) => handleDiscountValueChange(discount.discountTypeId, e.target.value)}
                                      className="flex-1 p-0.5 text-[8px] rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                  </div>
                                  <div className="mt-0.5 text-[8px] text-purple-500 dark:text-purple-400">
                                    Original: {discount.type === 'percentage' ? `${discount.originalRate}%` :
                                      discount.type === 'quantity' ? `${discount.originalRate} per piece` :
                                        `$${discount.originalValue}`} ({discount.originalValue.toFixed(2)})
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                      <div className="col-span-1 md:col-span-2">
                        <div className="text-[8px] text-purple-600 dark:text-purple-300">
                          Total Discount
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-semibold text-red-600 dark:text-red-400">
                          -${(amount - netAmountBeforeTax).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Tax Section */}
          <AnimatePresence>
            {taxBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={sectionClass}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={sectionTitleClass}>
                    <Percent className="text-purple-600 w-2 h-2" />
                    {customerProfile?.customerType === 'registered' ? 'Registered' : 'Un-Registered'} Taxes Applied
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTaxSection(!showTaxSection)}
                    className="text-[8px] text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {showTaxSection ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showTaxSection && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
                      {taxBreakdown
                        .filter(tax => {
                          // Show only registered taxes for registered customers
                          if (customerProfile?.customerType === 'registered') {
                            return tax.registeredValue > 0;
                          }
                          // Show only unregistered taxes for un-registered customers
                          else if (customerProfile?.customerType === 'un-registered') {
                            return tax.unregisteredValue > 0;
                          }
                          // Default case (shouldn't happen if customer profile is set up correctly)
                          return true;
                        })
                        .map((tax, index) => {
                          // Determine which tax rate to use based on customer type
                          const taxRate = customerProfile?.customerType === 'registered'
                            ? tax.registeredValue
                            : tax.unregisteredValue;
                          const taxValue = netAmountBeforeTax * (taxRate / 100);
                          const transactionType = tax.transactionType || 'sale'; // Default to 'sale' if not specified
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-1 border rounded-sm dark:border-purple-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[8px] font-medium text-purple-700 dark:text-purple-300">
                                  {tax.title}
                                </span>
                                <div className="flex gap-0.5">
                                  <span className="text-[8px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 py-0 rounded-full">
                                    {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                                  </span>
                                  <span className="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0 rounded-full">
                                    {customerProfile?.customerType === 'registered' ? 'Registered' : 'Un-Registered'}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex justify-between items-center border-t border-purple-200 dark:border-purple-600 pt-0.5 mt-0.5">
                                  <span className="text-[8px] font-medium text-purple-600 dark:text-purple-300">
                                    Tax Rate
                                  </span>
                                  <span className="text-[8px] text-purple-600 dark:text-purple-400">
                                    {tax.type === 'quantity' ? `${taxRate} per unit` : `${taxRate}%`}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] text-purple-500 dark:text-purple-400">
                                    {tax.type === 'quantity' ? `${quantity} units × ${taxRate}` : `${netAmountBeforeTax.toFixed(2)} × ${taxRate}%`}
                                  </span>
                                  <span className="text-[8px] font-semibold text-purple-600 dark:text-purple-400">
                                    +${tax.value.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              {tax.isEditable && (
                                <>
                                  <div className="mt-0.5 flex items-center justify-between">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={editableTaxes[tax.taxTypeId] || false}
                                        onChange={() => handleTaxEditToggle(tax.taxTypeId)}
                                        className="rounded border-purple-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                      />
                                      <span className="ml-0.5 text-[8px] text-purple-600 dark:text-purple-300">Edit</span>
                                    </label>
                                    {editableTaxes[tax.taxTypeId] && (
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => resetTaxEdit(tax.taxTypeId)}
                                          className="p-0.5 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                          title="Reset to original"
                                        >
                                          <RefreshCw className="w-2 h-2" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {editableTaxes[tax.taxTypeId] && (
                                    <div className="mt-0.5 space-y-0.5">
                                      <div className="flex items-center gap-0.5">
                                        <span className="text-[8px] text-purple-600 dark:text-purple-300">Rate:</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step={tax.type === 'quantity' ? '0.01' : '0.1'}
                                          value={
                                            editedTaxRates[tax.taxTypeId] !== undefined
                                              ? customerProfile?.customerType === 'registered'
                                                ? editedTaxRates[tax.taxTypeId].registeredValue
                                                : editedTaxRates[tax.taxTypeId].unregisteredValue
                                              : tax.currentRate || taxRate
                                          }
                                          onChange={(e) => {
                                            const newRate = parseFloat(e.target.value) || 0;
                                            setEditedTaxRates(prev => ({
                                              ...prev,
                                              [tax.taxTypeId]: {
                                                ...prev[tax.taxTypeId],
                                                [customerProfile?.customerType === 'registered' ? 'registeredValue' : 'unregisteredValue']: newRate
                                              }
                                            }));
                                          }}
                                          className="flex-1 p-0.5 text-[8px] rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                        <span className="text-[8px] text-purple-500">
                                          {tax.type === 'quantity' ? 'per unit' : '%'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        <span className="text-[8px] text-purple-600 dark:text-purple-300">Amount:</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={
                                            editedTaxValues[tax.taxTypeId] !== undefined
                                              ? editedTaxValues[tax.taxTypeId]
                                              : tax.value
                                          }
                                          onChange={(e) => handleTaxValueChange(tax.taxTypeId, e.target.value)}
                                          className="flex-1 p-0.5 text-[8px] rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                      </div>
                                      <div className="mt-0.5 text-[8px] text-purple-500 dark:text-purple-400">
                                        Original: {tax.type === 'quantity'
                                          ? `${customerProfile?.customerType === 'registered'
                                            ? tax.originalRegisteredValue
                                            : tax.originalUnregisteredValue} per unit (${tax.originalValue.toFixed(2)})`
                                          : `${customerProfile?.customerType === 'registered'
                                            ? tax.originalRegisteredValue
                                            : tax.originalUnregisteredValue}% (${tax.originalValue.toFixed(2)})`}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </motion.div>
                          );
                        })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                      <div className="col-span-1 md:col-span-2">
                        <div className="text-[8px] text-purple-600 dark:text-purple-300">
                          Total {customerProfile?.customerType === 'registered' ? 'Registered' : 'Un-Registered'} Tax
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                          +${(netAmount - netAmountBeforeTax).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Net Amount Section */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={sectionClass}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-1">
              <div className="flex flex-col items-start">
                <div className="text-[9px] font-semibold text-purple-800 dark:text-purple-300">
                  Net Amount
                </div>
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                  ${netAmount.toFixed(2)}
                </span>
              </div>
              <div>
                {isEditingItem ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleUpdateItem}
                    disabled={
                      loading ||
                      !selectedGoDown ||
                      !selectedDebtorAccount ||
                      !selectedSubAccount ||
                      !selectedFinishedGood ||
                      !selectedAccountLevel4
                    }
                    className={`${buttonClass} bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Check className="w-2 h-2" />
                    Update Item
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addItem}
                    disabled={
                      loading ||
                      !selectedGoDown ||
                      !selectedDebtorAccount ||
                      !selectedSubAccount ||
                      !selectedFinishedGood ||
                      !selectedAccountLevel4
                    }
                    className={`${buttonClass} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Plus className="w-2 h-2" />
                    Add Item
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Compact Invoice Items Table */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={sectionClass}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={sectionTitleClass}>
                    <ClipboardList className="text-purple-600 w-2 h-2" />
                    Invoice Items ({items.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={tableHeaderClass}>Product</th>
                        <th className={tableHeaderClass}>Sub Account</th>
                        <th className={tableHeaderClass}>Qty</th>
                        <th className={tableHeaderClass}>Rate</th>
                        <th className={tableHeaderClass}>Amount</th>
                        <th className={tableHeaderClass}>Discounts</th>
                        <th className={tableHeaderClass}>Taxes</th>
                        <th className={tableHeaderClass}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        // Find sub account title
                        const subAccountObj = subAccounts.find(sa => sa._id === item.subAccountId || sa._id === selectedSubAccount);

                        // Check if item has been edited
                        const isEdited = item.discountBreakdown?.some(d => d.isEdited) ||
                          item.taxBreakdown?.some(t => t.isEdited) ||
                          (editingItemIndex === index && isEditingItem);
                        return (
                          <tr
                            key={index}
                            className={`hover:bg-purple-100 dark:hover:bg-purple-900/50 ${isEdited ? 'bg-green-50 dark:bg-green-900/30' : ''}`}
                          >
                            <td className={tableCellClass}>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[9px]">
                                  {item.productCode} - {item.productName}
                                </p>
                                {isEdited && (
                                  <span className="text-[8px] text-green-600 dark:text-green-400">(Edited)</span>
                                )}
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="min-w-0">
                                <p className="truncate text-[9px]">
                                  {subAccountObj ? `${subAccountObj.subcode} - ${subAccountObj.title}` : '-'}
                                </p>
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="text-[9px]">
                                {item.quantity}
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="text-[9px]">
                                {item.rate.toFixed(2)}
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="text-[9px]">
                                {item.amount.toFixed(2)}
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              {item.discountBreakdown && item.discountBreakdown.length > 0 ? (
                                <ul>
                                  {item.discountBreakdown.map((d, i) => (
                                    <li key={i} className={`text-[8px] ${d.isEdited ? 'text-green-600 dark:text-green-400' : ''}`}>
                                      {d.typeName || d.type || d.name}: <span className="font-semibold">{d.value}</span>
                                      {d.isEdited && (
                                        <span className="ml-1 text-[8px] text-green-600 dark:text-green-400">(Edited)</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-[9px]">-</span>
                              )}
                            </td>
                            <td className={tableCellClass}>
                              {item.taxBreakdown && item.taxBreakdown.length > 0 ? (
                                <ul>
                                  {item.taxBreakdown.map((t, i) => (
                                    <li key={i} className={`text-[8px] ${t.isEdited ? 'text-green-600 dark:text-green-400' : ''}`}>
                                      {t.typeName || t.type || t.name}: <span className="font-semibold">{t.value}</span>
                                      {t.isEdited && (
                                        <span className="ml-1 text-[8px] text-green-600 dark:text-green-400">(Edited)</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-[9px]">-</span>
                              )}
                            </td>
                            <td className={`${tableCellClass} whitespace-nowrap`}>
                              <div className="flex gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditItem(index)}
                                  className="p-0.5 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                  title="Edit item"
                                >
                                  <Edit className="w-2 h-2 text-purple-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(index)}
                                  className="p-0.5 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                  title="Delete item"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="w-2 h-2 animate-spin" />
                                  ) : (
                                    <X className="w-2 h-2 text-red-500" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Debit/Credit Table */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className={`${sectionClass}`}
          >
            <div className="mb-0.5 flex justify-between items-center">
              <div>
                <h3 className={sectionTitleClass}>
                  Debit/Credit Entries
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDebitCredit(!showDebitCredit)}
                className="flex items-center gap-0.5 text-[8px] text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                {showDebitCredit ? (
                  <>
                    <ChevronUp className="w-2 h-2" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-2 h-2" />
                    Expand
                  </>
                )}
              </button>
            </div>
            {showDebitCredit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-sm overflow-hidden shadow-sm dark:shadow-none dark:border-purple-700"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={tableHeaderClass}>Particulars</th>
                        <th className={tableHeaderClass}>Debit (Rs.)</th>
                        <th className={tableHeaderClass}>Credit (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Main Debit Entry */}
                      <tr className="hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                        <td className={tableCellClass}>
                          <div className="flex items-center">
                            <div className="ml-0.5">
                              <div className="text-[9px] font-medium">
                                {existingInvoiceData
                                  ? `${existingInvoiceData.subAccountFullCode || 'N/A'} - ${existingInvoiceData.subAccountTitle || existingInvoiceData.subAccount?.title || 'N/A'}`
                                  : (selectedSubAccount && subAccounts.find(sa => sa._id === selectedSubAccount)
                                    ? `${subAccounts.find(sa => sa._id === selectedSubAccount)?.subcode || 'N/A'} - ${subAccounts.find(sa => sa._id === selectedSubAccount)?.title || 'N/A'}`
                                    : 'N/A')
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          <div className="text-[9px] font-medium text-purple-600 dark:text-purple-400">
                            {(existingInvoiceData ? existingInvoiceData.netAmount : netAmount).toFixed(2)}
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          <div className="text-[9px]">-</div>
                        </td>
                      </tr>

                      {/* Discount Entries */}
                      {(existingInvoiceData
                        ? (existingInvoiceData.items || []).flatMap(item => item.discountBreakdown || [])
                        : discountBreakdown
                      ).map((discount, index) => (
                        <tr key={`discount-${index}`} className="hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                          <td className={tableCellClass}>
                            <div className="flex items-center pl-2">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-0.5"></div>
                              <span className="text-[9px]">
                                {discount.title}
                              </span>
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px] text-red-600 dark:text-red-400">
                              {discount.value.toFixed(2)}
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px]">-</div>
                          </td>
                        </tr>
                      ))}

                      {/* Credit Entries for Each Product */}
                      {(existingInvoiceData
                        ? (existingInvoiceData.items || [])
                        : items
                      ).map((item, index) => (
                        <tr key={`product-${index}`} className="hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                          <td className={tableCellClass}>
                            <div className="flex items-center">
                              <div className="ml-0.5">
                                <div className="text-[9px] font-medium">
                                  {item.productCode || 'N/A'} - {item.productName || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px]">-</div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px] font-medium text-green-600 dark:text-green-400">
                              {(item.amount || 0).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Tax Entries */}
                      {(existingInvoiceData
                        ? (existingInvoiceData.items || []).flatMap(item => item.taxBreakdown || [])
                        : taxBreakdown
                      ).map((tax, index) => (
                        <tr key={`tax-${index}`} className="hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                          <td className={tableCellClass}>
                            <div className="flex items-center pl-2">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-0.5"></div>
                              <span className="text-[9px]">
                                {tax.title} ({tax.type === 'quantity' ? 'Per Unit' : 'Percentage'})
                              </span>
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px]">-</div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="text-[9px] text-purple-600 dark:text-purple-400">
                              {tax.value.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Totals Row */}
                      <tr className="bg-purple-100 dark:bg-purple-900 border-t-2 border-purple-200 dark:border-purple-600">
                        <td className={tableCellClass}>
                          <div className="text-[9px] font-bold">Total</div>
                        </td>
                        <td className={tableCellClass}>
                          <div className="text-[9px] font-bold text-purple-600 dark:text-purple-400">
                            {existingInvoiceData
                              ? (existingInvoiceData.netAmount + (existingInvoiceData.discountAmount || 0)).toFixed(2)
                              : (netAmount + discountBreakdown.reduce((sum, d) => sum + d.value, 0)).toFixed(2)
                            }
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          <div className="text-[9px] font-bold text-green-600 dark:text-green-400">
                            {existingInvoiceData
                              ? ((existingInvoiceData.totalAmount || 0) + (existingInvoiceData.taxAmount || 0)).toFixed(2)
                              : (amount + taxBreakdown.reduce((sum, t) => sum + t.value, 0)).toFixed(2)
                            }
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Compact Form Actions */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end gap-1"
          >
            <button
              type="button"
              className="px-1 py-0.5 rounded-sm font-medium text-[10px] border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-700 transition-all duration-200"
              onClick={() => {
                setItems([]);
                resetForm();
                setIsEditingItem(false);
                setIsEditingInvoice(false);
                setEditingItemIndex(null);
              }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || items.length === 0}
              className={`${buttonClass} ${loading || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <Loader2 className="w-2 h-2 animate-spin" />
              ) : (
                <Save className="w-2 h-2" />
              )}
              {isEditingInvoice ? "Update Invoice" : "Save Invoice"}
            </motion.button>
          </motion.div>

          {/* Invoices Data Modal - Kept as is since it's a modal */}
          <AnimatePresence>
            {showInvoicesModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                onClick={() => {
                  setShowInvoicesModal(false);
                  setCurrentInvoiceIndex(0); // Reset index when closing
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="lg:ml-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Invoice #{invoicesData[currentInvoiceIndex]?.invoiceNumber || ''}
                      <span className="text-sm font-normal ml-2">
                        ({currentInvoiceIndex + 1} of {invoicesData.length})
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvoicesModal(false);
                        setCurrentInvoiceIndex(0); // Reset index when closing
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  {/* Date Range Filter */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="fromDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          From:
                        </label>
                        <input
                          type="date"
                          id="fromDate"
                          className="px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500"
                          onChange={(e) => setFilterFromDate(e.target.value)}
                          value={filterFromDate || ''}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label htmlFor="toDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          To:
                        </label>
                        <input
                          type="date"
                          id="toDate"
                          className="px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500"
                          onChange={(e) => setFilterToDate(e.target.value)}
                          value={filterToDate || ''}
                        />
                      </div>
                      <button
                        onClick={() => {
                          // Apply filter
                          const filtered = originalInvoicesData.filter(invoice => {
                            if (!invoice.invoiceDate) return false;
                            const invoiceDate = new Date(invoice.invoiceDate);
                            invoiceDate.setHours(0, 0, 0, 0); // Normalize time to midnight
                            const fromDate = filterFromDate ? new Date(filterFromDate) : null;
                            if (fromDate) fromDate.setHours(0, 0, 0, 0);
                            const toDate = filterToDate ? new Date(filterToDate) : null;
                            if (toDate) toDate.setHours(23, 59, 59, 999); // End of day
                            let valid = true;
                            if (fromDate) valid = valid && invoiceDate >= fromDate;
                            if (toDate) valid = valid && invoiceDate <= toDate;
                            return valid;
                          });
                          setInvoicesData(filtered);
                          setCurrentInvoiceIndex(0); // Reset to first invoice after filtering
                        }}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                      >
                        Apply Filter
                      </button>
                      <button
                        onClick={() => {
                          // Reset filter
                          setFilterFromDate('');
                          setFilterToDate('');
                          setInvoicesData(originalInvoicesData);
                          setCurrentInvoiceIndex(0);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                      >
                        Show All
                      </button>
                    </div>
                  </div>
                  {/* Navigation Controls */}
                  <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setCurrentInvoiceIndex(0)}
                        disabled={currentInvoiceIndex === 0}
                        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentInvoiceIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentInvoiceIndex === 0}
                        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500"
                      >
                        Previous
                      </button>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, invoicesData.length) }).map((_, i) => {
                        // Show page numbers around current index
                        let pageNum;
                        if (invoicesData.length <= 5) {
                          pageNum = i;
                        } else if (currentInvoiceIndex < 3) {
                          pageNum = i;
                        } else if (currentInvoiceIndex > invoicesData.length - 4) {
                          pageNum = invoicesData.length - 5 + i;
                        } else {
                          pageNum = currentInvoiceIndex - 2 + i;
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentInvoiceIndex(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm font-medium ${currentInvoiceIndex === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'
                              }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setCurrentInvoiceIndex(prev => Math.min(invoicesData.length - 1, prev + 1))}
                        disabled={currentInvoiceIndex === invoicesData.length - 1}
                        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentInvoiceIndex(invoicesData.length - 1)}
                        disabled={currentInvoiceIndex === invoicesData.length - 1}
                        className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500"
                      >
                        Last
                      </button>
                    </div>
                  </div>

                  <div className="p-4 overflow-y-auto max-h-[calc(90vh-150px)]">
                    {invoicesData.length > 0 ? (
                      <div>
                        {/* Single Invoice Display */}
                        {(() => {
                          const invoice = invoicesData[currentInvoiceIndex];
                          console.log('Frontend: Processing invoice:', {
                            id: invoice._id,
                            subAccountTitle: invoice.subAccountTitle,
                            items: invoice.items?.map(item => ({
                              productName: item.productName,
                              subAccountTitle: item.subAccountTitle,
                              productCode: item.productCode,
                              subAccountFullCode: item.subAccountFullCode
                            }))
                          });

                          // Get the subAccountTitle from the first item if it's not available at the invoice level
                          const invoiceSubAccountTitle = invoice.subAccountTitle ||
                            (invoice.items && invoice.items.length > 0 ? invoice.items[0].subAccountTitle : 'N/A');

                          // Get the subAccountFullCode from the first item if it's not available at the invoice level
                          const invoiceSubAccountFullCode = invoice.subAccountFullCode ||
                            (invoice.items && invoice.items.length > 0 ? invoice.items[0].subAccountFullCode : 'N/A');

                          const safeInvoice = {
                            ...invoice,
                            invoiceNumber: invoice.invoiceNumber || 'N/A',
                            invoiceDate: invoice.invoiceDate || '',
                            invoiceType: invoice.invoiceType || 'N/A',
                            netAmount: invoice.netAmount || 0,
                            amount: invoice.amount || 0,
                            items: (invoice.items || []).map(item => ({
                              ...item,
                              quantity: item.quantity || 0,
                              rate: item.rate || 0,
                              productName: item.productName || 'N/A',
                              productCode: item.productCode || 'N/A',
                              subAccountTitle: item.subAccountTitle || invoiceSubAccountTitle || 'N/A',
                              subAccountFullCode: item.subAccountFullCode || invoiceSubAccountFullCode || 'N/A',
                              unitMeasurementTitle: item.unitMeasurementTitle || 'N/A',
                              unitMeasurementCode: item.unitMeasurementCode || 'N/A',
                              discountBreakdown: item.discountBreakdown || [],
                              taxBreakdown: item.taxBreakdown || []
                            })),
                            // Use the new title fields from backend
                            debtorAccountTitle: invoice.debtorAccountTitle || 'N/A',
                            accountLevel4Title: invoice.accountLevel4Title || 'N/A',
                            subAccountTitle: invoiceSubAccountTitle,
                            subAccountFullCode: invoiceSubAccountFullCode,
                            finishedGoodTitle: invoice.finishedGoodTitle || 'N/A'
                          };

                          // Calculate totals for display
                          const totalAmount = safeInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
                          const totalDiscount = safeInvoice.items.reduce((sum, item) =>
                            sum + (item.discountBreakdown?.reduce((dSum, d) => dSum + (d.value || 0), 0) || 0), 0);
                          const totalTax = safeInvoice.items.reduce((sum, item) =>
                            sum + (item.taxBreakdown?.reduce((tSum, t) => tSum + (t.value || 0), 0) || 0), 0);

                          // Combine all discounts from all items
                          const combinedDiscounts = {};
                          safeInvoice.items.forEach(item => {
                            if (item.discountBreakdown && item.discountBreakdown.length > 0) {
                              item.discountBreakdown.forEach(discount => {
                                const discountTitle = discount.title || 'Discount';
                                if (!combinedDiscounts[discountTitle]) {
                                  combinedDiscounts[discountTitle] = {
                                    value: 0,
                                    type: discount.type
                                  };
                                }
                                combinedDiscounts[discountTitle].value += discount.value || 0;
                              });
                            }
                          });

                          // Combine all taxes from all items
                          const combinedTaxes = {};
                          safeInvoice.items.forEach(item => {
                            if (item.taxBreakdown && item.taxBreakdown.length > 0) {
                              item.taxBreakdown.forEach(tax => {
                                const taxTitle = tax.title || 'Tax';
                                if (!combinedTaxes[taxTitle]) {
                                  combinedTaxes[taxTitle] = {
                                    value: 0,
                                    type: tax.type
                                  };
                                }
                                combinedTaxes[taxTitle].value += tax.value || 0;
                              });
                            }
                          });

                          // Log the final safeInvoice for debugging
                          console.log('Frontend: Final safeInvoice:', {
                            subAccountTitle: safeInvoice.subAccountTitle,
                            subAccountFullCode: safeInvoice.subAccountFullCode,
                            items: safeInvoice.items.map(item => ({
                              productName: item.productName,
                              productCode: item.productCode,
                              subAccountTitle: item.subAccountTitle,
                              subAccountFullCode: item.subAccountFullCode
                            }))
                          });

                          return (
                            <div className="border rounded-lg p-4 dark:border-gray-700">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Invoice #{safeInvoice.invoiceNumber}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Date: {safeInvoice.invoiceDate ? new Date(safeInvoice.invoiceDate).toLocaleDateString() : 'N/A'} |
                                    Type: {safeInvoice.invoiceType}
                                  </p>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  ${safeInvoice.netAmount.toFixed(2)}
                                </span>
                              </div>

                              {/* Items */}
                              <div className="mb-4">
                                <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Items ({safeInvoice.items.length}):</h5>
                                <div className="space-y-4">
                                  {safeInvoice.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="p-3 border rounded-lg dark:border-gray-700">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {item.productCode} - {item.productName || 'N/A'}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.subAccountFullCode} - {item.subAccountTitle || 'N/A'}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Unit: {item.unitMeasurementTitle || 'N/A'} ({item.unitMeasurementCode || 'N/A'})
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            ${(item.amount || 0).toFixed(2)}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(item.quantity || 0)} @ ${(item.rate || 0).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Item Discounts */}
                                      {(item.discountBreakdown || []).length > 0 && (
                                        <div className="mt-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Discounts:</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {(item.discountBreakdown || []).map((discount, discountIndex) => (
                                              <div key={discountIndex} className="text-xs">
                                                <span className="text-gray-600 dark:text-gray-300">{discount.title || 'Discount'}: </span>
                                                <span className="text-red-600 dark:text-red-400">-${(discount.value || 0).toFixed(2)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Item Taxes */}
                                      {(item.taxBreakdown || []).length > 0 && (
                                        <div className="mt-2 pl-2 border-l-2 border-purple-200 dark:border-purple-800">
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Taxes:</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {(item.taxBreakdown || []).map((tax, taxIndex) => (
                                              <div key={taxIndex} className="text-xs">
                                                <span className="text-gray-600 dark:text-gray-300">{tax.title || 'Tax'}: </span>
                                                <span className="text-purple-600 dark:text-purple-400">+${(tax.value || 0).toFixed(2)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-right">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                          Net: ${(item.netAmount || 0).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Summary */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    ${totalAmount.toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Discount</p>
                                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    -${totalDiscount.toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tax</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                    +${totalTax.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Combined Accounting Entries */}
                              <div>
                                <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Accounting Entries:</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Particulars</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-300">Debit</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-300">Credit</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                      {/* Main Debit Entry - Customer Account */}
                                      <tr>
                                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                          {safeInvoice.subAccountFullCode} - {safeInvoice.subAccountTitle || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm text-blue-600 dark:text-blue-400">
                                          {safeInvoice.netAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">-</td>
                                      </tr>

                                      {/* Combined Discount Entries */}
                                      {Object.entries(combinedDiscounts).map(([title, discount], idx) => (
                                        <tr key={`discount-${idx}`}>
                                          <td className="px-4 py-2 pl-6 text-sm text-gray-800 dark:text-gray-200">
                                            <div className="flex items-center">
                                              <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                                              {title || 'Discount'}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 text-right text-sm text-red-600 dark:text-red-400">
                                            {discount.value.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">-</td>
                                        </tr>
                                      ))}

                                      {/* Credit Entries for Each Product */}
                                      {safeInvoice.items.map((item, idx) => (
                                        <tr key={`product-${idx}`}>
                                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {item.productCode} - {item.productName || 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">-</td>
                                          <td className="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                            {item.amount.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}

                                      {/* Combined Tax Entries */}
                                      {Object.entries(combinedTaxes).map(([title, tax], idx) => (
                                        <tr key={`tax-${idx}`}>
                                          <td className="px-4 py-2 pl-6 text-sm text-gray-800 dark:text-gray-200">
                                            <div className="flex items-center">
                                              <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                                              {title || 'Tax'}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">-</td>
                                          <td className="px-4 py-2 text-right text-sm text-purple-600 dark:text-purple-400">
                                            {tax.value.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}

                                      {/* Totals Row */}
                                      <tr className="bg-gray-50 dark:bg-gray-700 font-medium border-t-2 border-gray-200 dark:border-gray-600">
                                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">Total</td>
                                        <td className="px-4 py-2 text-right text-sm text-blue-600 dark:text-blue-400">
                                          {(safeInvoice.netAmount + totalDiscount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                          {(totalAmount + totalTax).toFixed(2)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No invoices found
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showValidationModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                onClick={() => setShowValidationModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="lg:ml-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      FBR Validation Result
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowValidationModal(false)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="p-6">
                    {validationResult ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${validationResult.success ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                          <div className="flex items-center">
                            {validationResult.success ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                            )}
                            <span className={`font-medium ${validationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                              {validationResult.message}
                            </span>
                          </div>
                        </div>

                        {validationResult.data && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Response Details:</h4>
                            <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-60">
                              {JSON.stringify(validationResult.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No validation result available
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowValidationModal(false)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
            </fieldset>

        </form>
      </div>
    </motion.div>
  );
}