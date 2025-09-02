// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";


import Sidebar from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";

import Dashboard from "./pages/Dashboard";
import CompanyForm from "./pages/CompanyForm";
import ViewCompany from "./pages/ViewCompany";
import LocationForm from "./pages/LocationForm";
import ViewLocation from "./pages/ViewLocation";
import FinancialYear from "./pages/FinancialYear";
import AddUserForm from "./pages/AddUserForm";
import EditUserForm from './pages/EditUserForm';
import ChangePassword from "./pages/ChangePassword";
import Users from "./pages/Users";
import Login from "./components/Login";
import ChartOfAccounts from "./components/ChartOfAccounts";
import Level1 from "./pages/ChartOfAccounts/Level1";
import Level2 from "./pages/ChartOfAccounts/Level2";
import Level3 from "./pages/ChartOfAccounts/Level3";
import Level4 from "./pages/ChartOfAccounts/Level4";
import Defaults from './components/Defaults';
import ExcelImport from './components/ExcelImport';
import DefaultBanks from "./pages/Defaults/DefaultBanks";
import DefaultCash from "./pages/Defaults/DefaultCash";
import DefaultDebtors from "./pages/Defaults/DefaultDebtors";
import DefaultCreditors from "./pages/Defaults/DefaultCreditors";
import DefaultRawMaterials from "./pages/Defaults/DefaultRawMaterials";
import DefaultFinishedGoods from "./pages/Defaults/DefaultFinishedGoods";
import DefaultBrokerCode from "./pages/Defaults/DefaultBrokerAccount";
import DefaultGovtTaxes from "./pages/Defaults/DefaultGovtTaxes";
import DefaultDiscount from "./pages/Defaults/DefaultDiscount";
import CostAndRevenueCenter from "./components/CostAndRevenueCenter";
import ParentCenter from "./pages/CostRevenueCenter/ParentCenter";
import ChildCenter from "./pages/CostRevenueCenter/ChildCenter";
import RegionalCoding from "./components/RegionalCoding";
import ProfileSetting from "./components/ProfileSetting";
import OtherSettings from "./components/OtherSettings";
import FbrRequirements from "./components/FbrRequirements";
import Provinces from "./pages/RegionalCoding/Provinces";
import Cities from "./pages/RegionalCoding/Cities";
import SalesPerson from "./pages/RegionalCoding/SalesPerson";
import UnitMeasurement from "./pages/RegionalCoding/UnitMeasurement";
import ItemProfile from "./pages/RegionalCoding/ItemProfile";
import GoDown from "./pages/RegionalCoding/GoDown";
import ProductRateSetting from "./pages/RegionalCoding/ProductRateSetting";
import DiscountRateSetting from "./pages/RegionalCoding/DiscountSetting";
import TaxRateSetting from "./pages/RegionalCoding/TaxRateSetting";
import CustomerProfile from "./pages/RegionalCoding/CustomerProfile";
import SupplierProfile from "./pages/RegionalCoding/SupplierProfile";
import CashVoucher from "./pages/Transactions/CashVoucher";
import SalesVoucher from "./pages/Transactions/SalesVoucher";
import PurchaseOrder from "./pages/Contracts/PurchaseOrder";
import ImportPartyAccountCoding from "./pages/ImportPartyAccountCoding";
import ImportChildCenterCoding from "./pages/ImportChildCenterCoding";
import ImportSalesInvoice from "./pages/ImportSalesInvoice";
import SroSchedule from "./FbrRequirements/SroSchedule";
import ItemDescriptionCode from "./FbrRequirements/ItemDescriptionCode";

