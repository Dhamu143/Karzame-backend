const cron = require("node-cron");
const Vehicle = require("../models/Vehicle");
const GeoFence = require("../models/GeoFence");
const moment = require("moment");
const karzame = require("../services/karzame");

cron.schedule("* * * * *", async () => {
  console.log("⏱️ Running Park Cron...");
    const vehicles = await Vehicle.find({ });
    console.log(vehicles)
  await checkAutoPark();
  await noLongerParked();
});

const checkAutoPark = async () => {
  try {
    const vehicles = await Vehicle.find({
      prkkey: true,
      speed: 0,
      prktime: { $ne: null },
    });
    console.log("🚘 Vehicles Found: checkAutoPark", vehicles.length);

    for (const vehicle of vehicles) {
      const diffMinutes = moment().diff(moment(vehicle.prktime), "minutes");

      console.log(
        `🚗 ${vehicle.vehicleNickname} parked for ${diffMinutes} mins`,
      );

      if (diffMinutes == 1) {
        if (vehicle.autoPark) {
          await GeoFence.deleteMany({ imei: vehicle.imei });
          const lat = vehicle.location?.latitude;
          const lng = vehicle.location?.longitude;
          await GeoFence.create({
            imei: vehicle.imei,
            fenceId: 0,
            lat,
            lng,
            radius: 0,
          });
        } else {
          const payload = {
            imei: vehicle.imei,
            vehicleName: vehicle.vehicleNickname,
            alertType: "AUTO_PARK_SUGGESTION",
            lat: String(Number(lat)),
            lng: String(Number(lng)),
            userId: String(vehicle.userId),
            vehicleId: String(vehicle._id),
            showGeoFenceModal: "true",
          };
          await karzame(payload);
        }
      }
    }
  } catch (error) {
    console.log("🔥 Cron Error:", error.message);
  }
};
const noLongerParked = async () => {
  try {
    const vehicles = await Vehicle.find({
      autoPark: true,
      speed: { $gte: 1 },
      vehicleStartTime: { $ne: null },
    });
    console.log("🚘 Vehicles Found: noLongerParked", vehicles.length);
    for (const vehicle of vehicles) {
      const diffMinutes = moment().diff(
        moment(vehicle.vehicleStartTime),
        "minutes",
      );
      if (diffMinutes == 1) {
        const payload = {
          imei: vehicle.imei,
          vehicleName: vehicle.vehicleNickname,
          alertType: "Vehicle_AUTO",
          lat: String(Number(lat)),
          lng: String(Number(lng)),
          userId: String(vehicle.userId),
          vehicleId: String(vehicle._id),
        };
        await karzame(payload);
      }
    }
  } catch (error) {
    console.log("🔥 Cron Error:", error.message);
  }
};
