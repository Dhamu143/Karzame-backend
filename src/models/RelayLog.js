const mongoose = require('mongoose');

const relayLogSchema = new mongoose.Schema({
    imeis: [{ 
        type: String, 
        required: true 
    }],

    parameter: { 
        type: String, 
        required: true,
        enum: ['1', '2', '3'], 
    },

    message: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('RelayLog', relayLogSchema);