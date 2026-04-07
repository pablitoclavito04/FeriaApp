const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const conectar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordCifrada = await bcrypt.hash('admin1234', salt);

    const resultado = await mongoose.connection.collection('usuarios').insertOne({
      nombre: 'Pablo Sanz Aznar',
      email: 'admin@feriaapp.com',
      password: passwordCifrada,
      rol: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Administrador creado correctamente:', resultado.insertedId);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

conectar();