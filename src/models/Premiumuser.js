const mongoose = require('mongoose');

const premiumUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },
    subscriptionId: {
        type: String,
        ref: 'Subscription',
        required: true,
        index: true
    },
    vehicleId: {
        type: String,
        ref: 'Vehicle',
        required: true,
        index: true
    },
}, { timestamps: true }

)

module.exports = mongoose.model('PremiumUser', premiumUserSchema)