const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 100 }, // new users get 10 points
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  payments: [
    {
      amount: Number,
      status: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);