const express = require('express');
const router = express.Router();

const {
    createPlan,
    getAllPlans,
    getActivePlans,
    getPlanById,
    updatePlan,
    deletePlan,
} = require('../controllers/planController');

router.post('/', createPlan);
router.get('/', getAllPlans);
router.get('/active', getActivePlans);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
