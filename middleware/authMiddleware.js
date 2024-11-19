const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Determine the user type and query accordingly
    let query;
    let params = [decoded.id];

    switch (decoded.role) {
      case 'Admin':
      case 'Staff':
      case 'Courier':
        query = 'SELECT * FROM Staff WHERE staff_id = ?';
        break;
      case 'Customer':
      case null:
      default:
        query = 'SELECT * FROM Sender WHERE sender_id = ?';
        break;
    }

    // Execute the query
    const [results] = await db.promise().query(query, params);

    if (!results.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Attach user data to req.user based on role
    req.user = {
      id: decoded.id,
      role: decoded.role || 'Customer', // Default to 'Customer' if role is missing
      staff_role: user.staff_role || null, // Specific to Staff or Courier
      dist_id: user.dist_id || null, // Distribution ID for Staff
      first_name: user.sender_fname || user.staff_fname || null, // Handle both Sender and Staff
      last_name: user.sender_lname || user.staff_lname || null,
      phone: user.sender_phone || null, // Customer phone
      ...user, // Spread any additional user-specific data
    };

    console.log('User details attached to request:', req.user);

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};
