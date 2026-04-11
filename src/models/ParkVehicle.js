const mongoose = require('mongoose');

const parkVehicleSchema = new mongoose.Schema({
  imei: {
    type: String,
    required: true,
    index: true
  },
  alarmCode: {
    type: String
  },
  speed: {
    type: Number
  },

  
}, {
  timestamps: true, 
  strict: false     
});

module.exports = mongoose.model('ParkVehicle', parkVehicleSchema);