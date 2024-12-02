import express from 'express';
import { createUsersTable } from '../controllers/db.controller.js';

const router = express.Router(); // Crea el router

// Define la ruta que llama a la función para crear la tabla
router.post('/create-table', createUsersTable);  

// Exporta el router usando la sintaxis ESM
export default router;
