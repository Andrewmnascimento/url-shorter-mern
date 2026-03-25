import { loginRoute, registerRoute, logoutRoute, refreshRoute} from '../controllers/auth.controller.js';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import rateLimit from "express-rate-limit";

   
 // Criar limitador para login
 const loginLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutos
   max: 5, // Máximo 5 requisições
   message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
   standardHeaders: true,
   legacyHeaders: false,
 });
   
// Criar limitador para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 registros
  message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authRouter = Router();

authRouter.post('/register', registerLimiter, registerRoute);
authRouter.post('/login', loginLimiter, loginRoute);
authRouter.post('/logout', authMiddleware, logoutRoute);
authRouter.post('/refresh', refreshRoute);

export default authRouter;
