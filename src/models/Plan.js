const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { _id: false },
);

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        planType: {
            type: String,
            enum: ['Monthly', 'Yearly'],
            required: true,
        },
        subscriptionType: {
            type: String,
            enum: ['Standard', 'Premium'],
            required: true,
        },
        isRecommended: {
            type: Boolean,
            default: false,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        // description: {
        //     type: String,
        //     trim: true,
        // },
        features: {
            type: [planFeatureSchema],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Plan', planSchema);
