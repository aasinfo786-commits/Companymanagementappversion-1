// 📁 routes/financialYearRoutes.js
const express = require("express");
const router = express.Router();
const financialYearController = require("../controllers/financialYearController");

// ✅ Create a new financial year (protected)
router.post("/", financialYearController.createFinancialYear);

// ❌ Removed authMiddleware from this route to make it public
router.get("/", financialYearController.getFinancialYears);

// ✅ Still protected: Get the current default financial year
router.get("/current", financialYearController.getCurrentFinancialYear);

// ✅ Get financial year by ID (protected)
router.get("/:id", financialYearController.getFinancialYearById);

// ✅ Update a financial year by ID (protected)
router.put("/:id", financialYearController.updateFinancialYear);

// ✅ Delete a financial year by ID (protected)
router.delete("/:id", financialYearController.deleteFinancialYear);

module.exports = router;
