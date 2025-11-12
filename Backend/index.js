import app from "./app.js";
import prisma from "./prismaClient.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await prisma.$connect();
    console.log("Prisma conectado correctamente a la base de datos remota");
  } catch (error) {
    console.error("Error al conectar con Prisma:", error);
  }
});
