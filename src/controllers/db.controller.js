import pool from '../db.js';  // Importa la conexión a la base de datos

//Crear la tabla de usuarios de la base de datos
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

////////////////////////////////
//Crear un usuario en la base de datos
const createUser = async (req, res) => {
  const { name, email, password } = req.body;  // Extrae los datos del cuerpo de la petición
  const query = `
    INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name, email, password]);  // Ejecuta la consulta SQL
    res.json(result.rows[0]);  // Retorna el usuario recién creado
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).send('Hubo un error al crear el usuario');
  }
};

// Exporta la función usando la sintaxis ESM
export { createUsersTable, createUser };
