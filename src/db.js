import pkg from 'pg';  
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: `${process.env.DB_PASSWORD}`,
    port: process.env.DB_PORT,
  });

pool
  .connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error al conectar a PostgreSQL', err));

export default pool;
