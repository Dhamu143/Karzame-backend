const express = require('express');
const router = express.Router();
const premiumUserController = require('../controllers/premiumUserController');

router.post('/', premiumUserController.createPremiumUser);
router.get('/', premiumUserController.getAllPremiumUsers);
router.get('/user/:userId', premiumUserController.getPremiumUsersByUserId);
router.get('/:id', premiumUserController.getPremiumUserById);
router.put('/:id', premiumUserController.updatePremiumUser);
router.patch('/:id/cancel', premiumUserController.cancelPremiumUser);
router.delete('/:id', premiumUserController.deletePremiumUser);

module.exports = router;
