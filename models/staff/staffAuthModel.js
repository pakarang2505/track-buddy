const StaffAuthModel = {
  // Create a new staff member
  async create(db, staff) {
    try {
      const query = `
        INSERT INTO Staff (staff_fname, staff_lname, staff_password, dist_id, staff_role)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [
        staff.firstName,
        staff.lastName,
        staff.hashedPassword, // Ensure sensitive data like hashedPassword is not logged
        staff.distId,
        staff.role,
      ]);

      console.log('Staff member created successfully with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Database Error in StaffAuthModel.create:', {
        message: error.message,
        stack: error.stack,
        data: { ...staff, hashedPassword: 'REDACTED' }, // Avoid exposing sensitive data
      });
      throw new Error('Failed to create staff member');
    }
  },

  // Find staff by ID
  async findById(db, staffId) {
    try {
      const query = `SELECT * FROM Staff WHERE staff_id = ?`;
      const [results] = await db.query(query, [staffId]);

      if (!results.length) {
        console.error(`Staff with ID ${staffId} not found`);
        throw new Error(`Staff with ID ${staffId} not found`);
      }

      console.log(`Staff member retrieved successfully with ID: ${staffId}`);
      return results[0];
    } catch (error) {
      console.error('Database Error in StaffAuthModel.findById:', {
        message: error.message,
        stack: error.stack,
        data: { staffId },
      });
      throw new Error('Failed to find staff member');
    }
  },

  /* Optional: Find staff by role (if needed)
  async findByRole(db, role) {
    try {
      const query = `SELECT * FROM Staff WHERE staff_role = ?`;
      const [results] = await db.query(query, [role]);

      console.log(`Staff members retrieved successfully with role: ${role}`);
      return results;
    } catch (error) {
      console.error('Database Error in StaffAuthModel.findByRole:', {
        message: error.message,
        stack: error.stack,
        data: { role },
      });
      throw new Error('Failed to find staff by role');
    }
  },*/
};

module.exports = StaffAuthModel;
