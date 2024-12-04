import express from 'express';
import { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser, loginUser } from '../controllers/db.controller.js';
import { seedDatabase } from '../controllers/seed.controller.js';
import { verifyToken } from '../modules/auth_jwt.js';

const router = express.Router();


router.get('/users', verifyToken, getUsers);


router.get('/users/:id', verifyToken, getUser);


router.post('/create-table', createUsersTable);  


router.post('/create-user', createUser);


router.post('/login', loginUser)


router.put('/users/:id', verifyToken, editUser);


router.delete('/users/:id', verifyToken, deleteUser);


////////////////////////////////
// Seed data
router.post('/seed', seedDatabase);
export default router;
