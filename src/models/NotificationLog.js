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

    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
    error: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);