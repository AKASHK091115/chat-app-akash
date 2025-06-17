const User = require('./user');
const Grouptab = require('./grouptab');
const GroupMember = require('./groupMember');
const Message = require('./message');
const MessageRead = require('./messageRead'); // ✅ import class-based model
const PlaintextPassword = require('./plaintextPassword');
// Group associations
User.belongsToMany(Grouptab, { through: GroupMember, foreignKey: 'userId', as: 'groups' });
Grouptab.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Grouptab, { foreignKey: 'groupId', as: 'group' });

// Messages
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

// Read tracking
User.belongsToMany(Message, {
  through: MessageRead,
  as: 'readMessages',
  foreignKey: 'userId',
  otherKey: 'messageId',
});

Message.belongsToMany(User, {
  through: MessageRead,
  as: 'readBy',
  foreignKey: 'messageId',
  otherKey: 'userId',
});

module.exports = {
  User,
  Grouptab,
  GroupMember,
  Message,
  MessageRead,
  PlaintextPassword,
};
