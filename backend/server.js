const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const fairRoutes = require('./src/routes/fairRoutes');
const casetaRoutes = require('./src/routes/casetaRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const concertRoutes = require('./src/routes/concertRoutes');
const publishRoutes = require('./src/routes/publishRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const userRoutes = require('./src/routes/userRoutes');
const path = require('path');

dotenv.config();

connectDB();

// Remove legacy Spanish collection if it exists
mongoose.connection.once('open', async () => {
  const collections = await mongoose.connection.db.listCollections({ name: 'conciertos' }).toArray();
  if (collections.length > 0) {
    await mongoose.connection.db.dropCollection('conciertos');
    console.log('Removed legacy collection: conciertos');
  }
});

const app = express();

// CORS allow-list: only our own front-ends may call the API from the browser.
// A bare cors() would allow ANY website to call it, which is an unnecessary
// exposure. Extra origins can be added via CORS_ORIGINS (comma-separated).
const allowedOrigins = [
  'https://feriaapp.com',
  'https://www.feriaapp.com',
  'https://admin.feriaapp.com',
  'http://localhost:5173', // Vite dev server
  'https://localhost', // local Docker (nginx)
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server) that send no Origin,
    // and any origin on the allow-list. For a disallowed origin, resolve with
    // `false` (no CORS headers added) rather than throwing — the browser then
    // blocks the request, and we avoid noisy 500s in the server logs.
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true,
};

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors(corsOptions));

// Serve uploaded files. Allow them to be loaded cross-origin (the admin panel
// runs on a different port in dev, and the public web on a different host), so
// Helmet's default same-origin resource policy does not block the images.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fairs', fairRoutes);
app.use('/api/casetas', casetaRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/concerts', concertRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FeriaApp API is running' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;