const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Create Ko-fi payment request (optional)
router.post('/kofi', auth, async (req, res) => {
  const { amount, message } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Invalid amount' });
  }

  try {
    const response = await axios.post(
      'https://api.ko-fi.com/v1/payments',
      {
        type: 'Donation',
        amount: amount,
        message: message || 'No message',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.KOFI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save payment in user's document
    const user = await User.findById(req.user.id);
    user.payments.push({ amount, status: 'pending', date: new Date() });
    await user.save();

    res.json({ msg: 'Ko-fi payment request sent', data: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Ko-fi Webhook to confirm payments
router.post('/kofi-webhook', async (req, res) => {
  const signature = req.headers['x-kofi-signature'];
  if (signature !== process.env.KOFI_WEBHOOK_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  const data = req.body;
  const { amount, email } = data; // example fields from Ko-fi

  try {
    // Find user by email and mark payment as completed
    const user = await User.findOne({ email });
    if (user) {
      const payment = user.payments.find(p => p.amount == amount && p.status === 'pending');
      if (payment) payment.status = 'completed';
      await user.save();
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

module.exports = router;