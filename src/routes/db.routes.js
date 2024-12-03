import express from 'express';
import { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser } from '../controllers/db.controller.js';
import { seedDatabase } from '../controllers/seed.controller.js';

const router = express.Router();


router.get('/users', getUsers);


router.get('/users/:id', getUser);


router.post('/create-table', createUsersTable);  


router.post('/create-user', createUser);


router.put('/users/:id', editUser);


router.delete('/users/:id', deleteUser);


////////////////////////////////
// Seed data
router.post('/seed', seedDatabase);
export default router;
