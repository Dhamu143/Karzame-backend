const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      ],
      required: true,
    },

    alarmCode: {
      type: String, // raw GPS alarmCode
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