const NotificationLog = require("../models/NotificationLog");

const getNotifications = async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const notifications = await NotificationLog.find(filter)
      .sort({ createdAt: -1 }) 
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await NotificationLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("🔥 Get Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const updateAlertStatus = async (req, res) => {
  try {
    const { alertStatus } = req.body;
    const updated = await NotificationLog.findByIdAndUpdate(
      req.params.id,
      { alertStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  updateAlertStatus,
};
