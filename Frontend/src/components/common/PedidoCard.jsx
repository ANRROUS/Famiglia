import { Button } from "@mui/material";
import crypto from "crypto-js";

const ESTADO_CONFIG = {
  confirmado: {
    label: "Reservado",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
  },
  entregado: {
    label: "Entregado",
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
  },
  cancelado: {
    label: "Cancelado",
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
  },
  carrito: {
    label: "En carrito",
    badge: "bg-gray-200 text-gray-600",
    border: "border-gray-200",
  },
};

const ACTION_STYLES = {
  success: {
    backgroundColor: "#8b3e3e",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#6b2c2c" },
    "&.Mui-disabled": {
      backgroundColor: "#d8b6a4",
      color: "#f9f5f2",
    },
  },
  error: {
    backgroundColor: "#b85c5c",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#9c4c4c" },
    "&.Mui-disabled": {
      backgroundColor: "#e2b9b9",
      color: "#fdf8f6",
    },
  },
  warning: {
    backgroundColor: "#b17b6b",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#9c4c4c" },
    "&.Mui-disabled": {
      backgroundColor: "#e3cbc1",
      color: "#fdf8f6",
    },
  },
};

const hashFallback = (id) => {
  const hash = crypto.SHA256(id.toString()).toString();
  return `SA-${hash.substring(0, 8).toUpperCase()}`;
};

export default function PedidoCard({ pedido, actions = [], onAction, isUpdating = false }) {
  if (!pedido) {
    return null;
  }

  const total = pedido.detalle_pedido?.reduce(
    (sum, detalle) => sum + detalle.cantidad * (detalle.producto?.precio ?? 0),
    0
  ) ?? 0;

  const fecha = pedido.fecha
    ? new Date(pedido.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin fecha";

  const estadoClave = (pedido.estado || "").toLowerCase();
  const estadoConfig = ESTADO_CONFIG[estadoClave] || ESTADO_CONFIG.carrito;
  const codigo = pedido.codigo || hashFallback(pedido.id_pedido);

  return (
    <div
      className={`bg-white border ${estadoConfig.border} rounded-2xl shadow-sm p-5 transition-all`}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Pedido #{codigo}
          </h3>
          <p className="text-sm text-gray-600">
            Cliente: {pedido.usuario?.nombre || "Sin usuario"}
          </p>
          <p className="text-sm text-gray-500">{fecha}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full ${estadoConfig.badge}`}>
          {estadoConfig.label}
        </span>
      </div>

      <div className="overflow-x-auto border-t border-gray-200 mt-3 pt-3">
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
            {pedido.detalle_pedido?.slice(0, 4).map((detalle) => (
              <tr key={detalle.id_detalle_pedido} className="border-b last:border-0">
                <td className="py-2 pr-2 break-words max-w-[220px]">
                  {detalle.producto?.nombre || 'Producto eliminado'}
                </td>
                <td className="py-2 text-center">{detalle.cantidad}</td>
                <td className="py-2 text-center">
                  S/.{detalle.producto?.precio?.toFixed(2) ?? '0.00'}
                </td>
                <td className="py-2 text-right">
                  S/.{(detalle.cantidad * (detalle.producto?.precio ?? 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pedido.detalle_pedido?.length > 4 && (
          <p className="text-xs text-gray-500 italic mt-1">
            + {pedido.detalle_pedido.length - 4} productos adicionales
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
        <span className="text-base font-semibold text-gray-800">
          Total: S/.{total.toFixed(2)}
        </span>
        {pedido.pago?.[0] && (
          <span className="text-sm text-gray-500">
            Pago: {pedido.pago[0].medio || 'Sin medio registrado'}
          </span>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {actions.map(({ label, nextEstado, color }) => (
            <Button
              key={nextEstado}
              onClick={() => onAction?.(nextEstado)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '999px',
                px: 3,
                py: 1,
                ...ACTION_STYLES[color] || ACTION_STYLES.success,
              }}
              disabled={isUpdating}
            >
              {isUpdating ? 'Actualizando...' : label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
