const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import routes
const menuRoutes = require('./routes/menuRoutes');
const companyRoutes = require('./routes/companyRoutes');
const locationRoutes = require('./routes/locationRoutes');
const financialYearRoutes = require('./routes/financialYearRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const accountLevel1Routes = require('./routes/accountLevel1Routes'); // ✅ import
const accountLevel2Routes = require('./routes/accountLevel2Routes'); // ✅ import
const accountLevel3Routes = require('./routes/accountLevel3Routes'); // ✅ import
const accountLevel4Routes = require('./routes/accountLevel4Routes'); // ✅ import
const bankAccountRoutes = require('./routes/bankAccountRoutes'); // ✅ import
const cashAccountRoutes = require('./routes/cashAccountRoutes'); // ✅ import
const debtorAccountRoutes = require('./routes/debtorAccountRoutes'); // ✅ import
const creditorAccountRoutes = require('./routes/creditorAccountRoutes'); // ✅ import
const rawMaterialRoutes = require('./routes/rawMaterialRoutes'); // ✅ import
const finishedGoodsRoutes = require('./routes/finishedGoodsRoutes'); // ✅ import
const govtTaxesRoutes = require('./routes/govtTaxesRoutes'); // ✅ import
const parentCenterRoutes = require('./routes/parentCenterRoutes');
const childCenterRoutes = require('./routes/childCenterRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const cityRoutes = require('./routes/cityRoutes');
const salesPersonRoutes = require('./routes/salesPersonRoutes');
const itemProfileRoutes = require('./routes/itemProfileRoutes');
const godownRoutes = require('./routes/goDownRoutes');
const productRateSettingRoutes = require('./routes/productRateSettingRoutes');
const discountRateSettingRoutes = require('./routes/discountRateSettingRoutes');
const discountRateRoutes = require('./routes/discountRateRoutes');
const customerProfileRoutes = require('./routes/customerProfileRoutes');
const supplierProfileRoutes = require('./routes/supplierProfileRoutes');
const cashVoucherRoutes = require('./routes/cashVoucherRoutes');
const salesVoucherRoutes = require('./routes/salesVoucherRoutes');
const unitMeasurementRoutes = require('./routes/unitMeasurementRoutes')
const sroScheduleRoutes = require('./routes/sroScheduleRoutes');
const itemDescriptionCodeRoutes = require('./routes/itemDescriptionCodeRoutes');
const taxRateSettingRoutes = require('./routes/taxRateSettingRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const brokerAccountRoutes = require('./routes/brokerAccountRoutes');
const importPartyAccountRoutes = require('./routes/importPartyAccountRoutes');
const importChildCenterRoutes = require('./routes/importChildCenterRoutes');
const importSalesInvoiceRoutes = require('./routes/importSalesInvoiceRoutes');


const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Uploads directory setup
const uploadDir = path.resolve(__dirname, '..', 'public', 'uploads', 'profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Upload directory created at: ${uploadDir}`);
} else {
  console.log(`Upload directory exists at: ${uploadDir}`);
}
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'public', 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/companies_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Health check
app.use('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version,
    uploadsDirectory: uploadDir,
    fileUpload: true
  });
});

// Public routes (no auth required)
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes); // public

// DEBUG: log token on incoming protected requests (development only)
if (process.env.NODE_ENV === 'development') {
  app.use('/api', (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      console.warn('⚠️ No Authorization header provided on request:', req.method, req.originalUrl);
    } else {
      console.log('🔐 Incoming token:', token);
    }
    next();
  });
}

// ✅ Protected routes (auth required)
app.use('/api/menus', menuRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/financial-years', financialYearRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts/level1', accountLevel1Routes); // ✅ FIXED
app.use('/api/accounts/level2', accountLevel2Routes); // ✅ FIXED
app.use('/api/accounts/level3', accountLevel3Routes); // ✅ FIXED
app.use('/api/accounts/level4', accountLevel4Routes); // ✅ FIXED
app.use('/api', bankAccountRoutes);
app.use('/api', cashAccountRoutes);
app.use('/api', debtorAccountRoutes);
app.use('/api', creditorAccountRoutes);
app.use('/api', rawMaterialRoutes);
app.use('/api', finishedGoodsRoutes);
app.use('/api/defaults/govt_taxes', govtTaxesRoutes);
app.use('/api/parent-centers', parentCenterRoutes);
app.use('/api/child-centers', childCenterRoutes);
app.use('/api/unit-measurement', unitMeasurementRoutes);
app.use('/api/sro-schedule', sroScheduleRoutes);
app.use('/api/item-description-codes', itemDescriptionCodeRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/sales-persons', salesPersonRoutes)
app.use('/api/item-profile', itemProfileRoutes);
app.use('/api/godown', godownRoutes);
app.use('/api/product-rates', productRateSettingRoutes);
app.use('/api/product-discounts', discountRateSettingRoutes);
app.use('/api/defaults/discounts', discountRateRoutes);
app.use('/api/customer-profile', customerProfileRoutes);
app.use('/api/supplier-profile', supplierProfileRoutes);
app.use('/api/vouchers', cashVoucherRoutes);
// app.use('/api', cashVoucherRoutes);
app.use('/api/sales-vouchers', salesVoucherRoutes);
app.use('/api/tax-rates', taxRateSettingRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api',brokerAccountRoutes)
app.use('/api/import-partyaccount-coding', importPartyAccountRoutes); // Mount with the correct prefix
app.use('/api/import-childcenter-coding', importChildCenterRoutes); // Mount with the correct prefix
app.use('/api/import-sales-invoice', importSalesInvoiceRoutes); // Mount with the correct prefix


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/auth/login',
      '/api/health',
      '/api/companies'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('\x1b[31m', err.stack, '\x1b[0m');

  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'Requested resource not found',
      path: err.path
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      field: err.field,
      code: err.code
    });
  }

  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value',
      field,
      value: err.keyValue[field]
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      stack: err.stack,
      ...err
    } : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\x1b[32mServer running on http://localhost:${PORT}\x1b[0m`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\x1b[33m${signal} received. Shutting down...\x1b[0m`);
  try {
    await server.close();
    console.log('HTTP server closed');
    await mongoose.connection.close(false);
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    console.error('\x1b[31mError during shutdown:\x1b[0m', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('\x1b[31mUnhandled Rejection:\x1b[0m', err);
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  console.error('\x1b[31mUncaught Exception:\x1b[0m', err);
  shutdown('uncaughtException');
});

