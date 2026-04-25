const Plan = require('../models/Plan');

const getPlanPayload = (body = {}) => {
    const allowedFields = [
        'name',
        'planType',
        'subscriptionType',
        'price',
        'features',
        'isActive',
    ];

    return allowedFields.reduce((payload, field) => {
        if (body[field] !== undefined) {
            payload[field] = body[field];
        }
        return payload;
    }, {});
};

exports.createPlan = async (req, res) => {
    try {
        const plan = new Plan(getPlanPayload(req.body));
        const savedPlan = await plan.save();
        res.status(201).json({ success: true, data: savedPlan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const { planType, subscriptionType, isActive } = req.query;
        const query = {};
        if (planType) query.planType = planType;
        if (subscriptionType) query.subscriptionType = subscriptionType;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const plans = await Plan.find(query).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getActivePlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(
            req.params.id,
            getPlanPayload(req.body),
            { new: true, runValidators: true },
        );
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
