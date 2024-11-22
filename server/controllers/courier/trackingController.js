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
    const [tracking] = await req.db.query(
      `
      SELECT dist_id, final_dist_id, tracking_status 
      FROM TrackingEvent 
      WHERE tracking_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
      `,
      [trackingId]
    );

    if (!tracking.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const { dist_id: currentDistId, final_dist_id: finalDistId, tracking_status: currentStatus } = tracking[0];


    // Handle "Out for delivery" status
    // Check for valid status transitions
if (trackingStatus === 'Out for delivery') {
  // Ensure the current status is 'Arrived at...'
  if (!currentStatus.startsWith('Arrived at')) {
    return res.status(400).json({
      error: '"Out for delivery" can only follow a status of "Arrived at ..."',
    });
  }

  // Update dist_id to final_dist_id
  await req.db.query(
    `
    INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
    VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `,
    [trackingId, finalDistId, finalDistId, staffId, 'Out for delivery', null]
  );

  return res.status(200).json({ message: 'Tracking status updated to "Out for delivery"' });
}


    // Handle "Delivered" status
    if (trackingStatus === 'Delivered') {
      // Ensure the current status is "Out for delivery"
      if (currentStatus !== 'Out for delivery') {
        return res.status(400).json({
          error: 'Delivered can only follow "Out for delivery"',
        });
      }

      await req.db.query(
        `
        INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
        VALUES (?, ?, ?, ?, NOW(), ?, ?)
        `,
        [trackingId, finalDistId, finalDistId, staffId, 'Delivered', null]
      );

      return res.status(200).json({ message: 'Tracking status updated to "Delivered"' });
    }

    // Handle "Unsuccessful" status
    if (trackingStatus === 'Unsuccessful') {
      // Ensure a note is provided
      if (!note) {
        return res.status(400).json({
          error: 'Unsuccessful status requires a note',
        });
      }

      await req.db.query(
        `
        INSERT INTO TrackingEvent (tracking_id, final_dist_id, dist_id, staff_id, timestamp, tracking_status, note)
        VALUES (?, ?, ?, ?, NOW(), ?, ?)
        `,
        [trackingId, finalDistId, currentDistId, staffId, 'Unsuccessful', note]
      );

      return res.status(200).json({ message: 'Tracking status updated to "Unsuccessful"' });
    }

    // Invalid status
    return res.status(400).json({ error: 'Invalid tracking status provided' });
  } catch (error) {
    console.error('Error updating tracking status:', { message: error.message, stack: error.stack });
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
    console.error('Error fetching basic info for courier:', error);
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
    console.error('Error fetching tracking details for courier:', error.message);
    res.status(500).json({ error: 'Failed to fetch tracking details' });
  }
};


exports.getOutForDeliveryParcels = async (req, res) => {
  try {
    const courierDistId = req.user.dist_id; // The distribution center assigned to the courier
    const role = req.user.staff_role;

    // Ensure the user has the Courier role
    if (role !== 'Courier') {
      return res.status(403).json({ error: 'Access denied: Only couriers can perform this action' });
    }

    // Fetch parcels with the status "Out for delivery" at the courier's assigned distribution center
    const [parcels] = await req.db.query(`
      SELECT 
        p.tracking_id,
        te.tracking_status,
        te.timestamp,
        p.sender_name,
        r.recipient_name
      FROM Parcel p
      JOIN TrackingEvent te ON p.tracking_id = te.tracking_id
      JOIN Recipient r ON p.recipient_id = r.recipient_id
      WHERE te.tracking_status = 'Out for delivery'
      AND te.dist_id = ?
      AND te.timestamp = (
        SELECT MAX(inner_te.timestamp)
        FROM TrackingEvent inner_te
        WHERE inner_te.tracking_id = p.tracking_id
      )
      ORDER BY te.timestamp DESC
    `, [courierDistId]);

    // Map parcels into the desired response format
    const formattedParcels = parcels.map(parcel => ({
      tracking_id: parcel.tracking_id,
      status_tracking: parcel.tracking_status,
      timestamp: parcel.timestamp,
      from: parcel.sender_name || 'Unknown sender',
      to: parcel.recipient_name || 'Unknown recipient',
    }));

    res.status(200).json(formattedParcels);
  } catch (error) {
    console.error('Error fetching parcels for courier:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parcels' });
  }
};

