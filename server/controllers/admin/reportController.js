const ReportModel = require('../../models/admin/reportModel');
const moment = require('moment');

// Get parcel counts by date
exports.getParcelCountsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date || moment().format('YYYY-MM-DD'); // Default to current date if not provided

    const [counts] = await ReportModel.getParcelCountsByDate(req.db, selectedDate);

    // Add default counts for missing status filters
    const defaultCounts = {
      'All status': 0,
      Delivered: 0,
      Unsuccessful: 0,
    };

    counts.forEach((row) => {
      defaultCounts[row.filter_status] = row.count;
    });

    res.status(200).json(defaultCounts);
  } catch (error) {
    console.error('Error fetching parcel counts:', error.message);
    res.status(500).json({ error: 'Error fetching parcel counts' });
  }
};


// Get parcels by status and date
exports.getParcelsByStatusAndDate = async (req, res) => {
  try {
    const { date, status } = req.query;

    if (!status) {
      return res.status(400).json({ error: 'Status filter is required' });
    }

    const selectedDate = date || moment().format('YYYY-MM-DD'); // Default to current date if not provided
    const [parcels] = await ReportModel.getParcelsByStatusAndDate(req.db, selectedDate, status);

    // Map raw data to include "from" and "to" fields
    const formattedParcels = parcels.map((parcel) => ({
      tracking_id: parcel.tracking_id,
      status_tracking: parcel.tracking_status,
      timestamp: parcel.timestamp,
      from: parcel.sender_name || 'Unknown Sender', // Handle missing sender_name
      to: parcel.recipient_name || 'Unknown Recipient', // Handle missing recipient_name
    }));

    res.status(200).json(formattedParcels);
  } catch (error) {
    console.error('Error fetching parcels by status:', error.message);
    res.status(500).json({ error: 'Error fetching parcels' });
  }
};


// Get all unsuccessful parcels
exports.getUnsuccessfulParcels = async (req, res) => {
  try {
    const [parcels] = await ReportModel.getUnsuccessfulParcels(req.db);

    // Format the response to include "from" and "to" fields
    const mappedParcels = parcels.map((parcel) => ({
      tracking_id: parcel.tracking_id,
      status_tracking: parcel.tracking_status,
      timestamp: parcel.timestamp,
      from: parcel.sender_name || 'Unknown Sender', // Handle missing sender_name
      to: parcel.recipient_name || 'Unknown Recipient', // Handle missing recipient_name
      note: parcel.note || null, // Include the note if available
    }));

    res.status(200).json(mappedParcels);
  } catch (error) {
    console.error('Error fetching unsuccessful parcels:', error.message);
    res.status(500).json({ error: 'Error fetching unsuccessful parcels' });
  }
};


// Update parcel status
exports.updateTrackingStatus = async (req, res) => {
  try {
    const { trackingId, location, status, note } = req.body;

    if (!trackingId || !status) {
      return res.status(400).json({ error: 'Tracking ID and status are required' });
    }

    const staffId = req.user.id;
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let newStatus;
    let distId = null; // Initialize as null

    // Fetch parcel details for validation
    const [[parcel]] = await ReportModel.getParcelDetails(req.db, trackingId);
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    // Determine new status and dist_id
    if (status === 'Successful') {
      if (location) {
        // Validate location and determine new status
        const [[distribution]] = await ReportModel.findDistributionByName(req.db, location);
        if (!distribution) {
          return res.status(400).json({ error: 'Invalid distribution name' });
        }

        distId = distribution.dist_id;

        if (parcel.final_dist_id === distId) {
          newStatus = 'Out for delivery';
        } else {
          newStatus = `Arrived at ${location}`;
        }
      } else {
        // If status is "Delivered", update dist_id to match final_dist_id
        newStatus = 'Delivered';
        distId = parcel.final_dist_id;
      }
    } else if (status === 'Unsuccessful') {
      if (!note) {
        return res.status(400).json({ error: 'Note is required for Unsuccessful status' });
      }
      newStatus = 'Unsuccessful';
    } else {
      return res.status(400).json({ error: 'Invalid status selected' });
    }

    // Prepare update data
    const updateData = {
      dist_id: distId,
      staff_id: staffId,
      timestamp,
      tracking_status: newStatus,
      note: note || null,
    };

    // Update the tracking status
    await ReportModel.updateTrackingStatus(req.db, trackingId, updateData);

    res.status(200).json({ message: 'Tracking status updated successfully' });
  } catch (error) {
    console.error('Error updating tracking status:', error.message);
    res.status(500).json({ error: 'Error updating tracking status' });
  }
};

// Get all distributions for dropdown
exports.getAllDistributions = async (req, res) => {
  try {
    const { search } = req.query;

    const [distributions] = await ReportModel.getAllDistributions(req.db, search);

    res.status(200).json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error.message);
    res.status(500).json({ error: 'Error fetching distributions' });
  }
};