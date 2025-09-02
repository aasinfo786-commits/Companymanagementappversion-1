// src/components/FbrRequirements.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSearch, 
  CalendarCheck,
  List
} from 'lucide-react';

const FbrRequirements = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Map icon names to actual components
  const iconMap = {
    FileSearch: <FileSearch size={48} />,
    CalendarCheck: <CalendarCheck size={48} />,
    List: <List size={48} />,
  };
  
  // FBR Requirements data structure
  const fbrRequirements = [
    {
      title: "SRO Schedule",
      href: "/fbr/sro-schedule",
      icon: "CalendarCheck",
      children: []
    },
    {
      title: "Item Description Code",
      href: "/fbr/item-description-code",
      icon: "List",
      children: []
    }
  ];
  
  // Check for dark mode preference and listen for changes
  useEffect(() => {
    // Function to update dark mode state
    const updateDarkMode = () => {
      const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                        document.documentElement.classList.contains('dark');
      setDarkMode(isDarkMode);
    };
    // Initial check
    updateDarkMode();
    
    // Listen for theme changes
    const handleThemeChange = () => {
      updateDarkMode();
    };
    
    // Listen for storage changes (in case theme is changed in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        updateDarkMode();
      }
    };
    
    // Listen for DOM changes (class changes on html element)
    const observer = new MutationObserver(() => {
      updateDarkMode();
    });
    
    // Start observing the html element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Add event listeners
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);
  
  const handleButtonClick = (href) => {
    if (href) {
      navigate(href);
    }
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
        
        .fbr-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          transition: margin-left 0.3s ease;
          color: var(--text-primary);
        }
        
        .fbr-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }
        
        .fbr-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0;
        }
        
        .header-icon {
          color: var(--icon-color);
        }
        
        .fbr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .fbr-button {
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
        
        .fbr-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px var(--shadow-hover-color), 0 4px 6px var(--shadow-color);
          background: linear-gradient(145deg, var(--bg-secondary), var(--bg-hover));
        }
        
        .fbr-button .icon-container {
          margin-bottom: 1rem;
          color: var(--icon-color);
        }
        
        .fbr-button .title-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }
        
        /* Desktop styles */
        @media (min-width: 768px) {
          .fbr-container {
            margin-left: 16rem; /* Width of the sidebar */
          }
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .fbr-container {
            margin-left: 0;
            padding: 1rem;
          }
          
          .fbr-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .fbr-button {
            min-height: 140px;
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
      
      <div className="fbr-container">
        <div className="fbr-header">
          <FileSearch size={36} className="header-icon" />
          <h1>FBR Requirements</h1>
        </div>
        
        <div className="fbr-grid">
          {fbrRequirements.map((item, index) => (
            <button
              key={index}
              className="fbr-button"
              onClick={() => handleButtonClick(item.href)}
            >
              <div className="icon-container">
                {iconMap[item.icon]}
              </div>
              <span className="title-text">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default FbrRequirements;