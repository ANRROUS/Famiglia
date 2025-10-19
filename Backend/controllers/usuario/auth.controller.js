import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) return res.status(400).json({ message: "El correo ya está registrado" });

    const hashed = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre, correo, contrase_a: hashed },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(contraseña, usuario.contrase_a);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

export const getPerfil = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id },
      select: { id_usuario: true, nombre: true, correo: true, url_imagen: true },
    });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      message: "Perfil obtenido correctamente",
      usuario: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
  }
};