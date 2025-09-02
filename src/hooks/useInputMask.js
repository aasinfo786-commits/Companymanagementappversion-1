import { useState, useCallback } from 'react';

const useInputMask = (initialValue, maskType) => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((e) => {
    let newValue = e.target.value;
    
    switch (maskType) {
      case 'code':
        // Only allow 2 digits
        newValue = newValue.replace(/\D/g, '').substring(0, 2);
        break;
        
      case 'code3':
        // Only allow 3 digits
        newValue = newValue.replace(/\D/g, '').substring(0, 3);
        break;
        
      case 'subcode5':
        // Only allow 5 digits
        newValue = newValue.replace(/\D/g, '').substring(0, 5);
        break;
        
      case 'companyId':
        // Only allow 2 digits
        newValue = newValue.replace(/\D/g, '').substring(0, 2);
        break;
        
      case 'phone':
        // Format: + followed by 16 digits
        if (newValue === '') {
          newValue = '';
        } else {
          if (newValue[0] !== '+') {
            const digits = newValue.replace(/\D/g, '').substring(0, 16);
            newValue = '+' + digits;
          } else {
            const digits = newValue.substring(1).replace(/\D/g, '').substring(0, 16);
            newValue = '+' + digits;
          }
        }
        break;
        
      case 'companyName':
        // Limit to 100 characters
        newValue = newValue.substring(0, 100);
        break;
        
      case 'locationName':
        // Limit to 50 characters
        newValue = newValue.substring(0, 50);
        break;
        
      case 'title':
        // Limit to 50 characters
        newValue = newValue.substring(0, 50);
        break;
        
      case 'description':
        // Limit to 50 characters
        newValue = newValue.substring(0, 50);
        break;
        
      case 'address':
        // Limit to 250 characters
        newValue = newValue.substring(0, 250);
        break;
        
      case 'character':
        // Limit to 1 character
        newValue = newValue.substring(0, 1);
        break;
        
      case 'date':
        // Format: dd/mm/yyyy
        if (newValue === '') {
          newValue = '';
        } else {
          // Remove any non-digit characters
          const digits = newValue.replace(/\D/g, '');
          
          if (digits.length <= 2) {
            // Day part (dd)
            newValue = digits;
          } else if (digits.length <= 4) {
            // Day and month (dd/mm)
            newValue = `${digits.substring(0, 2)}/${digits.substring(2)}`;
          } else if (digits.length <= 8) {
            // Day, month, and year (dd/mm/yyyy)
            newValue = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
          } else {
            // Limit to 8 digits (dd/mm/yyyy)
            newValue = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
          }
        }
        break;
        
      case 'taxNumber':
        // Limit to 50 characters (for STRN and NTN)
        newValue = newValue.substring(0, 50);
        break;
        
      case 'balance':
        // Handle numeric input for balance
        if (newValue === '') {
          newValue = 0;
        } else {
          // Only allow numbers and decimal point
          newValue = newValue.replace(/[^\d.]/g, '');
          
          // Ensure only one decimal point
          const parts = newValue.split('.');
          if (parts.length > 2) {
            newValue = parts[0] + '.' + parts.slice(1).join('');
          }
          
          // Convert to number
          newValue = parseFloat(newValue) || 0;
        }
        break;
        
      default:
        break;
    }
    
    setValue(newValue);
  }, [maskType]);
  
  return [value, handleChange, setValue];
};

export default useInputMask;