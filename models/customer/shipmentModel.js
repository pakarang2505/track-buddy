const db = require('../../config/db');

const ShipmentModel = {
  // Fetch the latest shipment status for each parcel sent by the sender, with optional filters
  getShipmentsByStatus: (senderId, statusFilter) => {
    let query = `
      SELECT 
        p.tracking_id, 
        te.tracking_status, 
        te.timestamp, 
        s.sender_fname AS sender_name, 
        r.recipient_name
      FROM Parcel p
      JOIN Sender s ON p.sender_id = s.sender_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
      WHERE p.sender_id = ?
      AND te.timestamp = (
        SELECT MAX(inner_te.timestamp)
        FROM TrackingEvent inner_te
        WHERE inner_te.tracking_id = p.tracking_id
      )
    `;
    const queryParams = [senderId];

    // Apply status filters
    if (statusFilter === 'in-progress') {
      query += `
        AND (
          te.tracking_status = 'Pick up' OR 
          te.tracking_status LIKE 'Arrived at%' OR 
          te.tracking_status = 'Out for delivery'
        )
      `;
    } else if (statusFilter === 'delivered') {
      query += `AND te.tracking_status = 'Delivered'`;
    } else if (statusFilter === 'unsuccessful') {
      query += `AND te.tracking_status = 'Unsuccessful'`;
    }

    query += ` ORDER BY te.timestamp DESC`;

    return db.promise().query(query, queryParams);
  }
};

module.exports = ShipmentModel;
