const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/users - Register a new user
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Domain validation (@university.ac.kr)
    if (!email.endsWith('@university.ac.kr')) {
      return res.status(400).json({ message: 'Only @university.ac.kr domain is allowed.' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // 3. Create new user and hash password
    user = new User({ email, password });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
