const db = require('../../config/db');

// Update tracking status for staff
exports.updateTrackingStatus = async (req, res) => {
  try {
    const { trackingId, trackingStatus, note } = req.body;
    const staffId = req.user.id; // From authMiddleware
    const role = req.user.staff_role; // From authMiddleware
    const currentDistId = req.user.dist_id; // Staff's assigned distribution center ID

    // Validate staff role
    if (role !== 'Staff') {
      return res.status(403).json({ error: 'Only Staff can perform this action' });
    }

    // Fetch the latest tracking event for the given tracking ID
    const [tracking] = await db.promise().query(
      `SELECT dist_id, final_dist_id, tracking_status FROM TrackingEvent 
       WHERE tracking_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [trackingId]
    );

    if (!tracking.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const currentTracking = tracking[0];
    const distId = currentTracking.dist_id; // Current distribution center

    // Validate that the staff is working at their assigned distribution center
    if (distId !== currentDistId) {
      return res.status(403).json({ error: 'Staff can only update status for their assigned distribution center' });
    }

    // Fetch the name of the current distribution center
    const [distribution] = await db.promise().query(
      `SELECT dist_name FROM Distribution WHERE dist_id = ?`,
      [currentDistId]
    );

    if (!distribution.length) {
      return res.status(404).json({ error: 'Distribution center not found' });
    }

    const distName = distribution[0].dist_name;

    // Determine the new tracking status
    let finalTrackingStatus;

    // "Unsuccessful" requires a note
    if (trackingStatus === 'Unsuccessful') {
      if (!note) {
        return res.status(400).json({ error: 'Note is required for Unsuccessful status' });
      }
      finalTrackingStatus = 'Unsuccessful';
    } 
    // "Arrived" requires converting to "Arrived at {dist_name}" (current work office)
    else if (trackingStatus === 'Arrived') {
      // Validate previous status
      if (
        currentTracking.tracking_status !== 'Pick up' &&
        !currentTracking.tracking_status.startsWith('Arrived at')
      ) {
        return res.status(400).json({
          error: 'Status can only be updated to "Arrived" from "Pick up" or another "Arrived at" status',
        });
      }
      finalTrackingStatus = `Arrived at ${distName}`;
    } 
    // Invalid status for staff
    else {
      return res.status(400).json({ error: 'Invalid status for Staff role' });
    }

    // Insert a new tracking event with the updated status
    await db.promise().query(
      `INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [trackingId, currentTracking.final_dist_id, currentDistId, staffId, finalTrackingStatus, note || null]
    );

    res.status(200).json({ message: 'Tracking status updated successfully' });
  } catch (error) {
    console.error('Error updating tracking status:', error.message);
    res.status(500).json({ error: 'Failed to update tracking status' });
  }
};
