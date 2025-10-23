import { ZodError } from "zod";

export const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    // Si es un error de Zod, mostramos sus mensajes personalizados
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues.map((issue) => issue.message),
      });
    }

    // Si es otro tipo de error, mostramos un mensaje genérico
    console.error("Error inesperado en validateSchema:", error);
    return res.status(400).json({
      message: "Error de validación",
      errors: ["Error desconocido"],
    });
  }
};
