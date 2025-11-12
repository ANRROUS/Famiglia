import prisma from "../../prismaClient.js";
import qrcode from "qrcode";
import { authenticator } from "otplib";

const APP_NAME = "Famiglia";

export const setup2FA = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);

    // ✅ Generar secreto
    const secret = authenticator.generateSecret();

    // ✅ Crear URL para QR
    const otpauth = authenticator.keyuri(req.user.correo, APP_NAME, secret);

    // ✅ Generar QR
    const qrImageUrl = await qrcode.toDataURL(otpauth);

    // ✅ Guardar secreto temporal en BD
    await prisma.autenticacion_2fa.upsert({
      where: { id_usuario: userId },
      update: { temp_secreto: secret },
      create: {
        id_usuario: userId,
        temp_secreto: secret,
        habilitado: false,
      },
    });

    res.json({
      message: "Escanea este código con Google Authenticator",
      qrImageUrl,
      secret, // ✅ También devuelves el secreto para testing
    });
  } catch (error) {
    console.error("Error en setup2FA:", error);
    res
      .status(500)
      .json({ message: "Error generando QR 2FA", error: error.message });
  }
};

export const verify2FAByEmail = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
      return res
        .status(400)
        .json({ message: "Correo y código son requeridos" });
    }

    if (codigo.trim().length !== 6 || !/^\d+$/.test(codigo)) {
      return res
        .status(400)
        .json({ message: "Código debe ser 6 dígitos numéricos" });
    }

    // Buscar al usuario por correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: { id_usuario: true },
    });

    // ⚠️ Validación adicional
    if (!usuario || !usuario.id_usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar su registro 2FA
    const record = await prisma.autenticacion_2fa.findUnique({
      where: { id_usuario: BigInt(usuario.id_usuario) },
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "2FA no configurado para este usuario" });
    }

    const secretoAVerificar = record.temp_secreto || record.secreto;
    if (!secretoAVerificar) {
      return res.status(400).json({ message: "Secreto 2FA no encontrado" });
    }

    const isValid = authenticator.check(codigo, secretoAVerificar);
    if (!isValid) {
      return res.status(400).json({ message: "Código incorrecto o expirado" });
    }

    // ✅ Si pasa todo
    res.json({
      success: true,
      message: "Código 2FA válido",
      id_usuario: usuario.id_usuario,
    });
  } catch (error) {
    console.error("Error en verify2FAByEmail:", error);
    res
      .status(500)
      .json({ message: "Error verificando 2FA", error: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    let { codigo } = req.body;

    // ✅ Limpiar espacios y caracteres invisibles
    codigo = codigo.trim().replace(/\s+/g, "");

    // ✅ Obtener userId del token autenticado (para activar 2FA en perfil)
    const userId = BigInt(req.user.id_usuario || req.user.id);

    // ✅ Validar código
    if (!codigo || codigo.length !== 6 || !/^\d+$/.test(codigo)) {
      console.log(
        `Código rechazado - Valor recibido: [${codigo}] Longitud: ${codigo.length}`
      );
      return res
        .status(400)
        .json({ message: "Código debe ser 6 dígitos numéricos" });
    }

    // Buscar el registro de 2FA del usuario
    const record = await prisma.autenticacion_2fa.findUnique({
      where: { id_usuario: userId },
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "2FA no configurado para este usuario" });
    }

    // ✅ Usar el secreto temporal si existe, sino usar el definitivo
    const secretoAVerificar = record.temp_secreto || record.secreto;

    if (!secretoAVerificar) {
      return res.status(400).json({ message: "Secreto 2FA no encontrado" });
    }

    console.log(
      `Verificando código: ${codigo} con secreto: ${secretoAVerificar}`
    );

    // ✅ Verificar con OTPLIB
    const isValid = authenticator.check(codigo, secretoAVerificar);

    if (!isValid) {
      console.log(
        `Verificación fallida: código=${codigo}, secreto=${secretoAVerificar}`
      );
      return res.status(400).json({ message: "Código incorrecto o expirado" });
    }

    // ✅ Actualizar el estado de habilitado a true (primera activación)
    await prisma.autenticacion_2fa.update({
      where: { id_usuario: userId },
      data: {
        habilitado: true,
        secreto: secretoAVerificar,
        temp_secreto: null,
      },
    });

    res.json({ message: "2FA activado correctamente." });
  } catch (error) {
    console.error("Error en verify2FA:", error);
    res
      .status(500)
      .json({ message: "Error verificando 2FA", error: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);

    const record = await prisma.autenticacion_2fa.findUnique({
      where: { id_usuario: userId },
    });

    if (!record || !record.habilitado) {
      return res.status(400).json({ message: "2FA ya está desactivado." });
    }

    await prisma.autenticacion_2fa.update({
      where: { id_usuario: userId },
      data: { habilitado: false, secreto: null, temp_secreto: null },
    });

    res.json({ message: "Autenticación 2FA desactivada correctamente." });
  } catch (error) {
    console.error("Error al desactivar 2FA:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
