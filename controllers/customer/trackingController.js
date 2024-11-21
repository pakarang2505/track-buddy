const TrackingModel = require('../../models/customer/trackingModel');

exports.getBasicParcelInfo = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    console.log('Fetching basic parcel info for ID:', trackingId);

    // Fetch basic parcel information
    const [parcelInfoResult] = await TrackingModel.getParcelInfo(req.db, trackingId);
    if (!parcelInfoResult.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const parcelInfo = parcelInfoResult[0];

    // Map status for the `current_status` field
    let currentStatus = parcelInfo.tracking_status;
    if (currentStatus.startsWith('Arrived at')) {
      currentStatus = 'In transit';
    }

    res.status(200).json({
      tracking_id: parcelInfo.tracking_id,
      current_status: currentStatus,
      timestamp: parcelInfo.timestamp,
      sender_name: parcelInfo.sender_name || 'Unknown sender',
      recipient_name: parcelInfo.recipient_name || 'Unknown recipient',
    });
  } catch (error) {
    console.error('Error fetching basic parcel info:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error fetching basic parcel info' });
  }
};

exports.getTrackingInfo = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    console.log('Fetching tracking info for ID:', trackingId);

    // Fetch basic parcel information
    const [parcelInfoResult] = await TrackingModel.getParcelInfo(req.db, trackingId);
    if (!parcelInfoResult.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const parcelInfo = parcelInfoResult[0];

    // Map status for the `current_status` field
    let currentStatus = parcelInfo.tracking_status;
    if (currentStatus.startsWith('Arrived at')) {
      currentStatus = 'In transit';
    }

    // Fetch the journey of the parcel
    const [journeyResult] = await TrackingModel.getParcelJourney(req.db, trackingId);

    console.log('Parcel journey fetched successfully:', journeyResult);

    res.status(200).json({
      trackingInfo: {
        tracking_id: parcelInfo.tracking_id,
        current_status: currentStatus,
        timestamp: parcelInfo.timestamp,
        from: parcelInfo.sender_name || 'Unknown sender',
        to: parcelInfo.recipient_name || 'Unknown recipient',
      },
      journey: journeyResult.map(event => ({
        event_id: event.event_id,
        status: event.tracking_status,
        timestamp: event.timestamp,
        location: {
          district: event.location_district || 'Unknown district',
          province: event.location_province || 'Unknown province',
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching tracking info:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error fetching tracking info' });
  }
};

