const Sender = require('../../models/customer/senderModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const SenderModel = require('../../models/customer/senderModel');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, phone, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = req.db; // Database connection

    // Check if the sender already exists
    const existingSender = await Sender.findByPhone(db, phone);
    if (existingSender) {
      return res.status(400).json({ error: 'Phone number is already registered' });
    }

    // Create the sender
    const senderResult = await Sender.create(db, {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
    });

    const senderId = senderResult.insertId;

    // Link parcels created with the same phone number
    await Sender.linkParcelsToSender(db, senderId, phone);

    // Generate a JWT token
    const token = jwt.sign(
      { id: senderId, role: 'Customer' }, // Include role if needed
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(201).json({
      message: 'Signup successful',
      sender: {
        id: senderId,
        firstName,
        lastName,
        phone,
      },
      token, // Include token in the response
    });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ error: 'Failed to sign up sender' });
  }
};

// Login function
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const db = req.db; // Database connection

    // Find the sender by phone
    const user = await Sender.findByPhone(db, phone);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.sender_password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.sender_id, phone: user.sender_phone, role: 'Customer' }, // Include phone in token
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Return the token and user details
    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.sender_id,
        firstName: user.sender_fname,
        lastName: user.sender_lname,
        phone: user.sender_phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Error logging in' });
  }
};
