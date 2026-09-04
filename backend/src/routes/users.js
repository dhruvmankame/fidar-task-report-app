const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // must be logged in

// GET /api/users — used to populate the "Assign to" picker
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
