const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
   
    },
    description: {
      type: String,
      default: "",
    },
    performedBy: {
      type: String,
      enum: ["System", "Owner", "Admin"],
    },
    performedById: {
      type: String,
    },
  },
  {
    timestamps: true, 
    _id: true,
  }
);

const notificationLogSchema = new mongoose.Schema(
  {
    imei:             { type: String, required: true, index: true },
    alertType:        { type: String },
    alarmCode:        { type: String, default: null },
    notificationBody: { type: String },
    lat:              { type: String },
    lng:              { type: String },
    address:          { type: String },
    userId:           { type: String, index: true },
    vehicleId:        { type: String },

    vehicleName:  { type: String },
    ownerName:    { type: String },
    phone:        { type: String },
    email:        { type: String },
    licensePlate: { type: String },
    serviceMode: {
      type: String,
      enum: ["Self Service", "Customer Service"],
      default: "Self Service",
    },

    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
    error: { type: String },

    alertStatus: {
      type: String,
      enum: ["Pending", "Owner Attended", "Auto Secured", "Resolved", "Rejected"],
      default: "Pending",
    },
    reviewStatus: {
      type: String,
      enum: ["Pending Review", "Under Review", "Reviewed", "Not Applicable"],
      default: "Pending Review",
    },
    resolutionStatus: {
      type: String,
      enum: ["Not Resolved", "Resolved", "Rejected"],
      default: "Not Resolved",
    },

    timeline: {
      type: [timelineEventSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
