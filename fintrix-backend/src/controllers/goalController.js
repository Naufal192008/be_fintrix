const Goal = require('../models/Goal');

// @desc    Add a new goal
// @route   POST /api/goals
exports.addGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;
    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all active goals for user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update goal progress (e.g., Add Saving)
// @route   PUT /api/goals/:id
exports.updateGoalProgress = async (req, res) => {
  try {
    const goalId = req.params.id;
    const { addAmount } = req.body;
    
    const goal = await Goal.findOne({ _id: goalId, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (addAmount) {
      goal.currentAmount += Number(addAmount);
    }
    
    await goal.save();
    
    // Trigger notification (reminder/saving update)
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: req.user.id,
        type: 'reminder',
        title: `Savings goal updated!`,
        message: `You successfully added $${addAmount || 0} to your ${goal.title} goal. Keep it up!`,
        tag: 'Reminder',
        isRead: false
      });
    } catch (notifErr) { }
    
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    await goal.deleteOne();
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reset goal progress to 0
// @route   PUT /api/goals/:id/reset
exports.resetGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    goal.currentAmount = 0;
    await goal.save();
    res.status(200).json({ success: true, message: 'Goal reset', data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
