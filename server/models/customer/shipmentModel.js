const ShipmentModel = {
  // Fetch the latest shipment status for each parcel sent by the sender, with optional filters
  getShipmentsByStatus: async (db, senderId, senderPhone, statusFilter) => {
    try {
      let query = `
        SELECT 
          p.tracking_id, 
          te.tracking_status, 
          te.timestamp, 
          COALESCE(s.sender_fname, p.sender_name) AS sender_name, -- Use sender_name from Parcel if sender_id is NULL
          r.recipient_name
        FROM Parcel p
        LEFT JOIN Sender s ON p.sender_id = s.sender_id
        LEFT JOIN Recipient r ON p.recipient_id = r.recipient_id
        JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
        WHERE (p.sender_id = ? OR p.sender_phone = ?)
        AND te.timestamp = (
          SELECT MAX(inner_te.timestamp)
          FROM TrackingEvent inner_te
          WHERE inner_te.tracking_id = p.tracking_id
        )
      `;
      const queryParams = [senderId, senderPhone];

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

      return await db.query(query, queryParams);
    } catch (error) {
      throw new Error('Error fetching shipments: ' + error.message);
    }
  },
};

module.exports = ShipmentModel;
