const mongoose = require('mongoose');

const CasetaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    numero: {
      type: Number,
      required: [true, 'El número es obligatorio'],
    },
    descripcion: {
      type: String,
      trim: true,
    },
    ubicacion: {
      x: { type: Number },
      y: { type: Number },
    },
    feria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feria',
      required: [true, 'La feria es obligatoria'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Caseta', CasetaSchema);