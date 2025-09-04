const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Utility: Safely delete a file if it exists
const removeFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};

// GET: All users (excluding password & __v)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to retrieve users', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// GET: Single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error retrieving user', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// POST: Create a new user
exports.createUser = async (req, res) => {
  const {
    username,
    userFullName,
    role = 'user',
    password,
    isAllowed,
    companyId,
    locationId,
    financialYearId,
  } = req.body;
  
  if (!username || !userFullName || !password) {
    if (req.file) removeFile(req.file.path);
    return res.status(400).json({ message: 'Username, full name, and password are required' });
  }
  
  try {
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      if (req.file) removeFile(req.file.path);
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const newUser = new User({
      username: username.trim(),
      userFullName: userFullName.trim(),
      role: role.trim(),
      password,
      isAllowed: isAllowed === 'true' || isAllowed === true,
      userPicture: req.file ? `/uploads/profile-pictures/${req.file.filename}` : null,
      companyId: companyId ? companyId.trim() : null,
      locationId: locationId ? locationId.trim() : null,
      financialYearId: financialYearId ? financialYearId.trim() : null,
    });
    
    await newUser.save();
    
    const responseUser = newUser.toObject();
    delete responseUser.password;
    delete responseUser.__v;
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: responseUser 
    });
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// PUT: Update existing user
exports.updateUser = async (req, res) => {
  try {
    const {
      username,
      userFullName,
      role,
      isAllowed,
      companyId,
      locationId,
      financialYearId,
      oldPassword,
      newPassword
    } = req.body;
    
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      if (req.file) removeFile(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Handle password change if requested
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
      user.password = newPassword; // Will be hashed in pre-save hook
    }
    
    // Check if username is being changed and if it already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      user.username = username.trim();
    }
    
    // Prepare updates
    if (userFullName) user.userFullName = userFullName.trim();
    if (role) user.role = role.trim();
    if (typeof isAllowed !== 'undefined') user.isAllowed = isAllowed === 'true' || isAllowed === true;
    if (companyId !== undefined) user.companyId = companyId ? companyId.trim() : null;
    if (locationId !== undefined) user.locationId = locationId ? locationId.trim() : null;
    if (financialYearId !== undefined) user.financialYearId = financialYearId ? financialYearId.trim() : null;
    
    // If new profile picture is uploaded, replace the old one
    if (req.file) {
      if (user.userPicture) {
        const oldPath = path.join(__dirname, '../public', user.userPicture);
        removeFile(oldPath);
      }
      user.userPicture = `/uploads/profile-pictures/${req.file.filename}`;
    }
    
    await user.save();
    
    const responseUser = user.toObject();
    delete responseUser.password;
    delete responseUser.__v;
    
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: responseUser 
    });
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// DELETE: Delete user and profile picture
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.userPicture) {
      const imagePath = path.join(__dirname, '../public', user.userPicture);
      removeFile(imagePath);
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// PATCH: Change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required' });
  }
  
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    
    user.password = newPassword; // Will be hashed in pre-save hook
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error changing password', 
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};