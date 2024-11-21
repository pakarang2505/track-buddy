const ShipmentModel = {
  // Find sender by phone
  findSenderByPhone: async (db, phone) => {
    try {
      const query = `SELECT * FROM Sender WHERE sender_phone = ?`;
      return await db.query(query, [phone]);
    } catch (error) {
      throw new Error('Error finding sender by phone: ' + error.message);
    }
  },

  // Create a new parcel
  createParcel: async (db, parcelData) => {
    try {
      const query = `
        INSERT INTO Parcel (tracking_id, sender_id, recipient_id, sender_phone, sender_name)
        VALUES (?, ?, ?, ?, ?)
      `;
      return await db.query(query, [
        parcelData.tracking_id,
        parcelData.sender_id,
        parcelData.recipient_id,
        parcelData.sender_phone,
        parcelData.sender_name, // Include sender_name
      ]);
    } catch (error) {
      throw new Error('Error creating parcel: ' + error.message);
    }
  },
  
  
  
  

  // Create a tracking event
  createTrackingEvent: (db, eventData) => {
    const query = `
      INSERT INTO TrackingEvent (tracking_id, dist_id, final_dist_id, staff_id, timestamp, tracking_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.query(query, [
      eventData.tracking_id,
      eventData.dist_id, 
      eventData.final_dist_id, 
      eventData.staff_id,
      eventData.timestamp,
      eventData.tracking_status,
    ]);
  },
  

  // Link shipments to sender based on sender_phone
  linkShipmentsToSender: async (db, senderId) => {
    try {
      const query = `
        UPDATE Parcel
        SET sender_id = ?
        WHERE sender_id IS NULL
      `;
      return await db.query(query, [senderId]);
    } catch (error) {
      throw new Error('Error linking shipments to sender: ' + error.message);
    }
  },
};

module.exports = ShipmentModel;
