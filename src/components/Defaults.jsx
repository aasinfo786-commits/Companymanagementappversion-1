// src/components/Defaults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Banknote, 
  Wallet, 
  CreditCard, 
  ReceiptText, 
  PackageOpen, 
  ShoppingCart, 
  Receipt, 
  Percent,
  Settings,
  Briefcase
} from 'lucide-react';

const Defaults = () => {
  const navigate = useNavigate();
  const [defaults, setDefaults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Map icon names to actual components
  const iconMap = {
    Banknote: <Banknote size={48} />,
    Wallet: <Wallet size={48} />,
    CreditCard: <CreditCard size={48} />,
    ReceiptText: <ReceiptText size={48} />,
    PackageOpen: <PackageOpen size={48} />,
    ShoppingCart: <ShoppingCart size={48} />,
    Receipt: <Receipt size={48} />,
    Percent: <Percent size={48} />,
    Settings: <Settings size={48} />,
    Briefcase: <Settings size={48} />
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
    // In a real app, you would fetch this data from your API
    // For now, we'll use the sample data from your models file
    const defaultsData = [
      {
        title: "Default Banks",
        href: "/defaults/banks",
        icon: "Banknote",
      },
      {
        title: "Default Cash",
        href: "/defaults/cash",
        icon: "Wallet",
      },
      {
        title: "Default Debtors",
        href: "/defaults/debtors",
        icon: "CreditCard",
      },
      {
        title: "Default Creditors",
        href: "/defaults/creditors",
        icon: "ReceiptText",
      },
      {
        title: "Default Raw Materials",
        href: "/defaults/raw_materials",
        icon: "PackageOpen",
      },
      {
        title: "Default Finished Goods",
        href: "/defaults/sales",
        icon: "ShoppingCart",
      },
      {
        title: "Default Broker Code",
        href: "/defaults/broker-accounts",
        icon: "Briefcase",
      }
      ,
      {
        title: "Default Govt Taxes",
        href: "/defaults/govt_taxes",
        icon: "Receipt",
      },
      {
        title: "Default Discount",
        href: "/defaults/discounts",
        icon: "Percent"
      },
    ];
    setDefaults(defaultsData);
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
        
        .defaults-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          transition: margin-left 0.3s ease;
          color: var(--text-primary);
        }
        
        .defaults-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }
        
        .defaults-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0;
        }
        
        .header-icon {
          color: var(--icon-color);
        }
        
        .defaults-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .defaults-button {
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
        
        .defaults-button:hover {
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
          .defaults-container {
            margin-left: 16rem; /* Width of the sidebar */
          }
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .defaults-container {
            margin-left: 0;
            padding: 1rem;
          }
          
          .defaults-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .defaults-button {
            min-height: 140px;
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
      
      <div className="defaults-container">
        <div className="defaults-header">
          <Settings size={36} className="header-icon" />
          <h1>Defaults</h1>
        </div>
        
        <div className="defaults-grid">
          {defaults.map((item, index) => (
            <button
              key={index}
              className="defaults-button"
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

export default Defaults;