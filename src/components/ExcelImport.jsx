import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Users, 
  Building, 
  MapPin,
  Database,
  FileText,
  Settings,
  Upload
} from 'lucide-react';

const ExcelImport = () => {
  const navigate = useNavigate();
  const [importOptions, setImportOptions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Map icon names to actual components
  const iconMap = {
    FileSpreadsheet: <FileSpreadsheet size={48} />,
    Users: <Users size={48} />,
    Building: <Building size={48} />,
    MapPin: <MapPin size={48} />,
    Database: <Database size={48} />,
    FileText: <FileText size={48} />,
    Settings: <Settings size={48} />,
    Upload: <Upload size={48} />
  };
  
  // Check for dark mode preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                     document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                   document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);
  
  useEffect(() => {
    // Import options data
    const importOptionsData = [
      {
        title: "Import Party And Item A/C Coding",
        href: "/import-partyaccount-coding",
        icon: "FileSpreadsheet",
      },
      {
        title: "Import Child Center Coding",
        href: "/import-childcenter-coding",
        icon: "MapPin",
      },
      {
        title: "Import Sales Invoices",
        href: "/import-salesinvoice-coding",
        icon: "Database",
      }
    ];
    setImportOptions(importOptionsData);
  }, []);
  
  const handleButtonClick = (href) => {
    navigate(href);
  };
  
  // Function to handle sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (e) => {
      setSidebarOpen(e.detail);
    };
    window.addEventListener('sidebarToggle', handleSidebarChange);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarChange);
    };
  }, []);
  
  return (
    <>
      <style jsx>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f0f4f8;
          --bg-hover: #e2e8f0;
          --text-primary: #2d3748;
          --text-secondary: #4a5568;
          --icon-color: #4299e1;
          --shadow-color: rgba(0, 0, 0, 0.05);
          --shadow-hover-color: rgba(0, 0, 0, 0.1);
          --border-color: #e2e8f0;
        }
        
        .dark {
          --bg-primary: #1a202c;
          --bg-secondary: #2d3748;
          --bg-hover: #374151;
          --text-primary: #f7fafc;
          --text-secondary: #e2e8f0;
          --icon-color: #63b3ed;
          --shadow-color: rgba(0, 0, 0, 0.3);
          --shadow-hover-color: rgba(0, 0, 0, 0.4);
          --border-color: #374151;
        }
        
        .excel-import-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          transition: margin-left 0.3s ease;
          color: var(--text-primary);
        }
        
        .excel-import-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }
        
        .excel-import-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0;
        }
        
        .header-icon {
          color: var(--icon-color);
        }
        
        .import-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .import-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: linear-gradient(145deg, var(--bg-primary), var(--bg-secondary));
          border-radius: 16px;
          box-shadow: 0 4px 6px var(--shadow-color), 0 1px 3px var(--shadow-color);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 180px;
        }
        
        .import-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px var(--shadow-hover-color), 0 4px 6px var(--shadow-color);
          background: linear-gradient(145deg, var(--bg-secondary), var(--bg-hover));
        }
        
        .button-icon {
          margin-bottom: 1rem;
          color: var(--icon-color);
        }
        
        .button-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }
        
        /* Desktop styles */
        @media (min-width: 768px) {
          .excel-import-container {
            margin-left: 16rem; /* Width of the sidebar */
          }
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .excel-import-container {
            margin-left: 0;
            padding: 1rem;
          }
          
          .import-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .import-button {
            min-height: 140px;
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
      
      <div className="excel-import-container">
        <div className="excel-import-header">
          <Upload size={36} className="header-icon" />
          <h1>Excel Import</h1>
        </div>
        
        <div className="import-grid">
          {importOptions.map((item, index) => (
            <button
              key={index}
              className="import-button"
              onClick={() => handleButtonClick(item.href)}
            >
              <div className="button-icon">
                {iconMap[item.icon]}
              </div>
              <span className="button-text">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExcelImport;