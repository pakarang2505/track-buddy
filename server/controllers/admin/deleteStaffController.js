const StaffModel = require('../../models/admin/deleteStaffModel');

// Fetch all staff
exports.getAllStaff = async (req, res) => {
  try {
    const [staffList] = await StaffModel.getAllStaff(req.db);

    res.status(200).json(staffList);
  } catch (error) {
    console.error('Error fetching staff list:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error fetching staff list' });
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Check if the staff exists
    const [staff] = await StaffModel.findById(req.db, staffId);
    if (!staff.length) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Delete the staff
    await StaffModel.deleteStaffById(req.db, staffId);

    res.status(200).json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error deleting staff member' });
  }
};

// Search for staff
exports.searchStaff = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Search for staff by ID, name, or work office
    const [staffList] = await StaffModel.searchStaff(req.db, search);

    res.status(200).json(staffList);
  } catch (error) {
    console.error('Error searching staff:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error searching staff' });
  }
};
