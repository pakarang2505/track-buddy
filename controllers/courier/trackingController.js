const db = require('../../config/db');

exports.updateTrackingStatus = async (req, res) => {
    try {
      const { trackingId, trackingStatus, note } = req.body;
      const staffId = req.user.id;
      const role = req.user.staff_role;
      const distId = req.user.dist_id;
  
      // Ensure only Couriers can perform this action
      if (role !== 'Courier') {
        return res.status(403).json({ error: 'Only Couriers can perform this action' });
      }
  
      // Fetch the current tracking data
      const [tracking] = await db.promise().query(
        `SELECT dist_id, final_dist_id, tracking_status FROM TrackingEvent WHERE tracking_id = ? ORDER BY timestamp DESC LIMIT 1`,
        [trackingId]
      );
  
      if (!tracking.length) {
        return res.status(404).json({ error: 'Tracking ID not found' });
      }
  
      const currentDistId = tracking[0].dist_id;
      const finalDistId = tracking[0].final_dist_id;
  
      // Ensure the parcel is at the courier's assigned distribution
      if (currentDistId !== distId) {
        return res.status(403).json({ error: 'You can only update parcels at your assigned distribution center' });
      }
  
      // Check for valid status transitions
      if (trackingStatus === 'Out for delivery' && currentDistId !== finalDistId) {
        return res.status(403).json({
          error: 'Out for delivery can only be marked at the final distribution center',
        });
      }
  
      if (trackingStatus === 'Delivered' && tracking[0].tracking_status !== 'Out for delivery') {
        return res.status(400).json({ error: 'Delivered can only follow Out for delivery' });
      }
  
      if (trackingStatus === 'Unsuccessful' && !note) {
        return res.status(400).json({ error: 'Unsuccessful status requires a note' });
      }
  
      // Insert the updated tracking event
      await db.promise().query(
        `INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
         VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
        [trackingId, finalDistId, currentDistId, staffId, trackingStatus, note || null]
      );
  
      res.status(200).json({ message: 'Tracking status updated successfully' });
    } catch (error) {
      console.error('Error updating tracking status:', error.message);
      res.status(500).json({ error: 'Failed to update tracking status' });
    }
  };
  