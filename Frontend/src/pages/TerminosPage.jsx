import React from 'react';

const TerminosPage = () => {
  return (
    <div className="max-w-3xl mx-auto font-['Montserrat'] text-[#4a2b2b]">
      <p>
        Bienvenido a <strong>Pastelería Famiglia</strong>. Al realizar una compra en
        nuestro sitio web, usted acepta los siguientes términos:
      </p>
      <ul className="list-disc pl-5 mt-4 space-y-2">
        <li>Todos los precios incluyen impuestos y pueden variar sin previo aviso.</li>
        <li>Los pedidos deben realizarse con al menos 24 horas de anticipación para productos personalizados.</li>
        <li>Los pagos se procesan de manera segura a través de nuestras pasarelas autorizadas.</li>
        <li>No se aceptan devoluciones en productos alimenticios una vez entregados, salvo en casos de error comprobable por parte de la empresa.</li>
        <li>Pastelería Famiglia se reserva el derecho de cancelar pedidos en caso de fraude o información incorrecta.</li>
      </ul>
      <p className="mt-6">
        Gracias por confiar en nosotros. Nos esforzamos por ofrecerle siempre productos frescos y de la más alta calidad.
      </p>
    </div>
  );
};

export default TerminosPage;
