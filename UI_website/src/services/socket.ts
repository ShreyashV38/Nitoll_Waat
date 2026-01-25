import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; 

// Allow undefined type
export let socket: Socket | undefined;

export const socketService = {
  connect: () => {
    // 1. Create new connection if none exists
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ["websocket"], 
        reconnectionAttempts: 5, // Stop trying after 5 fails
      });

      socket.on("connect", () => console.log("🟢 Web Socket Connected!", socket?.id));
      socket.on("connect_error", (err) => console.error("🔴 Connection Failed:", err));
    } 
    // 2. If socket exists but was disconnected, reconnect it
    else if (socket.disconnected) {
        socket.connect();
    }
    
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      // socket = undefined; // Optional: Force full reset if needed
    }
  },

  onBinUpdate: (callback: (data: any) => void) => {
    if (!socket) return;
    
    // Remove old listeners to prevent duplicates (e.g. running twice in React Strict Mode)
    socket.off("bin_update"); 
    
    socket.on("bin_update", (data) => {
        console.log("📩 Service Received Bin Update:", data);
        callback(data);
    });
  }
};