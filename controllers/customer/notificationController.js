const NotificationModel = require('../../models/customer/notificationModel');

exports.getNotifications = async (req, res) => {
  try {
    const senderId = req.user.id;

    // Fetch notifications for the sender
    const [notifications] = await NotificationModel.getNotificationsForSender(req.db, senderId);

    // Map notifications to include sender name directly instead of '***'
    const mappedNotifications = notifications.map((notification) => ({
      tracking_id: notification.tracking_id,
      status: notification.tracking_status,
      timestamp: notification.timestamp,
      from: notification.sender_name, // Directly use sender_name
      to: notification.recipient_name, // Use recipient_name
      note: notification.note || null,
      additional_message: notification.tracking_status === 'Unsuccessful' ? 'waiting for refund' : null,
    }));

    res.status(200).json(mappedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

exports.getNotificationDetails = async (req, res) => {
  try {
    const trackingId = req.params.trackingId;

    // Fetch basic info and journey details for the given tracking ID
    const [basicInfo] = await NotificationModel.getBasicInfo(req.db, trackingId);
    const [journeyDetails] = await NotificationModel.getJourneyDetails(req.db, trackingId);

    if (!basicInfo || basicInfo.length === 0) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const notificationDetails = {
      tracking_id: basicInfo[0].tracking_id,
      status: basicInfo[0].tracking_status,
      timestamp: basicInfo[0].timestamp,
      from: basicInfo[0].sender_name, // Use sender_name directly
      to: basicInfo[0].recipient_name, // Use recipient_name directly
      journey: journeyDetails.map((journey) => ({
        event_id: journey.event_id,
        status: journey.tracking_status,
        timestamp: journey.timestamp,
        location: journey.location || 'Unknown location',
      })),
      note: basicInfo[0].note || null,
      additional_message:
        basicInfo[0].tracking_status === 'Unsuccessful' ? 'waiting for refund' : null,
    };

    res.status(200).json(notificationDetails);
  } catch (error) {
    console.error('Error fetching notification details:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Error fetching notification details' });
  }
};

