const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const socket = require('./config/socket');
const firebaseAdmin = require('./config/firebase'); // Initialize Firebase Admin


// Import Routes
const authRoutes = require('./routes/authRoutes');
const binRoutes = require('./routes/binRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const driverRoutes = require('./routes/driverRoutes');
const areaRoutes = require('./routes/areaRoutes');
const alertRoutes = require('./routes/alertRoutes');
const wardRoutes = require('./routes/wardRoutes');
const dumpingZoneRoutes = require('./routes/dumpingZoneRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const app = express();

// Middleware Setup
app.use(cors({
  origin: [/localhost/, /127\.0\.0\.1/], // Allow local dev; add production domain when deploying
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Nitoll Waat Backend Running' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/area', areaRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/dumping-zones', dumpingZoneRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/complaints', complaintRoutes);

// Global Error Handler (must be AFTER all routes)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server & Socket Initialization
const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (clientSocket) => {
  console.log('Client Connected:', clientSocket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});