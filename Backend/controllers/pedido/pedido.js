import prisma from "../../prismaClient.js";

export const getPedidos = async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            include: {
                detalle_pedido: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        res.json(pedidos);
    }
    catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }                   
};

export const getPedidoById = async (req, res) => {
    const { id_pedido } = req.params;
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
        res.json(pedido);
    }
    catch (error) {
        console.error("Error al obtener pedido por ID:", error);
        res.status(500).json({ error: "Error al obtener pedido por ID" });
    }
};

export const getPedidoByUsuario = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const pedidos = await prisma.pedido.findMany({
            where: { id_usuario: BigInt(id_usuario) },
            include: {
                detalle_pedido: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        res.json(pedidos);
    }
    catch (error) {
        console.error("Error al obtener pedidos por usuario:", error);
        res.status(500).json({ error: "Error al obtener pedidos por usuario" });
    }
};

export const createPedido = async (req, res) => {
    const { id_usuario, envio, productos } = req.body;

    if (!id_usuario || !productos || productos.length === 0) {
        return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
        for (const prod of productos) {
            const producto = await prisma.producto.findUnique({
                where: { id_producto: BigInt(prod.id_producto) }
            });
            
            if (!producto) {
                return res.status(404).json({ error: `Producto ${prod.id_producto} no encontrado` });
            }
            
            if (producto.stock < prod.cantidad) {
                return res.status(400).json({ 
                    error: `Stock insuficiente` 
                });
            }
        }
        const nuevoPedido = await prisma.pedido.create({
            data: {
                id_usuario: BigInt(id_usuario),
                fecha: new Date(),
                estado: "Carrito",
                envio: envio || null,
                detalle_pedido: {
                    create: productos.map(producto => ({
                        id_producto: BigInt(producto.id_producto),
                        cantidad: producto.cantidad,
                    })),
                },

            },
            include: {
                detalle_pedido:{
                    include: {
                        producto: true,
                    },
                },
            },
        });
        res.status(201).json(nuevoPedido);
    }
    catch (error) {
        console.error("Error al crear pedido:", error);
        res.status(500).json({ error: "Error al crear pedido" });
    }   
};

export const addProductoToPedido = async (req, res) => {
    const { id_pedido } = req.params;
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: "Datos inválidos" });
    }
    try {
        const pedido = await prisma.pedido.findUnique({
            where: { id_pedido: BigInt(id_pedido) },
        });
        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        if (pedido.estado !== "Carrito") {
            return res.status(400).json({ error: "Solo se pueden modificar pedidos en estado Carrito" });
        }

        const producto = await prisma.producto.findUnique({
            where: { id_producto: BigInt(id_producto) },
        });
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        const detalleExistente = await prisma.detalle_pedido.findFirst({
            where: {
                id_pedido: BigInt(id_pedido),
                id_producto: BigInt(id_producto),
            },
        });

        if (detalleExistente) {
            const detalleActualizado = await prisma.detalle_pedido.update({
                where: { id_detalle_pedido: detalleExistente.id_detalle_pedido },
                data: { cantidad: detalleExistente.cantidad + cantidad },
            });
            return res.status(200).json(detalleActualizado);
        }

        const nuevoDetalle = await prisma.detalle_pedido.create({
            data: {
                id_pedido: BigInt(id_pedido),
                id_producto: BigInt(id_producto),
                cantidad,
            },
            include: {
                producto: true,
            },
        });
        res.status(201).json(nuevoDetalle);
    } catch (error) {
        console.error("Error al agregar producto al pedido:", error);
        res.status(500).json({ error: "Error al agregar producto al pedido" });
    }
};

export const updateCantidadFromDetallePedido = async (req, res) => {
    const {id_detalle_pedido} = req.params;
    const {cantidad} = req.body;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
        const detalle = await prisma.detalle_pedido.findUnique({
            where: { id_detalle_pedido: BigInt(id_detalle_pedido) },
            include: {
                pedido: true,
                producto: true,
            },
        });
        if (!detalle) {
            return res.status(404).json({ error: "Detalle de pedido no encontrado" });
        }
        if (detalle.pedido.estado !== "Carrito") {
            return res.status(400).json({ error: "Solo se pueden modificar pedidos en estado Carrito" });
        }
        if (detalle.producto.stock < cantidad) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        const detalleActualizado = await prisma.detalle_pedido.update({
            where: { id_detalle_pedido: BigInt(id_detalle_pedido) },
            data: { cantidad },
            include: { producto: true },
        });
        res.status(200).json(detalleActualizado);
    } catch (error) {
        console.error("Error al actualizar producto en carrito:", error);
        res.status(500).json({ error: "Error al actualizar producto en carrito" });
    }
};

export const deleteProductoFromPedido = async (req, res) => {
    const { id_detalle_pedido } = req.params;
    try {
        const detalle = await prisma.detalle_pedido.findUnique({
            where: { id_detalle_pedido: BigInt(id_detalle_pedido) },
            include: {
                pedido: true,
            },
        });
        if (!detalle) {
            return res.status(404).json({ error: "Detalle de pedido no encontrado" });
        }
        if (detalle.pedido.estado !== "Carrito") {
            return res.status(400).json({ error: "Solo se pueden modificar pedidos en estado Carrito" });
        }

        await prisma.detalle_pedido.delete({
            where: { id_detalle_pedido: BigInt(id_detalle_pedido) },
        });
        res.status(200).json({ message: "Producto eliminado del pedido" });
    } catch (error) {
        console.error("Error al eliminar producto del pedido:", error);
        res.status(500).json({ error: "Error al eliminar producto del pedido" });
    }
};

