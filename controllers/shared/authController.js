const { connectToDatabase } = require('../../config/db');
const StaffAuthModel = require('../../models/staff/staffAuthModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Role-based configuration for validation
const ROLE_CONFIG = {
  Admin: { distId: process.env.ADMIN_DIST_ID || 1, message: 'Admin role requires distId to be "1" (Center)' },
  Staff: { message: 'Staff role cannot use distId "1" (Center)' },
  Courier: { message: 'Courier role cannot use distId "1" (Center)' },
};

// Staff Signup Function
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, password, distId, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !password || !distId || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    const validRoles = Object.keys(ROLE_CONFIG);
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Check if distId exists and is active in the Distribution table
    const db = connectToDatabase(role); // Use role to determine the connection
    const [distResults] = await db.query(
      'SELECT dist_id FROM Distribution WHERE dist_id = ? AND is_active = 1',
      [distId]
    );
    if (!distResults.length) {
      return res.status(400).json({ error: 'Invalid or inactive distribution ID' });
    }

    // Validate distId based on role
    if (role === 'Admin' && distId !== ROLE_CONFIG.Admin.distId) {
      return res.status(400).json({ error: ROLE_CONFIG.Admin.message });
    } else if (role !== 'Admin' && distId === ROLE_CONFIG.Admin.distId) {
      return res.status(400).json({ error: ROLE_CONFIG[role].message });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff in the database
    const staffId = await StaffAuthModel.create(db, {
      firstName,
      lastName,
      hashedPassword,
      distId,
      role,
    });

    // Generate a JWT token
    const token = jwt.sign({ id: staffId, role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'Staff account created successfully',
      token,
      staff: {
        staffId,
        firstName,
        lastName,
        role,
        distId,
      },
    });
  } catch (error) {
    console.error('Signup Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error creating staff account' });
  }
};


// Staff Login Function
exports.login = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Debugging: Log the request body

    const { staffId, password } = req.body;

    // Validate input
    if (!staffId || !password) {
      return res.status(400).json({ error: 'Staff ID and password are required' });
    }

    // Find the staff member by ID
    const staff = await StaffAuthModel.findById(req.db, staffId);
    if (!staff) {
      return res.status(400).json({ error: 'Invalid credentials (staff not found)' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, staff.staff_password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials (incorrect password)' });
    }

    // Generate a JWT token with role
    const token = jwt.sign(
      { id: staff.staff_id, role: staff.staff_role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      staff: {
        staffId: staff.staff_id,
        firstName: staff.staff_fname,
        lastName: staff.staff_lname,
        role: staff.staff_role,
        distId: staff.dist_id,
      },
    });
  } catch (error) {
    console.error('Login Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error logging in' });
  }
};


// Staff Logout Function
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};