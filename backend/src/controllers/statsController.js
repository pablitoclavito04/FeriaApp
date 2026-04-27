const Caseta = require('../models/Caseta');
const Menu = require('../models/Menu');
const Concert = require('../models/Concert');
const Fair = require('../models/Fair');

// @desc    Get general statistics
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    // General totals
    const totals = {
      fairs: await Fair.countDocuments(),
      casetas: await Caseta.countDocuments(),
      menus: await Menu.countDocuments(),
      concerts: await Concert.countDocuments(),
    };

    // Total menus and average price per caseta
    const menusByCaseta = await Menu.aggregate([
      {
        $group: {
          _id: '$caseta',
          total: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalPrice: { $sum: '$price' },
        },
      },
      {
        $lookup: {
          from: 'casetas',
          localField: '_id',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $project: {
          _id: 0,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
          total: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          totalPrice: { $round: ['$totalPrice', 2] },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Total concerts per caseta
    const concertsByCaseta = await Concert.aggregate([
      {
        $group: {
          _id: '$caseta',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'casetas',
          localField: '_id',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $project: {
          _id: 0,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Total concerts per date
    const concertsByDate = await Concert.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Total casetas per fair
    const casetasByFair = await Caseta.aggregate([
      {
        $group: {
          _id: '$fair',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'fairs',
          localField: '_id',
          foreignField: '_id',
          as: 'fairInfo',
        },
      },
      {
        $project: {
          _id: 0,
          fair: { $arrayElemAt: ['$fairInfo.name', 0] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Most repeated artists in concerts
    const topArtists = await Concert.aggregate([
      {
        $group: {
          _id: '$artist',
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          artist: '$_id',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Casetas without concerts
    const casetasWithConcerts = await Concert.distinct('caseta');
    const casetasWithoutConcerts = await Caseta.find({
      _id: { $nin: casetasWithConcerts },
    }).select('name number');

    // Fairs by date range (fairs that are currently active)
    const now = new Date();
    const activeFairs = await Fair.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('name startDate endDate location');

    // Casetas filtered by fair and number range
    const casetasByFairAndNumber = await Caseta.find({
      number: { $gte: 1, $lte: 10 },
    })
      .populate('fair', 'name')
      .select('name number fair')
      .sort({ number: 1 });

    // Menus by caseta and price range
    const menusByPriceRange = await Menu.aggregate([
      {
        $match: {
          price: { $gte: 5, $lte: 15 },
        },
      },
      {
        $lookup: {
          from: 'casetas',
          localField: 'caseta',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          price: 1,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
        },
      },
      { $sort: { price: 1 } },
    ]);

    // Concerts filtered by caseta and date
    const concertsByDateRange = await Concert.aggregate([
      {
        $match: {
          date: {
            $gte: new Date('2026-01-01'),
            $lte: new Date('2026-12-31'),
          },
        },
      },
      {
        $lookup: {
          from: 'casetas',
          localField: 'caseta',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $project: {
          _id: 0,
          artist: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          time: 1,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
        },
      },
      { $sort: { date: 1, time: 1 } },
    ]);

    // Casetas with their menus and concerts in a single query (lookup)
    const casetasComplete = await Caseta.aggregate([
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'caseta',
          as: 'menus',
        },
      },
      {
        $lookup: {
          from: 'concerts',
          localField: '_id',
          foreignField: 'caseta',
          as: 'concerts',
        },
      },
      {
        $lookup: {
          from: 'fairs',
          localField: 'fair',
          foreignField: '_id',
          as: 'fairInfo',
        },
      },
      {
        $project: {
          name: 1,
          number: 1,
          fair: { $arrayElemAt: ['$fairInfo.name', 0] },
          totalMenus: { $size: '$menus' },
          totalConcerts: { $size: '$concerts' },
          menus: { $slice: ['$menus', 3] },
          concerts: { $slice: ['$concerts', 3] },
        },
      },
      { $sort: { number: 1 } },
    ]);

    // Fairs with all their casetas menus and concerts (full lookup)
    const fairsComplete = await Fair.aggregate([
      {
        $lookup: {
          from: 'casetas',
          localField: '_id',
          foreignField: 'fair',
          as: 'casetas',
        },
      },
      {
        $project: {
          name: 1,
          startDate: 1,
          endDate: 1,
          location: 1,
          totalCasetas: { $size: '$casetas' },
        },
      },
    ]);

    res.json({
      totals,
      menusByCaseta,
      concertsByCaseta,
      concertsByDate,
      casetasByFair,
      topArtists,
      casetasWithoutConcerts,
      activeFairs,
      casetasByFairAndNumber,
      menusByPriceRange,
      concertsByDateRange,
      casetasComplete,
      fairsComplete,
    });
  } catch (error) {
    console.error('Error getting stats:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getStats };
