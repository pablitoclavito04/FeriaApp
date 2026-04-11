const mongoose = require('mongoose');

const ConcertSchema = new mongoose.Schema(
  {
    artist: {
      type: String,
      required: [true, 'Artist is required'],
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
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

module.exports = mongoose.model('Concert', ConcertSchema);