const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const feriaRoutes = require('./src/routes/feriaRoutes');
const casetaRoutes = require('./src/routes/casetaRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const conciertoRoutes = require('./src/routes/conciertoRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ferias', feriaRoutes);
app.use('/api/casetas', casetaRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/conciertos', conciertoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'FeriaApp API funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});