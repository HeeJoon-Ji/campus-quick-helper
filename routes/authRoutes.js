const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

// POST /api/auth/register - Register user (Step 1: Send Email)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({ email, password: hashedPassword, verificationCode: code });
    } else {
      user.verificationCode = code;
    }

    await user.save();

    // Send Email (비동기로 실행하되 에러 로그 확인)
    try {
      await sendVerificationEmail(email, code);
      res.status(200).json({ message: '인증 메일이 발송되었습니다.' });
    } catch (mailError) {
      console.error('Email send error:', mailError);
      res.status(500).json({ message: '인증 메일 발송에 실패했습니다. 관리자에게 문의하세요.' });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/verify - Verify code (Step 2: Complete Registration)
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: '인증 코드가 일치하지 않습니다.' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: '인증이 완료되었습니다. 이제 로그인할 수 있습니다.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/login - Login user and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: '학교 이메일 인증이 필요합니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const payload = { id: user._id, email: user.email };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, email: user.email });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