function AppContent() {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked) {
      if (isAuthenticated && isLoginPage) {
        navigate("/");
      } else if (!isAuthenticated && !isLoginPage) {
        navigate("/login", { state: { from: location.pathname } });
      }
    }
  }, [isAuthenticated, authChecked, isLoginPage, navigate, location.pathname]);

  if (!authChecked) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {!isLoginPage && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      <main
        className={`flex-1 p-4 text-gray-800 dark:text-gray-100 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-64 md:translate-x-0" : "translate-x-0"}`}
        style={{
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {!isLoginPage && <ThemeToggle theme={theme} setTheme={setTheme} />}

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/add_company"
            element={
              isAuthenticated ? <CompanyForm /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/view_company"
            element={
              isAuthenticated ? <ViewCompany /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/edit_company/:id"
            element={
              isAuthenticated ? <CompanyForm /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/add_Location"
            element={isAuthenticated ? <LocationForm /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/view_Location"
            element={isAuthenticated ? <ViewLocation /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/edit_Location/:id"
            element={
              isAuthenticated ? <LocationForm /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/financial_year"
            element={
              isAuthenticated ? <FinancialYear /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/users"
            element={isAuthenticated ? <Users /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/users/new"
            element={
              isAuthenticated ? <AddUserForm /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              isAuthenticated ? <EditUserForm /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/users/change_password/:id"
            element={
              isAuthenticated ? <ChangePassword /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/chart_of_accounts" element={<ChartOfAccounts />} />
          <Route
            path="/chart_of_accounts/level1"
            element={
              isAuthenticated ? <Level1 /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/chart_of_accounts/level1"
            element={
              isAuthenticated ? <Level1 /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/chart_of_accounts/level2"
            element={
              isAuthenticated ? <Level2 /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/chart_of_accounts/level3"
            element={
              isAuthenticated ? <Level3 /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/chart_of_accounts/level4"
            element={
              isAuthenticated ? <Level4 /> : <Navigate to="/login" replace />
            }
          />

          <Route path="/defaults" element={<Defaults />} />
          <Route path="/excel-import" element={<ExcelImport />} />
          <Route
            path="/defaults/banks"
            element={
              isAuthenticated ? <DefaultBanks /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/cash"
            element={
              isAuthenticated ? <DefaultCash /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/debtors"
            element={
              isAuthenticated ? <DefaultDebtors /> : <Navigate to="/login" replace />
            }
          /><Route
            path="/defaults/creditors"
            element={
              isAuthenticated ? <DefaultCreditors /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/raw_materials"
            element={
              isAuthenticated ? <DefaultRawMaterials /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/sales"
            element={
              isAuthenticated ? <DefaultFinishedGoods /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/broker-accounts"
            element={
              isAuthenticated ? <DefaultBrokerCode /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/govt_taxes"
            element={
              isAuthenticated ? <DefaultGovtTaxes /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/defaults/discounts"
            element={
              isAuthenticated ? <DefaultDiscount /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/cost_revenue_center" element={<CostAndRevenueCenter />} />
          <Route
            path="/cost_revenue/parent"
            element={
              isAuthenticated ? <ParentCenter /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/cost_revenue/child"
            element={
              isAuthenticated ? <ChildCenter /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/regional_coding" element={<RegionalCoding />} />
          <Route path="/profile_setting" element={<ProfileSetting />} />
          <Route path="/other_setting" element={<OtherSettings />} />
          <Route path="/fbr_requirements" element={<FbrRequirements />} />

          <Route
            path="/regional/provinces"
            element={
              isAuthenticated ? <Provinces /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/cities"
            element={
              isAuthenticated ? <Cities /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/sales"
            element={
              isAuthenticated ? <SalesPerson /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/unit-measurement"
            element={
              isAuthenticated ? <UnitMeasurement /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/product_rate_setting"
            element={
              isAuthenticated ? <ProductRateSetting /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/discount_rate_setting"
            element={
              isAuthenticated ? <DiscountRateSetting /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/tax_rate_setting"
            element={
              isAuthenticated ? <TaxRateSetting /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/item-profile"
            element={
              isAuthenticated ? <ItemProfile /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/godown"
            element={
              isAuthenticated ? <GoDown /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/customer_profile"
            element={
              isAuthenticated ? <CustomerProfile /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/regional/supplier_profile"
            element={
              isAuthenticated ? <SupplierProfile /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/fbr/sro-schedule"
            element={
              isAuthenticated ? <SroSchedule /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/fbr/item-description-code"
            element={
              isAuthenticated ? <ItemDescriptionCode /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/transactions/cash_voucher"
            element={
              isAuthenticated ? <CashVoucher /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/transactions/sales_voucher"
            element={
              isAuthenticated ? <SalesVoucher /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/contracts/purchase_order"
            element={
              isAuthenticated ? <PurchaseOrder /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/import-partyaccount-coding"
            element={
              isAuthenticated ? <ImportPartyAccountCoding /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/import-childcenter-coding"
            element={
              isAuthenticated ? <ImportChildCenterCoding /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/import-salesinvoice-coding"
            element={
              isAuthenticated ? <ImportSalesInvoice /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}