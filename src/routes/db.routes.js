import express from 'express';
import { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser } from '../controllers/db.controller.js';

const router = express.Router();

//GET all users
router.get('/users', getUsers);

//GET a user
router.get('/users/:id', getUser);

// Crear la tabla users
router.post('/create-table', createUsersTable);  

//Ruta para la creacion de un user
router.post('/create-user', createUser);

//Ruta para la edicion de un user
router.put('/users/:id', editUser);

// Ruta para eliminar un usuario
router.delete('/users/:id', deleteUser);

// Exporta el router usando la sintaxis ESM
export default router;
