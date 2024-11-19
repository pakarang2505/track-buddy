const StaffAuthModel = require('../../models/staff/staffAuthModel'); // Correct model import
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Staff Signup Function
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, password, distId: originalDistId, role } = req.body;
    let distId = originalDistId;

    // Validate role
    const validRoles = ['Staff', 'Courier', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Check if distId exists and is active in the Distribution table
    const [distResults] = await db.promise().query(
      'SELECT dist_id FROM Distribution WHERE dist_id = ? AND is_active = 1',
      [distId]
    );
    if (!distResults.length) {
      return res.status(400).json({ error: 'Invalid or inactive distribution ID' });
    }

    // Validate distId based on role
    if (role === 'Admin' && distId !== 5) {
      return res.status(400).json({ error: 'Admin role requires distId to be "5" (Center)' });
    } else if (role !== 'Admin' && distId === 5) {
      return res.status(400).json({ error: `${role} role cannot use distId "5" (Center)` });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff in the database
    const staffId = await StaffAuthModel.create({
      firstName,
      lastName,
      hashedPassword,
      distId,
      role,
    });

// Generate a JWT token
const token = jwt.sign(
  { id: staff.staff_id, role: staff.staff_role }, // Include role in the payload
  process.env.JWT_SECRET, // Use the same secret for verification
  { expiresIn: '1h' } // Token expiry
);


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
    console.error('Signup Error:', error.message);
    console.error('Stack Trace:', error.stack);

    res.status(500).json({ error: 'Error creating staff account' });
  }
};

// Staff Login Function
exports.login = async (req, res) => {
  try {
    const { staffId, password } = req.body;

    // Find the staff member by ID
    const staff = await StaffAuthModel.findById(staffId);
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
      { id: staff.staff_id, role: staff.staff_role }, // Include role in the token payload
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
    console.error('Login Error:', error.message);
    console.error('Stack Trace:', error.stack);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Staff Logout Function
exports.logout = (req, res) => {
  // For stateless JWTs, logout is handled on the client side
  res.status(200).json({ message: 'Logged out successfully' });
};
