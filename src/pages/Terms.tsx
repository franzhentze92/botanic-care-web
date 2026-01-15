import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
        <Card className="bg-white border border-gray-200 shadow-lg w-full">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#7d8768] rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-900 font-editorial-new">
              Términos de Servicio
            </CardTitle>
            <p className="text-gray-600 mt-2 font-body">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6 text-gray-700 font-body">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">1. Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar el sitio web de Botanic Care, usted acepta cumplir con estos Términos de Servicio y todas las leyes y regulaciones aplicables.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">2. Uso del Sitio Web</h2>
                <p>
                  Usted se compromete a:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Proporcionar información precisa y completa al registrarse</li>
                  <li>Mantener la seguridad de su cuenta y contraseña</li>
                  <li>No utilizar el sitio para fines ilegales o no autorizados</li>
                  <li>No intentar acceder a áreas restringidas del sitio</li>
                  <li>Respetar los derechos de propiedad intelectual</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">3. Productos y Precios</h2>
                <p>
                  Nos reservamos el derecho de:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Modificar precios en cualquier momento sin previo aviso</li>
                  <li>Limitar la cantidad de productos que puede comprar</li>
                  <li>Rechazar o cancelar pedidos a nuestra discreción</li>
                  <li>Descontinuar productos en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">4. Pagos</h2>
                <p>
                  Todos los pagos deben realizarse mediante los métodos de pago aceptados. Usted garantiza que tiene autorización para utilizar el método de pago proporcionado.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">5. Envíos y Entregas</h2>
                <p>
                  Los tiempos de entrega son estimados y pueden variar. No nos hacemos responsables por retrasos causados por terceros, como servicios de mensajería.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">6. Devoluciones y Reembolsos</h2>
                <p>
                  Nuestra política de devoluciones está disponible en nuestra página de políticas. Los reembolsos se procesarán según los términos establecidos en dicha política.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">7. Propiedad Intelectual</h2>
                <p>
                  Todo el contenido del sitio web, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de Botanic Care y está protegido por leyes de propiedad intelectual.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">8. Limitación de Responsabilidad</h2>
                <p>
                  Botanic Care no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar nuestros productos o servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">9. Modificaciones</h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilda-display">10. Contacto</h2>
                <p>
                  Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
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

export default Terms;

