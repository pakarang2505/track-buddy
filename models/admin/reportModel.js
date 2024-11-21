const ReportModel = {
  // Count parcels by status for a specific date
  getParcelCountsByDate: async (db, selectedDate) => {
    try {
      const query = `
        SELECT 
          'All status' AS filter_status, COUNT(DISTINCT te.tracking_id) AS count
        FROM TrackingEvent te
        WHERE DATE(te.timestamp) = ?
          AND te.timestamp = (
            SELECT MAX(inner_te.timestamp)
            FROM TrackingEvent inner_te
            WHERE inner_te.tracking_id = te.tracking_id
              AND DATE(inner_te.timestamp) = ?
          )
        UNION ALL
        SELECT 
          'Delivered' AS filter_status, COUNT(DISTINCT te.tracking_id) AS count
        FROM TrackingEvent te
        WHERE DATE(te.timestamp) = ?
          AND te.timestamp = (
            SELECT MAX(inner_te.timestamp)
            FROM TrackingEvent inner_te
            WHERE inner_te.tracking_id = te.tracking_id
              AND DATE(inner_te.timestamp) = ?
          )
          AND te.tracking_status = 'Delivered'
        UNION ALL
        SELECT 
          'Unsuccessful' AS filter_status, COUNT(DISTINCT te.tracking_id) AS count
        FROM TrackingEvent te
        WHERE DATE(te.timestamp) = ?
          AND te.timestamp = (
            SELECT MAX(inner_te.timestamp)
            FROM TrackingEvent inner_te
            WHERE inner_te.tracking_id = te.tracking_id
              AND DATE(inner_te.timestamp) = ?
          )
          AND te.tracking_status = 'Unsuccessful'
      `;
      return await db.query(query, [selectedDate, selectedDate, selectedDate, selectedDate, selectedDate, selectedDate]);
    } catch (error) {
      throw new Error('Error fetching parcel counts: ' + error.message);
    }
  },

  // Fetch parcels by status filter and date
getParcelsByStatusAndDate: async (db, selectedDate, statusFilter) => {
  try {
    let query = `
      SELECT 
        p.tracking_id, 
        te.tracking_status, 
        te.timestamp, 
        s.sender_fname AS sender_name, 
        r.recipient_name
      FROM TrackingEvent te
      JOIN Parcel p ON te.tracking_id = p.tracking_id
      LEFT JOIN Sender s ON p.sender_id = s.sender_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE DATE(te.timestamp) = ?
    `;

    // Add filter for tracking status
    if (statusFilter === 'All status') {
      query += `
        AND (te.tracking_status LIKE 'Arrived at%' 
          OR te.tracking_status IN ('Pick up', 'Out for delivery', 'Delivered', 'Unsuccessful'))
      `;
    } else if (statusFilter === 'Delivered') {
      query += `AND te.tracking_status = 'Delivered'`;
    } else if (statusFilter === 'Unsuccessful') {
      query += `AND te.tracking_status = 'Unsuccessful'`;
    }

    query += ` ORDER BY te.timestamp DESC`;

    return await db.query(query, [selectedDate]);
  } catch (error) {
    throw new Error('Error fetching parcels by status: ' + error.message);
  }
},


  // Fetch parcel details, including final_dist_id from TrackingEvent
  getParcelDetails: async (db, trackingId) => {
    try {
      const query = `
        SELECT te.tracking_id, te.final_dist_id
        FROM TrackingEvent te
        WHERE te.tracking_id = ?
        ORDER BY te.timestamp DESC
        LIMIT 1
      `;
      return await db.query(query, [trackingId]);
    } catch (error) {
      throw new Error('Error fetching parcel details: ' + error.message);
    }
  },

  // Find distribution by name
  findDistributionByName: async (db, distName) => {
    try {
      const query = `
        SELECT dist_id 
        FROM Distribution
        WHERE LOWER(dist_name) = LOWER(?)
      `;
      return await db.query(query, [distName]);
    } catch (error) {
      throw new Error('Error finding distribution: ' + error.message);
    }
  },

  // Update tracking status
  updateTrackingStatus: async (db, trackingId, updateData) => {
    try {
      const queryUpdate = `
        UPDATE TrackingEvent 
        SET 
          dist_id = ?, 
          staff_id = ?, 
          timestamp = ?, 
          tracking_status = ?, 
          note = ?
        WHERE tracking_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `;
      return await db.query(queryUpdate, [
        updateData.dist_id,
        updateData.staff_id,
        updateData.timestamp,
        updateData.tracking_status,
        updateData.note || null,
        trackingId,
      ]);
    } catch (error) {
      throw new Error('Error updating tracking status: ' + error.message);
    }
  },

  // Get all distributions for dropdown
  getAllDistributions: async (db, searchTerm) => {
    try {
      let query = `
        SELECT dist_id, dist_name 
        FROM Distribution
      `;
      if (searchTerm) {
        query += ` WHERE LOWER(dist_name) LIKE LOWER(?) `;
      }
      query += ` ORDER BY dist_name ASC`;

      return await db.query(query, searchTerm ? [`%${searchTerm}%`] : []);
    } catch (error) {
      throw new Error('Error fetching distributions: ' + error.message);
    }
  },
  
  // Fetch all unsuccessful parcels
getUnsuccessfulParcels: async (db) => {
  try {
    const query = `
      SELECT 
        p.tracking_id, 
        te.tracking_status, 
        te.timestamp, 
        s.sender_fname AS sender_name, 
        r.recipient_name, 
        te.note
      FROM TrackingEvent te
      JOIN Parcel p ON te.tracking_id = p.tracking_id
      LEFT JOIN Sender s ON p.sender_id = s.sender_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE te.tracking_status = 'Unsuccessful'
        AND te.timestamp = (
          SELECT MAX(inner_te.timestamp)
          FROM TrackingEvent inner_te
          WHERE inner_te.tracking_id = te.tracking_id
        )
      ORDER BY te.timestamp DESC
    `;
    return await db.query(query);
  } catch (error) {
    throw new Error('Error fetching unsuccessful parcels: ' + error.message);
  }
},

};

module.exports = ReportModel;
