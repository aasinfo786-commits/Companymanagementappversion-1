const mongoose = require('mongoose');
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/companies_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Define the Menu schema
const menuSchema = new mongoose.Schema({
  title: String,
  href: String,
  icon: String,
  children: [mongoose.Schema.Types.Mixed],
});
const Menu = mongoose.model('Menu', menuSchema);
// Sample menu data with href and icon
const sampleMenus = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "Home",
    children: [],
  },
  {
    title: "Company",
    href: "/view_company",
    icon: "Building",
    children: [],
  },
  {
    title: "Locations",
    href: "view_location",
    icon: "Boxes",
    children: [],
  },
  {
    title: "Financial Year",
    href: "/financial_year",
    icon: "Calendar",
    children: [],
  },
  {
    title: "User Management",
    href: "/users",
    icon: "Users",
    children: [],
  },
  {
    title: "Chart of Accounts",
    href: "/chart_of_accounts",
    icon: "FolderTree",
    children: [],
  },
  {
    title: "Cost / Revenue Center",
    href: "/cost_revenue_center",
    icon: "PieChart",
    children: [],
  },
  {
    title: "Defaults",
    href: "/defaults",
    icon: "Settings",
    children: [],
  },
  {
    title: "Regional Coding",
    href: "/regional_coding",
    icon: "Map",
    children: [],
  },
  {
    title: "Excel Import",
    href: "/excel-import",
    icon: "FileSpreadsheet",
    children: [],
  },
  {
    title: "Profile Setting",
    href: "/profile_setting",
    icon: "User",
    children: [],
  },
  {
    title: "Other Setting",
    href: "/other_setting",
    icon: "Settings",
    children: [],
  },
  {
    title: "FBR Requirements",
    href: "/fbr_requirements",
    icon: "FileSearch",
    children: [],
  },
  {
    title: "Transactions",
    href: "",
    icon: "FileText",
    children: [
      {
        title: "Cash Voucher",
        href: "/transactions/cash_voucher",
        icon: "Wallet",
        children: [],
      },
      {
        title: "Sales Voucher",
        href: "/transactions/sales_voucher",
        icon: "ShoppingCart",
        children: [],
      },
      {
        title: "Bank Voucher",
        href: "/transactions/bank_voucher",
        icon: "Banknote",
        children: [],
      },
      {
        title: "Journal Voucher",
        href: "/transactions/journal_voucher",
        icon: "BookText",
        children: [],
      },
    ],
  },
  {
    title: "Contracts",
    href: "",
    icon: "FileSignature", // example Lucide icon
    children: [
      {
        title: "Purchase Order",
        href: "/contracts/purchase_order",
        icon: "ClipboardList", // example Lucide icon
        children: [],
      }
    ],
  }
];
// Insert menus
async function insertMenus() {
  try {
    await Menu.deleteMany(); // Optional: Clear existing menus
    const result = await Menu.insertMany(sampleMenus);
    console.log("Menus inserted:", result);
    mongoose.disconnect();
  } catch (err) {
    console.error("Error inserting menus:", err);
    mongoose.disconnect();
  }
}
insertMenus();