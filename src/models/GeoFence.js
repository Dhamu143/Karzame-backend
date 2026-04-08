const mongoose = require('mongoose');

const geoFenceSchema = new mongoose.Schema({
  imei: String,
  fenceName: String,
  radius: Number,
  lat: Number,
  lng: Number,
  fenceId: Number,
}, { timestamps: true });

module.exports = mongoose.model('GeoFence', geoFenceSchema);