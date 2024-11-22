const NotificationModel = {
  // Get notifications for a sender (only Delivered or Unsuccessful)
  getNotificationsForSender: async (db, senderId) => {
    try {
      const query = `
        SELECT 
          p.tracking_id, 
          te.tracking_status, 
          te.timestamp, 
          s.sender_fname AS sender_name, 
          r.recipient_name,
          te.note
        FROM Parcel p
        JOIN Sender s ON p.sender_id = s.sender_id
        JOIN Recipient r ON p.recipient_id = r.recipient_id
        JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
        WHERE p.sender_id = ? 
        AND (te.tracking_status = 'Delivered' OR te.tracking_status = 'Unsuccessful')
        AND te.timestamp = (
          SELECT MAX(inner_te.timestamp)
          FROM TrackingEvent inner_te
          WHERE inner_te.tracking_id = p.tracking_id
        )
        ORDER BY te.timestamp DESC
      `;
      return await db.query(query, [senderId]);
    } catch (error) {
      throw new Error('Error fetching notifications: ' + error.message);
    }
  },

  // Get basic info for a specific tracking ID
  getBasicInfo: async (db, trackingId) => {
    try {
      const query = `
        SELECT 
          p.tracking_id, 
          te.tracking_status, 
          te.timestamp, 
          s.sender_fname AS sender_name, 
          r.recipient_name,
          te.note
        FROM Parcel p
        JOIN Sender s ON p.sender_id = s.sender_id
        JOIN Recipient r ON p.recipient_id = r.recipient_id
        JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
        WHERE p.tracking_id = ?
        AND te.timestamp = (
          SELECT MAX(inner_te.timestamp)
          FROM TrackingEvent inner_te
          WHERE inner_te.tracking_id = p.tracking_id
        )
        LIMIT 1
      `;
      return await db.query(query, [trackingId]);
    } catch (error) {
      throw new Error('Error fetching basic info: ' + error.message);
    }
  },

  // Get journey details for a specific tracking ID
  getJourneyDetails: async (db, trackingId) => {
    try {
      const query = `
        SELECT 
          te.event_id,
          te.tracking_status,
          te.timestamp,
          CONCAT(a.district, ' - ', a.province) AS location
        FROM TrackingEvent te
        LEFT JOIN Distribution d ON te.dist_id = d.dist_id
        LEFT JOIN Address a ON d.dist_addr_id = a.address_id
        WHERE te.tracking_id = ?
        ORDER BY te.timestamp ASC
      `;
      return await db.query(query, [trackingId]);
    } catch (error) {
      throw new Error('Error fetching journey details: ' + error.message);
    }
  },
};

module.exports = NotificationModel;
