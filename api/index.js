const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (Vercel handles this via UI)
dotenv.config(); 

const app = express();

// --- 1. FIXED Database Connection ---
// CRITICAL FIX: Add dbName option to tell Mongoose which database to connect to inside the cluster
mongoose.connect(process.env.MONGO_URI, { 
    // The database name we created in MongoDB Atlas
    dbName: 'JanviPriceDB' 
})
    .then(() => console.log('MongoDB connected successfully to JanviPriceDB.'))
    .catch(err => {
        console.error('CRITICAL MONGODB CONNECTION ERROR:', err);
        // If the connection fails, we need to crash the app gracefully to debug
        // throw new Error('Database connection failed.'); 
    });
// ------------------------------------

// --- 2. CORS Configuration ---
const corsOptions = {
    // CRITICAL: This allows ONLY your Hostinger frontend to access the API.
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
