const mongoose = require('mongoose');

/**
 * Safe test-database connector. Guards against the suite ever connecting to the
 * real database — the tests run deleteMany() in setup/teardown, so connecting to
 * production would wipe live data (this happened once; never again).
 *
 * Rules:
 *  - Prefer MONGODB_TEST_URI; fall back to MONGODB_URI (the CI sets only the
 *    latter, already pointed at a *_test database).
 *  - Whichever is used, its database name MUST contain "test", otherwise we
 *    refuse to connect. This is the guard that prevents wiping the real DB.
 */
const connectTestDb = async () => {
  const uri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('No test database URI set — refusing to run tests');
  }

  // Extract the db name (last path segment, minus any query string).
  const dbName = uri.split('/').pop().split('?')[0];
  if (!/test/i.test(dbName)) {
    throw new Error(
      `Refusing to run tests: database "${dbName}" does not look like a test database (its name must contain "test")`
    );
  }

  return mongoose.connect(uri);
};

module.exports = connectTestDb;
