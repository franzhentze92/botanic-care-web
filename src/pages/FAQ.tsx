import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  Leaf,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';
import Layout from '@/components/Layout';

const FAQ: React.FC = () => {
  const faqCategories = [
    {
      title: 'Información de Productos',
      icon: <Leaf className="h-5 w-5" />,
      questions: [
        {
          question: '¿Todos sus productos son 100% naturales?',
          answer: '¡Sí! Todos los productos de Botanic Care están hechos con ingredientes 100% naturales. Nunca usamos productos químicos sintéticos, parabenos, sulfatos o fragancias artificiales. Cada ingrediente se obtiene cuidadosamente de granjas y proveedores sostenibles.'
        },
        {
          question: '¿Cómo sé qué productos son adecuados para mi tipo de piel?',
          answer: 'Recomendamos tomar nuestro cuestionario de tipo de piel o consultar con nuestro equipo de atención al cliente. También puedes usar nuestro constructor de cremas personalizadas para crear una formulación personalizada basada en tus preocupaciones específicas de la piel y preferencias.'
        },
        {
          question: '¿Sus productos son adecuados para piel sensible?',
          answer: 'La mayoría de nuestros productos están formulados para ser suaves y adecuados para piel sensible. Sin embargo, siempre recomendamos hacer una prueba de parche antes de usar cualquier producto nuevo. Si tienes sensibilidades específicas, por favor revisa la lista de ingredientes o contacta a nuestro equipo para recomendaciones personalizadas.'
        },
        {
          question: '¿Hacen pruebas en animales?',
          answer: '¡Absolutamente no! Estamos orgullosos de ser una marca libre de crueldad animal. Todos nuestros productos se prueban en voluntarios humanos en estudios clínicos controlados, nunca en animales. Estamos certificados por Leaping Bunny y PETA.'
        },
        {
          question: '¿Cuál es la vida útil de sus productos?',
          answer: 'Nuestros productos típicamente tienen una vida útil de 12-24 meses cuando se almacenan correctamente en un lugar fresco y seco, lejos de la luz solar directa. Cada producto está claramente etiquetado con una fecha de vencimiento. Recomendamos usar productos abiertos dentro de 6-12 meses para mejores resultados.'
        }
      ]
    },
    {
      title: 'Pedidos y Envíos',
      icon: <Truck className="h-5 w-5" />,
      questions: [
        {
          question: '¿Cuánto tiempo tarda el envío?',
          answer: 'El envío estándar toma 3-5 días hábiles dentro de los Estados Unidos continentales. El envío express (1-2 días hábiles) está disponible por una tarifa adicional. El envío internacional típicamente toma 7-14 días hábiles dependiendo del destino.'
        },
        {
          question: '¿Ofrecen envío gratuito?',
          answer: '¡Sí! Ofrecemos envío estándar gratuito en todos los pedidos superiores a Q. 50. Para pedidos menores a Q. 50, el envío estándar es Q. 5.99. También ofrecemos opciones de envío express para entrega más rápida.'
        },
        {
          question: '¿Puedo rastrear mi pedido?',
          answer: '¡Absolutamente! Una vez que tu pedido se envíe, recibirás un correo electrónico de confirmación con información de seguimiento. También puedes rastrear tu pedido a través del panel de tu cuenta en nuestro sitio web.'
        },
        {
          question: '¿Envían internacionalmente?',
          answer: 'Sí, enviamos a la mayoría de países del mundo. Las tarifas de envío internacional y los tiempos de entrega varían según la ubicación. Ten en cuenta que los clientes son responsables de cualquier arancel aduanero o impuesto que pueda aplicarse.'
        },
        {
          question: '¿Qué pasa si mi paquete llega dañado?',
          answer: 'Si tu paquete llega dañado, por favor toma fotos y contacta a nuestro equipo de atención al cliente dentro de las 48 horas posteriores a la entrega. Organizaremos un reemplazo o reembolso sin costo para ti.'
        }
      ]
    },
    {
      title: 'Devoluciones y Reembolsos',
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: '¿Cuál es su política de devoluciones?',
          answer: 'Ofrecemos una garantía de satisfacción de 30 días. Si no estás completamente satisfecho con tu compra, puedes devolverla para un reembolso completo o intercambio dentro de los 30 días posteriores a la entrega. Los productos deben estar sin usar y en su empaque original.'
        },
        {
          question: '¿Cómo devuelvo un producto?',
          answer: 'Para devolver un producto, por favor contacta a nuestro equipo de atención al cliente con tu número de pedido y razón de la devolución. Te proporcionaremos una etiqueta de envío de devolución prepagada. Una vez que recibamos tu devolución, procesaremos tu reembolso dentro de 3-5 días hábiles.'
        },
        {
          question: '¿Hay productos que no se pueden devolver?',
          answer: 'Por razones de higiene, no podemos aceptar devoluciones de productos de cuidado personal abiertos. Sin embargo, si experimentas una reacción alérgica o el producto está defectuoso, haremos una excepción y proporcionaremos un reembolso completo.'
        },
        {
          question: '¿Cuánto tiempo toma procesar un reembolso?',
          answer: 'Los reembolsos típicamente se procesan dentro de 3-5 días hábiles después de recibir tu devolución. El tiempo que toma para que el reembolso aparezca en tu cuenta depende de tu banco o proveedor de tarjeta de crédito, generalmente 5-10 días hábiles.'
        }
      ]
    },
    {
      title: 'Pagos y Seguridad',
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          question: '¿Qué métodos de pago aceptan?',
          answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay y Google Pay. Todos los pagos se procesan de forma segura a través de nuestro sistema de pago encriptado.'
        },
        {
          question: '¿Mi información de pago está segura?',
          answer: '¡Sí, absolutamente! Usamos encriptación SSL de estándar industrial para proteger tu información de pago. Nunca almacenamos los detalles de tu tarjeta de crédito en nuestros servidores. Todas las transacciones se procesan a través de pasarelas de pago seguras y compatibles con PCI.'
        },
        {
          question: '¿Ofrecen planes de pago?',
          answer: '¡Sí! Ofrecemos planes de pago Klarna y Afterpay para pedidos superiores a Q. 35. Esto te permite dividir tu compra en 4 pagos sin intereses. La opción aparecerá en el checkout si calificas.'
        },
        {
          question: '¿Puedo guardar mi información de pago para pedidos futuros?',
          answer: 'Sí, puedes guardar tu información de pago de forma segura en tu cuenta para un checkout más rápido en pedidos futuros. Esta información está encriptada y almacenada según estrictos estándares de seguridad.'
        }
      ]
    },
    {
      title: 'Atención al Cliente',
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        {
          question: '¿Cómo puedo contactar al servicio al cliente?',
          answer: 'Puedes contactar a nuestro equipo de atención al cliente a través de múltiples canales: Chat en vivo en nuestro sitio web (disponible 24/7), correo electrónico a hello@botaniccare.com, o teléfono al 1-800-BOTANIC (Lun-Vie 9AM-6PM EST). Típicamente respondemos dentro de 2-4 horas.'
        },
        {
          question: '¿Ofrecen consultas de productos?',
          answer: '¡Sí! Nuestros expertos en cuidado de la piel están disponibles para consultas gratuitas para ayudarte a encontrar los productos perfectos para tu tipo de piel y preocupaciones. Puedes reservar una consulta a través de nuestro sitio web o contactar al servicio al cliente.'
        },
        {
          question: '¿Puedo obtener muestras antes de comprar?',
          answer: 'Ofrecemos tamaños de muestra de muchos de nuestros productos, y puedes solicitar muestras con tu pedido. También tenemos un programa de muestras donde puedes probar productos antes de comprometerte con compras de tamaño completo.'
        },
        {
          question: '¿Tienen un programa de lealtad?',
          answer: '¡Sí! Nuestro programa Botanic Care Rewards te permite ganar puntos en cada compra. Los puntos se pueden canjear por descuentos en pedidos futuros, productos gratuitos y ofertas exclusivas. El registro es gratuito y automático con tu primera compra.'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Contáctanos', href: '/contact', icon: <Mail className="h-4 w-4" /> },
    { title: 'Chat en Vivo', href: '#', icon: <MessageCircle className="h-4 w-4" /> },
    { title: 'Llámanos', href: 'tel:1-800-BOTANIC', icon: <Phone className="h-4 w-4" /> },
    { title: 'Rastrear Pedido', href: '#', icon: <Truck className="h-4 w-4" /> }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#7d8768]/10 via-[#9d627b]/10 to-[#7a7539]/10 py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#7d8768]/20 to-[#9d627b]/20 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#7a7539]/20 to-[#9d627b]/20 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-[#7d8768] to-[#9d627b] text-white border-0 px-4 py-2">
              ❓ Preguntas Frecuentes
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
              ¿Cómo Podemos <span className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] bg-clip-text text-transparent">Ayudarte?</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-audrey">
              Encuentra respuestas a preguntas comunes sobre nuestros productos, envíos, devoluciones y más. 
              ¿No encuentras lo que buscas? ¡Nuestro equipo de atención al cliente está aquí para ayudarte!
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar en nuestras FAQ..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7d8768] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Links Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-gilda-display">Ayuda Rápida</h3>
              <div className="space-y-3">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#7d8768]/10 hover:to-[#9d627b]/10 transition-all duration-300"
                  >
                    {link.icon}
                    <span className="text-sm font-medium text-gray-700">{link.title}</span>
                  </a>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 font-gilda-display">¿Necesitas Más Ayuda?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier pregunta o inquietud.
                </p>
                <Button className="w-full bg-gradient-to-r from-[#7d8768] to-[#9d627b] hover:from-[#7a7539] hover:to-[#9d627b] text-white">
                  Contactar Soporte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#7d8768] to-[#9d627b] rounded-xl flex items-center justify-center text-white shadow-lg">
                        {category.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 font-editorial-new">{category.title}</h2>
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-4">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem 
                          key={faqIndex} 
                          value={`item-${categoryIndex}-${faqIndex}`}
                          className="border border-gray-200 rounded-xl px-6 hover:border-[#7d8768] transition-all duration-300"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-4">
                            <span className="font-medium text-gray-900 text-lg">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Still Need Help Section */}
            <Card className="mt-12 bg-gradient-to-r from-[#7d8768]/10 via-[#9d627b]/10 to-[#7a7539]/10 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">¿Aún Necesitas Ayuda?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto font-audrey">
                  ¿No encuentras la respuesta que buscas? Nuestro amigable equipo de atención al cliente 
                  está aquí para ayudarte con cualquier pregunta o inquietud.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] hover:from-[#7a7539] hover:to-[#9d627b] text-white">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Iniciar Chat en Vivo
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768]/10">
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar Correo
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#9d627b] text-[#9d627b] hover:bg-[#9d627b]/10">
                    <Phone className="mr-2 h-5 w-5" />
                    Llamarnos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ; 