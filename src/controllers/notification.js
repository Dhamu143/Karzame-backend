const Notification = require("../models/Notification");

// ✅ Create Notification (used inside testApi)
exports.createNotification = async (data) => {
  try {
    const notification = new Notification({
      userId: data.userId,
      vehicleId: data.vehicleId,
      imei: data.imei,
      title: data.title,
      message: data.message,
      alertType: data.alertType,
      alarmCode: data.alarmCode,
      location: {
        lat: data.lat,
        lng: data.lng,
        address: data.address || "",
      },
      speed: data.speed || 0,
      extraData: data.extraData || {},
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.log("❌ CREATE NOTIFICATION ERROR:", error.message);
  }
};
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getallNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};