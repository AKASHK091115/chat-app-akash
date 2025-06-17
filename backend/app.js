const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware'); // For protecting routes
const models = require('./models');
const userRoutes = require('./routes/users');
const message=require('./routes/messages')
const grouptab=require('./routes/group')
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api',userRoutes)
app.use('/api/messages',message)
app.use('/api/groups',grouptab)
// Example protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: '✅ Protected route accessed successfully', user: req.user });
});



// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced');

  const PORT = 3305;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  // Attach socket server
  require('./socket/server')(server);
});
