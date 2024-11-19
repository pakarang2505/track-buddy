const db = require('../../config/db');

const Sender = {
  // Create a new sender
  create: (sender) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Sender (sender_fname, sender_lname, sender_phone, sender_password)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        query,
        [sender.firstName, sender.lastName, sender.phone, sender.password], // hashed password is passed here
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // Find a sender by their phone number
  findByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT sender_id, sender_fname, sender_lname, sender_phone, sender_password
        FROM Sender
        WHERE sender_phone = ?
      `;
      db.query(query, [phone], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Return the first matching record
      });
    });
  },
};

module.exports = Sender;
