// routes/premiumUserRoutes.js
const express = require('express');
const router = express.Router();
const premiumUserController = require('../controllers/premiumUserController');

router.post('/', premiumUserController.createPremiumUser);
router.get('/', premiumUserController.getAllPremiumUsers);
router.get('/:id', premiumUserController.getPremiumUserById);
router.put('/:id', premiumUserController.updatePremiumUser);
router.delete('/:id', premiumUserController.deletePremiumUser);

module.exports = router;