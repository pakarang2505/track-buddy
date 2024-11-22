exports.updateTrackingStatus = async (req, res) => {
  try {
    const { trackingId, trackingStatus, note } = req.body;
    const staffId = req.user.id; // Staff ID from authMiddleware
    const role = req.user.staff_role; // Role from authMiddleware
    const currentDistId = req.user.dist_id; // Staff's assigned distribution center ID

    // Validate staff role
    if (role !== 'Staff') {
      return res.status(403).json({ error: 'Only Staff can perform this action' });
    }

    // Fetch the latest tracking event for the given tracking ID
    const [tracking] = await req.db.query(
      `SELECT dist_id, final_dist_id, tracking_status FROM TrackingEvent 
       WHERE tracking_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [trackingId]
    );

    if (!tracking.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const currentTracking = tracking[0];
    const eventDistId = currentTracking.dist_id; // Distribution ID from the latest tracking event

    // Fetch the name of the staff's current distribution center
    const [distribution] = await req.db.query(
      `SELECT dist_name FROM Distribution WHERE dist_id = ?`,
      [currentDistId]
    );

    if (!distribution.length) {
      return res.status(404).json({ error: 'Distribution center not found' });
    }

    const distName = distribution[0].dist_name;

    // Determine the new tracking status and dist_id logic
    let finalTrackingStatus;
    let newDistId = currentDistId; // Default to the staff's distribution center

    if (trackingStatus === 'Arrived') {
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
    } else if (trackingStatus === 'Unsuccessful') {
      // "Unsuccessful" requires a note
      if (!note) {
        return res.status(400).json({ error: 'Note is required for Unsuccessful status' });
      }
      finalTrackingStatus = 'Unsuccessful';
      newDistId = eventDistId; // Keep the current dist_id from the latest tracking event
    } else {
      return res.status(400).json({ error: 'Invalid status for Staff role' });
    }

    // Insert a new tracking event with the updated status
    await req.db.query(
      `INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [trackingId, currentTracking.final_dist_id, newDistId, staffId, finalTrackingStatus, note || null]
    );

    res.status(200).json({ message: 'Tracking status updated successfully' });
  } catch (error) {
    console.error('Error updating tracking status:', error.message);
    res.status(500).json({ error: 'Failed to update tracking status' });
  }
};

exports.getBasicInfo = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    // Fetch basic parcel information
    const [basicInfo] = await req.db.query(`
      SELECT 
        p.tracking_id,
        p.sender_name,
        r.recipient_name,
        te.tracking_status,
        te.timestamp
      FROM Parcel p
      LEFT JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
      LEFT JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE p.tracking_id = ?
      ORDER BY te.timestamp DESC
      LIMIT 1
    `, [trackingId]);

    if (!basicInfo.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const parcelInfo = basicInfo[0];
    let displayStatus = parcelInfo.tracking_status;

    // Map 'Arrived at...' to 'In transit'
    if (displayStatus.startsWith('Arrived at')) {
      displayStatus = 'In transit';
    }

    // Respond with basic info
    res.status(200).json({
      tracking_id: parcelInfo.tracking_id,
      status_tracking: displayStatus,
      timestamp: parcelInfo.timestamp,
      from: parcelInfo.sender_name || 'Unknown sender',
      to: parcelInfo.recipient_name || 'Unknown recipient',
    });
  } catch (error) {
    console.error('Error fetching basic info:', error);
    res.status(500).json({ error: 'Failed to fetch basic info' });
  }
};

exports.getTrackingDetails = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    // Fetch basic parcel information
    const [basicInfo] = await req.db.query(`
      SELECT 
        p.tracking_id,
        p.sender_name,
        r.recipient_name,
        te.tracking_status,
        te.timestamp
      FROM Parcel p
      LEFT JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
      LEFT JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE p.tracking_id = ?
      ORDER BY te.timestamp DESC
      LIMIT 1
    `, [trackingId]);

    if (!basicInfo.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const parcelInfo = basicInfo[0];
    let displayStatus = parcelInfo.tracking_status;

    // Map 'Arrived at...' to 'In transit'
    if (displayStatus.startsWith('Arrived at')) {
      displayStatus = 'In transit';
    }

    // Fetch journey details
    const [journeyDetails] = await req.db.query(`
      SELECT 
        te.event_id,
        te.timestamp,
        te.tracking_status,
        d.dist_name AS location_name,
        addr.district AS location_district,
        addr.province AS location_province,
        te.note
      FROM TrackingEvent te
      LEFT JOIN Distribution d ON te.dist_id = d.dist_id
      LEFT JOIN Address addr ON d.dist_addr_id = addr.address_id
      WHERE te.tracking_id = ?
      ORDER BY te.timestamp DESC
    `, [trackingId]);

    // Respond with combined data
    res.status(200).json({
      basicInfo: {
        tracking_id: parcelInfo.tracking_id,
        sender_name: parcelInfo.sender_name || 'Unknown sender',
        recipient_name: parcelInfo.recipient_name || 'Unknown recipient',
        status_tracking: displayStatus,
        timestamp: parcelInfo.timestamp,
      },
      journey: journeyDetails.map(event => ({
        event_id: event.event_id,
        timestamp: event.timestamp,
        status: event.tracking_status,
        location: {
          district: event.location_district || 'Unknown district',
          province: event.location_province || 'Unknown province',
        },
        note: event.note || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching tracking details for staff:', error.message);
    res.status(500).json({ error: 'Failed to fetch tracking details' });
  }
};

