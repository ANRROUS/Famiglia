import prisma from "../../prismaClient.js";
import crypto from "crypto";

// Función para generar el hash del ID del pedido
const hashOrderId = (id) => {
  const hash = crypto.createHash('sha256').update(id.toString()).digest('hex');
  return `SA-${hash.substring(0, 8).toUpperCase()}`;
};

export const procesarPago = async (req, res) => {
    const id_usuario = req.user?.id;
    const { medio, numero, cod_ver, envio } = req.body;

    if (!id_usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!medio || !numero || !cod_ver) {
        return res.status(400).json({ error: "Datos de pago incompletos" });
    }

    try {
        // Buscar el pedido en estado "carrito" del usuario
        const pedido = await prisma.pedido.findFirst({
            where: { 
                id_usuario: BigInt(id_usuario),
                estado: "carrito"
            },
            include: {
                detalle_pedido: {
                    include: {
                        producto: true,
                    },
                },
            },
        });

        if (!pedido) {
            return res.status(404).json({ error: "No hay pedido en carrito" });
        }

        if (pedido.detalle_pedido.length === 0) {
            return res.status(400).json({ error: "El pedido no tiene productos" });
        }

        // Calcular el total
        const total = pedido.detalle_pedido.reduce((sum, item) => {
            return sum + (item.cantidad * item.producto.precio);
        }, 0);

        // Crear el registro de pago
        const pago = await prisma.pago.create({
            data: {
                id_pedido: pedido.id_pedido,
                medio,
                numero: parseInt(numero),
                cod_ver: parseInt(cod_ver),
                total,
                fecha: new Date(),
            },
        });

        // Actualizar el estado del pedido
        await prisma.pedido.update({
            where: { id_pedido: pedido.id_pedido },
            data: { 
                estado: "confirmado",
                envio: envio || "pendiente",
                fecha: new Date()
            },
        });

        // Generar el hash del ID del pedido para mostrar al usuario
        const hashedOrderId = hashOrderId(pedido.id_pedido);

        res.status(201).json({ 
            mensaje: "Pago procesado exitosamente", 
            pago: {
                id_pago: pago.id_pago.toString(),
                medio: pago.medio,
                total: pago.total,
                fecha: pago.fecha
            },
            pedido: {
                id_pedido: hashedOrderId,
                estado: "confirmado",
                total: total
            }
        });
    } catch (error) {
        console.error("Error al procesar pago:", error);
        res.status(500).json({ error: "Error al procesar pago" });
    }
};



