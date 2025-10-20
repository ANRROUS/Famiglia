import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "arthuropipa@gmail.com",
    pass: "fcgfgaweyvnunidz",
  },
});

transporter
  .verify()
  .then(() => console.log("✅ Listo para enviar correos con Gmail"))
  .catch((err) => console.error("❌ Error verificando transporte:", err));

export const sendContactMail = async ({ nombre, email, mensaje }) => {
  await transporter.sendMail({
    from: `"${nombre}" <${email}>`,
    to: "arthuropipa@gmail.com",
    subject: "Famiglia - Nuevo Mensaje de Contacto ⚠",
    html: `
      <div style="
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f7f7f7;
        padding: 0;
        margin: 0;
      ">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="background-color: #753b3b; padding: 20px 0;">
              <h1 style="color: #ffffff; font-size: 22px; margin: 0; letter-spacing: 1px;">
                FAMIGLIA
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600"
                style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">
                <tr>
                  <td style="padding: 40px 50px;">
                    <h2 style="color: #753b3b; font-size: 20px; margin-bottom: 15px; font-weight: 600;">
                      Nuevo mensaje de contacto
                    </h2>
                    <p style="font-size: 15px; color: #444; margin-bottom: 25px;">
                      Has recibido un nuevo mensaje a través del formulario de contacto de <strong>Famiglia</strong>.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="6" border="0" width="100%"
                      style="background-color: #f9f9f9; border-left: 4px solid #b25555; border-radius: 4px;">
                      <tr>
                        <td style="color: #000; font-size: 15px;">
                          <strong>Nombre:</strong> ${nombre}<br/>
                          <strong>Correo:</strong> ${email}<br/>
                          <strong>Mensaje:</strong><br/>${mensaje}
                        </td>
                      </tr>
                    </table>

                    <p style="margin-top: 30px; font-size: 13px; color: #999;">
                      Este correo fue generado automáticamente desde el sitio web de Famiglia.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} Famiglia — Todos los derechos reservados
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};
