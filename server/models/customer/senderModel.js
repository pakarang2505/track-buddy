const Sender = {
  // Link parcels to the sender using sender_phone
  linkParcelsToSender: async (db, senderId, senderPhone) => {
    try {
      const query = `
        UPDATE Parcel
        SET sender_id = ?
        WHERE sender_phone = ? AND sender_id IS NULL
      `;
      const [result] = await db.query(query, [senderId, senderPhone]);
      return result;
    } catch (error) {
      console.error('Error linking parcels to sender:', error.message);
      throw new Error('Error linking parcels to sender');
    }
  },
  // Find sender by phone
  findByPhone: async (db, phone) => {
    try {
      const query = `
        SELECT sender_id, sender_fname, sender_lname, sender_phone, sender_password
        FROM Sender
        WHERE sender_phone = ?
      `;
      const [results] = await db.query(query, [phone]);
      return results[0] || null;
    } catch (error) {
      console.error('Error finding sender by phone:', error.message);
      throw new Error('Error finding sender by phone');
    }
  },
  // Create a new sender
  create: async (db, sender) => {
    try {
      const query = `
        INSERT INTO Sender (sender_fname, sender_lname, sender_phone, sender_password)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [
        sender.firstName,
        sender.lastName,
        sender.phone,
        sender.password,
      ]);
      return result;
    } catch (error) {
      console.error('Error creating sender:', error.message);
      throw new Error('Error creating sender');
    }
  },
};

module.exports = Sender;
