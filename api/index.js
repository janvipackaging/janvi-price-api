const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (Vercel handles this via UI, but kept for local development)
dotenv.config(); 

const app = express();

// --- 1. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- 2. CORS Configuration (The Security Key) ---
const corsOptions = {
    // CRITICAL: This allows ONLY your Hostinger frontend to access the API.
    // Replace with your exact domain!
    origin: 'https://janvipackaging.online' 
};
app.use(cors(corsOptions));

// --- 3. Middleware and Routes ---
app.use(express.json());

// Import your existing routes (Ensure these files are copied to your repo)
const priceRoutes = require('../routes/priceRoutes');
const adminRoutes = require('../routes/adminRoutes');

app.use('/api/prices', priceRoutes);
app.use('/admin', adminRoutes);

// Vercel requires the API to respond to the root path
app.get('/', (req, res) => {
    res.send('Janvi Packaging Price API is running.');
});

// Export the app object for Vercel Serverless Function deployment
module.exports = app; 
