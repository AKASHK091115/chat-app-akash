const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require('../models/message');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Map to track online users: userId => Set of socketIds
const onlineUsers = new Map();

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user; // Attach user info to socket object
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`📡 User connected: ${user.email} (socket id: ${socket.id})`);

    let userSockets = onlineUsers.get(user.id) || new Set();
    const wasOffline = userSockets.size === 0;

    userSockets.add(socket.id);
    onlineUsers.set(user.id, userSockets);
    socket.on("request_groups", async () => {
  try {
    const userGroups = await socket.user.getGroups({
      attributes: ["id", "name"], // You can customize this as needed
    });

    socket.emit("update_groups", userGroups);
    console.log(`📤 Sent updated group list to ${socket.user.email}`);
  } catch (err) {
    console.error("Error fetching user groups:", err);
  }
});

    if (wasOffline) {
      // First socket for this user connected -> mark online
      (async () => {
        try {
          user.isOnline = true;
          await user.save();

          socket.broadcast.emit('user_online', { userId: user.id });
          console.log(`User ${user.email} is now online (first socket connection)`);
        } catch (err) {
          console.error('Error updating user online status:', err);
        }
      })();
    }

    // Notify client of successful authentication
    socket.emit('authenticated', { userId: user.id });

    // Private message handling
    socket.on('private_message', async ({ toUserId, message }) => {
      if (!toUserId || !message) return;

      try {
        const savedMessage = await Message.create({
          senderId: user.id,
          receiverId: toUserId,
          content: message,
          createdAt: new Date(),
        });

        const recipientSockets = onlineUsers.get(toUserId);
        if (recipientSockets) {
          for (const sockId of recipientSockets) {
            io.to(sockId).emit('private_message', {
              fromUserId: user.id,
              message: savedMessage.content,
              timestamp: savedMessage.createdAt,
            });
          }
        }
      } catch (err) {
        console.error('Error saving/sending private message:', err);
      }
    });

    // Group join
    socket.on('join_group', (groupId) => {
      if (!groupId) return;
      const roomName = `group_${groupId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined group room ${roomName}`);
    });

    // Group messages
    socket.on('group_message', async ({ groupId, message }) => {
      if (!groupId || !message) return;

      try {
        const savedMessage = await Message.create({
          senderId: user.id,
          groupId,
          content: message,
          receiverId: null,
          createdAt: new Date(),
        });

        const roomName = `group_${groupId}`;
        io.to(roomName).emit('group_message', {
          fromUserId: user.id,
          groupId,
          message: savedMessage.content,
          timestamp: savedMessage.createdAt,
        });
      } catch (err) {
        console.error('Error saving/sending group message:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❎ User disconnected: ${user.email} (socket id: ${socket.id})`);

      let userSockets = onlineUsers.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(user.id);
          try {
            user.isOnline = false;
            await user.save();

            socket.broadcast.emit('user_offline', { userId: user.id });
            console.log(`User ${user.email} is now offline (last socket disconnected)`);
          } catch (err) {
            console.error('Error updating user offline status:', err);
          }
        } else {
          onlineUsers.set(user.id, userSockets);
        }
      }
    });
  });
};
