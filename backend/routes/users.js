const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {Op}=require("sequelize")

router.get('/users', async (req, res) => {
  const userId = req.query.exclude; // optional: ?exclude=2

  try {
    const users = await User.findAll({
      where: userId ? { id: { [Op.ne]: userId } } : {},
      attributes: ['id','name', 'isOnline'], // fetch only necessary fields
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
