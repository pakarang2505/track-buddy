const db = require('../../config/db');

const RecipientModel = {
  // Find recipient by phone
  findByPhone: (phone) => {
    const query = `
      SELECT * FROM Recipient WHERE recipient_phone = ?
    `;
    return db.promise().query(query, [phone]);
  },

  // Create a new recipient
  create: (recipientData) => {
    const query = `
      INSERT INTO Recipient (recipient_name, recipient_phone, recipient_address)
      VALUES (?, ?, ?)
    `;
    return db.promise().query(query, [
      recipientData.name,
      recipientData.phone,
      recipientData.address,
    ]);
  },
};

module.exports = RecipientModel;
