const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PersonalDetails = require('../models/PersonalDetails');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 1, message: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 1, message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 1, message: 'Password must be at least 6 characters' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    }).select('_id').lean();

    if (existingUser) {
      return res.status(409).json({ error: 1, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({ success: 1, message: 'Registration successful' });
  } catch {
    res.status(500).json({ error: 1, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 1, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() })
      .select('_id username email password')
      .lean();

    if (!user) {
      return res.status(401).json({ error: 1, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 1, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const hasProfile = !!(await PersonalDetails.exists({ user_id: user._id }));

    res.json({
      success: 1,
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email },
      hasProfile
    });
  } catch {
    res.status(500).json({ error: 1, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('password');
    if (!user) {
      return res.status(404).json({ error: 1, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 1, message: 'Old password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 1, message: 'New password must be at least 6 characters' });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();

    res.json({ success: 1, message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ error: 1, message: 'Server error' });
  }
};
