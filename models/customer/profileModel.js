const ProfileModel = {
  // Fetch profile information by sender_id
  async getProfile(db, senderId) {
    try {
      const query = `
        SELECT sender_id, sender_fName, sender_lName, sender_phone
        FROM Sender
        WHERE sender_id = ?
      `;
      const [results] = await db.query(query, [senderId]);
      return results[0]; // Return the first result (or undefined if no match)
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      throw new Error('Failed to fetch profile');
    }
  },

  // Update profile information dynamically
  async updateProfile(db, senderId, updates) {
    try {
      const fields = Object.keys(updates)
        .map((field) => `${field} = ?`)
        .join(', ');
      const values = Object.values(updates);

      if (fields.length === 0) {
        throw new Error('No fields to update'); // Avoid running an empty query
      }

      const query = `
        UPDATE Sender
        SET ${fields}
        WHERE sender_id = ?
      `;
      const [result] = await db.query(query, [...values, senderId]);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error.message);
      throw new Error('Failed to update profile');
    }
  },
};

module.exports = ProfileModel;
