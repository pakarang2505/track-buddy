const SenderModel = require('../../models/customer/senderModel');
const RecipientModel = require('../../models/customer/recipientModel');
const ShipmentModel = require('../../models/staff/shipmentModel');
const moment = require('moment');
const { generateTrackingId } = require('../../utils/trackingUtils');

exports.createShipment = async (req, res) => {
  try {
    const {
      sender_name,
      sender_phone,
      recipient_name,
      recipient_phone,
      recipient_address,
      final_dist_id: finalDistName,
    } = req.body;

    const db = req.db;
    const staffDistId = req.user.dist_id;
    const staffId = req.user.id;

    if (!sender_name || !sender_phone || !recipient_name || !recipient_phone || !recipient_address || !finalDistName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Step 1: Validate the distribution center
    const [distribution] = await db.query('SELECT dist_id FROM Distribution WHERE dist_name = ?', [finalDistName]);
    if (!distribution || distribution.length === 0) {
      return res.status(400).json({ error: 'Invalid distribution name provided' });
    }
    const finalDistId = distribution[0].dist_id;

    // Step 2: Find or create the recipient
    let recipientId;
    const existingRecipient = await RecipientModel.findByPhone(db, recipient_phone);
    if (existingRecipient && existingRecipient.length > 0) {
      recipientId = existingRecipient[0].recipient_id;
    } else {
      const recipientResult = await RecipientModel.create(db, {
        name: recipient_name,
        phone: recipient_phone,
        address: recipient_address,
      });
      recipientId = recipientResult.insertId;
    }

    // Step 3: Check for existing sender
    let senderId = null;
    const [existingSender] = await ShipmentModel.findSenderByPhone(db, sender_phone);
    if (existingSender && existingSender.length > 0) {
      senderId = existingSender[0].sender_id;
    }

    // Step 4: Generate a tracking ID
    const trackingId = generateTrackingId();

    // Step 5: Insert the parcel into the Parcel table
    const parcelData = {
      tracking_id: trackingId,
      sender_id: senderId, // Nullable if no account
      recipient_id: recipientId,
      sender_phone, // Store sender_phone for later linking
      sender_name,  // Store the sender name provided
    };
    await ShipmentModel.createParcel(db, parcelData);
    

    // Step 6: Link shipments to the sender when they sign up
    if (senderId) {
      await ShipmentModel.linkShipmentsToSender(db, senderId);
    }

    // Step 7: Create the initial tracking event
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const trackingEvent = {
      tracking_id: trackingId,
      dist_id: staffDistId,
      final_dist_id: finalDistId,
      staff_id: staffId,
      timestamp,
      tracking_status: 'Pick up',
    };
    await ShipmentModel.createTrackingEvent(db, trackingEvent);

    // Step 8: Respond with success and the generated tracking ID
    res.status(201).json({
      message: 'Shipment created successfully',
      tracking_id: trackingId,
    });
  } catch (error) {
    console.error('Error creating shipment:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error creating shipment' });
  }
};
