// src/contexts/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Initialize state with localStorage values if they exist
  const [companyId, setCompanyId] = useState(() => {
    return localStorage.getItem('companyId') || null;
  });
  const [locationId, setLocationId] = useState(() => {
    return localStorage.getItem('locationId') || null;
  });
  const [financialYearId, setFinancialYearId] = useState(() => {
    return localStorage.getItem('financialYearId') || null;
  });
  const [fbrToken, setFbrToken] = useState(() => {
    return localStorage.getItem('fbrToken') || null;
  });
  
  // New state variables for names and title
  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem('companyName') || '';
  });
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('locationName') || '';
  });
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('title') || '';
  });
  
  // New state variable for username
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  
  // Sync with localStorage whenever it changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'username') {
        setUsername(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Log companyName, locationName, title, and username to console when they change
  useEffect(() => {
    console.log("Company Name:", companyName);
    console.log("Location Name:", locationName);
    console.log("Title:", title);
    console.log("Username:", username);
  }, [companyName, locationName, title, username]);
  
  // Update localStorage whenever state changes
  useEffect(() => {
    if (companyId) {
      localStorage.setItem('companyId', companyId);
    } else {
      localStorage.removeItem('companyId');
    }
  }, [companyId]);
  
  useEffect(() => {
    if (locationId) {
      localStorage.setItem('locationId', locationId);
    } else {
      localStorage.removeItem('locationId');
    }
  }, [locationId]);
  
  useEffect(() => {
    if (financialYearId) {
      localStorage.setItem('financialYearId', financialYearId);
    } else {
      localStorage.removeItem('financialYearId');
    }
  }, [financialYearId]);
  
  useEffect(() => {
    if (fbrToken) {
      localStorage.setItem('fbrToken', fbrToken);
    } else {
      localStorage.removeItem('fbrToken');
    }
  }, [fbrToken]);
  
  // New useEffect hooks for name and title
  useEffect(() => {
    // Always save to localStorage, even if empty
    localStorage.setItem('companyName', companyName);
  }, [companyName]);
  
  useEffect(() => {
    // Always save to localStorage, even if empty
    localStorage.setItem('locationName', locationName);
  }, [locationName]);
  
  useEffect(() => {
    // Always save to localStorage, even if empty
    localStorage.setItem('title', title);
  }, [title]);
  
  // New useEffect hook for username
  useEffect(() => {
    // Always save to localStorage, even if empty
    localStorage.setItem('username', username);
  }, [username]);
  
  // Enhanced setters that handle empty strings and clear dependent states
  const updateCompanyId = (id, name = '') => {
    const newId = id === "" ? null : id;
    setCompanyId(newId);
    setCompanyName(name); // Set company name along with ID
    
    // Only clear dependent states if company actually changed
    if (newId !== companyId && newId !== null) {
      setLocationId(null);
      setFinancialYearId(null);
      // Don't clear locationName immediately, wait for new location to be selected
    }
  };
  
  const updateLocationId = (id, name = '') => {
    const newId = id === "" ? null : id;
    setLocationId(newId);
    setLocationName(name); // Set location name along with ID
    
    // Only clear financial year if location actually changed
    if (newId !== locationId && newId !== null) {
      setFinancialYearId(null);
    }
  };
  
  const updateFinancialYearId = (id, titleValue = '') => {
    setFinancialYearId(id === "" ? null : id);
    setTitle(titleValue); // Set title along with ID
  };
  
  const updateFbrToken = (token) => {
    setFbrToken(token === "" ? null : token);
  };
  
  // New setters for names and title
  const updateCompanyName = (name) => {
    setCompanyName(name === "" ? '' : name);
  };
  
  const updateLocationName = (name) => {
    setLocationName(name === "" ? '' : name);
  };
  
  const updateTitle = (titleValue) => {
    setTitle(titleValue === "" ? '' : titleValue);
  };
  
  // New setter for username
  const updateUsername = (name) => {
    setUsername(name === "" ? '' : name);
  };
  
  // Add reset function to clear all selections
  const resetSelections = () => {
    setCompanyId(null);
    setLocationId(null);
    setFinancialYearId(null);
    setFbrToken(null);
    setCompanyName('');
    setLocationName('');
    setTitle('');
    setUsername(''); // Clear username as well
  };
  
  // Generate welcome message
  const welcomeMessage = companyName && locationName && title 
    ? `Welcome to ${companyName}, ${locationName}, ${title}`
    : '';
    
  return (
    <AppContext.Provider
      value={{
        companyId,
        setCompanyId: updateCompanyId,
        locationId,
        setLocationId: updateLocationId,
        financialYearId,
        setFinancialYearId: updateFinancialYearId,
        fbrToken,
        setFbrToken: updateFbrToken,
        companyName,
        setCompanyName: updateCompanyName,
        locationName,
        setLocationName: updateLocationName,
        title,
        setTitle: updateTitle,
        username,
        setUsername: updateUsername,
        resetSelections,
        hasAllSelections: !!companyId && !!locationId && !!financialYearId,
        welcomeMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};