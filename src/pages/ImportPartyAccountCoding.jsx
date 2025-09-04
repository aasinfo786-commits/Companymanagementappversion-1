import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  FileSpreadsheet,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Hash,
  FileText,
  FolderOpen,
  Info,
  Copy,
  SkipForward,
  Package
} from 'lucide-react';

export default function ExcelToModel() {
  const { companyId, username } = useAppContext();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [importType, setImportType] = useState('party'); // 'party' or 'item'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    excelFile: null
  });
  
  const inputClass = "w-full p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-sm transition-all duration-300 text-sm";
  const sectionClass = "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow mb-4 border border-purple-100 dark:border-purple-900";
  const sectionTitleClass = "text-base font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2";
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, excelFile: file }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setResult({
        type: "error",
        message: "Please select a company first"
      });
      return;
    }
    
    if (!formData.excelFile) {
      setResult({
        type: "error",
        message: "Please select an Excel file"
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('excelFile', formData.excelFile);
      formDataObj.append('companyId', companyId);
      formDataObj.append('importType', importType); // Add import type to form data
      formDataObj.append('createdBy', username || "");
      formDataObj.append('updatedBy', username || "");
      
      // Use single API endpoint for both party and item
      const res = await fetch(`http://localhost:5000/api/import-partyaccount-coding/account-level4`, {
        method: 'POST',
        body: formDataObj
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error processing Excel file');
      
      setResult({
        type: "success",
        data: json
      });
      
      // Reset form after successful submission
      setFormData({
        excelFile: null
      });
    } catch (err) {
      setResult({
        type: "error",
        message: err.message || 'Failed to process Excel file'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setIsFormOpen(false);
    setFormData({
      excelFile: null
    });
    setResult(null);
  };
  
  const openFormWithType = (type) => {
    setImportType(type);
    setIsFormOpen(true);
  };
  
  const ProcessingResult = ({ result }) => {
    if (result.type === "error") {
      return (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium shadow-md flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {result.message}
        </div>
      );
    }
    
    const { data } = result;
    const isSuccess = data.successCount > 0;
    const hasErrors = data.errorCount > 0;
    const hasDuplicates = data.duplicateCount > 0;
    const hasSkipped = data.skippedCount > 0;
    
    return (
      <div className="mb-4 space-y-3">
        {/* Main message */}
        <div className={`p-3 rounded-lg font-medium shadow-md flex items-center gap-2 text-sm ${
          isSuccess 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
            : "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {data.message}
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-green-200 dark:border-green-900">
            <div className="text-green-600 dark:text-green-400 font-medium text-sm">Success</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{data.successCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Records created</div>
          </div>
          
          {hasDuplicates && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-yellow-200 dark:border-yellow-900">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium text-sm">Duplicates</div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{data.duplicateCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Records skipped</div>
            </div>
          )}
          
          {hasSkipped && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-blue-200 dark:border-blue-900">
              <div className="text-blue-600 dark:text-blue-400 font-medium text-sm">Skipped</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.skippedCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Missing data</div>
            </div>
          )}
          
          {hasErrors && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-red-200 dark:border-red-900">
              <div className="text-red-600 dark:text-red-400 font-medium text-sm">Errors</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{data.errorCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Records failed</div>
            </div>
          )}
        </div>
        
        {/* Duplicates details */}
        {hasDuplicates && data.duplicates && data.duplicates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium mb-2">
              <Copy className="w-4 h-4" />
              Duplicate Records (First {data.duplicates.length} shown)
            </div>
            <div className="max-h-40 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {data.duplicates.map((dup, index) => (
                <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-800">
                  <div className="font-medium">Duplicate found:</div>
                  {importType === 'party' ? (
                    <>
                      <div>Party Code: {dup.row.partyCode}</div>
                      <div>Party Subcode: {dup.row.partySubCode}</div>
                      <div>Party Name: {dup.row.partyName}</div>
                    </>
                  ) : (
                    <>
                      <div>Item Code: {dup.row.itemCode}</div>
                      <div>Item Subcode: {dup.row.itemSubCode}</div>
                      <div>Item Name: {dup.row.itemName}</div>
                    </>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Existing record: {dup.existingRecord.code}-{dup.existingRecord.subcode} ({dup.existingRecord.title})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skipped records details */}
        {hasSkipped && data.skipped && data.skipped.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-2">
              <SkipForward className="w-4 h-4" />
              Skipped Records (First {data.skipped.length} shown)
            </div>
            <div className="max-h-40 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {data.skipped.map((skip, index) => (
                <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                  <div className="font-medium">Skipped: {skip.reason}</div>
                  {skip.missingFields && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Missing: {Object.entries(skip.missingFields)
                        .filter(([_, missing]) => missing)
                        .map(([field, _]) => field)
                        .join(', ')}
                    </div>
                  )}
                  <div>Row data: {JSON.stringify(skip.row)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Errors details */}
        {hasErrors && data.errors && data.errors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              Error Details
            </div>
            <div className="max-h-40 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {data.errors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="ml-0 md:ml-64 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 md:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Party And Item A/C Coding
          </h1>
          <p className="text-sm text-purple-500 dark:text-purple-400">
            Import Party and Item Account data from Excel files
          </p>
        </div>
        
        {result && <ProcessingResult result={result} />}
        
        {!isFormOpen ? (
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => openFormWithType('party')}
              disabled={loading || !companyId}
              className={`flex gap-2 items-center px-6 py-3 rounded-lg text-white transition-all duration-300 ${(!companyId) ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Import Party A/C
            </button>
            <button
              type="button"
              onClick={() => openFormWithType('item')}
              // disabled={loading || !companyId}
              className={`flex gap-2 items-center px-6 py-3 rounded-lg text-white transition-all duration-300 ${(!companyId) ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'}`}
              disabled
            >
              <Package className="w-5 h-5" />
              Import Item A/C
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Excel File Upload Section */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>
                <FolderOpen className="text-purple-600 w-4 h-4" />
                Excel File Upload
              </h2>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Select Excel File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-purple-500" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        XLSX, XLS (MAX. 5MB)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.excelFile && (
                  <div className="mt-2 text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {formData.excelFile.name}
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Required Columns</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {importType === 'party' ? (
                    <>
                      Your Excel file must contain the following columns: <span className="font-mono">partyCode</span>, <span className="font-mono">partySubCode</span>, and <span className="font-mono">partyName</span>
                    </>
                  ) : (
                    <>
                      Your Excel file must contain the following columns: <span className="font-mono">itemCode</span>, <span className="font-mono">itemSubCode</span>, and <span className="font-mono">itemName</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="flex gap-1 items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-300 text-sm hover:from-gray-600 hover:to-gray-700"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !companyId || !formData.excelFile}
                className={`flex gap-1 items-center px-4 py-2 rounded-lg text-white transition-all duration-300 text-sm ${loading ? 'bg-gradient-to-r from-purple-400 to-indigo-400' : importType === 'party' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {importType === 'party' ? 'Process Party A/C Data' : 'Process Item A/C Data'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        {!companyId && (
          <div className="mt-4 p-4 text-center text-purple-500 dark:text-purple-400 bg-white dark:bg-gray-800 rounded-lg shadow border border-purple-200 dark:border-purple-700 text-sm">
            Please select a company to import {importType === 'party' ? 'Party A/C' : 'Item A/C'} data
          </div>
        )}
      </div>
    </div>
  );
}