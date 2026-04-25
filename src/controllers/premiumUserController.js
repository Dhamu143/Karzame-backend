const PremiumUser = require('../models/Premiumuser');
const Plan = require('../models/Plan');

const computeEndDate = (startDate, planType) => {
    const end = new Date(startDate);

    if (planType === 'Yearly') {
        end.setFullYear(end.getFullYear() + 1);
        return end;
    }

    end.setMonth(end.getMonth() + 1);
    return end;
};

exports.createPremiumUser = async (req, res) => {
    try {
        const {
            userId,
            vehicleId,
            planId,
            startDate,
            paymentStatus,
            paymentReference,
            amountPaid,
        } = req.body;

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        if (!plan.isActive) {
            return res.status(400).json({ success: false, message: 'Plan is not active' });
        }

        const start = startDate ? new Date(startDate) : new Date();
        const end = computeEndDate(start, plan.planType);

        const premiumUser = await PremiumUser.create({
            userId,
            vehicleId,
            planId,
            startDate: start,
            endDate: end,
            amountPaid: amountPaid ?? plan.price,
            paymentStatus: paymentStatus || 'pending',
            paymentReference,
            status: paymentStatus === 'paid' ? 'active' : 'pending',
        });

        const populated = await premiumUser.populate('planId');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllPremiumUsers = async (req, res) => {
    try {
        const { userId, vehicleId, planId, status, paymentStatus } = req.query;
        const query = {};
        if (userId) query.userId = userId;
        if (vehicleId) query.vehicleId = vehicleId;
        if (planId) query.planId = planId;
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const premiumUsers = await PremiumUser.find(query)
            .populate('planId')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: premiumUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPremiumUsersByUserId = async (req, res) => {
    try {
        const premiumUsers = await PremiumUser.find({ userId: req.params.userId })
            .populate('planId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: premiumUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPremiumUserById = async (req, res) => {
    try {
        const premiumUser = await PremiumUser.findById(req.params.id).populate('planId');
        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, data: premiumUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePremiumUser = async (req, res) => {
    try {
        const { planId, startDate } = req.body;
        const update = { ...req.body };

        if (planId) {
            const plan = await Plan.findById(planId);
            if (!plan) {
                return res.status(404).json({ success: false, message: 'Plan not found' });
            }
            const start = startDate ? new Date(startDate) : new Date();
            update.startDate = start;
            update.endDate = computeEndDate(start, plan.planType);
        }

        const premiumUser = await PremiumUser.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true },
        ).populate('planId');

        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, data: premiumUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.cancelPremiumUser = async (req, res) => {
    try {
        const premiumUser = await PremiumUser.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true },
        ).populate('planId');
        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, data: premiumUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePremiumUser = async (req, res) => {
    try {
        const premiumUser = await PremiumUser.findByIdAndDelete(req.params.id);
        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, message: 'Premium user deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
