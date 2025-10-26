// routes/priceRoutes.js
const express = require('express');
const PriceList = require('../models/PriceList');
const router = express.Router();

// 1. GET: Get the current (latest) price list for a category
router.get('/current/:category', async (req, res) => {
    try {
        const latestList = await PriceList.findOne({ category: req.params.category })
            .sort({ effectiveDate: -1 }) // Sort by newest date first
            .limit(1)
            .exec();

        if (!latestList) {
            return res.status(404).json({ message: 'Current price list not found.' });
        }
        res.json(latestList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current list.' });
    }
});

// 2. GET: Get all archive dates for a category
router.get('/archive/:category', async (req, res) => {
    try {
        const dates = await PriceList.find({ category: req.params.category }, 'effectiveDate')
            .sort({ effectiveDate: -1 }) // Sort by newest date first
            .exec();

        // Return only the date strings, grouped by year for frontend sorting
        const archiveDates = dates.map(doc => doc.effectiveDate);
        res.json(archiveDates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching archive dates.' });
    }
});

// 3. GET: Get a specific historical price list by date and category
router.get('/historical/:category/:date', async (req, res) => {
    try {
        const targetDate = new Date(req.params.date);
        
        // Find the price list that was effective ON or BEFORE the requested date
        const historicalList = await PriceList.findOne({
            category: req.params.category,
            effectiveDate: { $lte: targetDate } // Less than or equal to the requested date
        })
        .sort({ effectiveDate: -1 }) // Get the one closest to the requested date
        .limit(1)
        .exec();

        if (!historicalList) {
            return res.status(404).json({ message: 'No historical price list found for this date.' });
        }
        res.json(historicalList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching historical list.' });
    }
});

module.exports = router;