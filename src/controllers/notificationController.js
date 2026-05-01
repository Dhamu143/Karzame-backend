const NotificationLog = require("../models/NotificationLog");
const Vehicle = require("../models/Vehicle");

const pushTimelineEvent = async (notificationId, event) => {
  await NotificationLog.findByIdAndUpdate(notificationId, {
    $push: { timeline: event },
  });
};

const createNotification = async (data) => {
  try {
    // 1. Fetch vehicle by IMEI to get owner details
    const vehicle = await Vehicle.findOne({ imei: data.imei }).lean();

    // 2. Build initial System-generated timeline events
    const initialTimeline = [
      {
        action:        "Alert Triggered",
        description:   `${data.alertType || "Alert"} detected for IMEI ${data.imei}`,
        performedBy:   "System",
        performedById: "system",
      },
      {
        action:        "Notification Sent",
        description:   `Push notification dispatched to owner${vehicle?.ownerName ? ` (${vehicle.ownerName})` : ""}`,
        performedBy:   "System",
        performedById: "system",
      },
    ];

    if (data.alertType === "DEVICE_REMOVED") {
      initialTimeline.push({
        action:        "Engine Cut Initiated",
        description:   "Engine stop command sent via relay automatically",
        performedBy:   "System",
        performedById: "system",
      });
    }

    // 3. Save notification with vehicle data + initial timeline
    const notification = new NotificationLog({
      imei:             data.imei,
      alertType:        data.alertType,
      alarmCode:        data.alarmCode || null,
      notificationBody: data.notificationBody || data.message || "",
      lat:              String(data.location?.lat  || data.lat  || ""),
      lng:              String(data.location?.lng  || data.lng  || ""),
      address:          data.location?.address || "",
      userId:           data.userId    ? String(data.userId)    : undefined,
      vehicleId:        data.vehicleId ? String(data.vehicleId) : undefined,
      status:           "SENT",

      // Vehicle fields — fetched from Vehicle collection via IMEI
      vehicleName:  vehicle?.vehicleNickname || data.vehicleName || "Unknown",
      ownerName:    vehicle?.ownerName       || "",
      phone:        vehicle?.phone           || "",
      email:        vehicle?.email           || "",
      licensePlate: vehicle?.licensePlate    || "",
      serviceMode:  vehicle?.serviceMode     || "Self Service",

      timeline: initialTimeline,
    });

    await notification.save();
    console.log("✅ Notification saved for IMEI:", data.imei);
    return notification;
  } catch (error) {
    console.error("❌ createNotification error:", error.message);
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Fetch notifications
    const notifications = await NotificationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    const imeis = [...new Set(notifications.map((n) => n.imei).filter(Boolean))];
    const vehicles = await Vehicle.find({ imei: { $in: imeis } })
      .select("imei vehicleNickname ownerName phone email licensePlate location lat lng")
      .lean();

    const vehicleMap = {};
    vehicles.forEach((v) => { vehicleMap[v.imei] = v; });

    const enriched = notifications.map((n) => {
      const v = vehicleMap[n.imei] || {};
      return {
        ...n,
        vehicleName:  n.vehicleName  || v.vehicleNickname || "Unknown",
        ownerName:    n.ownerName    || v.ownerName        || "N/A",
        phone:        n.phone        || v.phone            || "N/A",
        email:        n.email        || v.email            || "N/A",
        licensePlate: n.licensePlate || v.licensePlate     || "N/A",
        lat: n.lat || v.lat || v.location?.latitude  || "",
        lng: n.lng || v.lng || v.location?.longitude || "",
      };
    });

    const total = await NotificationLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("🔥 Get Notifications Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// ─── GET SINGLE NOTIFICATION (full timeline for detail panel) ─────────────────
const getNotificationById = async (req, res) => {
  try {
    const notification = await NotificationLog.findById(req.params.id).lean();
    if (!notification)
      return res.status(404).json({ success: false, message: "Not found" });

    const vehicle = await Vehicle.findOne({ imei: notification.imei })
      .select("vehicleNickname ownerName phone email licensePlate lat lng location")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...notification,
        vehicleName:  notification.vehicleName  || vehicle?.vehicleNickname || "Unknown",
        ownerName:    notification.ownerName    || vehicle?.ownerName        || "N/A",
        phone:        notification.phone        || vehicle?.phone            || "N/A",
        email:        notification.email        || vehicle?.email            || "N/A",
        licensePlate: notification.licensePlate || vehicle?.licensePlate     || "N/A",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAlertStatus = async (req, res) => {
  try {
    const {
      alertStatus,
      reviewStatus,
      resolutionStatus,
      performedBy,
      performedById,
      description,
    } = req.body;

    // Validate performedBy
    if (!performedBy || !["Owner", "Admin"].includes(performedBy)) {
      return res.status(400).json({
        success: false,
        message: 'performedBy is required and must be "Owner" or "Admin"',
      });
    }

    const updateFields  = {};
    const timelineEvents = [];

    const actorId = performedById || (performedBy === "Owner" ? "owner" : "admin");

    if (alertStatus) {
      updateFields.alertStatus = alertStatus;
      timelineEvents.push({
        action:        alertStatus,
        description:   description || `${performedBy} updated alert status to "${alertStatus}"`,
        performedBy,
        performedById: actorId,
      });
    }

    if (reviewStatus) {
      updateFields.reviewStatus = reviewStatus;
      timelineEvents.push({
        action:        reviewStatus,
        description:   description || `${performedBy} changed review status to "${reviewStatus}"`,
        performedBy,
        performedById: actorId,
      });
    }

    if (resolutionStatus) {
      updateFields.resolutionStatus = resolutionStatus;
      timelineEvents.push({
        action:        resolutionStatus,
        description:   description || `${performedBy} marked resolution as "${resolutionStatus}"`,
        performedBy,
        performedById: actorId,
      });
    }

    if (timelineEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one of: alertStatus, reviewStatus, resolutionStatus",
      });
    }

    // Atomic: update status fields + push all timeline events at once
    const updated = await NotificationLog.findByIdAndUpdate(
      req.params.id,
      {
        $set:  updateFields,
        $push: { timeline: { $each: timelineEvents } },
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Notification not found" });

    console.log(`✅ [${performedBy}] updated notification ${req.params.id}:`, updateFields);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("🔥 updateAlertStatus error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  updateAlertStatus,
  createNotification,
  pushTimelineEvent,
};