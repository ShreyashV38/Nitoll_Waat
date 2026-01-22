const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');
const socket = require('./config/socket');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const binRoutes = require('./routes/binRoutes');
const fleetRoutes = require('./routes/fleetRoutes');   // Ensure this file exists
const driverRoutes = require('./routes/driverRoutes'); // Ensure this file exists
const areaRoutes = require('./routes/areaRoutes');     // <--- NEW
const alertRoutes = require('./routes/alertRoutes');   // <--- NEW
const fleetController = require('./controllers/fleetController');
const alertController = require('./controllers/alertController');
const areaController = require('./controllers/areaController');
const protect = require('./middleware/authMiddleware');
const wardRoutes = require('./routes/wardRoutes');
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/wards', wardRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Nitoll Waat Backend is Running 🚀' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/area', areaRoutes);     // <--- NEW
app.use('/api/alerts', alertRoutes);  // <--- NEW
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);


// NEW ROUTES
const router = express.Router();

// Fleet
app.get('/api/fleet/vehicles', protect, fleetController.getVehicles);
app.get('/api/fleet/routes/active', protect, fleetController.getActiveRoutes);

// Alerts
app.get('/api/alerts', protect, alertController.getAlerts);

// Area
app.get('/api/area/:id', protect, areaController.getAreaById);

const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (clientSocket) => {
  console.log('🔌 Client Connected:', clientSocket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});