const mongoose = require('mongoose');

const premiumUserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
        },
        vehicleId: {
            type: String,
            ref: 'Vehicle',
            required: true,
            index: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'expired', 'pending'],
            default: 'active',
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'failed'],
            default: 'pending',
        },
        amountPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentReference: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('PremiumUser', premiumUserSchema);
