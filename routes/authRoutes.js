import express from 'express';
import { googleLogin, registerUser, userLogin } from '../controllers/authController.js';

const router=express.Router();

router.post("/register",registerUser);
router.post("/login",userLogin)
router.post("/google-login",googleLogin)

export default router;