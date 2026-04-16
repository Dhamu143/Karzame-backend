const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    imei: { type: String, required: true },
    vehicleName: String,
    alertType: String,
    notificationBody: String,
    lat: String,
    lng: String,
    userId: String,
    vehicleId: String,
    address: String,

    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
    alertStatus: {
      type: String,
      enum: ["Pending", "Owner Attended", "Resolved" ,"Rejected"],
      default: "Pending",
    },
    licensePlate: String,
    error: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);