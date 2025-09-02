// 📁 controllers/locationController.js
import Location from "../models/Location.js";
import Company from "../models/Company.js";
import mongoose from "mongoose"; // Add this import
// Helper function to ensure 2-digit format
const formatId = (id) => {
  if (!id) return null;
  const num = parseInt(id, 10);
  return isNaN(num) ? id : String(num).padStart(2, '0');
};
// Return all locations (both active and inactive)
export const getLocations = async (req, res) => {
  try {
    const { companyId } = req.query;
    console.log('Request received at getLocations');
    
    const query = {};
    if (companyId) {
      const formattedCompanyId = formatId(companyId);
      const companyExists = await Company.findOne({ companyId: formattedCompanyId });
      if (!companyExists) {
        return res.status(404).json({ message: "Company not found" });
      }
      query.companyId = formattedCompanyId;
    }
    
    // Get locations without sorting first
    const locations = await Location.find(query).lean();
    
    // Sort locations numerically by locationId
    locations.sort((a, b) => {
      const numA = parseInt(a.locationId, 10);
      const numB = parseInt(b.locationId, 10);
      return numA - numB;
    });
    
    const locationsWithCompany = await Promise.all(
      locations.map(async (location) => {
        const company = await Company.findOne({ companyId: location.companyId });
        return {
          ...location,
          companyName: company ? company.companyName : "Unknown",
          // Include formatted timestamps
          formattedCreatedAt: location.createdAt ? location.createdAt.toLocaleString() : 'Not set',
          formattedUpdatedAt: location.updatedAt ? location.updatedAt.toLocaleString() : 'Not set'
        };
      })
    );
    
    // Return plain array for frontend's `.map()` to work
    res.status(200).json(locationsWithCompany);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching locations",
      error: error.message
    });
  }
};
// Use findById instead of findOne with locationId
export const getLocationById = async (req, res) => {
  console.log('Request received getLocationById');
  try {
    // Use MongoDB's findById to search by _id instead of locationId
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    const company = await Company.findOne({ companyId: location.companyId });
    
    // Format timestamps for display
    const formattedLocation = location.toObject();
    formattedLocation.formattedCreatedAt = location.createdAt ? location.createdAt.toLocaleString() : 'Not set';
    formattedLocation.formattedUpdatedAt = location.updatedAt ? location.updatedAt.toLocaleString() : 'Not set';
    
    res.status(200).json({
      ...formattedLocation,
      company: company || null,
      companyName: company ? company.companyName : "Unknown",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching location",
      error: error.message
    });
  }
};
export const createLocation = async (req, res) => {
  try {
    const { locationName, address, phone, companyId, createdBy } = req.body;
    if (!locationName || !address || !phone || !companyId || !createdBy) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["locationName", "address", "phone", "companyId", "createdBy"]
      });
    }
    
    const formattedCompanyId = formatId(companyId);
    const companyExists = await Company.findOne({ companyId: formattedCompanyId });
    if (!companyExists) {
      return res.status(400).json({ message: "Invalid companyId" });
    }
    
    const lastLocation = await Location.findOne({ companyId: formattedCompanyId })
      .sort({ locationId: -1 });
    const nextLocationId = lastLocation
      ? String(parseInt(lastLocation.locationId, 10) + 1).padStart(2, '0')
      : '01';
      
    const location = new Location({
      ...req.body,
      locationId: nextLocationId,
      companyId: formattedCompanyId,
      createdBy: req.body.createdBy,
      updatedBy: req.body.createdBy // Set updatedBy to createdBy on creation
    });
    
    const savedLocation = await location.save();
    
    // Format timestamps for response
    const responseLocation = savedLocation.toObject();
    responseLocation.formattedCreatedAt = savedLocation.createdAt.toLocaleString();
    responseLocation.formattedUpdatedAt = savedLocation.updatedAt.toLocaleString();
    
    res.status(201).json(responseLocation);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create location",
      error: error.message
    });
  }
};
// Allow companyId to be updated with validation
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the existing location to preserve the createdBy field
    const existingLocation = await Location.findById(id);
    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    // Create a clean update object by removing only forbidden fields
    const { locationId, _id, __v, createdAt, createdBy, ...updateData } = req.body;
    
    console.log('Update data:', updateData); // For debugging
    
    // Preserve the original createdBy field
    if (req.body.createdBy && req.body.createdBy !== existingLocation.createdBy) {
      // Log an attempt to change the createdBy field
      console.warn(`User ${req.body.updatedBy} attempted to change createdBy from ${existingLocation.createdBy} to ${req.body.createdBy}`);
      // Revert to the original createdBy
      updateData.createdBy = existingLocation.createdBy;
    }
    
    // If companyId is being updated, validate it and generate a new locationId if needed
    if (updateData.companyId) {
      const formattedCompanyId = formatId(updateData.companyId);
      const companyExists = await Company.findOne({ companyId: formattedCompanyId });
      
      if (!companyExists) {
        return res.status(400).json({ message: "Invalid companyId" });
      }
      
      // If companyId is changing, we need to generate a new locationId for the new company
      if (formattedCompanyId !== existingLocation.companyId) {
        // Find the last locationId for the new company
        const lastLocation = await Location.findOne({ companyId: formattedCompanyId })
          .sort({ locationId: -1 });
        
        // Generate the next locationId
        const nextLocationId = lastLocation
          ? String(parseInt(lastLocation.locationId, 10) + 1).padStart(2, '0')
          : '01';
        
        // Update the companyId and locationId
        updateData.companyId = formattedCompanyId;
        updateData.locationId = nextLocationId;
      } else {
        // If companyId is not changing, just format it
        updateData.companyId = formattedCompanyId;
      }
    }
    
    // Always update the updatedBy field when updating
    if (req.body.updatedBy) {
      updateData.updatedBy = req.body.updatedBy;
    } else {
      updateData.updatedBy = existingLocation.updatedBy;
    }
    
    // Mongoose will automatically update the updatedAt timestamp
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Get company info for the response
    const company = await Company.findOne({ companyId: updatedLocation.companyId });
    
    // Format timestamps for response
    const responseLocation = updatedLocation.toObject();
    responseLocation.formattedCreatedAt = updatedLocation.createdAt.toLocaleString();
    responseLocation.formattedUpdatedAt = updatedLocation.updatedAt.toLocaleString();
    
    res.status(200).json({
      ...responseLocation,
      companyName: company ? company.companyName : "Unknown",
    });
  } catch (error) {
    console.error('Update error:', error); // For debugging
    
    // Handle duplicate key error specifically
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({
        message: "A location with this ID already exists for this company. Please try a different company or contact your administrator.",
        error: "Duplicate location ID"
      });
    }
    
    res.status(400).json({
      message: "Failed to update location",
      error: error.message
    });
  }
};
// Hard delete - permanently remove the location from the database
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete location with ID: ${id}`);
    
    // First, get the location to be deleted to access its locationId
    const location = await Location.findById(id);
    if (!location) {
      console.log(`Location not found with ID: ${id}`);
      return res.status(404).json({ message: "Location not found" });
    }
    
    const locationId = location.locationId;
    const companyId = location.companyId;
    console.log(`Found location: ${locationId} in company: ${companyId}`);
    
    // Check for references in User model specifically (since we know this is a common reference)
    try {
      const User = mongoose.model('User');
      // Check for users with BOTH the specific companyId AND locationId
      const userCount = await User.countDocuments({ 
        companyId: companyId,
        locationId: locationId
      });
      if (userCount > 0) {
        console.log(`Found ${userCount} users in company ${companyId} referencing location ${locationId}`);
        return res.status(400).json({ 
          success: false,
          message: `Cannot delete location. Found ${userCount} user(s) in company ${companyId} referencing location ${locationId}.`,
          details: {
            locationId,
            companyId,
            references: [
              {
                model: "User",
                count: userCount,
                field: "companyId AND locationId"
              }
            ],
            actionRequired: "Please reassign or delete these users before deleting the location."
          }
        });
      }
    } catch (error) {
      console.error('Error checking User model:', error.message);
    }
    
    // Check other models that might reference the location
    const modelNames = [
      'AccountLevel1', 'AccountLevel2', 'AccountLevel3', 'AccountLevel4',
      'BankAccount', 'CashAccount', 'DebtorAccount', 'CreditorAccount',
      'CashVoucher', 'ChildCenter', 'CustomerProfile', 'DiscountRate',
      'DiscountSetting', 'financialYearModel', 'FinishedGoods', 'goDown',
      'GovtTaxAccount', 'ItemDescriptionCode', 'ItemProfile', 'ParentCenter',
      'ProductRateSetting', 'RawMaterial', 'SalesPerson', 'SalesVoucher',
      'SroSchedule', 'TaxRateSetting', 'UnitMeasurement'
    ];
    
    const references = [];
    
    for (const modelName of modelNames) {
      try {
        const Model = mongoose.model(modelName);
        
        // ONLY check for records with BOTH the specific companyId AND locationId
        const combinedCount = await Model.countDocuments({ 
          companyId: companyId,
          locationId: locationId
        });
        
        if (combinedCount > 0) {
          references.push({ 
            model: modelName, 
            count: combinedCount, 
            field: 'companyId AND locationId' 
          });
          console.log(`Found ${combinedCount} references in ${modelName} for both companyId ${companyId} and locationId ${locationId}`);
        }
        
        // NOTE: We're no longer checking for companyId-only references
        // This prevents false positives when other locations in the same company are referenced
      } catch (error) {
        console.error(`Error checking ${modelName}:`, error.message);
      }
    }
    
    // If there are references, return an error with details
    if (references.length > 0) {
      // Format reference details for the error message
      const referenceDetails = references.map(ref => 
        `${ref.model} model: ${ref.count} records with ${ref.field}`
      ).join(', ');
      
      console.log(`References found: ${referenceDetails}`);
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete location. Found references in: ${referenceDetails}.`,
        details: {
          locationId,
          companyId,
          references: references,
          actionRequired: "Please remove all references to this location before deleting."
        }
      });
    }
    
    // If no references, proceed with deletion
    console.log('No references found, proceeding with deletion');
    const deletedLocation = await Location.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
      data: deletedLocation
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
      error: error.message
    });
  }
};