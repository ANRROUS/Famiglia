import { ZodError } from "zod";

export const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    return res.status(400).json({
      message: "Error de validación",
      errors: [{ field: "unknown", message: "Error desconocido" }],
    });
  }
};
