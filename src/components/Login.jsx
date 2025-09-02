import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, AlertCircle, CheckCircle2, Building, MapPin, Calendar, Sparkles } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to light
    return localStorage.getItem('theme') || 'light';
  });
  
  // Context values
  const {
    companyId,
    setCompanyId,
    locationId,
    setLocationId,
    financialYearId,
    setFinancialYearId,
    setFbrToken,
    companyName,
    setCompanyName,
    locationName,
    setLocationName,
    title,
    setTitle,
    setAccessibleMenus
  } = useAppContext();
  
  const [formData, setFormData] = useState({
    username: "taimoor",
    password: "abc@123",
  });
  
  // Apply theme on initial load and when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };
  
  const fetchData = async (url, setter, fallbackKey) => {
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data[fallbackKey] || [];
      setter(list);
    } catch (error) {
      console.error(`Failed to fetch ${fallbackKey}:`, error);
      setter([]);
    }
  };
  
  useEffect(() => {
    fetchData("http://localhost:5000/api/companies", setCompanies, "companies");
  }, []);
  
  useEffect(() => {
    if (!companyId) {
      setLocations([]);
      setLocationId(null);
      setFinancialYearId(null);
      return;
    }
    fetchData(
      `http://localhost:5000/api/locations?companyId=${companyId}`,
      setLocations,
      "locations"
    );
    setLocationId(null);
    setFinancialYears([]);
    setFinancialYearId(null);
  }, [companyId]);
  
  useEffect(() => {
    if (!companyId || !locationId) {
      setFinancialYears([]);
      setFinancialYearId(null);
      return;
    }
    const selectedCompany = companies.find(c => c.companyId === companyId);
    if (!selectedCompany) return;
    fetchData(
      `http://localhost:5000/api/financial-years?companyId=${companyId}&locationId=${locationId}`,
      setFinancialYears,
      "financialYears"
    );
  }, [companyId, locationId, companies]);
  
  // Set default company when companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !companyId) {
      const firstCompany = companies[0];
      setCompanyId(firstCompany.companyId, firstCompany.companyName);
    }
  }, [companies, companyId, setCompanyId]);
  
  // Set default location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !locationId) {
      const firstLocation = locations[0];
      setLocationId(firstLocation.locationId, firstLocation.locationName);
    }
  }, [locations, locationId, setLocationId]);
  
  // Set default financial year when financial years are loaded
  useEffect(() => {
    if (financialYears.length > 0 && !financialYearId) {
      const firstFinancialYear = financialYears[0];
      setFinancialYearId(firstFinancialYear.yearId, firstFinancialYear.title);
    }
  }, [financialYears, financialYearId, setFinancialYearId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "companyId") {
      const company = companies.find(c => c.companyId === value);
      setCompanyId(value, company ? company.companyName : '');
    }
    if (name === "locationId") {
      const location = locations.find(l => l.locationId === value);
      setLocationId(value, location ? location.locationName : '');
    }
    if (name === "financialYearId") {
      const financialYear = financialYears.find(f => f.yearId === value);
      setFinancialYearId(value, financialYear ? financialYear.title : '');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { username, password } = formData;
    
    if (!companyId || !locationId || !financialYearId) {
      setMessage({ type: "error", text: "Please select company, location, and financial year." });
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          companyId,
          locationId,
          financialYearId,
          username,
          password,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.token) {
        throw new Error(data.message || "Login failed");
      }
      
      // Store token and FBR token if available
      localStorage.setItem("token", data.token);
      if (data.fbrToken) {
        localStorage.setItem("fbrToken", data.fbrToken);
        setFbrToken(data.fbrToken);
      }
      
      // Store username, companyName, locationName, and title in localStorage
      localStorage.setItem("username", username);
      
      // Get the selected names from the context or find them in the arrays
      const selectedCompany = companies.find(c => c.companyId === companyId);
      const selectedLocation = locations.find(l => l.locationId === locationId);
      const selectedFinancialYear = financialYears.find(f => f.yearId === financialYearId);
      
      // Update context state and localStorage with names
      if (selectedCompany) {
        setCompanyName(selectedCompany.companyName);
        localStorage.setItem("companyName", selectedCompany.companyName);
      }
      
      if (selectedLocation) {
        setLocationName(selectedLocation.locationName);
        localStorage.setItem("locationName", selectedLocation.locationName);
      }
      
      if (selectedFinancialYear) {
        setTitle(selectedFinancialYear.title);
        localStorage.setItem("title", selectedFinancialYear.title);
      }
      
      // Extract and store accessible menus from the login response
      if (data.user && data.user.accessibleMenus) {
        // FIXED: Convert accessible menus to array of IDs with proper handling of $oid format
        const menuIds = data.user.accessibleMenus.map(menu => {
          if (menu && menu.$oid) {
            return menu.$oid.toString();
          } else if (menu && menu._id) {
            return menu._id.toString();
          } else if (typeof menu === 'string') {
            return menu;
          }
          return null;
        }).filter(id => id !== null); // Filter out any null values
        
        localStorage.setItem("accessibleMenus", JSON.stringify(menuIds));
        
        // Update context if available
        if (setAccessibleMenus) {
          setAccessibleMenus(menuIds);
        }
        
        console.log("Accessible menus stored:", menuIds);
      } else {
        localStorage.setItem("accessibleMenus", JSON.stringify([]));
        if (setAccessibleMenus) {
          setAccessibleMenus([]);
        }
        console.log("No accessible menus found for user");
      }
      
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  const inputClass = `w-full rounded-xl px-4 py-3 border transition-all duration-300 ${
    theme === "dark"
      ? "bg-gray-800/50 text-white border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
      : "bg-white/80 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
  }`;
  
  return (
    <div className={`min-h-screen flex items-center justify-center px-6 py-8 transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-purple-900/20 to-indigo-900/30"
        : "bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100"
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 z-10"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      <div className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        theme === "dark"
          ? "bg-gray-800/60 border border-gray-700/50"
          : "bg-white/80 border border-purple-100/50"
      }`}>
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg mb-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
          </div>
          <h2 className={`text-2xl font-bold text-center mb-1 ${
            theme === "dark" ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300" : "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
          }`}>
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Sign in to access your account
          </p>
        </div>
        
        {message && (
          <div
            className={`mb-4 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
              message.type === "error"
                ? "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
                : "bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <span>{message.text}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" spellCheck="false">
          {/* Company */}
          <div>
            <label htmlFor="companyId" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Building className="w-3 h-3 text-purple-500" />
              Company
            </label>
            <select
              id="companyId"
              name="companyId"
              value={companyId || ""}
              onChange={handleSelectChange}
              required
              className={`w-full rounded-lg px-3 py-2 text-sm border transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 text-white border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  : "bg-white/80 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              }`}
            >
              <option value="">Select</option>
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
              ))}
            </select>
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="locationId" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-500" />
              Location
            </label>
            <select
              id="locationId"
              name="locationId"
              value={locationId || ""}
              onChange={handleSelectChange}
              required
              disabled={!companyId}
              className={`w-full rounded-lg px-3 py-2 text-sm border transition-all duration-300 ${
                !companyId ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                theme === "dark"
                  ? "bg-gray-800/50 text-white border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  : "bg-white/80 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              }`}
            >
              <option value="">Select</option>
              {locations.map((l) => (
                <option key={l._id} value={l.locationId}>{l.locationName}</option>
              ))}
            </select>
          </div>
          
          {/* Financial Year */}
          <div>
            <label htmlFor="financialYearId" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-500" />
              Financial Year
            </label>
            <select
              id="financialYearId"
              name="financialYearId"
              value={financialYearId || ""}
              onChange={handleSelectChange}
              required
              disabled={!locationId}
              className={`w-full rounded-lg px-3 py-2 text-sm border transition-all duration-300 ${
                !locationId ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                theme === "dark"
                  ? "bg-gray-800/50 text-white border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  : "bg-white/80 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              }`}
            >
              <option value="">Select</option>
              {financialYears.map((f) => (
                <option key={f._id} value={f.yearId}>{f.title}</option>
              ))}
            </select>
          </div>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <User className="w-3 h-3 text-purple-500" />
              Username
            </label>
            <div className="relative">
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-300"
              }`}>
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-transparent outline-none placeholder:text-gray-400 text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-500" />
              Password
            </label>
            <div className="relative">
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
                theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-300"
              }`}>
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-transparent outline-none placeholder:text-gray-400 text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:ring-offset-1 shadow-md hover:shadow-lg ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Sign In</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Company App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;