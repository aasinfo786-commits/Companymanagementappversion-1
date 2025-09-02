import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Search, Menu as MenuIcon, LogOut, ChevronDown, ChevronRight, Home } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [search, setSearch] = useState("");
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [userProfile, setUserProfile] = useState(null);
  const [accessibleMenuIds, setAccessibleMenuIds] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch all menus
      axios
        .get("http://localhost:5000/api/menus", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("All menus received:", res.data);
          setAllMenus(res.data);
          setFilteredMenus(res.data);
        })
        .catch((err) => console.error(err));
      
      // Get accessible menu IDs from localStorage
      const storedMenus = localStorage.getItem("accessibleMenus");
      if (storedMenus) {
        try {
          const menuIds = JSON.parse(storedMenus);
          console.log("Loaded accessible menu IDs:", menuIds);
          setAccessibleMenuIds(menuIds);
        } catch (err) {
          console.error("Error parsing accessible menus:", err);
          setAccessibleMenuIds([]);
        }
      } else {
        console.log("No accessible menus found in localStorage");
      }
      
      // Mock user profile data
      setUserProfile({
        name: localStorage.getItem("username") || "John Doe",
        company: localStorage.getItem("companyName") || "Company Inc.",
      });
    }
  }, []);
  
  // Filter menus based on search term and user permissions
  useEffect(() => {
    if (!allMenus.length) return;
    
    console.log("Filtering menus. Accessible IDs:", accessibleMenuIds);
    
    // First filter by search term
    const searchFiltered = allMenus.filter(menu => {
      if (!search) return true;
      return menu.title.toLowerCase().includes(search.toLowerCase());
    });
    
    // Then filter by user permissions
    const permissionFiltered = filterMenusByPermission(searchFiltered);
    setFilteredMenus(permissionFiltered);
    console.log("Filtered menus:", permissionFiltered);
  }, [allMenus, search, accessibleMenuIds]);
  
  // Function to filter menus based on user permissions
  const filterMenusByPermission = (menus) => {
    if (!menus || !Array.isArray(menus)) return [];
    
    return menus
      .map(menu => {
        if (!menu) return null;
        
        // FIXED: More robust handling of menu ID
        let menuIdStr = null;
        if (menu._id) {
          if (typeof menu._id === 'string') {
            menuIdStr = menu._id;
          } else if (typeof menu._id === 'object' && menu._id.$oid) {
            menuIdStr = menu._id.$oid;
          } else if (typeof menu._id.toString === 'function') {
            try {
              menuIdStr = menu._id.toString();
            } catch (e) {
              console.error("Error converting menu._id to string:", e);
            }
          }
        }
        
        const hasAccess = menuIdStr && accessibleMenuIds.includes(menuIdStr);
        console.log(`Menu: ${menu.title}, ID: ${menuIdStr}, Has Access: ${hasAccess}`);
        
        // Process children
        const filteredChildren = menu.children && Array.isArray(menu.children) && menu.children.length > 0
          ? filterMenusByPermission(menu.children)
          : [];
        
        // Include menu if:
        // 1. User has direct access to it, OR
        // 2. It has children that the user has access to
        if (hasAccess || filteredChildren.length > 0) {
          return {
            ...menu,
            children: filteredChildren
          };
        }
        
        return null;
      })
      .filter(Boolean);
  };
  
  const toggleMenu = (id) => {
    if (!id) return;
    
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };
  
  const getIcon = (iconName) => {
    if (!iconName) return null;
    
    const IconComponent = Icons[iconName];
    return IconComponent ? (
      <IconComponent className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-300 transition-colors duration-200" />
    ) : null;
  };
  
  const handleMenuClick = (e, href) => {
    e.preventDefault();
    if (href) {
      navigate(href);
      setSidebarOpen(false);
    }
  };
  
  const renderMenu = (menu, level = 0) => {
    if (!menu) return null;
    
    const hasChildren = menu.children && Array.isArray(menu.children) && menu.children.length > 0;
    const isExpanded = menu._id ? expandedMenus.has(menu._id.toString()) : expandedMenus.has(menu.title);
    
    // FIXED: More robust handling of menu ID for access check
    let hasAccess = false;
    if (menu._id) {
      let menuIdStr = null;
      if (typeof menu._id === 'string') {
        menuIdStr = menu._id;
      } else if (typeof menu._id === 'object' && menu._id.$oid) {
        menuIdStr = menu._id.$oid;
      } else if (typeof menu._id.toString === 'function') {
        try {
          menuIdStr = menu._id.toString();
        } catch (e) {
          console.error("Error converting menu._id to string:", e);
        }
      }
      
      if (menuIdStr) {
        hasAccess = accessibleMenuIds.includes(menuIdStr);
      }
    }
    
    return (
      <div key={menu._id || menu.title || `menu-${level}`} className={`mb-1 transition-all duration-200`}>
        <div
          onClick={() => hasChildren && toggleMenu(menu._id || menu.title)}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-all duration-300 group
            ${isExpanded 
              ? "bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50"}
            ${!hasAccess ? "opacity-70" : ""}
          `}
        >
          <a
            href={menu.href || "#"}
            onClick={(e) => !hasChildren && handleMenuClick(e, menu.href)}
            className={`flex items-center text-xs w-full transition-colors duration-200
              ${hasAccess 
                ? "text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" 
                : "text-gray-500 dark:text-gray-400"}
            `}
          >
            {getIcon(menu.icon)}
            <span className="truncate">{menu.title || "Untitled Menu"}</span>
          </a>
          {hasChildren && (
            <span className="text-gray-500 dark:text-gray-400 transition-transform duration-300">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 pl-1 border-l border-indigo-200 dark:border-indigo-800/50 transition-all duration-300">
            {menu.children.map((child) => renderMenu(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("companyId");
    localStorage.removeItem("locationdId");
    localStorage.removeItem("financialYearId");
    localStorage.removeItem("companyName");
    localStorage.removeItem("locationName");
    localStorage.removeItem("title");
    localStorage.removeItem("accessibleMenus"); // Remove accessible menus on logout
    window.location.href = "/login";
  };
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
      >
        <MenuIcon size={20} />
      </button>
      
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 
          bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 
          border-r border-gray-200/50 dark:border-gray-700/50 
          z-50 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Header */}
          <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="ml-2 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Company App
                </h2>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Compact User Profile */}
            {userProfile && (
              <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {userProfile.name.charAt(0)}
                </div>
                <div className="ml-2 overflow-hidden">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{userProfile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile.company}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="p-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Menus */}
          <div className="flex-1 px-2 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Main Menu
              </h3>
              {filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => renderMenu(menu))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
                  No accessible menus
                </p>
              )}
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </aside>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;