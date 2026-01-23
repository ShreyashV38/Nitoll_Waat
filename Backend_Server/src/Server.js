const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const socket = require('./config/socket');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const binRoutes = require('./routes/binRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const driverRoutes = require('./routes/driverRoutes');
const areaRoutes = require('./routes/areaRoutes');
const alertRoutes = require('./routes/alertRoutes');
const wardRoutes = require('./routes/wardRoutes');
const dumpingZoneRoutes = require('./routes/dumpingZoneRoutes');

const app = express();

// Middleware Setup
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

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