const express = require("express");
const router = express.Router();
const DonationRequest = require("../models/DonationRequest");
const Product = require("../models/products"); // Correct path to products model
const Category = require("../models/categories"); // Correct path to categories model
const User = require("../models/users"); // Correct path to users model
const { loginCheck } = require("../middleware/auth"); // Use your existing auth middleware
const multer = require("multer");
const path = require("path");

// Set destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/donations");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

// Helper function to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// CREATE DONATION REQUEST
// CREATE DONATION REQUEST - CORRECTED VERSION
// Enhanced debugging version of your donation request route
router.post("/create", loginCheck, upload.array("images", 5), async (req, res) => {
  try {
    console.log("=== DETAILED DEBUGGING BACKEND REQUEST ===");
    console.log("req.body:", JSON.stringify(req.body, null, 2));
    console.log("req.files:", req.files?.map(f => ({ 
      fieldname: f.fieldname, 
      originalname: f.originalname, 
      size: f.size,
      mimetype: f.mimetype
    })));
    console.log("req.user:", req.user);
    console.log("=== VALIDATION CHECKS ===");

    const { organName, category, pinCode, description, quantity } = req.body;

    // Check 1: Organ name validation
    console.log("1. Organ name check:", { organName, isValid: !(!organName || !organName.trim()) });
    if (!organName || !organName.trim()) {
      console.log("❌ FAILED: Organ name validation");
      return res.status(400).json({
        success: false,
        message: "Organ name is required",
        debug: { organName, trimmed: organName?.trim() }
      });
    }

    // Check 2: Category validation
    console.log("2. Category check:", { category, isValid: !!category });
    if (!category) {
      console.log("❌ FAILED: Category validation");
      return res.status(400).json({
        success: false,
        message: "Category is required",
        debug: { category }
      });
    }

    // Check 3: Pin code validation
    console.log("3. Pin code check:", { pinCode, length: pinCode?.length, isValid: pinCode && pinCode.length === 6 });
    if (!pinCode || pinCode.length !== 6) {
      console.log("❌ FAILED: Pin code validation");
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit pin code is required",
        debug: { pinCode, length: pinCode?.length }
      });
    }

    // Check 4: Description validation
    console.log("4. Description check:", { 
      description, 
      trimmedLength: description?.trim().length, 
      isValid: description && description.trim().length >= 10 
    });
    if (!description || description.trim().length < 10) {
      console.log("❌ FAILED: Description validation");
      return res.status(400).json({
        success: false,
        message: "Description must be at least 10 characters",
        debug: { description, trimmedLength: description?.trim().length }
      });
    }

    // Check 5: Files validation
    console.log("5. Files check:", { 
      hasFiles: !!(req.files && req.files.length > 0),
      fileCount: req.files?.length || 0
    });
    if (!req.files || req.files.length === 0) {
      console.log("❌ FAILED: Files validation");
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
        debug: { files: req.files, fileCount: req.files?.length || 0 }
      });
    }

    // Check 6: Category exists in database
    console.log("6. Category existence check - querying database...");
    const categoryExists = await Category.findById(category);
    console.log("Category query result:", { category, exists: !!categoryExists });
    if (!categoryExists) {
      console.log("❌ FAILED: Category existence validation");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category selected",
        debug: { category, found: !!categoryExists }
      });
    }

    // Check 7: Existing request check
    console.log("7. Existing request check - querying database...");
    const existingRequest = await DonationRequest.findOne({
      requestedBy: req.user._id,
      organName: organName.trim(),
      status: "Pending"
    });
    console.log("Existing request result:", { exists: !!existingRequest });
    if (existingRequest) {
      console.log("❌ FAILED: Existing request validation");
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this organ",
        debug: { existingRequestId: existingRequest._id }
      });
    }

    console.log("✅ ALL VALIDATIONS PASSED - Creating donation request...");

    // Get image paths from uploaded files
    const imagePaths = req.files.map(file => `/uploads/donations/${file.filename}`);

    const donationRequest = new DonationRequest({
      organName: organName.trim(),
      category,
      images: imagePaths,
      pinCode,
      description: description.trim(),
      quantity: quantity || 1,
      requestedBy: req.user._id
    });

    console.log("Donation request object to save:", donationRequest);

    await donationRequest.save();

    console.log("✅ Successfully created donation request:", donationRequest);

    res.status(201).json({
      success: true,
      message: "Donation request submitted successfully",
      data: donationRequest
    });

  } catch (error) {
    console.error("❌ ERROR in donation request creation:", error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      console.log("Validation errors:", errors);
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors,
        debug: { validationError: error.errors }
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create donation request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: { errorName: error.name, errorMessage: error.message }
    });
  }
});

