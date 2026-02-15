const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors({
    origin: ['http://localhost', 'http://localhost:4200', 'http://localhost:80'],
    credentials: true
})); // Enable CORS for the Angular frontend
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'API Centre Commercial - MEAN Stack',
        version: '1.0.0'
    });
});

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/centre', require('./routes/centreRoutes'));
app.use('/api/v1/zones', require('./routes/zoneRoutes'));
app.use('/api/v1/boutiques', require('./routes/boutiqueRoutes'));
app.use('/api/v1/loyers', require('./routes/loyerRoutes'));
app.use('/api/v1/paiements', require('./routes/paiementRoutes'));
app.use('/api/v1/employes', require('./routes/employeRoutes'));
app.use('/api/v1/tasks', require('./routes/taskRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1/produits', require('./routes/produitRoutes'));
app.use('/api/v1/panier', require('./routes/panierRoutes'));
app.use('/api/v1/commandes', require('./routes/commandeRoutes'));

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
