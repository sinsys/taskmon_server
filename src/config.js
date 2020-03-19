module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://taskmon:test@localhost/taskmon_test',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://taskmon:test@localhost/taskmon',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000"
}