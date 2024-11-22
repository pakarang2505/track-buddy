const TrackingModel = require('../../models/admin/trackingModel');

// Get basic info of a parcel by tracking_id
exports.getBasicInfo = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    const [parcelInfo] = await TrackingModel.getBasicInfoByTrackingId(req.db, trackingId);

    if (!parcelInfo.length) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const currentInfo = parcelInfo[0];

    res.status(200).json({
      tracking_id: currentInfo.tracking_id,
      status_tracking: currentInfo.tracking_status.startsWith('Arrived at') ? 'In transit' : currentInfo.tracking_status,
      timestamp: currentInfo.timestamp,
      from: currentInfo.sender_name || 'Unknown Sender',
      to: currentInfo.recipient_name || 'Unknown Recipient',
    });
  } catch (error) {
    console.error('Error fetching basic info:', error.message);
    res.status(500).json({ error: 'Error fetching basic info' });
  }
};

// Get basic info + journey detail of a parcel by tracking_id
exports.getBasicAndJourneyInfo = async (req, res) => {
    try {
      const trackingId = req.params.trackingId;
  
      // Fetch basic info
      const [parcelInfo] = await TrackingModel.getBasicInfoByTrackingId(req.db, trackingId);
      if (!parcelInfo.length) {
        return res.status(404).json({ error: 'Tracking ID not found' });
      }
  
      const currentInfo = parcelInfo[0];
  
      // Fetch journey detail
      const [journeyDetails] = await TrackingModel.getJourneyDetailsByTrackingId(req.db, trackingId);
  
      res.status(200).json({
        basic_info: {
          tracking_id: currentInfo.tracking_id,
          status_tracking: currentInfo.tracking_status.startsWith('Arrived at') ? 'In transit' : currentInfo.tracking_status,
          timestamp: currentInfo.timestamp,
          from: currentInfo.sender_name || 'Unknown Sender',
          to: currentInfo.recipient_name || 'Unknown Recipient',
        },
        journey: journeyDetails.map((detail) => ({
          event_id: detail.event_id, // Include the event ID
          status: detail.tracking_status, // Current status of the event
          timestamp: detail.timestamp, // Event timestamp
          location: {
            district: detail.location_district || 'Unknown district', // District of the event
            province: detail.location_province || 'Unknown province', // Province of the event
          },
          note: detail.note || null, // Additional note if available
        })),
      });
    } catch (error) {
      console.error('Error fetching detailed info:', error.message);
      res.status(500).json({ error: 'Error fetching detailed info' });
    }
  };
  