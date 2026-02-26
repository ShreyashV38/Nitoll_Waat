const jwt = require('jsonwebtoken');
let io;

module.exports = {
  // Initialize Socket.io (Run this once in Server.js)
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: [/localhost/, /127\.0\.0\.1/],
        methods: ["GET", "POST"]
      }
    });

    // Socket.io Authentication Middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    return io;
  },

  // Get the instance (Use this in Controllers)
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};