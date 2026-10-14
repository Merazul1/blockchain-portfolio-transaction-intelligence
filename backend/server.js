require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkHealth } = require('./config/db');
const cacheService = require('./services/cacheService');
const priceService = require('./services/priceService');

// Route Handlers
const networkRoutes = require('./routes/networks');
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');
const anomalyRoutes = require('./routes/anomalies');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/networks', networkRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

// Prices route
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await priceService.getLivePrices();
    res.json({ success: true, prices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint (verifies SQL Server, Cache engine, and server status)
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkHealth();
  const cacheHealth = cacheService.getStatus();

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    sqlServer: dbHealth,
    cache: cacheHealth,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Blockchain Intelligence Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Networks API: http://localhost:${PORT}/api/networks`);
  console.log(`=======================================================`);
});

module.exports = app;
