const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for the Angular frontend
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the MEAN Backend API' });
});

// Routes
app.use('/api/v1/tasks', require('./routes/taskRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? 'null' : err.stack,
    });
});

module.exports = app;
