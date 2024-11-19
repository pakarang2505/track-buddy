const NotificationModel = require('../../models/customer/notificationModel');

exports.getNotifications = async (req, res) => {
  try {
    const senderId = req.user.id;

    // Fetch notifications for the sender
    const [notifications] = await NotificationModel.getNotificationsForSender(senderId);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};
