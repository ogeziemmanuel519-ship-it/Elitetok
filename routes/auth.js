const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const { username, email, password, referrer } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already exists' });

    const newUser = new User({ username, email, password, points: 10 });
    await newUser.save();

    // Handle referral
    if (referrer) {
      const refUser = await User.findById(referrer);
      if (refUser) {
        refUser.points += 4; // 4 points per referral
        refUser.referrals.push(newUser._id);
        await refUser.save();
      }
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: newUser._id, username, email, points: newUser.points } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});