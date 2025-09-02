// src/components/ProfileSetting.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users,
  Truck
} from 'lucide-react';

const ProfileSetting = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Map icon names to actual components
  const iconMap = {
    Package: <Package size={48} />,
    Users: <Users size={48} />,
    Truck: <Truck size={48} />,
  };
  
  // Profile settings data structure
  const profileSettings = [
    {
      title: "Item Profile",
      href: "/regional/item-profile",
      icon: "Package",
      children: []
    },
    {
      title: "Customer Profile",
      href: "/regional/customer_profile",
      icon: "Users",
      children: []
    },
    {
      title: "Supplier Profile",
      href: "/regional/supplier_profile",
      icon: "Truck",
      children: []
    },
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
        
        .profile-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          transition: margin-left 0.3s ease;
          color: var(--text-primary);
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }
        
        .profile-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0;
        }
        
        .header-icon {
          color: var(--icon-color);
        }
        
        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .profile-button {
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
        
        .profile-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px var(--shadow-hover-color), 0 4px 6px var(--shadow-color);
          background: linear-gradient(145deg, var(--bg-secondary), var(--bg-hover));
        }
        
        .profile-button .icon-container {
          margin-bottom: 1rem;
          color: var(--icon-color);
        }
        
        .profile-button .title-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }
        
        /* Desktop styles */
        @media (min-width: 768px) {
          .profile-container {
            margin-left: 16rem; /* Width of the sidebar */
          }
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .profile-container {
            margin-left: 0;
            padding: 1rem;
          }
          
          .profile-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .profile-button {
            min-height: 140px;
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
      
      <div className="profile-container">
        <div className="profile-header">
          <Users size={36} className="header-icon" />
          <h1>Profile Settings</h1>
        </div>
        
        <div className="profile-grid">
          {profileSettings.map((item, index) => (
            <button
              key={index}
              className="profile-button"
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

export default ProfileSetting;