const ChildCenter = require('../models/ChildCenter');
const ParentCenter = require('../models/ParentCenter');

const childCenterController = {
  // Create new child center
  createChildCenter: async (req, res) => {
    try {
      const { companyId, parentCenterId, title, startDate, isActive = true, childCode, createdBy, updatedBy } = req.body;
      
      // Validate required fields
      if (!companyId || !parentCenterId || !title || !startDate) {
        return res.status(400).json({
          success: false,
          error: 'Company ID, Parent Center, Title and Start Date are required'
        });
      }
      
      // Get parent center info
      const parentCenter = await ParentCenter.findOne({
        companyId,
        _id: parentCenterId
      }).lean();
      
      if (!parentCenter) {
        return res.status(404).json({
          success: false,
          error: 'Parent center not found'
        });
      }
      
      // Check if child code already exists for this parent center only (not across the entire company)
      const existingChildCenter = await ChildCenter.findOne({
        parentCenterId,
        childCode
      });
      
      if (existingChildCenter) {
        return res.status(400).json({
          success: false,
          error: `Child center with code ${childCode} already exists for this parent center`
        });
      }
      
      const childCenter = new ChildCenter({
        companyId,
        parentCenterId,
        parentCode: parentCenter.parentCode,
        childCode,
        title,
        startDate,
        isActive,
        createdBy: createdBy || "System", // Set createdBy
        updatedBy: updatedBy || createdBy || "System" // Set updatedBy to same as createdBy
      });
      
      await childCenter.save();
      
      res.status(201).json({
        success: true,
        message: 'Child center created successfully',
        data: childCenter
      });
    } catch (err) {
      console.error('Error creating child center:', err);
      
      let errorMessage = 'Failed to create child center';
      if (err.name === 'ValidationError') {
        errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
      } else if (err.code === 11000) {
        // Handle duplicate key error specifically for parentCenterId + childCode combination
        errorMessage = 'Child center with this code already exists for this parent center';
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Get last child code for a parent center
  getLastChildCode: async (req, res) => {
    try {
      const { companyId, parentCenterId } = req.query;
      
      if (!companyId || !parentCenterId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID and Parent Center ID are required'
        });
      }
      
      // Find the last used child code specifically for this parent center
      const lastChildCenter = await ChildCenter.findOne({
        companyId,
        parentCenterId
      }).sort({ childCode: -1 }).limit(1);
      
      if (lastChildCenter && lastChildCenter.childCode) {
        // Get the next available code for this parent center
        const lastCodeNumber = parseInt(lastChildCenter.childCode);
        const nextCode = (lastCodeNumber + 1).toString().padStart(3, '0');
        
        res.json({
          success: true,
          lastCode: lastChildCenter.childCode,
          nextCode: nextCode
        });
      } else {
        // No child centers exist for this parent center yet, start with 001
        res.json({
          success: true,
          lastCode: null,
          nextCode: "001"
        });
      }
    } catch (err) {
      console.error('Error fetching last child code:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch last child code',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Check if child code exists in a parent center
  checkChildCodeExists: async (req, res) => {
    try {
      const { companyId, parentCenterId, childCode } = req.query;
      
      if (!companyId || !parentCenterId || !childCode) {
        return res.status(400).json({
          success: false,
          error: 'Company ID, Parent Center ID, and Child Code are required'
        });
      }
      
      const existingChildCenter = await ChildCenter.findOne({
        companyId,
        parentCenterId,
        childCode
      });
      
      res.json({
        success: true,
        exists: !!existingChildCenter
      });
    } catch (err) {
      console.error('Error checking child code:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to check child code',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Get all child centers for company
  getChildCenters: async (req, res) => {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID is required'
        });
      }
      
      const childCenters = await ChildCenter.find({ companyId })
        .sort({ parentCode: 1, childCode: 1 })
        .lean();
      
      res.json({
        success: true,
        count: childCenters.length,
        data: childCenters
      });
    } catch (err) {
      console.error('Error fetching child centers:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch child centers',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Update child center
  updateChildCenter: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, startDate, isActive, parentCenterId, updatedBy } = req.body;
      
      // Get the current child center
      const currentChildCenter = await ChildCenter.findById(id);
      
      if (!currentChildCenter) {
        return res.status(404).json({
          success: false,
          error: 'Child center not found'
        });
      }
      
      // Check if parent center is being changed
      if (parentCenterId && parentCenterId !== currentChildCenter.parentCenterId.toString()) {
        // Get the parent center info
        const parentCenter = await ParentCenter.findById(parentCenterId);
        
        if (!parentCenter) {
          return res.status(404).json({
            success: false,
            error: 'Parent center not found'
          });
        }
        
        // Check if the current child code already exists in the new parent center
        const existingChildCenter = await ChildCenter.findOne({
          parentCenterId,
          childCode: currentChildCenter.childCode,
          _id: { $ne: id } // Exclude the current record from the check
        });
        
        let newChildCode = currentChildCenter.childCode;
        let codeChanged = false;
        
        // If child code exists in the new parent center, generate a new one
        if (existingChildCenter) {
          // Find the last child center for the new parent center only
          const lastChildCenter = await ChildCenter.findOne({
            companyId: currentChildCenter.companyId,
            parentCenterId
          }).sort({ childCode: -1 }).limit(1);
          
          if (lastChildCenter && lastChildCenter.childCode) {
            const lastCodeNumber = parseInt(lastChildCenter.childCode);
            newChildCode = (lastCodeNumber + 1).toString().padStart(3, '0');
          } else {
            newChildCode = "001";
          }
          codeChanged = true;
        }
        
        // Update the child center with new parent info and potentially new child code
        const updateData = {
          parentCenterId,
          parentCode: parentCenter.parentCode,
          childCode: newChildCode,
          ...(title && { title: title.trim() }),
          ...(startDate && { startDate }),
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(updatedBy && { updatedBy }) // Only update updatedBy
        };
        
        const updatedChildCenter = await ChildCenter.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
        
        // If child code was changed, include a message about it
        const message = codeChanged
          ? `Child center updated successfully. Child code was changed to ${newChildCode} to avoid conflict in the new parent center.`
          : 'Child center updated successfully';
        
        res.json({
          success: true,
          message,
          data: updatedChildCenter
        });
      } else {
        // Parent center not changing, update other fields normally
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (startDate) updateData.startDate = startDate;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (updatedBy) updateData.updatedBy = updatedBy; // Only update updatedBy
        
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No valid fields provided for update'
          });
        }
        
        const updatedChildCenter = await ChildCenter.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
        
        res.json({
          success: true,
          message: 'Child center updated successfully',
          data: updatedChildCenter
        });
      }
    } catch (err) {
      console.error('Error updating child center:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to update child center',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Delete child center
  deleteChildCenter: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedChildCenter = await ChildCenter.findByIdAndDelete(id);
      
      if (!deletedChildCenter) {
        return res.status(404).json({
          success: false,
          error: 'Child center not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Child center deleted successfully',
        data: deletedChildCenter
      });
    } catch (err) {
      console.error('Error deleting child center:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to delete child center',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  
  // Toggle active status
  toggleActiveStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, updatedBy } = req.body;
      
      const childCenter = await ChildCenter.findById(id);
      
      if (!childCenter) {
        return res.status(404).json({
          success: false,
          error: 'Child center not found'
        });
      }
      
      childCenter.isActive = typeof isActive === 'boolean' ? isActive : !childCenter.isActive;
      if (updatedBy) childCenter.updatedBy = updatedBy; // Only update updatedBy
      
      await childCenter.save();
      
      res.json({
        success: true,
        message: `Child center ${childCenter.isActive ? 'activated' : 'deactivated'} successfully`,
        data: childCenter
      });
    } catch (err) {
      console.error('Error toggling child center status:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle active status',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

module.exports = childCenterController;