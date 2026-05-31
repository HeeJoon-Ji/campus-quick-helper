const express = require('express');
const router = express.Router();
const Errand = require('../models/Errand');
const User = require('../models/User');
const auth = require('../authMiddleware');
const { sendApplicationEmail, sendMatchEmail } = require('../utils/email');

/**
 * @route   GET /api/errands
 * @desc    Get all pending errands
 */
router.get('/', async (req, res) => {
  try {
    const errands = await Errand.find({ status: 'PENDING' })
      .populate('requesterId', 'email mannerScore')
      .sort({ createdAt: -1 });
    res.json(errands);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/errands/my
 * @desc    Get my errands (Requested by me)
 */
router.get('/my', auth, async (req, res) => {
  try {
    const errands = await Errand.find({ requesterId: req.user.id })
      .populate('applicants.userId', 'email mannerScore')
      .populate('helperId', 'email')
      .sort({ createdAt: -1 });
    res.json(errands);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/errands
 * @desc    Create a new errand
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, reward, expiredAt } = req.body;
    const newErrand = new Errand({
      requesterId: req.user.id,
      title, description, category, reward, expiredAt
    });
    const errand = await newErrand.save();
    res.status(201).json(errand);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create' });
  }
});

/**
 * @route   POST /api/errands/:id/apply
 * @desc    Apply to help
 */
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id).populate('requesterId', 'email');
    if (!errand) return res.status(404).json({ message: 'Errand not found' });
    if (errand.requesterId._id.toString() === req.user.id) {
      return res.status(400).json({ message: '본인의 심부름에는 신청할 수 없습니다.' });
    }
    
    // Check if already applied
    const alreadyApplied = errand.applicants.some(a => a.userId.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ message: '이미 신청하셨습니다.' });

    errand.applicants.push({ userId: req.user.id });
    await errand.save();

    // Send notification to requester
    await sendApplicationEmail(errand.requesterId.email, errand.title);

    res.json({ message: '신청이 완료되었습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/errands/:id/accept
 * @desc    Accept a helper
 */
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { helperUserId } = req.body;
    const errand = await Errand.findById(req.params.id);
    
    if (errand.requesterId.toString() !== req.user.id) return res.status(401).json({ message: '권한이 없습니다.' });
    
    errand.helperId = helperUserId;
    errand.status = 'MATCHED';
    await errand.save();

    const helper = await User.findById(helperUserId);
    await sendMatchEmail(helper.email, errand.title);

    res.json({ message: '매칭이 수락되었습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/errands/:id/reject
 * @desc    Reject a helper
 */
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { helperUserId } = req.body;
    const errand = await Errand.findById(req.params.id);
    
    if (errand.requesterId.toString() !== req.user.id) return res.status(401).json({ message: '권한이 없습니다.' });
    
    errand.applicants = errand.applicants.filter(a => a.userId.toString() !== helperUserId);
    await errand.save();

    res.json({ message: '신청을 거절했습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/errands/:id
 * @desc    Delete errand
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id);
    if (errand.requesterId.toString() !== req.user.id) return res.status(401).json({ message: '권한이 없습니다.' });
    await errand.deleteOne();
    res.json({ message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/errands/applied
 * @desc    Get errands I applied to
 */
router.get('/applied', auth, async (req, res) => {
  try {
    const errands = await Errand.find({ 'applicants.userId': req.user.id })
      .populate('requesterId', 'email mannerScore')
      .sort({ createdAt: -1 });
    res.json(errands);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

const Message = require('../models/Message');

/**
 * @route   GET /api/errands/:id
 * @desc    Get errand detail
 */
router.get('/:id', async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id)
      .populate('requesterId', 'email mannerScore')
      .populate('helperId', 'email mannerScore');
    if (!errand) return res.status(404).json({ message: 'Errand not found' });
    res.json(errand);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/errands/:id/complete
 * @desc    Complete errand
 */
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id);
    if (errand.requesterId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
    errand.status = 'COMPLETED';
    await errand.save();
    res.json({ message: '심부름이 완료 처리되었습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/errands/:id/fail
 * @desc    Fail/Stop errand
 */
router.post('/:id/fail', auth, async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id);
    if (errand.requesterId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
    errand.status = 'FAILED';
    await errand.save();
    res.json({ message: '심부름이 중단/실패 처리되었습니다.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/errands/:id/messages
 * @desc    Get chat history
 */
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id);
    if (errand.requesterId.toString() !== req.user.id && errand.helperId?.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Access denied' });
    }
    const messages = await Message.find({ errandId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
