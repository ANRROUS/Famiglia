import express from "express";
import { 
    addProductoToPedido, 
    createPedido, 
    deleteProductoFromPedido, 
    getPedidoById, 
    getPedidoByUsuario, 
    getPedidos, 
    updateCantidadFromDetallePedido 
} from "../../controllers/pedido/pedido.js";
const pedidoRoutes = express.Router();
pedidoRoutes.get("/", getPedidos);
pedidoRoutes.get("/:id_pedido", getPedidoById);
pedidoRoutes.get("/usuario/:id_usuario", getPedidoByUsuario);
// Gestión del carrito
pedidoRoutes.post("/", createPedido);
pedidoRoutes.post("/:id_pedido", addProductoToPedido);
pedidoRoutes.put("/detalle/:id_detalle_pedido", updateCantidadFromDetallePedido);
pedidoRoutes.delete("/detalle/:id_detalle_pedido", deleteProductoFromPedido);

export default pedidoRoutes;