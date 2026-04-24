const PremiumUser = require('../models/Premiumuser'); 

exports.createPremiumUser = async (req, res) => {
    try {
        const premiumUser = new PremiumUser(req.body);
        const savedPremiumUser = await premiumUser.save();
        res.status(201).json({ success: true, data: savedPremiumUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all premium users
exports.getAllPremiumUsers = async (req, res) => {
    try {
        const premiumUsers = await PremiumUser.find();
        res.status(200).json({ success: true, data: premiumUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single premium user by ID
exports.getPremiumUserById = async (req, res) => {
    try {
        const premiumUser = await PremiumUser.findById(req.params.id);
        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, data: premiumUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a premium user
exports.updatePremiumUser = async (req, res) => {
    try {
        const premiumUser = await PremiumUser.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!premiumUser) {
            return res.status(404).json({ success: false, message: 'Premium user not found' });
        }
        res.status(200).json({ success: true, data: premiumUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a premium user
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