// Additional debugging middleware to check what's being sent
router.use('/create', (req, res, next) => {
  console.log('=== RAW REQUEST DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Files received:', req.files ? req.files.length : 0);
  next();
});

// Test endpoint to verify form data parsing
router.post('/test-form', upload.array("images", 5), (req, res) => {
  res.json({
    body: req.body,
    files: req.files?.map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      size: f.size
    })) || [],
    message: "Form data parsing test"
  });
});


// GET ALL DONATION REQUESTS (ADMIN ONLY)
router.get("/all", loginCheck, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { organName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await DonationRequest.find(filter)
      .populate("requestedBy", "name email")
      .populate("category", "cName cDescription") // Use correct field names
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DonationRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation requests"
    });
  }
});

// APPROVE DONATION REQUEST
router.put("/approve/:id", loginCheck, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const donationRequest = await DonationRequest.findById(req.params.id)
      .populate("requestedBy", "name email")
      .populate("category", "cName cDescription");

    if (!donationRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found"
      });
    }

    if (donationRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved"
      });
    }

    // Create new product/organ in inventory using correct field names
    const newOrgan = new Product({
      pName: donationRequest.organName,
      pDescription: donationRequest.description,
      pCategory: donationRequest.category._id,
      pImages: donationRequest.images,
      pPrice: 0, // Set to 0 for donated organs
      pQuantity: donationRequest.quantity,
      pStatus: "Active",
      donatedBy: donationRequest.requestedBy._id,
      isDonated: true,
      donationRequestId: donationRequest._id
    });

    await newOrgan.save();

    // Update donation request status
    donationRequest.status = "Approved";
    donationRequest.approvedBy = req.user._id;
    donationRequest.approvedAt = new Date();
    if (adminNotes) donationRequest.adminNotes = adminNotes;

    await donationRequest.save();

    res.json({
      success: true,
      message: "Donation request approved successfully",
      data: {
        donationRequest,
        newOrgan
      }
    });

  } catch (error) {
    console.error("Error approving donation request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve donation request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// REJECT DONATION REQUEST
router.put("/reject/:id", loginCheck, isAdmin, async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required and must be at least 10 characters"
      });
    }

    const donationRequest = await DonationRequest.findById(req.params.id);

    if (!donationRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found"
      });
    }

    if (donationRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be rejected"
      });
    }

    donationRequest.status = "Rejected";
    donationRequest.rejectionReason = rejectionReason.trim();
    donationRequest.approvedBy = req.user._id;
    donationRequest.approvedAt = new Date();
    if (adminNotes) donationRequest.adminNotes = adminNotes;

    await donationRequest.save();

    res.json({
      success: true,
      message: "Donation request rejected successfully",
      data: donationRequest
    });

  } catch (error) {
    console.error("Error rejecting donation request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject donation request"
    });
  }
});

// GET USER'S DONATION REQUESTS
router.get("/my-requests", loginCheck, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const requests = await DonationRequest.find({ requestedBy: req.user._id })
      .populate("category", "cName cDescription") // Use correct field names
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DonationRequest.countDocuments({ requestedBy: req.user._id });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation requests"
    });
  }
});

// GET SINGLE DONATION REQUEST DETAILS
router.get("/:id", loginCheck, async (req, res) => {
  try {
    const donationRequest = await DonationRequest.findById(req.params.id)
      .populate("requestedBy", "name email")
      .populate("category", "cName cDescription")
      .populate("approvedBy", "name");

    if (!donationRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found"
      });
    }

    // Check if user owns this request or is admin
    if (donationRequest.requestedBy._id.toString() !== req.user._id.toString() && req.user.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      data: donationRequest
    });

  } catch (error) {
    console.error("Error fetching donation request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation request"
    });
  }
});

module.exports = router;