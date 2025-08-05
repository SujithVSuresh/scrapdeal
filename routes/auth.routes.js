import express from 'express'
import authControllers from '../controllers/auth.controllers.js';

const authRouter = express.Router();

authRouter.post('/signup', authControllers.signup);
authRouter.post('/signin', authControllers.signin)

export default authRouter
