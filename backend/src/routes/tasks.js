const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // every task route requires a valid token

// GET /api/tasks?search=&status=&priority=&assignedTo=
router.get('/', async (req, res, next) => {
  try {
    const { search, status, priority, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search.trim(), $options: 'i' }; // case-insensitive search

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, assignedToName } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      assignedToName: assignedToName || '',
      createdBy: req.user.id,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'assignedToName'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:id/comments — add a comment or a daily work update
// Body: { text, isUpdate? }  — isUpdate=true marks it as a daily work update.
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { text, isUpdate } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({
      author: req.user.id,
      authorName: req.user.name,
      text,
      isUpdate: !!isUpdate,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:id/attachments — attach an image (stored inline as a data URL)
// Body: { name?, dataUrl }
router.post('/:id/attachments', async (req, res, next) => {
  try {
    const { name, dataUrl } = req.body;
    if (!dataUrl) return res.status(400).json({ message: 'dataUrl is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.attachments.push({
      name: name || 'attachment',
      dataUrl,
      uploadedBy: req.user.id,
      uploadedByName: req.user.name,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id/attachments/:attId — remove an attachment
router.delete('/:id/attachments/:attId', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const att = task.attachments.id(req.params.attId);
    if (!att) return res.status(404).json({ message: 'Attachment not found' });
    att.deleteOne();
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
