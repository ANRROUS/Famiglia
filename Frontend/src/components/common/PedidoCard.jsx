import React from "react";

export default function PedidoCard({ pedido, onSelect }) {
  if (!pedido) return null;

  const total = pedido.detalle_pedido?.reduce(
    (sum, d) => sum + (d.cantidad * (d.producto?.precio ?? 0)),
    0
  );

  const fecha = pedido.fecha
    ? new Date(pedido.fecha).toLocaleDateString("es-PE")
    : "Sin fecha";

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition"
      onClick={() => onSelect?.(pedido)}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Pedido #{pedido.id_pedido}
          </h3>
          <p className="text-sm text-gray-500">{fecha}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            pedido.estado === "Entregado"
              ? "bg-green-100 text-green-700"
              : pedido.estado === "Reservado"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {pedido.estado || "Desconocido"}
        </span>
      </div>

      <div className="border-t border-gray-200 pt-3">
        {pedido.detalle_pedido?.slice(0, 2).map((d) => (
          <div key={d.id_detalle_pedido} className="flex items-center gap-3 mb-2">
            <img
              src={d.producto?.url_imagen || "/images/placeholder-product.jpg"}
              alt={d.producto?.nombre}
              className="w-14 h-14 object-cover rounded-md"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{d.producto?.nombre}</p>
              <p className="text-xs text-gray-500">
                Cantidad: {d.cantidad} × S/.{d.producto?.precio ?? 0}
              </p>
            </div>
          </div>
        ))}
        {pedido.detalle_pedido?.length > 2 && (
          <p className="text-xs text-gray-500 italic">
            + {pedido.detalle_pedido.length - 2} productos más...
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <span className="text-gray-700 font-semibold">Total: S/.{total?.toFixed(2)}</span>
        {pedido.pago?.[0] && (
          <span className="text-sm text-gray-500">
            Pago: {pedido.pago[0].medio || "Desconocido"}
          </span>
        )}
      </div>
    </div>
  );
}
