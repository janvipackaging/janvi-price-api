// routes/adminRoutes.js (Simplified for core logic)
const express = require('express');
const PriceList = require('../models/PriceList');
const router = express.Router();

// Placeholder for Authentication Middleware (to protect these routes)
const authMiddleware = (req, res, next) => {
    // In production, this would verify the JWT token
    console.log('Admin route accessed (Auth check passed)');
    next();
};

// POST: Publish a new price list (This copies the old list and saves the new one)
router.post('/publish', authMiddleware, async (req, res) => {
    try {
        const { category, effectiveDate, products } = req.body;
        
        // 1. Validation (ensure required fields are present)
        if (!category || !effectiveDate || !products || products.length === 0) {
            return res.status(400).json({ message: 'Missing required data.' });
        }

        // 2. Create and save the new price list snapshot
        const newPriceList = new PriceList({
            category,
            effectiveDate: new Date(effectiveDate),
            products, // The full array of products/prices from your admin form
            isArchived: false // Automatically the current list
        });

        await newPriceList.save();

        // 3. Mark the *previous* list as archived (optional, but good for cleanup)
        // Find the previous current list for this category and set isArchived to true
        await PriceList.updateMany(
            { category, _id: { $ne: newPriceList._id } },
            { $set: { isArchived: true } }
        );

        res.status(201).json({ 
            message: `New ${category} price list published successfully.`,
            list: newPriceList
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to publish price list.' });
    }
});

// GET: Get the latest list to pre-populate the admin edit form
router.get('/latest/:category', authMiddleware, async (req, res) => {
    try {
        const latestList = await PriceList.findOne({ category: req.params.category })
            .sort({ effectiveDate: -1 })
            .exec();

        if (!latestList) {
            return res.status(404).json({ message: 'No price list found for this category.' });
        }
        res.json(latestList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching latest list.' });
    }
});

module.exports = router;