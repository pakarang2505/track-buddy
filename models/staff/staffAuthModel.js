const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const StaffAuthModel = {
  // Create a new staff member
  async create(staff) {
    try {
      const query = `
        INSERT INTO Staff (staff_fname, staff_lname, staff_password, dist_id, staff_role)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await db.promise().query(query, [
        staff.firstName,
        staff.lastName,
        staff.hashedPassword,
        staff.distId,
        staff.role,
      ]);
  
      console.log('Staff member created successfully with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Database Error in StaffAuthModel.create:', {
        message: error.message,
        stack: error.stack,
        data: staff, // Log the full input data
      });
      throw new Error('Failed to create staff member');
    }
  }
  ,

  // Find staff by ID
  async findById(staffId) {
    try {
      const query = `SELECT * FROM Staff WHERE staff_id = ?`;
      const [results] = await db.promise().query(query, [staffId]);

      if (results.length === 0) {
        console.error(`Staff with ID ${staffId} not found`);
        throw new Error(`Staff with ID ${staffId} not found`); // Throw an error if no staff found
      }

      // Log successful retrieval
      console.log(`Staff member found with ID: ${staffId}`);

      return results[0];
    } catch (error) {
      console.error('Database Error in StaffAuthModel.findById:', {
        message: error.message,
        stack: error.stack,
        data: { staffId },
      });
      throw new Error('Failed to find staff member'); // Throw a clear error for the controller
    }
  },

  // Find staff by role (Optional)
  async findByRole(role) {
    try {
      const query = `SELECT * FROM Staff WHERE staff_role = ?`;
      const [results] = await db.promise().query(query, [role]);

      // Log successful retrieval
      console.log(`Staff members retrieved with role: ${role}`);

      return results;
    } catch (error) {
      console.error('Database Error in StaffAuthModel.findByRole:', {
        message: error.message,
        stack: error.stack,
        data: { role },
      });
      throw new Error('Failed to find staff by role');
    }
  },
};

module.exports = StaffAuthModel;
