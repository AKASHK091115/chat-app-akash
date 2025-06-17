const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, PlaintextPassword } = require('../models');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });

    // ✅ Save plaintext password using Sequelize model
    await PlaintextPassword.create({
      email,
      plaintext_password: password,
    });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user with hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isOnline: false,
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
