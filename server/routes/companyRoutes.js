const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
// const authMiddleware = require("../middleware/authMiddleware");  // no longer needed for public route

router.post("/", companyController.addCompany);
router.get("/", companyController.getCompanies);  // no auth here
router.get("/:id", companyController.getCompanyById);
router.get("/company/:companyId", companyController.getCompanyByCompanyId); // New route to search by companyId
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

module.exports = router;