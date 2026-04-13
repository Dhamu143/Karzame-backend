const { default: axios } = require("axios");
const Vehicle = require("../models/Vehicle");
const { getToken } = require("../services/gpsTokenManager");
const { registerVehicle } = require("../services/iopgpsService");
const karzame = require("../services/karzame");
const ParkVehicle = require("../models/ParkVehicle");

exports.createVehicle = async (req, res) => {
  //	console.log('Start')
  try {
    const vehicleData = req.body;

    //console.log('Vehicle Data:', vehicleData)

    const existingVehicle = await Vehicle.findOne({
      imei: vehicleData.imei,
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "This GPS device is already registered",
      });
    }

    const gpsResponse = await registerVehicle(vehicleData);

    //	console.log('GPS RESPONSE:', gpsResponse)

    if (!gpsResponse || gpsResponse.code !== 0) {
      return res.status(400).json({
        success: false,
        message: "GPS registration failed",
        gpsResponse: gpsResponse,
      });
    }

    vehicleData.gpsConnected = true;
    vehicleData.deviceName = vehicleData.vehicleNickname;

    const vehicle = new Vehicle(vehicleData);
    const savedVehicle = await vehicle.save();

    return res.status(201).json({
      success: true,
      message: "Vehicle registered successfully",
      data: savedVehicle,
      gpsResponse: gpsResponse,
    });
  } catch (error) {
    console.log("CREATE VEHICLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, movementStatus, stolen, search } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (movementStatus) {
      filter.movementStatus = movementStatus;
    }

    if (stolen !== undefined && stolen !== "") {
      filter.stolen = stolen === "true";
    }

    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehiclesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, movementStatus, stolen } = req.query;

    let filter = {
      userId: req.params.userId,
    };

    if (status) {
      filter.status = status;
    }

    if (movementStatus) {
      filter.movementStatus = movementStatus;
    }

    if (stolen !== undefined && stolen !== "") {
      filter.stolen = stolen === "true";
    }

    const vehicles = await Vehicle.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "User vehicles fetched successfully",
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehicleLocation = async (req, res) => {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({
        success: false,
        message: "IMEI is required",
      });
    }

    const token = getToken();

    const response = await axios.get(
      `https://open.iopgps.com/api/device/location?imei=${imei}`,
      {
        headers: {
          accessToken: token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response?.data;

    if (!data || data.code !== 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch location",
        data: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location fetched successfully",
      data: {
        latitude: data.lat,
        longitude: data.lng,
        gpsTime: data.gpsTime,
        address: data.address,
      },
    });
  } catch (error) {
    console.log("GET LOCATION ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.testApi = async (req, res) => {
//   try {
//     console.log("TEST API BODY:", JSON.parse(req.body.body));
//     const payload = JSON.parse(req.body.body);
//     for (let index = 0; index < payload.length; index++) {
//       const element = payload[index];
//       const vehicle = await Vehicle.findOne({ imei: element.imei }).lean();
//       console.log(vehicle);
//       if (vehicle) {
//         if (payload.alarmCode == "REMOVE") {
//           // vehicle.stolen = true;
//           // await vehicle.save();
//           const vehicle = await Vehicle.findByIdAndUpdate(
//             vehicle._id,
//             { stolen: true },
//             {
//               new: true,
//               runValidators: true,
//             },
//           );
//         }
//         console.log({ ...vehicle, ...element });
//         await karzame({ ...vehicle, ...element });
//       }
//     }

//     // await karzame(vehicle);
//     // console.log(vehicle.userId);
//     return res.status(200).json({
//       success: true,
//       message: "Success",
//       data: req.body,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Don't forget to import your new model at the top of the file!
// const ParkVehicle = require('../models/ParkVehicle');

exports.testApi = async (req, res) => {
  try {
    console.log("🚀 TEST API HIT");

    const payload =
      typeof req.body.body === "string"
        ? JSON.parse(req.body.body)
        : req.body.body;
    console.log("📥 Payload:", payload, typeof req.body.body === "string");
    for (const element of payload) {
      console.log(element);
      const vehicle = await Vehicle.findOne({ imei: element.imei });

      if (!vehicle) {
        console.log("❌ Vehicle not found:", element.imei);
        continue;
      }

      const speed = Number(element.speed || 0);

      console.log(
        `📡 IMEI: ${element.imei} | Speed: ${speed} | Alarm: ${element.alarmCode}`,
      );

      if (element.alarmCode === "REMOVE") {
        await Vehicle.findByIdAndUpdate(vehicle._id, { stolen: true });

        await karzame({
          ...vehicle.toObject(),
          ...element,
          alertType: "DEVICE_REMOVED",
          notificationBody: "Vehicle Stolen Alert",
        });

        console.log("⚠️ Device removed alert sent");
      }

      // if (speed > 0 && vehicle.prkkey === true) {
      //   console.log("🚗 Movement detected");

      //   await Vehicle.findByIdAndUpdate(vehicle._id, {
      //     prkkey: false,
      //     movementStatus: "moving",
      //     prktime: null,
      //     speed: speed,
      //   });

      //   await GeoFence.deleteMany({ imei: vehicle.imei });
      //   console.log("🗑️ Notification flag cleared (vehicle moved)");

      //   if (vehicle.autoPark) {
      //     console.log("🚨 AutoPark breach triggered");

      //     await karzame({
      //       imei: vehicle.imei,
      //       vehicleName: vehicle.vehicleNickname,
      //       alertType: "GEO_FENCE_BREACH_AUTO_PARK",
      //       lat: String(vehicle.location?.latitude || element.lat || ""),
      //       lng: String(vehicle.location?.longitude || element.lng || ""),
      //       userId: String(vehicle.userId),
      //       vehicleId: String(vehicle._id),
      //     });

      //     try {
      //       const token = getToken();
      //       const fences = await GeoFence.find({ imei: vehicle.imei });

      //       for (const f of fences) {
      //         await axios
      //           .delete(`https://open.iopgps.com/api/fence/del/${f.fenceId}`, {
      //             headers: { accessToken: token },
      //           })
      //           .catch(() => {});
      //       }

      //       await GeoFence.deleteMany({ imei: vehicle.imei });
      //       console.log("🗑️ Fence deleted after movement");
      //     } catch (err) {
      //       console.log("⚠️ Failed to delete fence:", err.message);
      //     }
      //   }
      // }

      // 🅿️ PARK DETECTED
      if (element.alarmCode == "STAYTIMEOUT") {
        console.log("🅿️ Parking detected", payload);

        // let parktime;

        // if (element.alarmTime) {
        //   const time = Number(element.alarmTime);

        //   parktime = time < 10000000000
        //     ? new Date(time * 1000)
        //     : new Date(time);
        // } else {
        //   parktime = new Date();
        // }
        console.log(
          vehicle.speed == 0 && element.speed > 0,
          "testggg",
          "payload.speed",
          element.speed,
          "vehicle.speed",
          vehicle.speed,
        );
        if (vehicle.speed == 0 && element.speed > 0) {
          console.log("🚗 Movement detected from parked state", {
            speed: element.speed,
            vehicleStartTime: new Date(),
            prktime: null,
            lat: element.lat,
            lng: element.lng,
          });
          await Vehicle.findByIdAndUpdate(vehicle._id, {
            speed: element.speed,
            vehicleStartTime: new Date(),
            prktime: null,
            lat: element.lat,
            lng: element.lng,
          });
        }
        if (vehicle.speed > 0 && element.speed == 0) {
          console.log("🚗 Movement detected from parked state 33333", {
            speed: element.speed,
            prkkey: true,
            prktime: new Date(),
            lat: element.lat,
            lng: element.lng,
            //vehicleStartTime: null,
          });
          await Vehicle.findByIdAndUpdate(vehicle._id, {
            speed: element.speed,
            prkkey: true,
            prktime: new Date(),
            vehicleStartTime: null,
            lat: element.lat,
            lng: element.lng,
          });
        }
        // console.log("🕒 Parsed Park Time:", parktime);

        // await Vehicle.findByIdAndUpdate(vehicle._id, {
        //   prkkey: true,
        //   movementStatus: "parked",
        //   prktime: parktime,
        //   speed: 0,
        // });

        console.log("✅ Vehicle updated to parked");
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.log("🔥 ERROR:", err.message);
    res.status(500).json({ success: false });
  }
};
