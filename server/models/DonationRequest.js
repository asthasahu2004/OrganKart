const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const donationRequestSchema = new mongoose.Schema({
  organName: {
    type: String,
    required: [true, "Organ name is required"],
    trim: true,
    minlength: [2, "Organ name must be at least 2 characters"],
    maxlength: [100, "Organ name cannot exceed 100 characters"]
  },
  category: {
    type: ObjectId,
    ref: "categories",
    required: [true, "Category is required"]
  },
  images: [{
    type: String,
    required: [true, "At least one image is required"]
  }],
  pinCode: {
    type: Number,
    required: [true, "Pin code is required"],
    min: [100000, "Pin code must be 6 digits"],
    max: [999999, "Pin code must be 6 digits"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [10, "Description must be at least 10 characters"],
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity must be at least 1"]
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Approved", "Rejected"],
      message: "Status must be either Pending, Approved, or Rejected"
    },
    default: "Pending"
  },
  requestedBy: {
    type: ObjectId,
    ref: "users",
    required: [true, "Requested by user is required"]
  },
  rejectionReason: {
    type: String,
    maxlength: [500, "Rejection reason cannot exceed 500 characters"]
  },
  adminNotes: {
    type: String,
    maxlength: [500, "Admin notes cannot exceed 500 characters"]
  },
  approvedBy: {
    type: ObjectId,
    ref: "users"
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
donationRequestSchema.index({ status: 1, createdAt: -1 });
donationRequestSchema.index({ requestedBy: 1, status: 1 });

module.exports = mongoose.model("donationrequests", donationRequestSchema);