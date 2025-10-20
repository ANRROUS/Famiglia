import prisma from "../../prismaClient.js";

export const getCategorias = async (req, res) => {
    try {
        const categorias = await prisma.categoria.findMany();
        res.json(categorias);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};

export const getCategoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await prisma.categoria.findUnique({
            where: { id_categoria: BigInt(id) },
        });
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.json(categoria);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error al obtener categoría" });
    }
};
