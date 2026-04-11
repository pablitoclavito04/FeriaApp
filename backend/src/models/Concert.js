const mongoose = require('mongoose');

const ConciertoSchema = new mongoose.Schema(
  {
    artista: {
      type: String,
      required: [true, 'El artista es obligatorio'],
      trim: true,
    },
    genero: {
      type: String,
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
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

module.exports = mongoose.model('Concierto', ConciertoSchema);