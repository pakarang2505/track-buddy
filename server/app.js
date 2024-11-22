const express = require('express');
const cors = require('cors');
const { protect } = require('./middleware/authMiddleware');
const { connectToDatabase } = require('./config/db'); // For dynamic database connection
require('dotenv').config();

// Customer routes
const authRoutes = require('./routes/customer/authRoutes');
const trackingRoutes = require('./routes/customer/trackingRoutes');
const locationRoutes = require('./routes/customer/locationRoutes');
const shipmentRoutes = require('./routes/customer/shipmentRoutes');
const profileRoutes = require('./routes/customer/profileRoutes');
const notificationRoutes = require('./routes/customer/notificationRoutes');

// Shared (staff, courier, admin) routes
const staffAuthRoutes = require('./routes/shared/authRoutes');
const staffProfileRoutes = require('./routes/shared/profileRoutes');

// Staff routes
const staffTrackingRoutes = require('./routes/staff/trackingRoutes');
const staffShipmentRoutes = require('./routes/staff/shipmentRoutes');

// Courier routes
const courierTrackingRoutes = require('./routes/courier/trackingRoutes');

// Admin routes
const adminReportRoutes = require('./routes/admin/reportRoutes');
const deleteStaffRoutes = require('./routes/admin/deleteStaffRoutes');
const adminTrackingRoutes = require('./routes/admin/trackingRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Middleware
app.use((req, res, next) => {
  try {
    const role = req.user?.role || 'Customer'; // Default to 'Customer' if not logged in
    req.db = connectToDatabase(role); // Dynamically inject the database based on role
    next();
  } catch (error) {
    console.error('Database Connection Error:', error.message);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Customer routes
app.use('/api/auth', authRoutes); // Login and signup routes (no protection needed)
app.use('/api/tracking', protect, trackingRoutes); // Home
app.use('/api/location', protect, locationRoutes); // Location
app.use('/api/shipments', protect, shipmentRoutes); // My shipment
app.use('/api/profile', protect, profileRoutes); // Profile
app.use('/api/notifications', protect, notificationRoutes); // Notifications

// Shared routes (staff, courier, admin)
app.use('/api/staff/auth', staffAuthRoutes);  
app.use('/api/staff/profile', protect, staffProfileRoutes);

// Staff routes
app.use('/api/staff/tracking', protect, staffTrackingRoutes);
app.use('/api/staff/shipment', protect, staffShipmentRoutes);

// Courier routes
app.use('/api/courier/tracking', protect, courierTrackingRoutes);

// Admin routes
app.use('/api/admin/reports', protect, adminReportRoutes);
app.use('/api/admin/deleteStaff', protect, deleteStaffRoutes);
app.use('/api/admin/tracking', adminTrackingRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message, err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
