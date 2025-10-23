import express from "express";
import { register, login, getPerfil, logout } from "../../controllers/usuario/auth.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { registerSchema } from "../../schemas/authSchema.js";

const router = express.Router();

router.post("/register", validateSchema(registerSchema), register);
router.post("/login", validateSchema, login);
router.post("/logout", logout);
router.get("/perfil", verifyToken, getPerfil);

export default router;
