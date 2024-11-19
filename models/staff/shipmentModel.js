const db = require('../../config/db');

const ShipmentModel = {
  // Find sender by phone
  findSenderByPhone: (phone) => {
    const query = `
      SELECT * FROM Sender WHERE sender_phone = ?
    `;
    return db.promise().query(query, [phone]);
  },

  // Create a new parcel
  createParcel: (parcelData) => {
    const query = `
      INSERT INTO Parcel (tracking_id, sender_id, recipient_id)
      VALUES (?, ?, ?)
    `;
    return db.promise().query(query, [
      parcelData.tracking_id,
      parcelData.sender_id, // Nullable
      parcelData.recipient_id,
    ]);
  },

  // Create a tracking event
  createTrackingEvent: (eventData) => {
    const query = `
      INSERT INTO TrackingEvent (tracking_id, dist_id, final_dist_id, staff_id, timestamp, tracking_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.promise().query(query, [
      eventData.tracking_id,
      eventData.dist_id,
      eventData.final_dist_id,
      eventData.staff_id,
      eventData.timestamp,
      eventData.tracking_status,
    ]);
  },

  // Link shipments to sender based on sender_phone
  linkShipmentsToSender: (senderId) => {
    const query = `
      UPDATE Parcel
      SET sender_id = ?
      WHERE sender_id IS NULL
    `;
    return db.promise().query(query, [senderId]);
  },
};

module.exports = ShipmentModel;
