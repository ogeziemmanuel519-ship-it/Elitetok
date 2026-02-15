const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Mock payment route
router.post('/pay', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.payments.push({ amount, status: 'pending' });
    await user.save();
    res.json({ msg: 'Payment processed (mock)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;