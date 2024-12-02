import pkg from 'pg';  // Importa el paquete 'pg'
const { Pool } = pkg;  // Extrae 'Pool' desde el objeto importado

const pool = new Pool({
  user: 'alumno',
  host: 'localhost',
  database: 'course-db',
  password: '123456',
  port: 5432,
});

pool
  .connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error al conectar a PostgreSQL', err));

export default pool;
