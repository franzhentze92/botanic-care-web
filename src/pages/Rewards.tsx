import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout,
  Star,
  Gift,
  Award,
  CheckCircle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Leaf,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const Rewards: React.FC = () => {
  const benefits = [
    {
      icon: <Star className="h-8 w-8 text-white" />,
      title: 'Puntos por Compra',
      description: 'Gana puntos con cada compra. Por cada Q.10 gastado, obtienes 1 punto.',
      color: 'bg-[#7d8768]'
    },
    {
      icon: <Gift className="h-8 w-8 text-white" />,
      title: 'Descuentos Exclusivos',
      description: 'Accede a descuentos especiales y ofertas exclusivas solo para miembros.',
      color: 'bg-[#8e421e]'
    },
    {
      icon: <Award className="h-8 w-8 text-white" />,
      title: 'Recompensas de Cumpleaños',
      description: 'Recibe puntos extra en tu cumpleaños y celebra con nosotros.',
      color: 'bg-[#b9a035]'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      title: 'Niveles de Membresía',
      description: 'Desbloquea niveles superiores con más beneficios y recompensas.',
      color: 'bg-[#313522]'
    }
  ];

  const tiers = [
    {
      name: 'Nuevo',
      points: '0 - 99',
      benefits: [
        '1 punto por Q.10 gastado',
        'Acceso a ofertas especiales',
        'Newsletter exclusivo'
      ],
      color: 'bg-[#7d8768]'
    },
    {
      name: 'Plata',
      points: '100 - 499',
      benefits: [
        '1.5 puntos por Q.10 gastado',
        '5% de descuento en todas las compras',
        'Envío gratis en compras mayores a Q.75',
        'Acceso anticipado a nuevos productos'
      ],
      color: 'bg-[#8e421e]'
    },
    {
      name: 'Oro',
      points: '500 - 999',
      benefits: [
        '2 puntos por Q.10 gastado',
        '10% de descuento en todas las compras',
        'Envío gratis en todas las compras',
        'Acceso exclusivo a eventos',
        'Productos de muestra gratis'
      ],
      color: 'bg-[#b9a035]'
    },
    {
      name: 'Platino',
      points: '1000+',
      benefits: [
        '2.5 puntos por Q.10 gastado',
        '15% de descuento en todas las compras',
        'Envío gratis prioritario',
        'Asesor personal de cuidado',
        'Acceso VIP a lanzamientos',
        'Productos personalizados gratis'
      ],
      color: 'bg-[#313522]'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#7d8768] text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 shadow-lg">
                <Sprout className="h-5 w-5" />
                <span className="font-medium font-gilda-display">Programa de Recompensas</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight font-editorial-new drop-shadow-lg">
                Botanic Care Rewards
              </h1>
              <p className="text-xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed font-audrey drop-shadow-md">
                Únete a nuestro programa de fidelidad y obtén recompensas increíbles por cada compra. 
                Gana puntos, desbloquea niveles y disfruta de beneficios exclusivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-white text-[#7d8768] hover:bg-gray-50 px-8 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link to="/shop">
                    Comenzar a Comprar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#7d8768] bg-transparent px-8 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link to="/register">
                    Crear Cuenta
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-6 px-5 py-2.5 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                <Sparkles className="h-4 w-4 text-[#7d8768] mr-2" />
                <span className="text-sm font-medium text-[#7d8768] font-gilda-display">Beneficios Exclusivos</span>
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                ¿Por Qué Unirte?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">
                Disfruta de beneficios únicos diseñados para recompensar tu lealtad
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-editorial-new">{benefit.title}</h3>
                    <p className="text-gray-600 font-body leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers Section */}
        <section className="py-24 bg-[#7d8768]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-6 px-5 py-2.5 bg-[#313522]/10 rounded-full border border-[#313522]/20">
                <Award className="h-4 w-4 text-[#313522] mr-2" />
                <span className="text-sm font-medium text-[#313522] font-gilda-display">Niveles de Membresía</span>
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                Desbloquea Niveles Superiores
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">
                Mientras más compras, más beneficios obtienes. Sube de nivel y disfruta de ventajas exclusivas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <Card key={index} className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`${tier.color} text-white px-4 py-2 rounded-full inline-block mb-4`}>
                      <span className="font-bold font-gilda-display">{tier.name}</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 font-body mb-1">Puntos Requeridos</p>
                      <p className="text-2xl font-bold text-gray-900 font-editorial-new">{tier.points}</p>
                    </div>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-[#7d8768] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 font-body">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-6 px-5 py-2.5 bg-[#b9a035]/10 rounded-full border border-[#b9a035]/20">
                <ShoppingBag className="h-4 w-4 text-[#b9a035] mr-2" />
                <span className="text-sm font-medium text-[#b9a035] font-gilda-display">Cómo Funciona</span>
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                Comienza a Ganar Puntos Hoy
              </h2>
            </div>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#7d8768] text-white rounded-full flex items-center justify-center font-bold text-xl font-editorial-new">1</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Únete Gratis</h3>
                  <p className="text-gray-600 font-body leading-relaxed">
                    Crea una cuenta en Botanic Care y automáticamente te unes al programa de recompensas. No hay costo adicional.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#8e421e] text-white rounded-full flex items-center justify-center font-bold text-xl font-editorial-new">2</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Compra y Gana</h3>
                  <p className="text-gray-600 font-body leading-relaxed">
                    Cada compra te otorga puntos según tu nivel. Por cada Q.10 gastado, obtienes 1 punto. Los puntos se acumulan automáticamente en tu cuenta y puedes verlos en tu panel de usuario.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#b9a035] text-white rounded-full flex items-center justify-center font-bold text-xl font-editorial-new">3</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Sube de Nivel</h3>
                  <p className="text-gray-600 font-body leading-relaxed">
                    A medida que acumulas puntos, desbloqueas nuevos niveles con beneficios cada vez mejores.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#313522] text-white rounded-full flex items-center justify-center font-bold text-xl font-editorial-new">4</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Disfruta las Recompensas</h3>
                  <p className="text-gray-600 font-body leading-relaxed">
                    Usa tus puntos para obtener descuentos, productos gratis y acceder a beneficios exclusivos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Points Section */}
        <section className="py-24 bg-[#b9a035]/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-6 px-5 py-2.5 bg-[#8e421e]/10 rounded-full border border-[#8e421e]/20">
                <Gift className="h-4 w-4 text-[#8e421e] mr-2" />
                <span className="text-sm font-medium text-[#8e421e] font-gilda-display">Canjea tus Puntos</span>
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                ¿Cómo Usar tus Puntos?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">
                Tus puntos se acumulan automáticamente y puedes canjearlos por descuentos en tus compras
              </p>
            </div>
            <Card className="border border-gray-200 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#7d8768] rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Ver tus Puntos</h3>
                      <p className="text-gray-600 font-body leading-relaxed mb-4">
                        Puedes ver tus puntos acumulados en cualquier momento ingresando a tu cuenta. En tu panel de usuario encontrarás el saldo actual de puntos disponibles.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6"></div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#8e421e] rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Canjear Puntos</h3>
                      <p className="text-gray-600 font-body leading-relaxed mb-4">
                        <span className="font-semibold text-gray-900">100 puntos = Q.50 de descuento</span>
                      </p>
                      <p className="text-gray-600 font-body leading-relaxed mb-4">
                        Al momento de realizar tu compra, puedes elegir usar tus puntos acumulados. Por cada 100 puntos canjeados, recibirás Q.50 de descuento en tu compra total.
                      </p>
                      <div className="bg-[#7d8768]/10 border border-[#7d8768]/20 rounded-lg p-4 mt-4">
                        <p className="text-sm text-gray-700 font-body">
                          <strong className="font-semibold">Ejemplo:</strong> Si tienes 250 puntos acumulados, puedes canjear 150 puntos y recibir Q.75 de descuento, dejando 100 puntos en tu cuenta para futuras compras.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6"></div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#b9a035] rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-editorial-new">Usar Puntos en el Checkout</h3>
                      <p className="text-gray-600 font-body leading-relaxed">
                        Durante el proceso de checkout, verás una opción para usar tus puntos. Simplemente selecciona la cantidad de puntos que deseas canjear y el descuento se aplicará automáticamente a tu compra.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#313522] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-8 left-8 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Badge className="mb-6 px-5 py-2.5 bg-[#7d8768]/30 backdrop-blur-sm text-white border border-white/20">
              <Heart className="h-4 w-4 mr-2" />
              <span className="font-medium font-gilda-display">Únete Ahora</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-editorial-new">
              ¿Listo para Empezar?
            </h2>
            <p className="text-xl text-white/95 mb-10 max-w-2xl mx-auto font-audrey leading-relaxed">
              Únete a miles de clientes que ya están disfrutando de recompensas increíbles
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-[#b9a035] text-white hover:bg-[#a8902f] px-10 py-6 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link to="/register">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white bg-transparent px-10 py-6 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link to="/shop">
                  Ver Tienda
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Rewards;

