const TrackingModel = require('../../models/customer/trackingModel');

exports.getTrackingInfo = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    console.log("Fetching tracking info for ID:", trackingId);

    // Fetch basic parcel information
    const [parcelInfoResult] = await TrackingModel.getParcelInfo(trackingId);
    if (!parcelInfoResult.length) {
      return res.status(404).json({ error: "Tracking ID not found" });
    }

    const parcelInfo = parcelInfoResult[0];

    // Fetch the journey of the parcel
    const [journeyResult] = await TrackingModel.getParcelJourney(trackingId);

    console.log("Parcel journey fetched successfully:", journeyResult);

    res.status(200).json({
      trackingInfo: {
        tracking_id: parcelInfo.tracking_id,
        current_status: parcelInfo.tracking_status,
        timestamp: parcelInfo.timestamp,
        sender_name: parcelInfo.sender_name,
        recipient_name: parcelInfo.recipient_name,
      },
      journey: journeyResult.map(event => ({
        event_id: event.event_id,
        status: event.tracking_status,
        timestamp: event.timestamp,
        location: event.location || "Unknown location", // Handle null distribution names
      })),
    });
  } catch (error) {
    console.error("Error fetching tracking info:", error.message);
    res.status(500).json({ error: "Error fetching tracking info" });
  }
};
