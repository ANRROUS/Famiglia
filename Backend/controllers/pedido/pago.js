import prisma from "../../prismaClient.js";

export const procesarPago = async (req, res) => {
    const { id_pedido} = req.params;
    const {medio,numero,cod_ver,envio} = req.body;

    if (!medio || !numero || !cod_ver ) {
        return res.status(400).json({ error: "Datos de pago incompletos" });
    }
    try {
        const pedido = await prisma.pedido.findUnique({
            where: { id_pedido: BigInt(id_pedido) },
            include: {
                detalle_pedido: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }   
        if (pedido.estado !== "Carrito") {
            return res.status(400).json({ error: "El pedido ya ha sido procesado" });
        }
        if (pedido.detalle_pedido.length === 0) {
            return res.status(400).json({ error: "El pedido no tiene productos" });
        }  
        const total = pedido.detalle_pedido.reduce((sum, item) => {
            return sum + (item.cantidad * item.producto.precio);
        }, 0);
        const pago = await prisma.pago.create({
            data: {
                id_pedido: BigInt(id_pedido),
                medio,
                numero,
                cod_ver,
                total,
                fecha: new Date(),
            },
        });
        await prisma.pedido.update({
            where: { id_pedido: BigInt(id_pedido) },
            data: { estado: "Pagado", envio: envio || null },
        });
        res.status(201).json({ mensaje: "Pago procesado exitosamente", pago });
    } catch (error) {
        console.error("Error al procesar pago:", error);
        res.status(500).json({ error: "Error al procesar pago" });
    }
};



