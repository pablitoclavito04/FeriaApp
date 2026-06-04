const mongoose = require('mongoose');

const FairSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    // Fair map for caseta positioning. Casetas store pixel coordinates relative
    // to this image, so the map and its coordinates travel together per fair.
    mapImage: {
      type: String,
      trim: true,
    },
    mapBounds: {
      width: { type: Number },
      height: { type: Number },
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fair', FairSchema);