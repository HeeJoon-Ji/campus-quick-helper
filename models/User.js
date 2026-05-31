const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@office\.skhu\.ac\.kr$|^\S+@test\.com$/, '성공회대학교 메일(@office.skhu.ac.kr) 또는 테스트 메일(@test.com)만 사용 가능합니다.']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  mannerScore: {
    type: Number,
    default: 36.5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
