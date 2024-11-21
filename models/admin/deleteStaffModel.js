const StaffModel = {
    // Find staff by ID
    findById: async (db, staffId) => {
      try {
        const query = `
          SELECT * FROM Staff
          WHERE staff_id = ?
        `;
        return await db.query(query, [staffId]);
      } catch (error) {
        throw new Error('Error finding staff by ID: ' + error.message);
      }
    },
  
    // Delete staff by ID
    deleteStaffById: async (db, staffId) => {
      try {
        const query = `
          DELETE FROM Staff
          WHERE staff_id = ?
        `;
        return await db.query(query, [staffId]);
      } catch (error) {
        throw new Error('Error deleting staff by ID: ' + error.message);
      }
    },
  
    // Fetch all staff with their work office
    getAllStaff: async (db) => {
      try {
        const query = `
          SELECT 
            s.staff_id,
            CONCAT(s.staff_fname, ' ', s.staff_lname) AS staff_name,
            d.dist_name AS work_office
          FROM Staff s
          LEFT JOIN Distribution d ON s.dist_id = d.dist_id
          ORDER BY s.staff_id ASC
        `;
        return await db.query(query);
      } catch (error) {
        throw new Error('Error fetching staff list: ' + error.message);
      }
    },
  
    // Search staff by query (ID, name, or work office)
    searchStaff: async (db, searchTerm) => {
      try {
        const query = `
          SELECT 
            s.staff_id,
            CONCAT(s.staff_fname, ' ', s.staff_lname) AS staff_name,
            d.dist_name AS work_office
          FROM Staff s
          LEFT JOIN Distribution d ON s.dist_id = d.dist_id
          WHERE LOWER(s.staff_fname) LIKE LOWER(?) 
             OR LOWER(s.staff_lname) LIKE LOWER(?)
             OR LOWER(d.dist_name) LIKE LOWER(?)
             OR s.staff_id LIKE ?
          ORDER BY s.staff_id ASC
        `;
        const searchParam = `%${searchTerm}%`;
        return await db.query(query, [searchParam, searchParam, searchParam, searchParam]);
      } catch (error) {
        throw new Error('Error searching staff: ' + error.message);
      }
    },
  };
  
  module.exports = StaffModel;
  