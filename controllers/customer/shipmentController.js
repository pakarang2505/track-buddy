const ShipmentModel = require('../../models/customer/shipmentModel');

exports.getShipments = async (req, res) => {
  try {
    const senderId = req.user.id; // Sender ID from authentication
    const senderPhone = req.user.phone; // Sender phone from JWT payload
    const { status } = req.query;

    // Validate status filter
    const allowedStatuses = ['in-progress', 'delivered', 'unsuccessful'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    // Fetch shipments with status filter applied
    const [shipments] = await ShipmentModel.getShipmentsByStatus(req.db, senderId, senderPhone, status);

    // Map statuses for display purposes
    const mappedShipments = shipments.map((shipment) => {
      let displayStatus = shipment.tracking_status;
      if (displayStatus.startsWith('Arrived at')) {
        displayStatus = 'In transit'; // Map "Arrived at {dist_name}" to "In transit"
      }
      return {
        tracking_id: shipment.tracking_id,
        status: displayStatus,
        timestamp: shipment.timestamp,
        sender_name: shipment.sender_name,
        recipient_name: shipment.recipient_name,
      };
    });

    // Return the shipments
    res.status(200).json(mappedShipments);
  } catch (error) {
    console.error('Error fetching shipments:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error fetching shipments' });
  }
};
