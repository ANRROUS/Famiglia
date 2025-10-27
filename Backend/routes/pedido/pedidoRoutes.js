import express from "express";
import { 
    addProductoToPedido, 
    createPedido, 
    deleteProductoFromPedido, 
    getPedidoById, 
    getPedidoByUsuario, 
    getPedidos, 
    updateCantidadFromDetallePedido,
    getHistorialPedidos
} from "../../controllers/pedido/pedido.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const pedidoRoutes = express.Router();

pedidoRoutes.get("/", getPedidos);
pedidoRoutes.get("/:id_pedido", getPedidoById);
pedidoRoutes.get("/usuario/:id_usuario", getPedidoByUsuario);

// Ruta protegida para obtener historial del usuario autenticado
pedidoRoutes.get("/historial/mis-pedidos", verifyToken, getHistorialPedidos);

// Gestión del carrito
pedidoRoutes.post("/", createPedido);
pedidoRoutes.post("/:id_pedido", addProductoToPedido);
pedidoRoutes.put("/detalle/:id_detalle_pedido", updateCantidadFromDetallePedido);
pedidoRoutes.delete("/detalle/:id_detalle_pedido", deleteProductoFromPedido);

export default pedidoRoutes;