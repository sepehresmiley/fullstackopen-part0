import 'dotenv/config'

const config = {
  PORT: process.env.PORT || 3003,
  MONGODB_URI: process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI,
  SECRET: process.env.SECRET || (process.env.NODE_ENV === 'test' ? 'local-test-secret-only' : undefined),
}

export default config
