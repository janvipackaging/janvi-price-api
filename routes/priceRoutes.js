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
        // Log error for debugging purposes (optional but helpful)
        console.error("Error fetching current list:", error); 
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
        console.error("Error fetching archive dates:", error); 
        res.status(500).json({ message: 'Error fetching archive dates.' });
    }
});

// 3. GET: Get a specific historical price list by date and category
router.get('/historical/:category/:date', async (req, res) => {
    try {
        // -------------------------
        // ✨ THE FIX IS HERE (Step 1) ✨
        // -------------------------
        // We MUST decode the URI component first. The frontend sends the full
        // timestamp (23:59:59Z) encoded, which includes characters like ':' and '.'
        const decodedDate = decodeURIComponent(req.params.date);
        const targetDate = new Date(decodedDate);
        
        if (isNaN(targetDate.getTime())) {
             // Handle case where decoding results in an invalid date
             return res.status(400).json({ message: 'Invalid historical date format provided.' });
        }
        
        // -------------------------
        // (Step 2: Query remains correct)
        // -------------------------
        // Find the price list that was effective ON or BEFORE the requested time (23:59:59Z)
        const historicalList = await PriceList.findOne({
            category: req.params.category,
            effectiveDate: { $lte: targetDate } // Less than or equal to the requested date
        })
        .sort({ effectiveDate: -1 }) // Get the one closest to the requested date
        .limit(1)
        .exec();

        if (!historicalList) {
            // This 404 error message should now be accurate
            return res.status(404).json({ 
                message: 'No historical price list found for this date.',
                products: [] // Ensure an empty array is sent for robustness
            });
        }
        res.json(historicalList);
    } catch (error) {
        console.error("Error fetching historical list:", error); 
        res.status(500).json({ message: 'Error fetching historical list.' });
    }
});

module.exports = router;