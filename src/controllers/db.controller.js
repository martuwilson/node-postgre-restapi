import pool from '../db.js';  // Importa la conexión a la base de datos

const createUsersTable = async (req, res) => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);  // Ejecuta la consulta para crear la tabla
    res.send('Tabla "users" creada exitosamente');
  } catch (error) {
    console.error('Error al crear la tabla "users":', error);
    res.status(500).send('Hubo un error al crear la tabla');
  }
};

// Exporta la función usando la sintaxis ESM
export { createUsersTable };
