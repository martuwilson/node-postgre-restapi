import express from 'express';
import { createUsersTable, createUser, getUsers, getUser, editUser, deleteUser, loginUser } from '../controllers/db.controller.js';
import { seedDatabase } from '../controllers/seed.controller.js';
import { verifyToken } from '../modules/auth_jwt.js';
import { checkAdmin } from '../middlewares/check_admin.js';
import { loginLimiter, generalLimiter } from '../middlewares/rate_limit.js';

const router = express.Router();


router.get('/users', verifyToken, generalLimiter, getUsers);


router.get('/users/:id', verifyToken, generalLimiter, getUser);


router.post('/create-table', verifyToken, checkAdmin, createUsersTable);  


router.post('/create-user',  verifyToken, checkAdmin, loginLimiter, createUser);


router.post('/login', loginLimiter, loginUser)


router.put('/users/:id', verifyToken, checkAdmin, editUser);


router.delete('/users/:id', verifyToken, checkAdmin, deleteUser);


////////////////////////////////
// Seed data
router.post('/seed', checkAdmin, seedDatabase);
export default router;
