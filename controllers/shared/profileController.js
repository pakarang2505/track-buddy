const db = require('../../config/db');
const bcrypt = require('bcryptjs');

// Get profile data
exports.getProfile = async (req, res) => {
  try {
    const staffId = req.user.id; // Extracted from the JWT token via `protect` middleware

    // Fetch the staff profile
    const [staff] = await db.promise().query(
      'SELECT staff_id, staff_fname, staff_lname, staff_role, dist_id FROM Staff WHERE staff_id = ?',
      [staffId]
    );

    //If no record is found, it means the staff_id is invalid
    if (!staff.length) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.status(200).json({ profile: staff[0] });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Update profile data
exports.editProfile = async (req, res) => {
  try {
    const { firstName, lastName, role, distId, password } = req.body;
    const staffId = req.user.id; // Extracted from the JWT token via `protect` middleware

    // Validate role
    const validRoles = ['Staff', 'Courier', 'Admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // If role is Admin, ensure distId corresponds to "Center"
    const CENTER_DIST_ID = 5;

if (role === 'Admin' && distId !== CENTER_DIST_ID) {
    return res.status(400).json({
      error: 'Admin role requires work office to be "Center"',
    });
}
if (role === 'Admin') {
    distId = 5; // Override to "Center"
}



    // Hash the password if the user provides a new password
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Dynamically build the update query
    const updates = [];
    const queryParams = [];
    if (firstName) {
      updates.push('staff_fname = ?');
      queryParams.push(firstName);
    }
    if (lastName) {
      updates.push('staff_lname = ?');
      queryParams.push(lastName);
    }
    if (role) {
      updates.push('staff_role = ?');
      queryParams.push(role);
    }
    if (distId) {
      updates.push('dist_id = ?');
      queryParams.push(distId);
    }
    if (hashedPassword) {
      updates.push('staff_password = ?');
      queryParams.push(hashedPassword);
    }
    queryParams.push(staffId); // Add staff ID for the WHERE clause

    
    //checks whether the user provided any fields to update
    if (!updates.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE Staff SET ${updates.join(', ')} WHERE staff_id = ?`;

    // Execute the query
    await db.promise().query(query, queryParams);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Edit Profile Error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};
