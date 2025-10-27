import prisma from '../../prismaClient.js';

export const getProductos = async (req, res) => {
    try {
        const productos = await prisma.producto.findMany();
        res.json(productos);
        
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

export const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await prisma.producto.findUnique({
            where: { id_producto: BigInt(id) },
        });
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ error: "Error al obtener producto" });
    }
};

export const getProductosByCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.params;
        const productos = await prisma.producto.findMany({
            where: { id_categoria: BigInt(id_categoria) },
        });
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos por categoría:", error);
        res.status(500).json({ error: "Error al obtener productos por categoría" });
    }
};


