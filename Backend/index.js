import app from "./app.js";
import { sendContactMail } from "./utils/mailer.js";

// Ruta para probar envío de correo
app.post("/send-email", async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    await sendContactMail({ nombre, email, mensaje });

    res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});