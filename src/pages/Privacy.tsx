import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
        <Card className="bg-white border border-gray-200 shadow-lg w-full">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#7d8768] rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-900 font-editorial-new">
              Política de Privacidad
            </CardTitle>
            <p className="text-gray-600 mt-2 font-body">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6 text-gray-700 font-body">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">1. Información que Recopilamos</h2>
                <p>
                  En Botanic Care, recopilamos información que usted nos proporciona directamente cuando:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Se registra en nuestro sitio web</li>
                  <li>Realiza una compra</li>
                  <li>Se suscribe a nuestro boletín informativo</li>
                  <li>Se comunica con nosotros</li>
                </ul>
                <p className="mt-4">
                  Esta información puede incluir su nombre, dirección de correo electrónico, dirección postal, número de teléfono y información de pago.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">2. Uso de la Información</h2>
                <p>
                  Utilizamos la información recopilada para:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Procesar y completar sus pedidos</li>
                  <li>Enviarle información sobre productos y servicios</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Comunicarnos con usted sobre su cuenta o pedidos</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">3. Protección de Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">4. Compartir Información</h2>
                <p>
                  No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio</li>
                  <li>Cuando sea requerido por ley</li>
                  <li>Para proteger nuestros derechos y seguridad</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">5. Sus Derechos</h2>
                <p>
                  Usted tiene derecho a:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Acceder a su información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Solicitar la eliminación de sus datos</li>
                  <li>Oponerse al procesamiento de sus datos</li>
                  <li>Retirar su consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">6. Cookies</h2>
                <p>
                  Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">7. Contacto</h2>
                <p>
                  Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> info@botaniccare.com<br />
                  <strong>Teléfono:</strong> +502 57081058
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Privacy;

