const TrackingModel = {
  // Retrieve basic parcel information and current status
  getParcelInfo: async (db, trackingId) => {
    try {
      const query = `
        SELECT 
          p.tracking_id,
          s.sender_fname AS sender_name,
          r.recipient_name,
          te.tracking_status,
          te.timestamp
        FROM Parcel p
        JOIN Sender s ON p.sender_id = s.sender_id
        JOIN Recipient r ON p.recipient_id = r.recipient_id
        JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
        WHERE p.tracking_id = ?
        AND (
          te.tracking_status = 'Pick up' OR
          te.tracking_status = 'Out for delivery' OR
          te.tracking_status = 'Delivered' OR
          te.tracking_status = 'Unsuccessful' OR
          te.tracking_status LIKE 'Arrived at%'
        )
        ORDER BY te.timestamp DESC
        LIMIT 1; 
      `;
      return await db.query(query, [trackingId]);
    } catch (error) {
      throw new Error('Error fetching parcel info: ' + error.message);
    }
  },

  // Retrieve the journey of the parcel through each distribution point
  getParcelJourney: async (db, trackingId) => {
    try {
      const query = `
        SELECT 
          te.event_id, 
          te.tracking_status, 
          te.timestamp,
          a.district AS location_district,
          a.province AS location_province
        FROM TrackingEvent te
        LEFT JOIN Distribution d ON te.dist_id = d.dist_id
        LEFT JOIN Address a ON d.dist_addr_id = a.address_id
        WHERE te.tracking_id = ?
        ORDER BY te.timestamp DESC; -- Sort journey from latest to oldest
      `;
      return await db.query(query, [trackingId]);
    } catch (error) {
      throw new Error('Error fetching parcel journey: ' + error.message);
    }
  },
};

module.exports = TrackingModel;
