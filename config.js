import dotenv from 'dotenv'
dotenv.config()
export default {
  port: process.env.PORT || 8080,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  },
  jwtSecret: process.env.JWT_SECRET
}