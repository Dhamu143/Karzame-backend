const mongoose = require('mongoose');

const Subscription = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: "User",
            required: true,
            index: true,
        },
        vehicleId: {
            type: String,
            ref: "Vehicle",
            required: true,
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        subscriptionType: {
            type: String,
            enum: ["Standard", "premium"],
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "expired", "pending"],
            default: "active",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        PlanType: {
            type: String,
            enum: ["Monthly", "Yearly"],
            required: true,
        },

    },
    { timestamps: true },
);

module.exports = mongoose.model("Subscription", Subscription);
