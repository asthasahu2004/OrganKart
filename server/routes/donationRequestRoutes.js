const express = require("express");
const router = express.Router();
const DonationRequest = require("../models/DonationRequest");
const Product = require("../models/products"); // Correct path to products model
const Category = require("../models/categories"); // Correct path to categories model
const User = require("../models/users"); // Correct path to users model
const { loginCheck } = require("../middleware/auth"); // Use your existing auth middleware

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
router.post("/create", loginCheck, async (req, res) => {
  try {
    const { organName, category, images, pinCode, description, quantity } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected"
      });
    }

    // Check if user has pending requests for the same organ
    const existingRequest = await DonationRequest.findOne({
      requestedBy: req.user._id,
      organName: organName.trim(),
      status: "Pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this organ"
      });
    }

    const donationRequest = new DonationRequest({
      organName: organName.trim(),
      category,
      images,
      pinCode,
      description: description.trim(),
      quantity: quantity || 1,
      requestedBy: req.user._id
    });

    await donationRequest.save();

    res.status(201).json({
      success: true,
      message: "Donation request submitted successfully",
      data: donationRequest
    });

  } catch (error) {
    console.error("Error creating donation request:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create donation request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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