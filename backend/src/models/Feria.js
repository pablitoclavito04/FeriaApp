const mongoose = require('mongoose');

const FeriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    fechaFin: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria'],
    },
    ubicacion: {
      type: String,
      trim: true,
    },
    activa: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feria', FeriaSchema);