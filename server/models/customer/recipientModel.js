const RecipientModel = {
  // Find recipient by phone
  findByPhone: async (db, phone) => {
    try {
      const query = `SELECT * FROM Recipient WHERE recipient_phone = ?`;
      const [rows] = await db.query(query, [phone]); // Ensure it returns rows
      return rows; // Return rows (array)
    } catch (error) {
      console.error('Error finding recipient by phone:', error.message);
      throw new Error('Error finding recipient by phone');
    }
  },

  // Create a new recipient
  create: async (db, recipientData) => {
    try {
      const query = `
        INSERT INTO Recipient (recipient_name, recipient_phone, recipient_address)
        VALUES (?, ?, ?)
      `;
      const [result] = await db.query(query, [
        recipientData.name,
        recipientData.phone,
        recipientData.address,
      ]);
      return result; // Return result (insertId, etc.)
    } catch (error) {
      console.error('Error creating recipient:', error.message);
      throw new Error('Error creating recipient');
    }
  },
};

module.exports = RecipientModel;
