const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import Routes
const { router: authRoutes } = require('./routes/auth');
const businessRoutes = require('./routes/business');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register Routes
app.use('/auth', authRoutes);
app.use('/business', businessRoutes);
app.use('/ai', aiRoutes);
app.use('/payment', paymentRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send("VyapaarMitra Professional Backend Running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Professional Server is running on http://localhost:${PORT}`);
});
