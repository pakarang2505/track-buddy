const db = require('../../config/db');

const ReportModel = {
  // Count parcels by status for a specific date
  getParcelCountsByDate: (selectedDate) => {
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
    return db.promise().query(query, [selectedDate, selectedDate, selectedDate, selectedDate, selectedDate, selectedDate]);
  },

  // Fetch parcels by status filter and date
  getParcelsByStatusAndDate: (selectedDate, statusFilter) => {
    let query = `
      SELECT 
        p.tracking_id, 
        te.tracking_status, 
        te.timestamp, 
        s.sender_fname AS sender_name, 
        r.recipient_name
      FROM TrackingEvent te
      JOIN Parcel p ON te.tracking_id = p.tracking_id
      JOIN Sender s ON p.sender_id = s.sender_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE DATE(te.timestamp) = ?
    `;

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

    return db.promise().query(query, [selectedDate]);
  },

  // Fetch parcel details, including final_dist_id from TrackingEvent
  getParcelDetails: (trackingId) => {
    const query = `
      SELECT te.tracking_id, te.final_dist_id
      FROM TrackingEvent te
      WHERE te.tracking_id = ?
      ORDER BY te.timestamp DESC
      LIMIT 1
    `;
    return db.promise().query(query, [trackingId]);
  },

  // Find distribution by name
  findDistributionByName: (distName) => {
    const query = `
      SELECT dist_id 
      FROM Distribution
      WHERE LOWER(dist_name) = LOWER(?)
    `;
    return db.promise().query(query, [distName]);
  },

// Update tracking status
updateTrackingStatus: async (trackingId, updateData) => {
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
    return db.promise().query(queryUpdate, [
      updateData.dist_id, // Update dist_id as part of the query
      updateData.staff_id,
      updateData.timestamp,
      updateData.tracking_status,
      updateData.note || null,
      trackingId,
    ]);
  },
  
  
  // Get all distribution centers for dropdown
  getAllDistributions: (searchTerm) => {
    let query = `
      SELECT dist_id, dist_name 
      FROM Distribution
    `;
    if (searchTerm) {
      query += ` WHERE LOWER(dist_name) LIKE LOWER(?) `;
    }
    query += ` ORDER BY dist_name ASC`;
    return db.promise().query(query, searchTerm ? [`%${searchTerm}%`] : []);
  },
};

module.exports = ReportModel;
