const db = require('../../config/db');

const TrackingModel = {
  // Retrieve basic parcel information and current status
  getParcelInfo: (trackingId) => {
    const query = `
      SELECT 
        p.tracking_id, 
        p.sender_id, 
        s.sender_fname AS sender_name,
        r.recipient_name, 
        te.tracking_status, 
        te.timestamp
      FROM Parcel p
      JOIN Sender s ON p.sender_id = s.sender_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
      WHERE p.tracking_id = ?
      ORDER BY te.timestamp DESC
      LIMIT 1; 
    `;
    return db.promise().query(query, [trackingId]);
  },

  // Retrieve the journey of the parcel through each distribution point
  getParcelJourney: (trackingId) => {
    const query = `
      SELECT 
        te.event_id, 
        te.tracking_status, 
        te.timestamp,
        d.dist_name AS location
      FROM TrackingEvent te
      LEFT JOIN Distribution d ON te.dist_id = d.dist_id
      WHERE te.tracking_id = ?
      ORDER BY te.timestamp ASC;
    `;
    return db.promise().query(query, [trackingId]);
  }
};

module.exports = TrackingModel;
