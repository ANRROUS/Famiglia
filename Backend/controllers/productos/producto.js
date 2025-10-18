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