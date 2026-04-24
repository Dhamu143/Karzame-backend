const express = require("express");
const router = express.Router();

const {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");

router.post("/", createSubscription);
router.get("/", getAllSubscriptions);
router.get("/:id", getSubscriptionById);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;
