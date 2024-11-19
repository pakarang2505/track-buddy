const db = require('../../config/db');

const NotificationModel = {
    getNotificationsForSender: (senderId) => {
      const query = `
        SELECT 
          p.tracking_id,
          te.tracking_status,
          te.timestamp,
          s.sender_fname AS sender_name,
          r.recipient_name AS recipient_name,
          te.note
        FROM TrackingEvent te
        JOIN Parcel p ON te.tracking_id = p.tracking_id
        JOIN Sender s ON p.sender_id = s.sender_id
        JOIN Recipient r ON p.recipient_id = r.recipient_id
        WHERE p.sender_id = ?
          AND te.tracking_status IN ('Unsuccessful', 'Delivered')
          AND te.timestamp = (
            SELECT MAX(inner_te.timestamp)
            FROM TrackingEvent inner_te
            WHERE inner_te.tracking_id = te.tracking_id
          )
        ORDER BY te.timestamp DESC;
      `;
      return db.promise().query(query, [senderId]);
    },
  };
  
  

module.exports = NotificationModel;
