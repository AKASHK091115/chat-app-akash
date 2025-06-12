const User = require('./user');
const Grouptab = require('./grouptab');
const GroupMember = require('./groupMember');
const Message = require('./message');

User.belongsToMany(Grouptab, { through: GroupMember, foreignKey: 'userId', as: 'groups' });
Grouptab.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Grouptab, { foreignKey: 'groupId', as: 'group' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

module.exports = {
  User,
  Grouptab,
  GroupMember,
  Message,
};
