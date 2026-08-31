import express from 'express';
import {
    registrarController,
    loginController
} from '../controllers/AuthController.js';

const router = express.Router();

// Público: criação de conta e login
router.post('/registro', registrarController);
router.post('/login', loginController);

export default router;
