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

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

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