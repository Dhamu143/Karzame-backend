// const cron = require("node-cron");
// const Vehicle = require("../models/Vehicle");
// const GeoFence = require("../models/GeoFence");
// const moment = require("moment");
// const karzame = require("../services/karzame");

// cron.schedule("* * * * *", async () => {
//   console.log("⏱️ Running Park Cron...");
//   const vehicles = await Vehicle.find({});
//   console.log(vehicles);
//   await checkAutoPark();
//   await noLongerParked();
// });

// const checkAutoPark = async () => {
//   try {
//     const vehicles = await Vehicle.find({
//       prkkey: true,
//       speed: 0,
//       prktime: { $ne: null },
//     });
//     console.log("🚘 Vehicles Found: checkAutoPark", vehicles.length);

//     for (const vehicle of vehicles) {
//       const diffMinutes = moment().diff(moment(vehicle.prktime), "minutes");
//       const lat = vehicle.location?.latitude || 0;
//       const lng = vehicle.location?.longitude || 0;
//       console.log(
//         `🚗 ${vehicle.vehicleNickname} parked for ${diffMinutes} mins`,
//       );

//       if (diffMinutes == 1) {
//         if (vehicle.autoPark) {
//           await GeoFence.deleteMany({ imei: vehicle.imei });

//           await GeoFence.create({
//             imei: vehicle.imei,
//             fenceId: 0,
//             lat,
//             lng,
//             radius: 0,
//           });
//         } else {
//           const payload = {
//             imei: vehicle.imei,
//             vehicleName: vehicle.vehicleNickname,
//             alertType: "AUTO_PARK_SUGGESTION",
//             lat: String(Number(lat)),
//             lng: String(Number(lng)),
//             userId: String(vehicle.userId),
//             vehicleId: String(vehicle._id),
//             showGeoFenceModal: "true",
//           };
//           await karzame(payload);
//         }
//       }
//     }
//   } catch (error) {
//     console.log("🔥 Cron Error:", error.message);
//   }
// };

// // const noLongerParked = async () => {
// //   try {
// //     const vehicles = await Vehicle.find({
// //       autoPark: true,
// //       speed: { $gte: 1 },
// //       vehicleStartTime: { $ne: null },
// //     });
// //     console.log("🚘 Vehicles Found: noLongerParked", vehicles.length);
// //     for (const vehicle of vehicles) {
// //       const diffMinutes = moment().diff(
// //         moment(vehicle.vehicleStartTime),
// //         "minutes",
// //       );
// //       if (diffMinutes == 1) {
// //         const payload = {
// //           imei: vehicle.imei,
// //           vehicleName: vehicle.vehicleNickname,
// //           alertType: "Vehicle_AUTO",
// //           lat: String(Number(lat)),
// //           lng: String(Number(lng)),
// //           userId: String(vehicle.userId),
// //           vehicleId: String(vehicle._id),
// //         };
// //         await karzame(payload);
// //       }
// //     }
// //   } catch (error) {
// //     console.log("🔥 Cron Error:", error.message);
// //   }
// // };

// const noLongerParked = async () => {
//   try {
//     const vehicles = await Vehicle.find({
//       autoPark: true,
//       speed: { $gte: 1 },
//       vehicleStartTime: { $ne: null }, 
//     });
//     console.log("🚘 Vehicles Found: noLongerParked", vehicles.length);
//     for (const vehicle of vehicles) {
//       const diffMinutes = moment().diff(
//         moment(vehicle.vehicleStartTime),
//         "minutes",
//       );
//       if (diffMinutes == 1) {
//         // ADD THESE TWO LINES TO PREVENT A CRASH
//         const lat = vehicle.location?.latitude || 0;
//         const lng = vehicle.location?.longitude || 0;

//         const payload = {
//           imei: vehicle.imei,
//           vehicleName: vehicle.vehicleNickname,
//           alertType: "Vehicle_AUTO",
//           lat: String(Number(lat)),
//           lng: String(Number(lng)),
//           userId: String(vehicle.userId),
//           vehicleId: String(vehicle._id),
//         };
//         await karzame(payload);
//       }
//     }
//   } catch (error) {
//     console.log("🔥 Cron Error:", error.message);
//   }
// };

const cron = require("node-cron");
const Vehicle = require("../models/Vehicle");
const GeoFence = require("../models/GeoFence");
const moment = require("moment");
const karzame = require("../services/karzame");
const NotificationLog = require("../models/NotificationLog");
const { createNotification } = require("../controllers/notification");
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Running Park Cron...");
  const vehicles = await Vehicle.find({});
  console.log(vehicles);
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
      const lat = vehicle.lat || vehicle.location?.latitude;
      const lng = vehicle.lng || vehicle.location?.longitude;

      console.log("📍 Vehicle Location:", {
        imei: vehicle.imei,
        lat,
        lng
      });
      console.log(
        `🚗 ${vehicle.vehicleNickname} parked for ${diffMinutes} mins`,
      );

      if (diffMinutes == 1) {
        if (vehicle.autoPark) {
          await GeoFence.deleteMany({ imei: vehicle.imei });

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
            notificationBody: "Vehicle Auto Park Suggestion",
            lat: String(lat),
            lng: String(lng),
            userId: String(vehicle.userId),
            vehicleId: String(vehicle._id),
            showGeoFenceModal: "true",
            alarmCode: vehicle.alarmCode,
            licensePlate: vehicle.licensePlate,
          };
          // await karzame(payload);

          try {
            console.log("📤 Sending Notification (AUTO_PARK_SUGGESTION):", payload);

            const savedNotification = await NotificationLog.create({
              ...payload,
              status: "SENT",
              alertStatus: "Pending"
            });

            console.log("📥 Notification stored:", savedNotification._id);

            const response = {
              ...payload,
              notificationId: savedNotification._id,
            };

            await karzame(response);
            createNotification(payload);
          } catch (err) {
            await NotificationLog.create({
              ...payload,
              status: "FAILED",
              error: err.message,
            });

            console.log("❌ Notification failed & stored");
          }
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
        "minutes"
      );

      const lat = vehicle.lat || vehicle.location?.latitude;
      const lng = vehicle.lng || vehicle.location?.longitude;

      console.log("🚗 Vehicle Debug:", {
        imei: vehicle.imei,
        lat,
        lng
      });

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.log("❌ Invalid location, skipping:", {
          imei: vehicle.imei,
          lat,
          lng
        });
        continue;
      }

      if (diffMinutes == 1) {
        const payload = {
          imei: vehicle.imei,
          vehicleName: vehicle.vehicleNickname,
          alertType: "Vehicle_AUTO",
          notificationBody: "Vehicle GEO fence alert",
          lat: String(lat),
          lng: String(lng),
          userId: String(vehicle.userId),
          vehicleId: String(vehicle._id),
          alarmCode: vehicle.alarmCode,
          licensePlate: vehicle.licensePlate,
        };

        // await karzame(payload);
        try {
          console.log("📤 Sending Notification (AUTO_PARK_SUGGESTION):", payload);

          const savedNotification = await NotificationLog.create({
            ...payload,
            status: "SENT",
            alertStatus: "Pending"
          });

          console.log("📥 Notification stored:", savedNotification._id);

          const response = {
            ...payload,
            notificationId: savedNotification._id,
          };

          await karzame(response);
          createNotification(payload);

        } catch (err) {
          await NotificationLog.create({
            ...payload,
            status: "FAILED",
            error: err.message,
          });

          console.log("❌ Notification failed & stored");
        }
      }
    }
  } catch (error) {
    console.log("🔥 Cron Error:", error.message);
  }
};
