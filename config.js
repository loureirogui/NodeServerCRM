require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

// MySQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mytable'
  };

module.exports = {
 secretKey,
 dbConfig,
 };