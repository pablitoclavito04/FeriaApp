const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const fairRoutes = require('./src/routes/fairRoutes');
const casetaRoutes = require('./src/routes/casetaRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const concertRoutes = require('./src/routes/concertRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fairs', fairRoutes);
app.use('/api/casetas', casetaRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/concerts', concertRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FeriaApp API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});