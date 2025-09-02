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
    User,
    Truck,
    Weight,
    FileText,
    Ban
} from 'lucide-react';
export default function PurchaseOrder() {
    const { companyId, username } = useAppContext();
    // State for PO header information
    const [poNumber, setPoNumber] = useState('');
    const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCancelled, setIsCancelled] = useState(false);
    // State for creditor selection
    const [creditors, setCreditors] = useState([]);
    const [filteredCreditors, setFilteredCreditors] = useState([]);
    const [creditorSearchTerm, setCreditorSearchTerm] = useState('');
    const [selectedCreditor, setSelectedCreditor] = useState('');
    const [isCreditorComboboxOpen, setIsCreditorComboboxOpen] = useState(false);
    const [selectedCreditorLevel4, setSelectedCreditorLevel4] = useState('');
    const [creditorLevel4s, setCreditorLevel4s] = useState([]);
    const [filteredCreditorLevel4s, setFilteredCreditorLevel4s] = useState([]);
    const [creditorLevel4SearchTerm, setCreditorLevel4SearchTerm] = useState('');
    const [isCreditorLevel4ComboboxOpen, setIsCreditorLevel4ComboboxOpen] = useState(false);
    // State for broker information
    const [brokers, setBrokers] = useState([]);
    const [filteredBrokers, setFilteredBrokers] = useState([]);
    const [brokerSearchTerm, setBrokerSearchTerm] = useState('');
    const [selectedBroker, setSelectedBroker] = useState('');
    const [isBrokerComboboxOpen, setIsBrokerComboboxOpen] = useState(false);
    const [selectedBrokerLevel4, setSelectedBrokerLevel4] = useState('');
    const [brokerLevel4s, setBrokerLevel4s] = useState([]);
    const [filteredBrokerLevel4s, setFilteredBrokerLevel4s] = useState([]);
    const [brokerLevel4SearchTerm, setBrokerLevel4SearchTerm] = useState('');
    const [isBrokerLevel4ComboboxOpen, setIsBrokerLevel4ComboboxOpen] = useState(false);
    const [commissionType, setCommissionType] = useState('weight');
    const [commissionValue, setCommissionValue] = useState('');
    // State for raw materials
    const [rawMaterials, setRawMaterials] = useState([]);
    const [filteredRawMaterials, setFilteredRawMaterials] = useState([]);
    const [rawMaterialSearchTerm, setRawMaterialSearchTerm] = useState('');
    const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
    const [isRawMaterialComboboxOpen, setIsRawMaterialComboboxOpen] = useState(false);
    const [selectedRawMaterialLevel4, setSelectedRawMaterialLevel4] = useState('');
    const [rawMaterialLevel4s, setRawMaterialLevel4s] = useState([]);
    const [filteredRawMaterialLevel4s, setFilteredRawMaterialLevel4s] = useState([]);
    const [rawMaterialLevel4SearchTerm, setRawMaterialLevel4SearchTerm] = useState('');
    const [isRawMaterialLevel4ComboboxOpen, setIsRawMaterialLevel4ComboboxOpen] = useState(false);
    
    // Updated rate fields
    const [exclRate, setExclRate] = useState('');
    const [inclRate, setInclRate] = useState('');
    
    const [uom, setUom] = useState('kg');
    const [uomFactor, setUomFactor] = useState('1'); // New state for UOM factor
    
    // New bag rate and bag type fields
    const [bagRate, setBagRate] = useState('');
    const [bagType, setBagType] = useState('');
    
    const [paymentMode, setPaymentMode] = useState(''); // Changed to selection
    const [paymentTerm, setPaymentTerm] = useState('');
    // Removed freight state as requested
    const [freightChargeBy, setFreightChargeBy] = useState(''); // Changed to selection
    const [qualityParameters, setQualityParameters] = useState('');
    const [creditDays, setCreditDays] = useState('');
    const [bagsCriteria, setBagsCriteria] = useState('our');
    // State for PO items
    const [poItems, setPoItems] = useState([]);
    // State for total/received/balance
    const [totalType, setTotalType] = useState('bags');
    const [totalBags, setTotalBags] = useState('');
    const [totalWeight, setTotalWeight] = useState('');
    const [totalTruck, setTotalTruck] = useState('');
    const [receivedBags, setReceivedBags] = useState('');
    const [receivedWeight, setReceivedWeight] = useState('');
    const [receivedTruck, setReceivedTruck] = useState('');
    const [balanceBags, setBalanceBags] = useState('');
    const [balanceWeight, setBalanceWeight] = useState('');
    const [balanceTruck, setBalanceTruck] = useState('');
    // State for min/max quantities and remarks
    const [minQuantity, setMinQuantity] = useState('');
    const [maxQuantity, setMaxQuantity] = useState('');
    const [remarks, setRemarks] = useState('');
    // UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [pendingOrders, setPendingOrders] = useState([]);
    
    // Bag type options
    const bagTypeOptions = [
        { value: 'pp bag a', label: 'PP Bag A' },
        { value: 'pp bag b', label: 'PP Bag B' },
        { value: 'jute bag', label: 'Jute Bag' },
        { value: 'jute a', label: 'Jute A' },
        { value: 'jute b', label: 'Jute B' },
        { value: 'jute c', label: 'Jute C' },
        { value: 'jute d', label: 'Jute D' }
    ];
    
    // Update UOM factor when UOM changes
    useEffect(() => {
        switch (uom) {
            case 'kg':
                setUomFactor('1');
                break;
            case '40kg':
                setUomFactor('40');
                break;
            case '25kg':
                setUomFactor('25');
                break;
            case '20kg':
                setUomFactor('20');
                break;
            case '37.324kg':
                setUomFactor('37.324');
                break;
            case '1000kg':
                setUomFactor('1000');
                break;
            case 'nos':
                setUomFactor('1');
                break;
            default:
                setUomFactor('1');
        }
    }, [uom]);
    
    // Fetch PO number when company changes
    useEffect(() => {
        const fetchPONumber = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const currentYear = new Date().getFullYear();
                const res = await fetch(`http://localhost:5000/api/purchase-orders/next-number/${companyId}/${currentYear}`);
                if (!res.ok) throw new Error('Failed to fetch PO number');
                const data = await res.json();
                setPoNumber(data.poNumber);
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch PO number'
                });
            } finally {
                setLoading(false);
            }
        };
        if (companyId) fetchPONumber();
    }, [companyId]);
    
    // Fetch creditors when company changes
    useEffect(() => {
        const fetchCreditors = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/defaults/creditors/${companyId}`);
                if (!res.ok) throw new Error('Failed to fetch creditors');
                const data = await res.json();
                console.log('Creditors data:', data); // Debug log
                setCreditors(Array.isArray(data) ? data : (data.data || []));
                setFilteredCreditors(Array.isArray(data) ? data : (data.data || []));
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch creditors'
                });
            } finally {
                setLoading(false);
            }
        };
        if (companyId) fetchCreditors();
    }, [companyId]);
    
    // Fetch brokers when company changes
    useEffect(() => {
        const fetchBrokers = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/defaults/brokerAccounts/${companyId}`);
                if (!res.ok) throw new Error('Failed to fetch brokers');
                const data = await res.json();
                console.log('Brokers data:', data); // Debug log
                setBrokers(Array.isArray(data) ? data : (data.data || []));
                setFilteredBrokers(Array.isArray(data) ? data : (data.data || []));
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch brokers'
                });
            } finally {
                setLoading(false);
            }
        };
        if (companyId) fetchBrokers();
    }, [companyId]);
    
    // Fetch raw materials when company changes
    useEffect(() => {
        const fetchRawMaterials = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/defaults/rawMaterials/${companyId}`);
                if (!res.ok) throw new Error('Failed to fetch raw materials');
                const data = await res.json();
                console.log('Raw materials data:', data); // Debug log
                setRawMaterials(Array.isArray(data) ? data : (data.data || []));
                setFilteredRawMaterials(Array.isArray(data) ? data : (data.data || []));
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch raw materials'
                });
            } finally {
                setLoading(false);
            }
        };
        if (companyId) fetchRawMaterials();
    }, [companyId]);
    
    // Fetch creditor level 4 when creditor changes
    useEffect(() => {
        const fetchCreditorLevel4s = async () => {
            if (!companyId || !selectedCreditor) return;
            setLoading(true);
            try {
                const selected = creditors.find(creditor => creditor._id === selectedCreditor);
                if (!selected) return;
                const res = await fetch(
                    `http://localhost:5000/api/accounts/level4/${companyId}/${selected.level1Id}/${selected.level2Id}/${selected.level3Id}`
                );
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch creditor level 4');
                }
                const data = await res.json();
                setCreditorLevel4s(data.data || []);
                setFilteredCreditorLevel4s(data.data || []);
            } catch (err) {
                console.error('Error fetching creditor level 4:', err);
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch creditor level 4'
                });
            } finally {
                setLoading(false);
            }
        };
        if (selectedCreditor) fetchCreditorLevel4s();
    }, [selectedCreditor, companyId, creditors]);
    
    // Fetch broker level 4 when broker changes
    useEffect(() => {
        const fetchBrokerLevel4s = async () => {
            if (!companyId || !selectedBroker) return;
            setLoading(true);
            try {
                const selected = brokers.find(broker => broker._id === selectedBroker);
                if (!selected) return;
                const res = await fetch(
                    `http://localhost:5000/api/accounts/level4/${companyId}/${selected.level1Id}/${selected.level2Id}/${selected.level3Id}`
                );
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch broker level 4');
                }
                const data = await res.json();
                setBrokerLevel4s(data.data || []);
                setFilteredBrokerLevel4s(data.data || []);
            } catch (err) {
                console.error('Error fetching broker level 4:', err);
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch broker level 4'
                });
            } finally {
                setLoading(false);
            }
        };
        if (selectedBroker) fetchBrokerLevel4s();
    }, [selectedBroker, companyId, brokers]);
    
    // Fetch raw material level 4 when raw material changes
    useEffect(() => {
        const fetchRawMaterialLevel4s = async () => {
            if (!companyId || !selectedRawMaterial) return;
            setLoading(true);
            try {
                const selected = rawMaterials.find(material => material._id === selectedRawMaterial);
                if (!selected) return;
                const res = await fetch(
                    `http://localhost:5000/api/accounts/level4/${companyId}/${selected.level1Id}/${selected.level2Id}/${selected.level3Id}`
                );
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch raw material level 4');
                }
                const data = await res.json();
                setRawMaterialLevel4s(data.data || []);
                setFilteredRawMaterialLevel4s(data.data || []);
            } catch (err) {
                console.error('Error fetching raw material level 4:', err);
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch raw material level 4'
                });
            } finally {
                setLoading(false);
            }
        };
        if (selectedRawMaterial) fetchRawMaterialLevel4s();
    }, [selectedRawMaterial, companyId, rawMaterials]);
    
    // Fetch pending orders when creditor and raw material change
    useEffect(() => {
        const fetchPendingOrders = async () => {
            if (!companyId || !selectedCreditor || !selectedRawMaterial) return;
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:5000/api/purchase-orders/pending/${companyId}?creditorId=${selectedCreditor}&rawMaterialId=${selectedRawMaterial}`
                );
                if (!res.ok) throw new Error('Failed to fetch pending orders');
                const data = await res.json();
                setPendingOrders(Array.isArray(data) ? data : (data.data || []));
            } catch (err) {
                console.error('Error fetching pending orders:', err);
                setMessage({
                    type: "error",
                    text: err.message || 'Failed to fetch pending orders'
                });
            } finally {
                setLoading(false);
            }
        };
        if (selectedCreditor && selectedRawMaterial) fetchPendingOrders();
    }, [selectedCreditor, selectedRawMaterial, companyId]);
    
    // Filter creditors based on search term
    useEffect(() => {
        const filtered = creditors.filter(creditor => {
            if (!creditor) return false;
            const title = creditor.title || creditor.name || '';
            const code = creditor.code || '';
            return (
                title.toLowerCase().includes(creditorSearchTerm.toLowerCase()) ||
                code.toLowerCase().includes(creditorSearchTerm.toLowerCase())
            );
        });
        setFilteredCreditors(filtered);
    }, [creditorSearchTerm, creditors]);
    
    // Filter brokers based on search term
    useEffect(() => {
        const filtered = brokers.filter(broker => {
            if (!broker) return false;
            const title = broker.title || broker.name || '';
            const code = broker.code || '';
            return (
                title.toLowerCase().includes(brokerSearchTerm.toLowerCase()) ||
                code.toLowerCase().includes(brokerSearchTerm.toLowerCase())
            );
        });
        setFilteredBrokers(filtered);
    }, [brokerSearchTerm, brokers]);
    
    // Filter raw materials based on search term
    useEffect(() => {
        const filtered = rawMaterials.filter(material => {
            if (!material) return false;
            const title = material.title || material.name || '';
            const code = material.code || '';
            return (
                title.toLowerCase().includes(rawMaterialSearchTerm.toLowerCase()) ||
                code.toLowerCase().includes(rawMaterialSearchTerm.toLowerCase())
            );
        });
        setFilteredRawMaterials(filtered);
    }, [rawMaterialSearchTerm, rawMaterials]);
    
    // Filter creditor level 4 based on search term
    useEffect(() => {
        const filtered = creditorLevel4s.filter(level4 => {
            if (!level4) return false;
            const title = level4.title || level4.name || '';
            const subcode = level4.subcode || '';
            return (
                title.toLowerCase().includes(creditorLevel4SearchTerm.toLowerCase()) ||
                subcode.toLowerCase().includes(creditorLevel4SearchTerm.toLowerCase())
            );
        });
        setFilteredCreditorLevel4s(filtered);
    }, [creditorLevel4SearchTerm, creditorLevel4s]);
    
    // Filter broker level 4 based on search term
    useEffect(() => {
        const filtered = brokerLevel4s.filter(level4 => {
            if (!level4) return false;
            const title = level4.title || level4.name || '';
            const subcode = level4.subcode || '';
            return (
                title.toLowerCase().includes(brokerLevel4SearchTerm.toLowerCase()) ||
                subcode.toLowerCase().includes(brokerLevel4SearchTerm.toLowerCase())
            );
        });
        setFilteredBrokerLevel4s(filtered);
    }, [brokerLevel4SearchTerm, brokerLevel4s]);
    
    // Filter raw material level 4 based on search term
    useEffect(() => {
        const filtered = rawMaterialLevel4s.filter(level4 => {
            if (!level4) return false;
            const title = level4.title || level4.name || '';
            const subcode = level4.subcode || '';
            return (
                title.toLowerCase().includes(rawMaterialLevel4SearchTerm.toLowerCase()) ||
                subcode.toLowerCase().includes(rawMaterialLevel4SearchTerm.toLowerCase())
            );
        });
        setFilteredRawMaterialLevel4s(filtered);
    }, [rawMaterialLevel4SearchTerm, rawMaterialLevel4s]);
    
    // Calculate balance when total or received changes
    useEffect(() => {
        if (totalType === 'bags') {
            const total = parseInt(totalBags) || 0;
            const received = parseInt(receivedBags) || 0;
            setBalanceBags(Math.max(0, total - received).toString());
        } else if (totalType === 'weight') {
            const total = parseFloat(totalWeight) || 0;
            const received = parseFloat(receivedWeight) || 0;
            setBalanceWeight(Math.max(0, total - received).toFixed(2));
        } else if (totalType === 'truck') {
            const total = parseInt(totalTruck) || 0;
            const received = parseInt(receivedTruck) || 0;
            setBalanceTruck(Math.max(0, total - received).toString());
        }
    }, [totalBags, totalWeight, totalTruck, receivedBags, receivedWeight, receivedTruck, totalType]);
    
    // Handle adding a new item to PO
    const handleAddItem = () => {
        if (!selectedRawMaterial || !selectedRawMaterialLevel4 || !exclRate || !inclRate) {
            setMessage({
                type: "error",
                text: "Please select raw material, level 4, and enter both rates"
            });
            return;
        }
        const rawMaterial = rawMaterials.find(material => material._id === selectedRawMaterial);
        const rawMaterialLevel4 = rawMaterialLevel4s.find(level4 => level4._id === selectedRawMaterialLevel4);
        if (!rawMaterial || !rawMaterialLevel4) {
            setMessage({
                type: "error",
                text: "Invalid raw material or level 4 selection"
            });
            return;
        }
        const newItem = {
            id: `temp-${Date.now()}`,
            rawMaterialId: selectedRawMaterial,
            rawMaterialCode: rawMaterial.code,
            rawMaterialTitle: rawMaterial.title || rawMaterial.name || '',
            rawMaterialLevel4Id: selectedRawMaterialLevel4,
            rawMaterialLevel4Code: rawMaterialLevel4.subcode,
            rawMaterialLevel4Title: rawMaterialLevel4.title || rawMaterialLevel4.name || '',
            exclRate: parseFloat(exclRate),
            inclRate: parseFloat(inclRate),
            uom,
            uomFactor, // Added UOM factor
            bagRate: parseFloat(bagRate) || 0,
            bagType,
            paymentMode,
            paymentTerm,
            // Removed freight as requested
            freightChargeBy,
            qualityParameters,
            creditDays: parseInt(creditDays) || 0,
            bagsCriteria
        };
        setPoItems(prev => [...prev, newItem]);
        // Reset form fields
        setSelectedRawMaterial('');
        setSelectedRawMaterialLevel4('');
        setExclRate('');
        setInclRate('');
        setUom('kg');
        setUomFactor('1'); // Reset UOM factor
        setBagRate('');
        setBagType('');
        setPaymentMode('');
        setPaymentTerm('');
        setFreightChargeBy('');
        setQualityParameters('');
        setCreditDays('');
        setBagsCriteria('our');
        setMessage({
            type: "success",
            text: "Item added successfully!"
        });
    };
    
    // Handle removing an item from PO
    const handleRemoveItem = (itemId) => {
        setPoItems(prev => prev.filter(item => item.id !== itemId));
    };
    
    // Handle saving the purchase order
    const handleSavePO = async () => {
        if (!selectedCreditor || !selectedCreditorLevel4 || poItems.length === 0) {
            setMessage({
                type: "error",
                text: "Please select creditor, level 4, and add at least one item"
            });
            return;
        }
        try {
            const creditor = creditors.find(creditor => creditor._id === selectedCreditor);
            const creditorLevel4 = creditorLevel4s.find(level4 => level4._id === selectedCreditorLevel4);
            if (!creditor || !creditorLevel4) {
                setMessage({
                    type: "error",
                    text: "Invalid creditor or level 4 selection"
                });
                return;
            }
            const broker = brokers.find(broker => broker._id === selectedBroker);
            const brokerLevel4 = brokerLevel4s.find(level4 => level4._id === selectedBrokerLevel4);
            const poData = {
                poNumber,
                poDate,
                isCancelled,
                creditorId: selectedCreditor,
                creditorCode: creditor.code,
                creditorTitle: creditor.title || creditor.name || '',
                creditorLevel4Id: selectedCreditorLevel4,
                creditorLevel4Code: creditorLevel4.subcode,
                creditorLevel4Title: creditorLevel4.title || creditorLevel4.name || '',
                brokerId: selectedBroker,
                brokerCode: broker?.code || '',
                brokerTitle: broker?.title || broker?.name || '',
                brokerLevel4Id: selectedBrokerLevel4,
                brokerLevel4Code: brokerLevel4?.subcode || '',
                brokerLevel4Title: brokerLevel4?.title || brokerLevel4?.name || '',
                commissionType,
                commissionValue: parseFloat(commissionValue) || 0,
                items: poItems.map(item => ({
                    rawMaterialId: item.rawMaterialId,
                    rawMaterialCode: item.rawMaterialCode,
                    rawMaterialTitle: item.rawMaterialTitle,
                    rawMaterialLevel4Id: item.rawMaterialLevel4Id,
                    rawMaterialLevel4Code: item.rawMaterialLevel4Code,
                    rawMaterialLevel4Title: item.rawMaterialLevel4Title,
                    exclRate: item.exclRate,
                    inclRate: item.inclRate,
                    uom: item.uom,
                    uomFactor: item.uomFactor, // Added UOM factor
                    bagRate: item.bagRate,
                    bagType: item.bagType,
                    paymentMode: item.paymentMode,
                    paymentTerm: item.paymentTerm,
                    // Removed freight as requested
                    freightChargeBy: item.freightChargeBy,
                    qualityParameters: item.qualityParameters,
                    creditDays: item.creditDays,
                    bagsCriteria: item.bagsCriteria
                })),
                totalType,
                totalBags: parseInt(totalBags) || 0,
                totalWeight: parseFloat(totalWeight) || 0,
                totalTruck: parseInt(totalTruck) || 0,
                receivedBags: parseInt(receivedBags) || 0,
                receivedWeight: parseFloat(receivedWeight) || 0,
                receivedTruck: parseInt(receivedTruck) || 0,
                balanceBags: parseInt(balanceBags) || 0,
                balanceWeight: parseFloat(balanceWeight) || 0,
                balanceTruck: parseInt(balanceTruck) || 0,
                minQuantity: parseFloat(minQuantity) || 0,
                maxQuantity: parseFloat(maxQuantity) || 0,
                remarks,
                createdBy: username,
                updatedBy: username
            };
            const res = await fetch(`http://localhost:5000/api/purchase-orders/${companyId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(poData)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save purchase order');
            }
            const data = await res.json();
            setMessage({
                type: "success",
                text: "Purchase order saved successfully!"
            });
            // Reset form
            setPoNumber(data.nextPoNumber || '');
            setPoDate(new Date().toISOString().split('T')[0]);
            setIsCancelled(false);
            setSelectedCreditor('');
            setSelectedCreditorLevel4('');
            setSelectedBroker('');
            setSelectedBrokerLevel4('');
            setCommissionType('weight');
            setCommissionValue('');
            setPoItems([]);
            setTotalType('bags');
            setTotalBags('');
            setTotalWeight('');
            setTotalTruck('');
            setReceivedBags('');
            setReceivedWeight('');
            setReceivedTruck('');
            setBalanceBags('');
            setBalanceWeight('');
            setBalanceTruck('');
            setMinQuantity('');
            setMaxQuantity('');
            setRemarks('');
        } catch (err) {
            console.error('Error saving purchase order:', err);
            setMessage({
                type: "error",
                text: err.message || 'Failed to save purchase order'
            });
        }
    };
    
    // Handle cancelling the purchase order
    const handleCancelPO = async () => {
        if (!poNumber) {
            setMessage({
                type: "error",
                text: "No purchase order to cancel"
            });
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/purchase-orders/cancel/${companyId}/${poNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    updatedBy: username
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to cancel purchase order');
            }
            setIsCancelled(true);
            setMessage({
                type: "success",
                text: "Purchase order cancelled successfully!"
            });
        } catch (err) {
            console.error('Error cancelling purchase order:', err);
            setMessage({
                type: "error",
                text: err.message || 'Failed to cancel purchase order'
            });
        }
    };
    
    // Handle refresh
    const handleRefresh = () => {
        window.location.reload();
    };
    
    // Helper functions for display
    const getSelectedCreditorName = () => {
        const selected = creditors.find(creditor => creditor._id === selectedCreditor);
        if (!selected) return 'Select Creditor';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.code || ''} - ${title}`;
    };
    
    const getSelectedCreditorLevel4Name = () => {
        const selected = creditorLevel4s.find(level4 => level4._id === selectedCreditorLevel4);
        if (!selected) return 'Select Level 4';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.subcode || ''} - ${title}`;
    };
    
    const getSelectedBrokerName = () => {
        const selected = brokers.find(broker => broker._id === selectedBroker);
        if (!selected) return 'Select Broker';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.code || ''} - ${title}`;
    };
    
    const getSelectedBrokerLevel4Name = () => {
        const selected = brokerLevel4s.find(level4 => level4._id === selectedBrokerLevel4);
        if (!selected) return 'Select Level 4';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.subcode || ''} - ${title}`;
    };
    
    const getSelectedRawMaterialName = () => {
        const selected = rawMaterials.find(material => material._id === selectedRawMaterial);
        if (!selected) return 'Select Raw Material';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.code || ''} - ${title}`;
    };
    
    const getSelectedRawMaterialLevel4Name = () => {
        const selected = rawMaterialLevel4s.find(level4 => level4._id === selectedRawMaterialLevel4);
        if (!selected) return 'Select Level 4';
        // Try different possible property names for the title
        const title = selected.title || selected.name || selected.displayName || selected.label || '';
        return `${selected.subcode || ''} - ${title}`;
    };
    
    // Helper function to get bag type label
    const getBagTypeLabel = (value) => {
        const option = bagTypeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };
    
    // Ultra compact styling with purple theme
    const inputClass = "w-full p-0.5 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-[10px] h-6";
    const labelClass = "block text-[8px] font-medium text-purple-700 dark:text-purple-300 mb-0";
    const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-1 rounded-sm shadow mb-1 border border-purple-100 dark:border-purple-900";
    const sectionTitleClass = "text-[9px] font-semibold text-purple-800 dark:text-purple-300 mb-0.5 flex items-center gap-0.5";
    const buttonClass = "flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-colors duration-200 text-[10px]";
    const tableHeaderClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-0.5 text-left font-medium text-[9px]";
    const tableCellClass = "p-0.5 border-t border-purple-200 dark:border-purple-700 text-[9px]";
    
    return (
        <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-0.5">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-0.5">
                    <h1 className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-0 flex items-center justify-center gap-0.5">
                        <FileText className="w-2 h-2" />
                        Purchase Order
                    </h1>
                    <p className="text-[8px] text-purple-500 dark:text-purple-400">
                        Create and manage purchase orders
                    </p>
                </div>
                <div className="flex justify-end mb-0.5">
                    <button
                        onClick={handleRefresh}
                        className={`${buttonClass} h-6`}
                    >
                        <RefreshCw className="w-2 h-2" />
                        Refresh
                    </button>
                </div>
                {message && (
                    <div className={`mb-1 p-0.5 rounded-sm text-white font-medium shadow-md flex items-center gap-0.5 text-[9px] ${message.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
                        {message.type === "success" ? (
                            <CheckCircle2 className="w-2 h-2" />
                        ) : (
                            <AlertCircle className="w-2 h-2" />
                        )}
                        {message.text}
                    </div>
                )}
                {/* Section 1: PO Header */}
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>
                        <FileText className="text-purple-600 w-2 h-2" />
                        PO Header
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {/* PO Number */}
                        <div>
                            <label className={labelClass}>PO Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={poNumber}
                                    onChange={(e) => setPoNumber(e.target.value)}
                                    className={`${inputClass} bg-gray-100 dark:bg-gray-700`}
                                    disabled
                                />
                            </div>
                        </div>
                        {/* PO Date */}
                        <div>
                            <label className={labelClass}>PO Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={poDate}
                                    onChange={(e) => setPoDate(e.target.value)}
                                    className={inputClass}
                                />
                                <CalendarIcon className="absolute right-0.5 top-1 h-2 w-2 text-purple-400" />
                            </div>
                        </div>
                        {/* PO Cancellation */}
                        <div className="flex items-end">
                            <button
                                onClick={handleCancelPO}
                                disabled={isCancelled || !poNumber}
                                className={`${buttonClass} w-full ${isCancelled || !poNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Ban className="w-2 h-2" />
                                {isCancelled ? 'Cancelled' : 'Cancel PO'}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                        {/* Creditor Combobox */}
                        <div className="relative">
                            <label className={labelClass}>Creditor</label>
                            <button
                                type="button"
                                onClick={() => setIsCreditorComboboxOpen(!isCreditorComboboxOpen)}
                                className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                                disabled={loading || !companyId}
                            >
                                <span className="truncate text-[10px]">{getSelectedCreditorName()}</span>
                                {selectedCreditor ? (
                                    <X
                                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCreditor('');
                                            setSelectedCreditorLevel4('');
                                            setCreditorLevel4s([]);
                                        }}
                                    />
                                ) : (
                                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                                )}
                            </button>
                            {isCreditorComboboxOpen && (
                                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                                        <input
                                            type="text"
                                            placeholder="Search creditors..."
                                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                                            value={creditorSearchTerm}
                                            onChange={(e) => setCreditorSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredCreditors.length > 0 ? (
                                        <ul>
                                            {filteredCreditors.map((creditor) => (
                                                <li
                                                    key={creditor._id}
                                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${creditor._id === selectedCreditor ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCreditor(creditor._id);
                                                        setIsCreditorComboboxOpen(false);
                                                        setCreditorSearchTerm('');
                                                        setSelectedCreditorLevel4('');
                                                    }}
                                                >
                                                    <div className="font-medium">{creditor.code || ''} - {creditor.title || creditor.name || ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                                            No creditors found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Creditor Level 4 Combobox */}
                        <div className="relative">
                            <label className={labelClass}>Creditor Level 4</label>
                            <button
                                type="button"
                                onClick={() => selectedCreditor && setIsCreditorLevel4ComboboxOpen(!isCreditorLevel4ComboboxOpen)}
                                className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedCreditor ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                disabled={loading || !companyId || !selectedCreditor}
                            >
                                <span className="truncate text-[10px]">{getSelectedCreditorLevel4Name()}</span>
                                {selectedCreditorLevel4 ? (
                                    <X
                                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCreditorLevel4('');
                                        }}
                                    />
                                ) : (
                                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                                )}
                            </button>
                            {isCreditorLevel4ComboboxOpen && selectedCreditor && (
                                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                                        <input
                                            type="text"
                                            placeholder="Search level 4..."
                                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                                            value={creditorLevel4SearchTerm}
                                            onChange={(e) => setCreditorLevel4SearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredCreditorLevel4s.length > 0 ? (
                                        <ul>
                                            {filteredCreditorLevel4s.map((level4) => (
                                                <li
                                                    key={level4._id}
                                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${level4._id === selectedCreditorLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCreditorLevel4(level4._id);
                                                        setIsCreditorLevel4ComboboxOpen(false);
                                                        setCreditorLevel4SearchTerm('');
                                                    }}
                                                >
                                                    <div className="font-medium">{level4.subcode || ''} - {level4.title || level4.name || ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                                            {creditorLevel4s.length === 0 ? 'No level 4 found for this creditor' : 'No matching level 4 found'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Section 2: Broker Information */}
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>
                        <User className="text-purple-600 w-2 h-2" />
                        Broker Information
                    </h2>
                    {/* All widgets in a single row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mt-1">
                        
                        {/* Broker Combobox */}
                        <div className="relative">
                            <label className={labelClass}>Broker</label>
                            <button
                                type="button"
                                onClick={() => setIsBrokerComboboxOpen(!isBrokerComboboxOpen)}
                                className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                                disabled={loading || !companyId}
                            >
                                <span className="truncate text-[10px]">{getSelectedBrokerName()}</span>
                                {selectedBroker ? (
                                    <X
                                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBroker('');
                                            setSelectedBrokerLevel4('');
                                            setBrokerLevel4s([]);
                                        }}
                                    />
                                ) : (
                                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                                )}
                            </button>
                            {isBrokerComboboxOpen && (
                                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                                        <input
                                            type="text"
                                            placeholder="Search brokers..."
                                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                                            value={brokerSearchTerm}
                                            onChange={(e) => setBrokerSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredBrokers.length > 0 ? (
                                        <ul>
                                            {filteredBrokers.map((broker) => (
                                                <li
                                                    key={broker._id}
                                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${broker._id === selectedBroker ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                                    onClick={() => {
                                                        setSelectedBroker(broker._id);
                                                        setIsBrokerComboboxOpen(false);
                                                        setBrokerSearchTerm('');
                                                        setSelectedBrokerLevel4('');
                                                    }}
                                                >
                                                    <div className="font-medium">{broker.code || ''} - {broker.title || broker.name || ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                                            No brokers found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Broker Level 4 Combobox */}
                        <div className="relative">
                            <label className={labelClass}>Broker Level 4</label>
                            <button
                                type="button"
                                onClick={() => selectedBroker && setIsBrokerLevel4ComboboxOpen(!isBrokerLevel4ComboboxOpen)}
                                className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedBroker ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading || !companyId || !selectedBroker}
                            >
                                <span className="truncate text-[10px]">{getSelectedBrokerLevel4Name()}</span>
                                {selectedBrokerLevel4 ? (
                                    <X
                                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBrokerLevel4('');
                                        }}
                                    />
                                ) : (
                                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                                )}
                            </button>
                            {isBrokerLevel4ComboboxOpen && selectedBroker && (
                                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                                        <input
                                            type="text"
                                            placeholder="Search level 4..."
                                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                                            value={brokerLevel4SearchTerm}
                                            onChange={(e) => setBrokerLevel4SearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredBrokerLevel4s.length > 0 ? (
                                        <ul>
                                            {filteredBrokerLevel4s.map((level4) => (
                                                <li
                                                    key={level4._id}
                                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${level4._id === selectedBrokerLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                                    onClick={() => {
                                                        setSelectedBrokerLevel4(level4._id);
                                                        setIsBrokerLevel4ComboboxOpen(false);
                                                        setBrokerLevel4SearchTerm('');
                                                    }}
                                                >
                                                    <div className="font-medium">{level4.subcode || ''} - {level4.title || level4.name || ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                                            {brokerLevel4s.length === 0 ? 'No level 4 found for this broker' : 'No matching level 4 found'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Commission Type */}
                        <div>
                            <label className={labelClass}>Commission Type</label>
                            <select
                                value={commissionType}
                                onChange={(e) => setCommissionType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="weight">Weight</option>
                                <option value="value">Value</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {/* Commission Value */}
                        <div>
                            <label className={labelClass}>Commission Value</label>
                            <input
                                type="number"
                                value={commissionValue}
                                onChange={(e) => setCommissionValue(e.target.value)}
                                className={inputClass}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
{/* Section 3: Raw Material */}
<div className={sectionClass}>
    <h2 className={sectionTitleClass}>
        <Package className="text-purple-600 w-2 h-2" />
        Raw Material
    </h2>
    
    {/* Row 1 */}
    <div className="grid grid-cols-1 md:grid-cols-6 gap-1 mt-1">
        {/* 1. Raw Material */}
        <div className="relative col-span-1 md:col-span-2">
            <label className={labelClass}>Raw Material</label>
            <button
                type="button"
                onClick={() => setIsRawMaterialComboboxOpen(!isRawMaterialComboboxOpen)}
                className={`${inputClass} flex items-center justify-between cursor-pointer text-left`}
                disabled={loading || !companyId}
            >
                <span className="truncate text-[10px]">{getSelectedRawMaterialName()}</span>
                {selectedRawMaterial ? (
                    <X
                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRawMaterial('');
                            setSelectedRawMaterialLevel4('');
                            setRawMaterialLevel4s([]);
                        }}
                    />
                ) : (
                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                )}
            </button>
            {isRawMaterialComboboxOpen && (
                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                        <input
                            type="text"
                            placeholder="Search raw materials..."
                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                            value={rawMaterialSearchTerm}
                            onChange={(e) => setRawMaterialSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {filteredRawMaterials.length > 0 ? (
                        <ul>
                            {filteredRawMaterials.map((material) => (
                                <li
                                    key={material._id}
                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${material._id === selectedRawMaterial ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                    onClick={() => {
                                        setSelectedRawMaterial(material._id);
                                        setIsRawMaterialComboboxOpen(false);
                                        setRawMaterialSearchTerm('');
                                        setSelectedRawMaterialLevel4('');
                                    }}
                                >
                                    <div className="font-medium">{material.code || ''} - {material.title || material.name || ''}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                            No raw materials found
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* 2. Raw Material Level 4 */}
        <div className="relative col-span-1 md:col-span-2">
            <label className={labelClass}>Raw Material Level 4</label>
            <button
                type="button"
                onClick={() => selectedRawMaterial && setIsRawMaterialLevel4ComboboxOpen(!isRawMaterialLevel4ComboboxOpen)}
                className={`${inputClass} flex items-center justify-between cursor-pointer text-left ${!selectedRawMaterial ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading || !companyId || !selectedRawMaterial}
            >
                <span className="truncate text-[10px]">{getSelectedRawMaterialLevel4Name()}</span>
                {selectedRawMaterialLevel4 ? (
                    <X
                        className="w-2 h-2 text-purple-500 hover:text-purple-700 flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRawMaterialLevel4('');
                        }}
                    />
                ) : (
                    <ChevronDown className="w-2 h-2 text-purple-500 flex-shrink-0" />
                )}
            </button>
            {isRawMaterialLevel4ComboboxOpen && selectedRawMaterial && (
                <div className="absolute z-20 mt-0.5 w-full bg-white dark:bg-gray-800 rounded-sm shadow border border-purple-200 dark:border-purple-700 max-h-24 overflow-auto">
                    <div className="p-0.5 sticky top-0 bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700">
                        <input
                            type="text"
                            placeholder="Search level 4..."
                            className="w-full p-0.5 rounded border border-purple-300 dark:border-purple-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-[9px]"
                            value={rawMaterialLevel4SearchTerm}
                            onChange={(e) => setRawMaterialLevel4SearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {filteredRawMaterialLevel4s.length > 0 ? (
                        <ul>
                            {filteredRawMaterialLevel4s.map((level4) => (
                                <li
                                    key={level4._id}
                                    className={`p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-[9px] ${level4._id === selectedRawMaterialLevel4 ? 'bg-purple-50 dark:bg-purple-900' : ''}`}
                                    onClick={() => {
                                        setSelectedRawMaterialLevel4(level4._id);
                                        setIsRawMaterialLevel4ComboboxOpen(false);
                                        setRawMaterialLevel4SearchTerm('');
                                    }}
                                >
                                    <div className="font-medium">{level4.subcode || ''} - {level4.title || level4.name || ''}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-0.5 text-center text-purple-500 dark:text-purple-400 text-[8px]">
                            {rawMaterialLevel4s.length === 0 ? 'No level 4 found for this raw material' : 'No matching level 4 found'}
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* 3. Excl. Rate */}
        <div>
            <label className={labelClass}>Excl. Rate</label>
            <input
                type="number"
                value={exclRate}
                onChange={(e) => setExclRate(e.target.value)}
                className={inputClass}
                min="0"
                step="0.01"
            />
        </div>
        
        {/* 4. Incl. Rate */}
        <div>
            <label className={labelClass}>Incl. Rate</label>
            <input
                type="number"
                value={inclRate}
                onChange={(e) => setInclRate(e.target.value)}
                className={inputClass}
                min="0"
                step="0.01"
            />
        </div>
    </div>
    
    {/* Row 2 */}
    <div className="grid grid-cols-1 md:grid-cols-6 gap-1 mt-1">
        {/* 5. UOM */}
        <div>
            <label className={labelClass}>UOM</label>
            <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className={inputClass}
            >
                <option value="kg">kg</option>
                <option value="40kg">40kg</option>
                <option value="25kg">25kg</option>
                <option value="20kg">20kg</option>
                <option value="37.324kg">37.324kg</option>
                <option value="1000kg">1000kg</option>
                <option value="nos">nos</option>
            </select>
        </div>
        
        {/* 6. UOM Factor */}
        <div>
            <label className={labelClass}>Factor</label>
            <input
                type="text"
                value={uomFactor}
                onChange={(e) => setUomFactor(e.target.value)}
                className={`${inputClass} bg-gray-100 dark:bg-gray-700`}
                disabled
            />
        </div>
        
        {/* 7. Freight Term */}
        <div>
            <label className={labelClass}>Freight Term</label>
            <select
                value={freightChargeBy}
                onChange={(e) => setFreightChargeBy(e.target.value)}
                className={inputClass}
            >
                <option value="">Select</option>
                <option value="Mill">Mill</option>
                <option value="Ex-Mill">Ex-Mill</option>
            </select>
        </div>
        
        {/* 8. Bags Criteria */}
        <div>
            <label className={labelClass}>Bags Criteria</label>
            <select
                value={bagsCriteria}
                onChange={(e) => setBagsCriteria(e.target.value)}
                className={inputClass}
            >
                <option value="our">Our</option>
                <option value="party">Party</option>
            </select>
        </div>
        
        {/* 9. Bag Type */}
        <div>
            <label className={labelClass}>Bag Type</label>
            <select
                value={bagType}
                onChange={(e) => setBagType(e.target.value)}
                className={inputClass}
            >
                <option value="">Select</option>
                {bagTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
        
        {/* 10. Bag Rate */}
        <div>
            <label className={labelClass}>Bag Rate</label>
            <input
                type="number"
                value={bagRate}
                onChange={(e) => setBagRate(e.target.value)}
                className={inputClass}
                min="0"
                step="0.01"
            />
        </div>
    </div>
    
    {/* Row 3 */}
    <div className="grid grid-cols-1 md:grid-cols-6 gap-1 mt-1">
        {/* 11. Payment Mode */}
        <div>
            <label className={labelClass}>Payment Mode</label>
            <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={inputClass}
            >
                <option value="">Select</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="DD">DD</option>
                <option value="PO">PO</option>
            </select>
        </div>
        
        {/* 12. Payment Term */}
        <div>
            <label className={labelClass}>Payment Term</label>
            <input
                type="text"
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value)}
                className={inputClass}
            />
        </div>
        
        {/* 13. Quality Parameters */}
        <div>
            <label className={labelClass}>Quality Parameters</label>
            <input
                type="text"
                value={qualityParameters}
                onChange={(e) => setQualityParameters(e.target.value)}
                className={inputClass}
            />
        </div>
        
        {/* 14. Credit Days */}
        <div>
            <label className={labelClass}>Credit Days</label>
            <input
                type="number"
                value={creditDays}
                onChange={(e) => setCreditDays(e.target.value)}
                className={inputClass}
                min="0"
            />
        </div>
    </div>
    
    {/* Add Item Button */}
    <div className="mt-1">
        <button
            type="button"
            onClick={handleAddItem}
            className={`${buttonClass} w-full`}
        >
            <Plus className="w-2 h-2" />
            Add Item
        </button>
    </div>
</div>
                {/* PO Items Table */}
                {poItems.length > 0 && (
                    <div className={sectionClass}>
                        <h2 className={sectionTitleClass}>
                            <Package className="text-purple-600 w-2 h-2" />
                            PO Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className={tableHeaderClass}>Raw Material</th>
                                        <th className={tableHeaderClass}>Level 4</th>
                                        <th className={tableHeaderClass}>Excl. Rate</th>
                                        <th className={tableHeaderClass}>Incl. Rate</th>
                                        <th className={tableHeaderClass}>UOM</th>
                                        <th className={tableHeaderClass}>Bag Type</th>
                                        <th className={tableHeaderClass}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-purple-100 dark:hover:bg-purple-900/50"
                                        >
                                            <td className={tableCellClass}>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-[9px]">
                                                        {item.rawMaterialCode} - {item.rawMaterialTitle}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[9px]">
                                                        {item.rawMaterialLevel4Code} - {item.rawMaterialLevel4Title}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {item.exclRate.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {item.inclRate.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {item.uom}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {item.bagType ? getBagTypeLabel(item.bagType) : '-'}
                                                </div>
                                            </td>
                                            <td className={`${tableCellClass} whitespace-nowrap`}>
                                                <div className="flex gap-0.5">
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-0 rounded-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-2 h-2 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Pending Orders */}
                {pendingOrders.length > 0 && (
                    <div className={sectionClass}>
                        <h2 className={sectionTitleClass}>
                            <AlertCircle className="text-purple-600 w-2 h-2" />
                            Pending Orders
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className={tableHeaderClass}>PO Number</th>
                                        <th className={tableHeaderClass}>Date</th>
                                        <th className={tableHeaderClass}>Raw Material</th>
                                        <th className={tableHeaderClass}>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-purple-100 dark:hover:bg-purple-900/50"
                                        >
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {order.poNumber}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {new Date(order.poDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {order.items.map(item => `${item.rawMaterialCode} - ${item.rawMaterialTitle}`).join(', ')}
                                                </div>
                                            </td>
                                            <td className={tableCellClass}>
                                                <div className="text-[9px]">
                                                    {order.totalType === 'bags' ? `${order.balanceBags} bags` :
                                                        order.totalType === 'weight' ? `${order.balanceWeight} kg` :
                                                            `${order.balanceTruck} trucks`}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Section 4: Total/Received/Balance */}
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>
                        <Weight className="text-purple-600 w-2 h-2" />
                        Quantity Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {/* Total Type */}
                        <div>
                            <label className={labelClass}>Total Type</label>
                            <select
                                value={totalType}
                                onChange={(e) => setTotalType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="bags">Bags</option>
                                <option value="weight">Weight</option>
                                <option value="truck">Truck</option>
                            </select>
                        </div>
                        {/* Min Quantity */}
                        <div>
                            <label className={labelClass}>Min Quantity</label>
                            <input
                                type="number"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                                className={inputClass}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {/* Max Quantity */}
                        <div>
                            <label className={labelClass}>Max Quantity</label>
                            <input
                                type="number"
                                value={maxQuantity}
                                onChange={(e) => setMaxQuantity(e.target.value)}
                                className={inputClass}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="mt-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                            {/* Labels */}
                            <div></div>
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300 text-center">Bags</div>
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300 text-center">Weight (kg)</div>
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300 text-center">Truck</div>
                            {/* Total Row */}
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300">Total</div>
                            <div>
                                <input
                                    type="number"
                                    value={totalBags}
                                    onChange={(e) => setTotalBags(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    disabled={totalType !== 'bags'}
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={totalWeight}
                                    onChange={(e) => setTotalWeight(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    step="0.01"
                                    disabled={totalType !== 'weight'}
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={totalTruck}
                                    onChange={(e) => setTotalTruck(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    disabled={totalType !== 'truck'}
                                />
                            </div>
                            {/* Received Row */}
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300">Received</div>
                            <div>
                                <input
                                    type="number"
                                    value={receivedBags}
                                    onChange={(e) => setReceivedBags(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    disabled={totalType !== 'bags'}
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={receivedWeight}
                                    onChange={(e) => setReceivedWeight(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    step="0.01"
                                    disabled={totalType !== 'weight'}
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={receivedTruck}
                                    onChange={(e) => setReceivedTruck(e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    disabled={totalType !== 'truck'}
                                />
                            </div>
                            {/* Balance Row */}
                            <div className="text-[9px] font-medium text-purple-700 dark:text-purple-300">Balance</div>
                            <div>
                                <input
                                    type="number"
                                    value={balanceBags}
                                    onChange={(e) => setBalanceBags(e.target.value)}
                                    className={`${inputClass} bg-gray-100 dark:bg-gray-700`}
                                    min="0"
                                    disabled
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={balanceWeight}
                                    onChange={(e) => setBalanceWeight(e.target.value)}
                                    className={`${inputClass} bg-gray-100 dark:bg-gray-700`}
                                    min="0"
                                    step="0.01"
                                    disabled
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={balanceTruck}
                                    onChange={(e) => setBalanceTruck(e.target.value)}
                                    className={`${inputClass} bg-gray-100 dark:bg-gray-700`}
                                    min="0"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                    {/* Remarks */}
                    <div className="mt-1">
                        <label className={labelClass}>Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full p-0.5 rounded-sm border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-[9px]"
                            rows="1"
                        ></textarea>
                    </div>
                </div>
                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSavePO}
                        disabled={loading || poItems.length === 0}
                        className={`${buttonClass} px-1 py-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <RefreshCw className="w-2 h-2 animate-spin" />
                        ) : (
                            <Save className="w-2 h-2" />
                        )}
                        Save Purchase Order
                    </button>
                </div>
            </div>
        </div>
    );
}