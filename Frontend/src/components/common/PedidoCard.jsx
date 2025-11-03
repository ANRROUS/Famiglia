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
      className="bg-white rounded-2xl shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => onSelect?.(pedido)}
    >
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Pedido #{pedido.id_pedido}
          </h3>
          <p className="text-sm text-gray-600">
            Usuario: {pedido.usuario?.nombre || "Sin usuario"}
          </p>
          <p className="text-sm text-gray-500">{fecha}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full text-center ${
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

      {/* Tabla de productos */}
      <div className="overflow-x-auto border-t border-gray-200 pt-2">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-1">Producto</th>
              <th className="py-1 text-center">Cant.</th>
              <th className="py-1 text-center">Precio</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.detalle_pedido?.slice(0, 3).map((d) => (
              <tr key={d.id_detalle_pedido} className="border-b last:border-0">
                <td className="py-1 pr-2 break-words max-w-[150px]">
                  {d.producto?.nombre}
                </td>
                <td className="py-1 text-center">{d.cantidad}</td>
                <td className="py-1 text-center">
                  S/.{d.producto?.precio?.toFixed(2) ?? "0.00"}
                </td>
                <td className="py-1 text-right">
                  S/.{(d.cantidad * (d.producto?.precio ?? 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pedido.detalle_pedido?.length > 3 && (
          <p className="text-xs text-gray-500 italic mt-1">
            + {pedido.detalle_pedido.length - 3} productos más...
          </p>
        )}
      </div>

      {/* Total y pago */}
      <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
        <span className="font-semibold text-gray-800">
          Total: S/.{total?.toFixed(2)}
        </span>
        {pedido.pago?.[0] && (
          <span className="text-sm text-gray-600">
            Pago: {pedido.pago[0].medio || "Desconocido"}
          </span>
        )}
      </div>
    </div>
  );
}
