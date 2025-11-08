import prisma from '../../prismaClient.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAuditoria } from '../../services/auditoriaService.js';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) return res.status(409).json({ message: "El correo ya está registrado" });

    const hashed = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre, correo, contrase_a: hashed, rol: "C" },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: {
        id: Number(nuevoUsuario.id_usuario),
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol || "C",
      },
    });
    logAuditoria({
      // usuarioId: nuevoUsuario?.id_usuario || nuevoUsuario?.id || null,
      // rol: nuevoUsuario?.rol || null,
      accion: 'register',
      recurso: 'usuario',
      recursoId: nuevoUsuario?.id_usuario || nuevoUsuario?.id || null,
      req
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

  const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(contraseña, usuario.contrase_a);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const rol = usuario.rol || "C";

    const token = jwt.sign(
      { id: Number(usuario.id_usuario), correo: usuario.correo, rol },
      process.env.JWT_SECRET || "famiglia-secret",
      { expiresIn: "1d" }
    );

    // Configurar cookie HTTPOnly
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({
      message: "Login exitoso",
      usuario: {
        id: Number(usuario.id_usuario),
        nombre: usuario.nombre,
        correo: usuario.correo,
        url_imagen: usuario.url_imagen,
        rol,
      },
    });
    logAuditoria({
      // usuarioId: usuario?.id_usuario || usuario?.id || null,
      // rol:req.user?.rol || null,
      accion: 'login',
      recurso: 'usuario',
      recursoId: usuario?.id_usuario || usuario?.id || null,
      req,
      meta: { metodo: 'password' }
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

export const getPerfil = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_usuario: true, nombre: true, correo: true, url_imagen: true, rol: true },
    });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      message: "Perfil obtenido correctamente",
      usuario: {
        id: Number(user.id_usuario),
        nombre: user.nombre,
        correo: user.correo,
        url_imagen: user.url_imagen,
        rol: user.rol || "C",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
  }
};