import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Heart, 
  Shield, 
  Users, 
  Award, 
  Globe, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Recycle,
  TreePine,
  Flower2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const About: React.FC = () => {
  const values = [
    {
      icon: <img src="/icons/icon1.png" alt="Made in Guatemala" className="h-64 w-64 object-contain" />,
      title: 'Made in Guatemala',
      description: 'Orgullosamente guatemaltecos, creamos productos que representan la riqueza natural de nuestra tierra y apoyan la economía local.'
    },
    {
      icon: <img src="/icons/icon2.png" alt="Cruelty Free" className="h-64 w-64 object-contain" />,
      title: 'Cruelty Free',
      description: 'Nuestros productos nunca se prueban en animales. Creemos en la belleza ética que respeta a todos los seres vivos.'
    },
    {
      icon: <img src="/icons/icon3.png" alt="Natural Ingredients" className="h-64 w-64 object-contain" />,
      title: 'Natural Ingredients',
      description: 'Usamos solo los ingredientes a base de plantas más puros, cuidadosamente obtenidos de granjas sostenibles alrededor del mundo.'
    },
    {
      icon: <img src="/icons/icon4.png" alt="Safe and Sustainable" className="h-64 w-64 object-contain" />,
      title: 'Safe and Sustainable',
      description: 'Cada producto está formulado pensando en la seguridad y la sostenibilidad, usando ingredientes probados y empaques ecológicos.'
    }
  ];


  const commitments = [
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: 'Calidad Garantizada',
      description: 'Cada producto pasa por rigurosos controles de calidad para asegurar su eficacia y seguridad.'
    },
    {
      icon: <Award className="h-8 w-8 text-white" />,
      title: 'Ingredientes Certificados',
      description: 'Trabajamos solo con proveedores certificados que comparten nuestros valores de sostenibilidad.'
    },
    {
      icon: <Leaf className="h-8 w-8 text-white" />,
      title: '100% Natural',
      description: 'Sin parabenos, sulfatos, ni ingredientes sintéticos. Solo lo mejor que la naturaleza ofrece.'
    },
    {
      icon: <Leaf className="h-6 w-6 text-white" />,
      title: 'Libre de Crueldad',
      description: 'Nunca probamos en animales. Todos nuestros productos son cruelty-free certificados.'
    },
    {
      icon: <Globe className="h-8 w-8 text-white" />,
      title: 'Empaques Sostenibles',
      description: 'Comprometidos con el medio ambiente usando materiales reciclables y biodegradables.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      title: 'Personalización',
      description: 'Crea tu producto ideal con nuestro constructor personalizado adaptado a tus necesidades.',
      comingSoon: true
    }
  ];

  

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-[#313522] text-white py-24 md:py-32 overflow-hidden">
          {/* Background decorative elements - enhanced */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-[#7d8768]/30 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <Leaf className="h-5 w-5 text-white/95" />
                  <Sparkles className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium tracking-wide font-gilda-display">Quiénes Somos</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal mb-8 font-editorial-new leading-tight tracking-tight animate-slide-in">
                Sobre Nosotros
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-audrey font-normal mb-8">
                Botanic Care es una marca guatemalteca de productos naturales que combina el poder de la naturaleza y la ciencia creando fórmulas efectivas y respetuosas con el medio ambiente
              </p>
              <div className="flex items-center justify-center gap-6 text-white/80 text-sm font-body flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7d8768]/30 rounded-full">
                  <Leaf className="h-4 w-4" />
                  <span>100% Natural</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#313522]/30 rounded-full">
                  <Leaf className="h-3 w-3" />
                  <span>Libre de Crueldad</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#b9a035]/30 rounded-full">
                  <Globe className="h-4 w-4" />
                  <span>Sostenible</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section - Enhanced */}
        <section className="py-20 bg-white -mt-12 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-8 font-editorial-new leading-tight">Nuestra Misión y Visión</h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed font-body text-justify">
                  En Botanic Care, nuestra misión es ofrecer productos naturales de alta calidad que promuevan el bienestar y la belleza, 
                  fusionando la sabiduría de la naturaleza con avances científicos. Nuestro compromiso es ser responsables con el medio ambiente, 
                  utilizando ingredientes ecofriendly y biodegradables para enriquecer la vida de nuestros clientes.
                </p>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed font-body text-justify">
                  Nuestra visión es llegar a ser reconocidos como líderes en la industria de productos naturales en Guatemala y Latinoamérica, 
                  inspirando a las personas a elegir opciones saludables y sostenibles. Aspiramos a innovar continuamente nuestras fórmulas, 
                  preservar la biodiversidad y educar a nuestros consumidores sobre los beneficios de los productos naturales para un estilo 
                  de vida equilibrado y saludable.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link to="/shop">
                    <Button className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-lg hover:shadow-xl transition-all">
                      <span className="font-gilda-display">Comprar Nuestros Productos</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/blog">
                    <Button variant="outline" className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white transition-all shadow-sm">
                      <span className="font-gilda-display">Leer Nuestro Blog</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Card className="border border-gray-200/60 shadow-xl bg-[#e7b745]">
                  <CardContent className="p-10">
                    <div className="flex justify-center mb-6">
                      <img
                        src="/BC Brand/2. icono-20250730T203031Z-1-001/2. icono/Icono_BotanicCare_Verde Claro.png"
                        alt="Botanic Care Icon"
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-normal text-gray-900 mb-6 font-gilda-display text-center">Nuestra Motivación</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <Flower2 className="h-5 w-5 text-[#7d8768] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Creemos en el poder de los ingredientes naturales guatemaltecos para transformar el cuidado de la piel</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Flower2 className="h-5 w-5 text-[#313522] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Fusionamos la sabiduría ancestral con la innovación científica para crear fórmulas efectivas</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Flower2 className="h-5 w-5 text-[#8e421e] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Promovemos la sostenibilidad y el respeto por el medio ambiente en cada producto</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Flower2 className="h-5 w-5 text-[#b9a035] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Aspiramos a ser líderes en productos naturales en Guatemala y Latinoamérica</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Enhanced */}
        <section className="py-20 bg-gradient-to-b from-white via-[#fafaf9] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 font-editorial-new">Nuestros Valores</h2>
              <p className="text-xl text-gray-600 font-audrey max-w-2xl mx-auto">Los principios que guían todo lo que hacemos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className={`text-center hover:shadow-xl transition-all duration-500 border border-gray-200/60 hover:-translate-y-2 ${
                    index % 4 === 0 ? 'bg-[#698ba9]' :
                    index % 4 === 1 ? 'bg-[#587e52]' :
                    index % 4 === 2 ? 'bg-[#cc8f47]' :
                    'bg-[#9d627b]'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0 pb-8 px-8">
                    <div className="flex flex-col items-center -mt-8">
                      <div className="mb-0 hover:scale-110 transition-transform duration-300">
                        {value.icon}
                      </div>
                    </div>
                    <p className="text-white/90 leading-relaxed font-body text-center -mt-6">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section - Enhanced */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 font-editorial-new">Nuestro Equipo</h2>
              <p className="text-xl text-gray-600 font-audrey max-w-2xl mx-auto">La pasión y visión detrás de Botanic Care</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Ana Cristina Hentze */}
              <Card className="border border-gray-200/60 shadow-xl bg-white hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col items-center text-center">
                    {/* Team Member Image */}
                    <div className="mb-8 relative">
                      <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#7d8768]/20 shadow-2xl bg-[#7d8768]/10">
                        <img 
                          src="/ana_cristina.png" 
                          alt="Ana Cristina Hentze Movil - Fundadora de Botanic Care"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EFoto%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>

                    {/* Team Member Info */}
                    <h3 className="text-3xl md:text-4xl font-normal text-gray-900 mb-3 font-editorial-new">Ana Cristina Hentze Movil</h3>
                    <p className="text-xl text-[#7d8768] font-normal font-audrey">Fundadora y Creadora</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pablo Mendez */}
              <Card className="border border-gray-200/60 shadow-xl bg-white hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col items-center text-center">
                    {/* Team Member Image */}
                    <div className="mb-8 relative">
                      <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#313522]/20 shadow-2xl bg-[#313522]/10">
                        <img 
                          src="/pablo_mendez.jpg" 
                          alt="Pablo Mendez - Equipo Botanic Care"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EFoto%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>

                    {/* Team Member Info */}
                    <h3 className="text-3xl md:text-4xl font-normal text-gray-900 mb-3 font-editorial-new">Pablo Mendez</h3>
                    <p className="text-xl text-[#313522] font-normal font-audrey">Co-Fundador</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default About; 