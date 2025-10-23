import { z } from "zod";

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  correo: z
    .string()
    .email("Debe ser un correo electrónico válido")
    .regex(
      /^[A-Za-z0-9._%+-]+@famiglia\.[A-Za-z]{2,}$/,
      "Solo se permiten correos del dominio @famiglia con un subdominio"
    ),
  contraseña: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial"),
});

export const loginSchema = z.object({
  correo: z.string().email("Debe ser un correo electrónico válido"),
  contraseña: z.string().min(1, "La contraseña es requerida"),
});