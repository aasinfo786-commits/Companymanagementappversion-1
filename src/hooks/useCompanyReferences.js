// 📁 src/hooks/useCompanyReferences.js
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useCompanyReferences = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Delete company with reference check
  const deleteCompanyWithCheck = async (companyId, companyData, onDeleteSuccess) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await axios.delete(`http://localhost:5000/api/companies/${companyData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Company deleted successfully!");
      onDeleteSuccess();
      return true;
    } catch (err) {
      console.error("Error deleting company:", err);
      
      // Handle reference error specifically
      if (err.response?.status === 400 && err.response?.data?.references) {
        const references = err.response.data.references;
        let errorMessage = "Cannot delete this company. It's referenced in:\n\n";
        
        Object.entries(references).forEach(([model, count]) => {
          // Format model name to be more readable
          const modelName = model.replace(/([A-Z])/g, ' $1').trim();
          errorMessage += `• ${count} ${modelName.toLowerCase()}(s)\n`;
        });
        
        errorMessage += "\nPlease remove these references first.";
        
        toast.error(errorMessage, {
          duration: 8000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }
        });
      } else {
        // Handle other errors
        toast.error(err.response?.data?.message || "Failed to delete company");
      }
      
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    deleteCompanyWithCheck
  };
};

export default useCompanyReferences;