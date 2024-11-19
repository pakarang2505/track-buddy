const Sender = require('../../models/customer/senderModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup function
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, phone, password } = req.body;

    // Check if the phone number is already registered
    const existingUser = await Sender.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const result = await Sender.create({
      firstName,
      lastName,
      phone,
      password: hashedPassword,
    });

    if (!result.insertId) {
      throw new Error('Failed to insert user into the database');
    }

    const newSenderId = result.insertId;

    // Generate a JWT token for the new user
    const token = jwt.sign({ id: newSenderId }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Respond with the token and user details
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newSenderId,
        firstName,
        lastName,
        phone,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error.message);
    console.error('Stack Trace:', error.stack);
    res.status(500).json({ error: 'Error creating account' });
  }
};

// Login function
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find the user by phone
    const user = await Sender.findByPhone(phone);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.sender_password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.sender_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

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
