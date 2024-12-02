import express from 'express';
import { createUsersTable, createUser } from '../controllers/db.controller.js';

const router = express.Router(); // Crea el router

// Define la ruta que llama a la función para crear la tabla
router.post('/create-table', createUsersTable);  

//Ruta para la creacion de un user
router.post('/create-user', createUser);

// Exporta el router usando la sintaxis ESM
export default router;
