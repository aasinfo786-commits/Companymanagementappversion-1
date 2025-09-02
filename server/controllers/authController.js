const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

exports.login = async (req, res) => {
  const { username, password, companyId, locationId, financialYearId } = req.body;
  try {
    // 1. Verify user credentials
    const user = await User.findOne({ username }).select('+password').populate('accessibleMenus');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // 2. Get the company's FBR token
    let fbrToken = null;
    if (companyId) {
      const company = await Company.findOne({ companyId });
      if (company && company.fbrToken) {
        fbrToken = company.fbrToken;
      }
    }
    
    // 3. Generate JWT token
    const payload = { 
      id: user._id, 
      username: user.username, 
      role: user.role,
      companyId: user.companyId,
      locationId: user.locationId,
      financialYearId: user.financialYearId
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // 4. Return response with tokens and user data including accessible menus
    res.json({ 
      token,
      fbrToken, // Include the FBR token in the response
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        locationId: user.locationId,
        financialYearId: user.financialYearId,
        accessibleMenus: user.accessibleMenus || [] // Include accessible menus
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new endpoint to get current user data with populated menus
exports.getCurrentUser = async (req, res) => {
  try {
    // Get user with populated accessible menus
    const user = await User.findById(req.user.id).populate('accessibleMenus');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      userFullName: user.userFullName,
      role: user.role,
      companyId: user.companyId,
      locationId: user.locationId,
      financialYearId: user.financialYearId,
      userPicture: user.userPicture,
      isAllowed: user.isAllowed,
      accessibleMenus: user.accessibleMenus || []
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};