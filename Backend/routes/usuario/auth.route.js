import express from "express";
import { register, login, getPerfil, logout } from "../../controllers/usuario/auth.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/perfil", verifyToken, getPerfil);

export default router;
