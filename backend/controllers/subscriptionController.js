const Subscription = require('../models/Subscription');

// Seed default premium mock subscriptions if user has none
const seedDefaultSubscriptions = async (userId) => {
  const count = await Subscription.countDocuments({ user: userId });
  if (count === 0) {
    const today = new Date();
    
    const defaults = [
      {
        user: userId,
        name: 'Netflix',
        category: 'Entertainment',
        cost: 649,
        billingCycle: 'monthly',
        nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), // Tomorrow
        paymentMethod: 'UPI',
        status: 'Active',
        confidence: 99,
        notifyBefore: true,
        unusedDays: 2 // active
      },
      {
        user: userId,
        name: 'Spotify Premium',
        category: 'Music',
        cost: 119,
        billingCycle: 'monthly',
        nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), // 3 days
        paymentMethod: 'Credit Card',
        status: 'Active',
        confidence: 96,
        notifyBefore: true,
        unusedDays: 21 // UNUSED alert trigger!
      },
      {
        user: userId,
        name: 'AWS Cloud Services',
        category: 'Cloud Services',
        cost: 2450,
        billingCycle: 'monthly',
        nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), // 5 days
        paymentMethod: 'Debit Card',
        status: 'Active',
        confidence: 98,
        notifyBefore: false,
        unusedDays: 0
      },
      {
        user: userId,
        name: 'Adobe Creative Cloud',
        category: 'Productivity',
        cost: 1630,
        billingCycle: 'monthly',
        nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8), // 8 days
        paymentMethod: 'UPI',
        status: 'Active',
        confidence: 95,
        notifyBefore: true,
        unusedDays: 35 // INACTIVE service alert trigger!
      }
    ];

    await Subscription.insertMany(defaults);
  }
};

// 1. GET /api/subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    await seedDefaultSubscriptions(userId);
    
    const subs = await Subscription.find({ user: userId }).sort({ nextRenewal: 1 });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving subscriptions', error: error.message });
  }
};

// 2. POST /api/subscriptions
exports.addSubscription = async (req, res) => {
  try {
    const { name, category, cost, billingCycle, nextRenewal, paymentMethod, status, notifyBefore } = req.body;
    const userId = req.user.id;

    if (!name || !cost) {
      return res.status(400).json({ message: 'Service name and cost are required' });
    }

    const newSub = await Subscription.create({
      user: userId,
      name,
      category: category || 'Entertainment',
      cost,
      billingCycle: billingCycle || 'monthly',
      nextRenewal: nextRenewal ? new Date(nextRenewal) : undefined,
      paymentMethod: paymentMethod || 'UPI',
      status: status || 'Active',
      confidence: 100, // manual entry holds 100% confidence
      notifyBefore: notifyBefore !== undefined ? notifyBefore : true
    });

    res.status(201).json(newSub);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

// 3. PUT /api/subscriptions/:id
exports.updateSubscription = async (req, res) => {
  try {
    const subId = req.params.id;
    const userId = req.user.id;

    let sub = await Subscription.findOne({ _id: subId, user: userId });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    sub = await Subscription.findByIdAndUpdate(subId, req.body, { new: true, runValidators: true });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  }
};

// 4. DELETE /api/subscriptions/:id
exports.deleteSubscription = async (req, res) => {
  try {
    const subId = req.params.id;
    const userId = req.user.id;

    const sub = await Subscription.findOneAndDelete({ _id: subId, user: userId });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription', error: error.message });
  }
};
