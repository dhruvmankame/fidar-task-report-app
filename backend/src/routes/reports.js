const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Only managers may see team-wide employee reports.
function requireManager(req, res, next) {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Managers only' });
  }
  next();
}

// GET /api/reports/summary — powers the dashboard
router.get('/summary', async (req, res, next) => {
  try {
    const [byStatus, byPriority, total, overdue] = await Promise.all([
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(),
      Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } }),
    ]);

    const statusCounts = { 'To Do': 0, 'In Progress': 0, Completed: 0 };
    byStatus.forEach((s) => { if (s._id) statusCounts[s._id] = s.count; });

    const priorityCounts = { Low: 0, Medium: 0, High: 0 };
    byPriority.forEach((p) => { if (p._id) priorityCounts[p._id] = p.count; });

    res.json({ total, statusCounts, priorityCounts, overdue });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/monthly?year=2026&month=9 — simple monthly work report
router.get('/monthly', async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [created, completed] = await Promise.all([
      Task.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Task.countDocuments({ status: 'Completed', updatedAt: { $gte: start, $lt: end } }),
    ]);

    res.json({ year, month, created, completed });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/employees?year=&month=  (manager only)
// Per-employee monthly report: assigned / completed / in-progress / overdue counts.
router.get('/employees', requireManager, async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const users = await User.find({ role: 'employee' }).select('name email').lean();

    const rows = await Promise.all(
      users.map(async (u) => {
        const [assigned, completed, inProgress, overdue] = await Promise.all([
          // tasks assigned to this user that were created this month
          Task.countDocuments({ assignedTo: u._id, createdAt: { $gte: start, $lt: end } }),
          // tasks assigned to this user that reached Completed this month
          Task.countDocuments({
            assignedTo: u._id,
            status: 'Completed',
            updatedAt: { $gte: start, $lt: end },
          }),
          Task.countDocuments({ assignedTo: u._id, status: 'In Progress' }),
          Task.countDocuments({
            assignedTo: u._id,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() },
          }),
        ]);
        return {
          userId: u._id,
          name: u.name,
          email: u.email,
          assigned,
          completed,
          inProgress,
          overdue,
        };
      })
    );

    res.json({ year, month, employees: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/activity?limit=  — recent daily work updates (comments flagged isUpdate).
// Managers see everyone's updates; employees see only their own.
router.get('/activity', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const match = { 'comments.isUpdate': true };
    const tasks = await Task.find(match)
      .select('title comments assignedToName')
      .lean();

    // Flatten the embedded update comments into a single activity feed.
    let feed = [];
    tasks.forEach((t) => {
      (t.comments || []).forEach((c) => {
        if (!c.isUpdate) return;
        if (req.user.role !== 'manager' && String(c.author) !== String(req.user.id)) return;
        feed.push({
          taskId: t._id,
          taskTitle: t.title,
          author: c.author,
          authorName: c.authorName,
          text: c.text,
          createdAt: c.createdAt,
        });
      });
    });

    feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ updates: feed.slice(0, limit) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
