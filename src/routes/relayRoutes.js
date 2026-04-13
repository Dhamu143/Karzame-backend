const express = require('express');
const router = express.Router();
const relayController = require('../controllers/relayController');

router.post('/instruction/relay', relayController.sendRelayCommand);

module.exports = router;