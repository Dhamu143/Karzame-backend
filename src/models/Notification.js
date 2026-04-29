const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    imei: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    alertType: {
      type: String,
      enum: [
        "DEVICE_REMOVED",
        "SOS",
        "FENCEOUT",
        "REMOVECONTINUOUSLY",
        "PARKED",
        "MOVEMENT",
        "AUTO_PARK_SUGGESTION",
        "Vehicle_AUTO",
        "POWER_CUT",
      ],
      required: true,
    },

    alarmCode: {
      type: String, 
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    location: {
      lat: String,
      lng: String,
      address: String,
    },

    speed: {
      type: Number,
      default: 0,
    },

    extraData: {
      type: Object, // full payload if needed
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
