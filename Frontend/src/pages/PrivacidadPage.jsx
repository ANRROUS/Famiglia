import React from 'react';

const PrivacidadPage = () => {
  return (
    <div className="max-w-3xl mx-auto font-['Montserrat'] text-[#4a2b2b]">
      <p>
        En <strong>Pastelería Famiglia</strong>, respetamos su privacidad y protegemos su información personal de acuerdo con la normativa vigente.
      </p>
      <ul className="list-disc pl-5 mt-4 space-y-2">
        <li>Recopilamos datos como nombre, correo electrónico, teléfono y dirección únicamente para procesar pedidos y mejorar nuestro servicio.</li>
        <li>No compartimos su información con terceros, excepto con servicios necesarios para el procesamiento del pago o la entrega.</li>
        <li>Puede solicitar la eliminación de sus datos personales enviando un correo a <strong>soporte@famiglia.pe</strong>.</li>
        <li>Utilizamos cookies para mejorar su experiencia de navegación y ofrecerle contenido personalizado.</li>
        <li>Su información es almacenada de forma segura y cifrada.</li>
      </ul>
      <p className="mt-6">
        Al usar nuestra tienda en línea, usted acepta esta política y nos autoriza a utilizar sus datos de acuerdo con ella.
      </p>
    </div>
  );
};

export default PrivacidadPage;
