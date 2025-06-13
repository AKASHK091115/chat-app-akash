const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // ✅ Fix: Import Op
const Message = require('../models/message');
const { markChatAsRead } = require('../controller/messageReadController');
const auth = require('../middleware/authMiddleware'); // if you're using auth
const { getUnreadCounts } = require('../controller/messageReadController');
// 🔒 Fetch private messages between two users
router.get('/private/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).send('Server error');
  }
});

// 💬 Fetch group messages by group ID
router.get('/groups/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { groupId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).send('Server error');
  }
});
router.post('/:chatId/read', auth, markChatAsRead);

router.get('/unread/counts', auth, getUnreadCounts);

module.exports = router;
