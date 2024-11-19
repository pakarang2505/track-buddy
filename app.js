
const express = require('express');
const cors = require('cors');
const { protect } = require('./middleware/authMiddleware');
require('dotenv').config();

//customer routes
const authRoutes = require('./routes/customer/authRoutes');
const trackingRoutes = require('./routes/customer/trackingRoutes');
const locationRoutes = require('./routes/customer/locationRoutes');
const shipmentRoutes = require('./routes/customer/shipmentRoutes');
const profileRoutes = require('./routes/customer/profileRoutes');
const notificationRoutes = require('./routes/customer/notificationRoutes');

//shared(staff, courier, admin) routes
const staffAuthRoutes = require('./routes/shared/authRoutes');
const staffProfileRoutes = require('./routes/shared/profileRoutes');

//staff routes
const staffTrackingRoutes = require('./routes/staff/trackingRoutes');
const staffShipmentRoutes = require('./routes/staff/shipmentRoutes');

//courier routes
const courierTrackingRoutes = require('./routes/courier/trackingRoutes');

//admin routes
const adminReportRoutes = require('./routes/admin/reportRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// customer
app.use('/api/auth', authRoutes); // Login and signup routes (no protection needed)
app.use('/api/tracking', protect, trackingRoutes); // Home
app.use('/api/location', protect, locationRoutes); // Location
app.use('/api/shipments', protect, shipmentRoutes); // My shipment
app.use('/api/profile', protect, profileRoutes); // Profile
app.use('/api/notifications', protect, notificationRoutes);

//shared(staff, courier, admin)
app.use('/api/staff/auth', staffAuthRoutes);  
app.use('/api/staff/profile', protect, staffProfileRoutes);

//staff
app.use('/api/staff/tracking', protect, staffTrackingRoutes);
app.use('/api/staff/shipment', protect, staffShipmentRoutes);

//courier
app.use('/api/courier/tracking', protect, courierTrackingRoutes);

//admin
app.use('/api/admin/reports', protect, adminReportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));