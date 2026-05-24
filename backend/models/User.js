const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  settings: {
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'English' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    theme: { type: String, default: 'dark' },
    accentColor: { type: String, default: 'indigo' },
    notifications: {
      alerts: { type: Boolean, default: true },
      aiReminders: { type: Boolean, default: true },
      billNotifications: { type: Boolean, default: true },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      privacyControls: { type: Boolean, default: true },
    },
    ai: {
      insightFrequency: { type: String, default: 'Daily' },
      anomalyDetection: { type: Boolean, default: true },
      tone: { type: String, default: 'Professional' },
    },
    connectedAccounts: {
      bankIntegrations: { type: Boolean, default: false },
      upiLinking: { type: Boolean, default: false },
    }
  }
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
// Note: async pre-hooks in Mongoose 6+ resolve via the returned Promise — do NOT call next()
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
