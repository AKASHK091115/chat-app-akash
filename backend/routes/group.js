const express = require('express');
const Grouptab = require('../models/grouptab');
const GroupMember = require('../models/groupMember');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  const { name, memberIds, type } = req.body; // receive 'type'

  if (!name || !Array.isArray(memberIds)) {
    return res.status(400).json({ error: 'Group name and member IDs are required' });
  }

  try {
    // Create group with the 'type' field, default to 'group' if not provided
    const group = await Grouptab.create({ name, type: type || 'group', createdBy: req.user.id });

    // Add creator to the group members
    const membersToAdd = [req.user.id, ...memberIds];

    // Remove duplicates
    const uniqueMemberIds = [...new Set(membersToAdd)];

    // Bulk insert into GroupMember
    const groupMembersData = uniqueMemberIds.map(userId => ({
      userId,
      groupId: group.id,
    }));

    console.log('Inserting members:', groupMembersData);
    await GroupMember.bulkCreate(groupMembersData);

    res.status(201).json({ message: 'Group created with members', group });
  } catch (err) {
    console.error('Group creation error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Join an existing group
router.post('/join', authMiddleware, async (req, res) => {
  const { groupId } = req.body;

  try {
    const alreadyJoined = await GroupMember.findOne({
      where: { groupId, userId: req.user.id }
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already a member of the group' });
    }

    await GroupMember.create({ groupId, userId: req.user.id });

    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error('Group join error:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
});


// List all groups current user is part of
router.get('/my-groups', authMiddleware, async (req, res) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { userId: req.user.id },
      include: { model: Grouptab, as: 'group' }
    });

    const groups = memberships.map(m => m.group);

    res.json(groups);
  } catch (err) {
    console.error('Fetch groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});
router.get('/group-members/:groupId', authMiddleware, async (req, res) => {
  try {
    const members = await GroupMember.findAll({
      where: { groupId: req.params.groupId },
      include: {
        model: require('../models/user'),
        attributes: ['id', 'name']
      }
    });

    const result = members.map(m => ({
      id: m.userId,
      name: m.User.name
    }));

    res.json(result);
  } catch (err) {
    console.error('Fetch group members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
