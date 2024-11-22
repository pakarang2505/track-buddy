const ProfileModel = require('../../models/customer/profileModel');
const bcrypt = require('bcryptjs');

// Fetch profile details for the logged-in sender
exports.getProfile = async (req, res) => {
  try {
    const senderId = req.user.id;

    // Fetch the profile from the database
    const profile = await ProfileModel.getProfile(req.db, senderId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({
      id: profile.sender_id,
      firstName: profile.sender_fName,
      lastName: profile.sender_lName,
      phone: profile.sender_phone,
    });
  } catch (error) {
    console.error('Error fetching profile:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Update profile details for the logged-in sender
exports.updateProfile = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { firstName, lastName, phone, password } = req.body;

    // Prepare the fields to be updated
    const updates = {};
    if (firstName) updates.sender_fName = firstName;
    if (lastName) updates.sender_lName = lastName;
    if (phone) updates.sender_phone = phone;
    if (password) {
      // Hash the password before updating
      updates.sender_password = await bcrypt.hash(password, 10);
    }

    // Check if there are any updates to be made
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update the profile in the database
    const updateResult = await ProfileModel.updateProfile(req.db, senderId, updates);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error updating profile' });
  }
};
