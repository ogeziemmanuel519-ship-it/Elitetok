router.post('/kofi', auth, async (req, res) => {
  const amount = 10; // £10 fixed payment

  try {
    const response = await axios.post(
      'https://api.ko-fi.com/v1/payments',
      { type: 'Donation', amount, message: 'Payment of £10' },
      { headers: { 'Authorization': `Bearer ${process.env.KOFI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    // Update user points
    const user = await User.findById(req.user.id);
    user.points += 10; // earn 10 points for payment
    user.payments.push({ amount, status: 'pending', date: new Date() });
    await user.save();

    res.json({ msg: 'Payment request sent for £10', data: response.data, points: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});