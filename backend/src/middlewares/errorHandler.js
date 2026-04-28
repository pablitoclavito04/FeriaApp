// Helper to send a consistent error response based on the error type
const handleError = (res, error, notFoundCode = 'NOT_FOUND') => {
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
  }
  if (error.name === 'ValidationError') {
    return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
  }
  return res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
};

module.exports = { handleError };
