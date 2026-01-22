let io;

module.exports = {
  // Initialize Socket.io (Run this once in Server.js)
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "*", // Allow connections from App and Website
        methods: ["GET", "POST"]
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