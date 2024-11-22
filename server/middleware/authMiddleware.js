const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, invalid token format' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract role and ID from the token
    const { id, role = 'Customer' } = decoded;

    // Establish a database connection based on the role
    const db = connectToDatabase(role);

    // Attach the database connection to req
    req.db = db;

    // Determine the user type and query accordingly
    const queries = {
      Admin: 'SELECT * FROM Staff WHERE staff_id = ?',
      Staff: 'SELECT * FROM Staff WHERE staff_id = ?',
      Courier: 'SELECT * FROM Staff WHERE staff_id = ?',
      Customer: 'SELECT * FROM Sender WHERE sender_id = ?',
    };

    const query = queries[role] || queries.Customer;
    const [results] = await db.query(query, [id]);

    if (!results.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Attach user data to req.user
    req.user = {
      id,
      role,
      staff_role: user.staff_role || null,
      dist_id: user.dist_id || null,
      first_name: user.sender_fname || user.staff_fname || null,
      last_name: user.sender_lname || user.staff_lname || null,
      phone: user.sender_phone || null,
      ...user, // Include all other user fields for flexibility
    };

    console.log('User details attached to request:', req.user);

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please log in again' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token, authorization denied' });
    }

    return res.status(500).json({ error: 'Server error during authentication' });
  }
};
