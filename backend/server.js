const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Configuración de variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'FeriaApp API funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});