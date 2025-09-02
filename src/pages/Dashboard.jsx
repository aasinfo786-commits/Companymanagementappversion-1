import React, { useEffect, useState } from "react";
import moment from "moment-hijri";
import { useAppContext } from "../contexts/AppContext";
import { Building, MapPin, Calendar, Key, Eye, EyeOff, User, Star } from "lucide-react";

const hijriMonthNamesUrdu = {
  1: "محرم",
  2: "صفر",
  3: "ربیع الاول",
  4: "ربیع الثانی",
  5: "جمادی الاول",
  6: "جمادی الثانی",
  7: "رجب",
  8: "شعبان",
  9: "رمضان",
  10: "شوال",
  11: "ذوالقعدۃ",
  12: "ذوالحجۃ",
};

const Dashboard = () => {
  const [hijriDateUrdu, setHijriDateUrdu] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    companyId,
    locationId,
    financialYearId,
    fbrToken,
    hasAllSelections,
    username,
    setUsername,
    companyName,
    locationName,
    title
  } = useAppContext();

  // Check for username in localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && (!username || username !== storedUsername)) {
      setUsername(storedUsername);
    }
    setLoading(false);
  }, [username, setUsername]);

  useEffect(() => {
    const today = moment();
    const day = parseInt(today.format("iD"));
    const month = parseInt(today.format("iM"));
    const year = parseInt(today.format("iYYYY"));
    const urduMonth = hijriMonthNamesUrdu[month];
    const formattedUrduDate = `${day-1} ${urduMonth} ${year}`;
    setHijriDateUrdu(formattedUrduDate);
  }, []);

  // Log FBR token status
  useEffect(() => {
    console.log("FBR Token Status:", fbrToken ? "Configured" : "Not configured");
  }, [fbrToken]);

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  if (loading) {
    return (
      <div className="flex-1 px-6 py-8 ml-0 md:ml-64 transition-all duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-8 ml-0 md:ml-64 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {/* Welcome Section */}
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <User className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome, <span className="text-blue-600 dark:text-blue-400">{username || 'User'}</span>!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {companyName && locationName && title 
                ? `You are logged into ${companyName}, ${locationName} for the ${title} period.`
                : 'Please complete your selections to view dashboard information.'}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <Star className="text-yellow-500 dark:text-yellow-400" size={18} />
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                Islamic Date: {hijriDateUrdu}
              </span>
            </div>
          </div>
          
          {hasAllSelections ? (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-5 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-700">
                      <Building className="text-blue-600 dark:text-blue-300" size={20} />
                    </div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">Company</h3>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 truncate">
                    {companyName}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono">
                    ID: {companyId}
                  </p>
                </div>
                
                {/* Location Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-5 rounded-xl shadow-sm border border-green-100 dark:border-green-800 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-700">
                      <MapPin className="text-green-600 dark:text-green-300" size={20} />
                    </div>
                    <h3 className="font-medium text-green-800 dark:text-green-200">Location</h3>
                  </div>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100 truncate">
                    {locationName}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                    ID: {locationId}
                  </p>
                </div>
                
                {/* Financial Year Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-5 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-700">
                      <Calendar className="text-purple-600 dark:text-purple-300" size={20} />
                    </div>
                    <h3 className="font-medium text-purple-800 dark:text-purple-200">Financial Year</h3>
                  </div>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100 truncate">
                    {title}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1 font-mono">
                    ID: {financialYearId}
                  </p>
                </div>
              </div>
              
              {/* FBR Token Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 p-5 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-700">
                      <Key className="text-amber-600 dark:text-amber-300" size={20} />
                    </div>
                    <h3 className="font-medium text-amber-800 dark:text-amber-200">FBR Token</h3>
                  </div>
                  <button 
                    onClick={toggleTokenVisibility}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {showToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/50">
                    {fbrToken ? (
                      <p className="text-sm font-mono text-amber-900 dark:text-amber-100 break-all">
                        {showToken ? fbrToken : "••••••••••••••••••••••"}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Not configured
                      </p>
                    )}
                  </div>
                  {fbrToken && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(fbrToken);
                        console.log("FBR Token copied to clipboard");
                      }}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline self-start"
                    >
                      Copy to clipboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700">
                  <Building className="text-gray-500 dark:text-gray-400" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selection Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Please select a company, location, and financial year to view your dashboard information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;