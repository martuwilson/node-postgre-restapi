import Joi from 'joi';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';


import { generateToken } from '../modules/auth_jwt.js';

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
      await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`); 
      await pool.query(query);
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

  const { name, email, password, role = 'user' } = value;

  try {
    const emailCheckQuery = 'SELECT id FROM users WHERE email = $1';
    const emailCheckResult = await pool.query(emailCheckQuery, [email]);

    if (emailCheckResult.rowCount > 0) {
      return res.status(409).json({ error: 'Error con el mail ingresado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [name, email, hashedPassword, role]);

    const user = { ...result.rows[0] };
    delete user.password;
    await sendEmail(
      email,
      '¡Bienvenido a nuestra plataforma!',
      `Hola ${name}, has sido agregado como usuario en nuestra plataforma. Tu rol es: ${role}.`
    );

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
    const result = await pool.query('SELECT id, name, email, created_at FROM users');
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
  const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';

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
      let query = `UPDATE users SET `;
      const values = [];
      let valueIndex = 1;
  
      if (name) {
        query += `name = $${valueIndex++}, `;
        values.push(name);
      }
  
      if (email) {
        query += `email = $${valueIndex++}, `;
        values.push(email);
      }
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `password = $${valueIndex++}, `;
        values.push(hashedPassword);
      }
  
      query = query.slice(0, -2); // Eliminar la coma final
      query += ` WHERE id = $${valueIndex} RETURNING *;`;
  
      values.push(id);
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const user = result.rows[0];
      delete user.password;
  
      res.json(user);
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

////////////////////////////////
//log with json web token

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
  
      // Usa la función generateToken
      const token = generateToken({ id: user.id, role: user.role });
  
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  ////////////////////////////////
// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'El email no está registrado' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(
      user.email,
      'Restablecer contraseña',
      `Haga clic en el siguiente enlace para restablecer su contraseña: ${resetLink}`
    );

    res.json({ message: 'Enlace de restablecimiento enviado a su correo electrónico' });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

////////////////////////////////
// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const schema = Joi.string().min(8).required();
    const { error } = schema.validate(newPassword);
    if (error) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await pool.query(query, [hashedPassword, decoded.id]);

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'El token ha expirado' });
    }
    res.status(500).send('Error al restablecer la contraseña');
  }
};

  
export { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser, loginUser, forgotPassword, resetPassword };
