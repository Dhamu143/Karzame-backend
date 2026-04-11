const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const GeoFence = require('../models/GeoFence');
const moment = require('moment');
const karzame = require('../services/karzame');

const startParkCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('⏱️ Running Park Cron...');

    try {
      const vehicles = await Vehicle.find({
        movementStatus: "parked",
        prkkey: true,
        autoPark: false,
        speed: { $lte: 1 },
        prktime: { $ne: null }
      });

      console.log("🚘 Vehicles Found:", vehicles.length);

      for (const vehicle of vehicles) {

        const speed = Number(vehicle.speed || 0);

        if (speed > 1) {
          await GeoFence.deleteMany({ imei: vehicle.imei });
          console.log("🗑️ Cleared flag (vehicle moving)");
          continue;
        }

        if (!vehicle.prktime) continue;

        const diffMinutes = moment().diff(moment(vehicle.prktime), 'minutes');

        console.log(`🚗 ${vehicle.vehicleNickname} parked for ${diffMinutes} mins`);

        if (diffMinutes < 1) continue;

        const existing = await GeoFence.findOne({ imei: vehicle.imei });

        if (existing && vehicle.autoPark === true) {
          console.log("⚠️ Already protected, skipping...");
          continue;
        }

        const lat = vehicle.location?.latitude;
        const lng = vehicle.location?.longitude;

        if (lat == null || lng == null) continue;

        try {
          console.log(`🔔 Sending notification for ${vehicle.vehicleNickname}`);

          const payload = {
            imei: vehicle.imei,
            vehicleName: vehicle.vehicleNickname,
            alertType: 'AUTO_PARK_SUGGESTION',  
            lat: String(Number(lat)),          
            lng: String(Number(lng)),
            userId: String(vehicle.userId),
            vehicleId: String(vehicle._id),
            showGeoFenceModal: 'true',
          };

          await karzame(payload);

          console.log("📡 Notification sent");

          // ✅ Save flag
          await GeoFence.create({
            imei: vehicle.imei,
            fenceId: 0,
            lat,
            lng,
            radius: 0,
          });

        } catch (err) {
          console.log("❌ Notification failed:", err.message);
        }
      }

    } catch (error) {
      console.log('🔥 Cron Error:', error.message);
    }
  });
};

module.exports = startParkCron;