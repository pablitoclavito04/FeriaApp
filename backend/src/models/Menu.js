const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    caseta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caseta',
      required: [true, 'Caseta is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Menu', MenuSchema);