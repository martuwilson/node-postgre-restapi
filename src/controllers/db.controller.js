import Joi from 'joi';
import bcrypt from 'bcrypt';
import pool from '../db.js';


////////////////////////////////
// Schema de validación para los usuarios
const userSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(), 
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

//Crear la tabla de usuarios de la base de datos
const createUsersTable = async (req, res) => {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  
    try {
      await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`); // Asegura que la extensión esté habilitada
      await pool.query(query);  // Ejecuta la consulta para crear la tabla
      res.send('Tabla "users" creada exitosamente');
    } catch (error) {
      console.error('Error al crear la tabla "users":', error);
      res.status(500).send('Hubo un error al crear la tabla');
    }
  };
  

////////////////////////////////
const createUser = async (req, res) => {
    const { error, value } = userSchema.validate(req.body);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { name, email, password } = value;
  
    try {
      const emailCheckQuery = 'SELECT id FROM users WHERE email = $1';
      const emailCheckResult = await pool.query(emailCheckQuery, [email]);
  
      if (emailCheckResult.rowCount > 0) {
        return res.status(409).json({ error: 'Error con el mail ingresado' });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const query = `
        INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await pool.query(query, [name, email, hashedPassword]);
  
      const user = { ...result.rows[0] };
      delete user.password;
      res.json(user);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      res.status(500).send('Hubo un error al crear el usuario');
    }
  };
  

////////////////////////////////
// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).send('Hubo un error al obtener los usuarios');
  }
};

////////////////////////////////
// Get a user by id
const getUser = async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await pool.query(query, [id]);
    res.json(result.rows[0]);
    } catch (error)
    {
        console.error('Error al obtener el usuario:', error);
        res.status(500).send('Hubo un error al obtener el usuario');
    }
}

////////////////////////////////
// EDIT user by id
const editUser = async (req, res) => {
    const paramsSchema = Joi.object({
      id: Joi.string().uuid().required()
    });
  
    const bodySchema = Joi.object({
      name: Joi.string().min(3).max(100),
      email: Joi.string().email(),
      password: Joi.string().min(8)
    });
  
    const { error: paramsError, value: paramsValue } = paramsSchema.validate(req.params);
    const { error: bodyError, value: bodyValue } = bodySchema.validate(req.body);
  
    if (paramsError) {
      return res.status(400).json({ error: paramsError.details[0].message });
    }
  
    if (bodyError) {
      return res.status(400).json({ error: bodyError.details[0].message });
    }
  
    const { id } = paramsValue;
    const { name, email, password } = bodyValue;
  
    try {
      const query = `
        UPDATE users
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            password = COALESCE($3, password)
        WHERE id = $4
        RETURNING *;
      `;
  
      const result = await pool.query(query, [name, email, password, id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      res.status(500).send('Hubo un error al editar el usuario');
    }
  };
  

////////////////////////////////
// DELETE user by id
const deleteUser = async (req, res) => {
    const schema = Joi.object({
      id: Joi.string().uuid().required()
    });
  
    const { error, value } = schema.validate(req.params);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { id } = value;
  
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      res.send('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).send('Hubo un error al eliminar el usuario');
    }
  };


// Exporta la función usando la sintaxis ESM
export { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser };
