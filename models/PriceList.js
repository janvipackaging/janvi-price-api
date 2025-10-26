// models/PriceList.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "BOPP Film 12mic"
    price: { type: Number, required: true }, // The current price
    unit: { type: String, default: 'USD/Kg' } // e.g., "USD/Kg" or "INR/Ton"
});

const priceListSchema = new mongoose.Schema({
    category: { type: String, required: true, enum: ['BOPP', 'Polyester', 'CPP'] }, // Your main product lines
    effectiveDate: { type: Date, required: true }, // The date this price snapshot became effective
    products: [productSchema], // Array of products for this specific snapshot
    isArchived: { type: Boolean, default: false } // Optional flag
}, { timestamps: true });

module.exports = mongoose.model('PriceList', priceListSchema);