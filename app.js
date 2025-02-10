require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://parser-production-902f.up.railway.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors(corsOptions));

console.log('Connecting to MongoDB:', process.env.MONGODB_URI || 'mongodb://localhost:27017/creditsea');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creditsea')
.then(() => {
    console.log('Successfully connected to MongoDB');
    mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (err) {
            console.error('Error listing collections:', err);
        } else {
            console.log('Available collections:', collections.map(c => c.name));
        }
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/creditsea');
});

// Add root route handler for basic testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend server is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
