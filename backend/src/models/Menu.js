const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
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
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
    },
    caseta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caseta',
      required: [true, 'La caseta es obligatoria'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Menu', MenuSchema);