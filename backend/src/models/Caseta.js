const mongoose = require('mongoose');

const CasetaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    number: {
      type: Number,
      required: [true, 'Number is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      x: { type: Number },
      y: { type: Number },
    },
    fair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fair',
      required: [true, 'Fair is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Caseta', CasetaSchema);