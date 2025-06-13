// controllers/messageReadController.js
const { Message, MessageRead } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
exports.markChatAsRead = async (req, res) => {
  const userId = req.user.id; // or however you attach user to request
  const chatId = req.params.chatId;

  try {
    const messages = await Message.findAll({
      where: {
        chatId,
        senderId: { [Op.ne]: userId },
      },
      include: [{
        association: 'readBy',
        where: { id: userId },
        required: false,
      }],
    });

    const unread = messages.filter(m => !m.readBy || m.readBy.length === 0);

    const readEntries = unread.map(m => ({
      messageId: m.id,
      userId,
    }));

    await MessageRead.bulkCreate(readEntries, { ignoreDuplicates: true });

    res.status(200).json({ message: 'Marked as read', count: readEntries.length });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
exports.getUnreadCounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await sequelize.query(`
      SELECT chatId, COUNT(*) AS unreadCount
      FROM messages m
      LEFT JOIN message_reads r
        ON m.id = r.messageId AND r.userId = :userId
      WHERE m.senderId != :userId
        AND r.messageId IS NULL
      GROUP BY chatId
    `, {
      replacements: { userId },
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
};
