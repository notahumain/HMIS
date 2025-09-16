import mysql from 'mysql2/promise'
import cfg from './config.js'

const pool = mysql.createPool({
  host: cfg.db.host,
  port: cfg.db.port,
  user: cfg.db.user,
  password: cfg.db.password,
  database: cfg.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool
