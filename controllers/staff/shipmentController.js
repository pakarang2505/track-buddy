const ShipmentModel = require('../../models/staff/shipmentModel');
const RecipientModel = require('../../models/customer/recipientModel');
const moment = require('moment'); // For handling date/time formatting
const { generateTrackingId } = require('../../utils/trackingUtils');

exports.createShipment = async (req, res) => {
  try {
    const {
      sender_name,
      sender_phone,
      recipient_name,
      recipient_phone,
      recipient_address,
      final_dist_id,
    } = req.body;

    const staffDistId = req.user.dist_id; // Staff's assigned distribution center
    const staffId = req.user.id; // Logged-in staff ID

    // Validate required fields
    if (
      !sender_name ||
      !sender_phone ||
      !recipient_name ||
      !recipient_phone ||
      !recipient_address ||
      !final_dist_id
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the recipient already exists in the database
    let recipientId;
    const [existingRecipient] = await RecipientModel.findByPhone(recipient_phone);
    if (existingRecipient) {
      recipientId = existingRecipient.recipient_id;
    } else {
      // Create a new recipient if not found
      const [recipientResult] = await RecipientModel.create({
        name: recipient_name,
        phone: recipient_phone,
        address: recipient_address,
      });
      recipientId = recipientResult.insertId;
    }

    // Check if the sender already has an account
    const [existingSender] = await ShipmentModel.findSenderByPhone(sender_phone);
    let senderId = null;
    if (existingSender.length) {
      senderId = existingSender[0].sender_id; // Link existing sender account
    }

    // Generate a unique tracking ID
    const trackingId = generateTrackingId();

    // Get the current timestamp
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    // Create the parcel entry
    const parcelData = {
      tracking_id: trackingId,
      sender_id: senderId, // Nullable if no account
      recipient_id: recipientId,
    };

    await ShipmentModel.createParcel(parcelData);

    // Link any previous shipments made by this sender phone to the new account
    if (senderId) {
      await ShipmentModel.linkShipmentsToSender(senderId);
    }

    // Create the initial tracking event
    const trackingEvent = {
      tracking_id: trackingId,
      dist_id: staffDistId, // Staff's work office
      final_dist_id,
      staff_id: staffId,
      timestamp,
      tracking_status: 'Pick up',
    };

    await ShipmentModel.createTrackingEvent(trackingEvent);

    // Respond with success and the generated tracking ID
    res.status(201).json({
      message: 'Shipment created successfully',
      tracking_id: trackingId,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Error creating shipment' });
  }
};
