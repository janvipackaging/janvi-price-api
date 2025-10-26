const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (for local testing. Vercel loads them securely)
dotenv.config(); 

const app = express();

// --- 1. Database Connection ---
// CRITICAL FIX: Add dbName option to tell Mongoose which database to query inside the cluster
mongoose.connect(process.env.MONGO_URI, { 
    // The database name we created in MongoDB Atlas
    dbName: 'JanviPriceDB' 
})
    .then(() => console.log('MongoDB connected successfully to JanviPriceDB.'))
    .catch(err => {
        console.error('CRITICAL MONGODB CONNECTION ERROR:', err);
        // In a Vercel environment, crashing here leads to the 500 error, 
        // but logging the error helps debug.
    });

// --- 2. CORS Configuration ---
// This is the security rule that allows your Hostinger site to connect.
const corsOptions = {
    // CRITICAL: This allows ONLY your Hostinger frontend to access the API.
    origin: process.env.FRONTEND_URL || 'https://janvipackaging.online'
};
app.use(cors(corsOptions));

// --- 3. Middleware and Routes ---
app.use(express.json());

// Import your existing routes
const priceRoutes = require('../routes/priceRoutes');
const adminRoutes = require('../routes/adminRoutes');

app.use('/api/prices', priceRoutes);
app.use('/admin', adminRoutes);

// Vercel's root endpoint check
app.get('/', (req, res) => {
    res.status(200).send('Janvi Packaging Price API is running and connected.');
});

// CRITICAL: Express Error Handler Middleware 
// This handles any unexpected Mongoose or query errors and prevents the server from crashing.
app.use((err, req, res, next) => {
    console.error('--- EXPRESS HANDLED CRASH ---');
    console.error(err.stack);
    // Send a generic 500 error to the client to mask internal details
    res.status(500).json({ 
        message: 'Internal Server Error: The API crashed while processing the request.',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});

// Export the app object for Vercel Serverless Function deployment
module.exports = app;
