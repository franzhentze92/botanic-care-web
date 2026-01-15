import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  ShoppingCart, 
  Heart,
  Leaf,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Award,
  Globe,
  Users,
  TrendingUp,
  Clock,
  Truck,
  Package,
  Gift,
  Loader2
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useProducts } from '@/hooks/useProducts';
import { useActiveProductCategories } from '@/hooks/useProductCategories';
import { useCart } from '@/contexts/CartContext';
import { ProductUI } from '@/types/product';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data: storeSettings } = useStoreSettings();
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 50;
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  
  // Fetch products from database
  const { data: allProducts = [], isLoading: isLoadingProducts } = useProducts({});
  
  // Fetch active product categories from database
  const { data: productCategories = [], isLoading: isLoadingCategories } = useActiveProductCategories();
  
  // Get featured products (first 4 products that are in stock, or all available if less than 4)
  const featuredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    // Filter in stock products and take first 4
    return allProducts.filter(p => p.inStock).slice(0, 4);
  }, [allProducts]);

  const handleWishlistToggle = (product: ProductUI) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Map product categories from database to the format expected by the component
  const categories = useMemo(() => {
    return productCategories.map(cat => ({
      name: cat.name,
      image: cat.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
      href: `/shop?category=${cat.id}`,
      color: 'bg-[#7d8768]/10',
      description: cat.description || 'Productos naturales'
    }));
  }, [productCategories]);

  const benefits = [
    {
      icon: <Leaf className="h-8 w-8 text-white" />,
      title: '100% Natural',
      description: 'Ingredientes a base de plantas puros sin químicos dañinos',
      color: 'bg-[#7d8768]'
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: 'Libre de Crueldad',
      description: 'Nunca probado en animales, siempre probado en humanos',
      color: 'bg-[#313522]'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      title: 'Formulaciones Personalizadas',
      description: 'Crea tu cuidado de la piel perfecto con nuestro constructor personalizado',
      color: 'bg-[#8e421e]'
    },
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: 'Resultados Rápidos',
      description: 'Ve mejoras visibles en tu piel en semanas',
      color: 'bg-[#b9a035]'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Clientes Satisfechos', icon: <Users className="h-6 w-6" /> },
    { number: '100%', label: 'Natural', icon: <Leaf className="h-6 w-6" /> },
    { number: '24/7', label: 'Soporte', icon: <Clock className="h-6 w-6" /> },
    { number: '4.9★', label: 'Valoración', icon: <Star className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: 'María González',
      content: 'Los productos faciales de Botanic Care han transformado mi rutina de cuidado de la piel. Mi piel nunca se ha visto tan radiante y saludable. Los resultados son increíbles desde la primera semana.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    },
    {
      name: 'Carlos Rodríguez',
      content: 'Increíble calidad y resultados visibles desde la primera semana. Los productos faciales son perfectos para mi piel sensible. Definitivamente volveré a comprar.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    },
    {
      name: 'Sofia Ramírez',
      content: 'Las cremas corporales han sido un cambio total. Mi piel se siente más suave, hidratada y nutrida después de cada uso. Los ingredientes naturales realmente hacen la diferencia.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    }
  ];

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-white" />,
      title: 'Envío Gratis',
      description: 'En pedidos superiores a $50'
    },
    {
      icon: <Package className="h-8 w-8 text-white" />,
      title: 'Empaque Sostenible',
      description: 'Materiales 100% reciclables'
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: 'Garantía de Calidad',
      description: '30 días de garantía'
    },
    {
      icon: <Gift className="h-8 w-8 text-white" />,
      title: 'Muestras Gratis',
      description: 'Con cada pedido'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-[#7d8768] text-white py-24 md:py-32 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
            {/* Subtle botanical pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            <div className="text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 shadow-lg">
                <span className="font-semibold font-audrey">Ingredientes 100% Naturales</span>
                <CheckCircle className="h-5 w-5" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight font-editorial-new drop-shadow-lg">
                Descubre el Poder de la
                <br />
                <span className="text-white">
                  Belleza Natural
                </span>
              </h1>
              <p className="text-xl text-white/95 mb-10 max-w-2xl leading-relaxed font-audrey drop-shadow-md">
                Transforma tu rutina de cuidado de la piel con nuestros productos premium a base de plantas. 
                Desde aceites esenciales hasta cremas y serums naturales, llevamos lo mejor de la naturaleza a tu cuidado diario.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mt-6">
                <Button size="lg" className="bg-white text-[#7d8768] hover:bg-gray-50 px-8 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link to="/shop">
                    Comprar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/BC Brand/FOTOS-20250730T202909Z-1-001/FOTOS/image7.jpeg" 
                  alt="Productos Naturales de Belleza"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#313522] rounded-full flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 font-body">100%</p>
                      <p className="text-sm text-gray-600 font-body">Natural</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>
        </section>

        {/* Promotional Banner - Enhanced */}
        <section className="bg-[#7d8768]/10 py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7d8768]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#7d8768]/5 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-[#7d8768]/20 shadow-md">
                <span className="text-4xl">🎉</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-editorial-new text-gray-900">¡Oferta de Verano - Hasta 40% de Descuento!</h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-audrey max-w-3xl mx-auto">Envío gratis en pedidos superiores a Q. {freeShippingThreshold} • Oferta por tiempo limitado</p>
            <Button size="lg" className="bg-[#7d8768] hover:bg-[#6d7660] text-white px-10 py-6 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
              <Link to="/shop?sale=true">
                Aprovechar Oferta
                <TrendingUp className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Video 1 Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <video
                src="/BC Brand/videos/video1.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover max-h-[500px] lg:max-h-[700px]"
              />
            </div>
          </div>
        </section>

        {/* Categories - Enhanced */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                <Sparkles className="h-4 w-4 text-[#7d8768]" />
                <span className="text-sm font-medium text-[#7d8768] font-audrey">Nuestras Categorías</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                Comprar por <span className="text-[#7d8768]">Categoría</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">Encuentra exactamente lo que tu piel necesita con nuestra amplia selección de productos naturales</p>
            </div>
            {isLoadingCategories ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768] mb-4" />
                <p className="text-gray-600 font-audrey">Cargando categorías...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-audrey">No hay categorías disponibles en este momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {categories.map((category, index) => (
                  <Link key={category.name} to={category.href}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white border border-gray-200/60 relative overflow-hidden h-full">
                      <div className="absolute inset-0 bg-[#7d8768]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-6 text-center relative z-10 flex flex-col h-full">
                      <div className="relative mb-6 mx-auto">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl group-hover:shadow-2xl transition-all duration-300 ring-4 ring-white group-hover:ring-[#7d8768]/20">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center';
                            }}
                          />
                        </div>
                        {/* Decorative gradient overlay on hover */}
                        <div className="absolute inset-0 rounded-full bg-[#7d8768]/0 group-hover:bg-[#7d8768]/10 transition-all duration-300 pointer-events-none"></div>
                      </div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-[#7d8768] transition-colors duration-300 font-editorial-new mb-2">{category.name}</h3>
                        <p className="text-xs text-gray-600 font-audrey leading-relaxed">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products - Enhanced */}
        <section className="py-24 bg-[#7d8768]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                <Star className="h-4 w-4 text-[#7d8768]" />
                <span className="text-sm font-medium text-[#7d8768] font-audrey">Productos Destacados</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                Nuestros <span className="text-[#7d8768]">Productos</span> Más Amados
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">Descubre nuestros productos esenciales de cuidado natural más populares y efectivos</p>
            </div>
            {isLoadingProducts ? (
              <div className="text-center py-24">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
                  <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-editorial-new">Cargando productos...</h3>
                <p className="text-gray-600 font-audrey">Por favor espera</p>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-600 font-audrey">No hay productos disponibles en este momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border border-gray-200/60 relative overflow-hidden h-full flex flex-col cursor-pointer" onClick={() => navigate(`/shop/product/${product.id}`)}>
                    <CardContent className="p-0 relative z-10 flex flex-col h-full">
                      <div className="relative flex flex-col h-full">
                        {/* Product Image */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {product.badge && (
                            <Badge className={`absolute top-3 right-3 text-xs z-10 shadow-lg ${
                              product.badge === 'OFERTA' ? 'bg-red-600' :
                              product.badge === 'NUEVO' ? 'bg-blue-600' :
                              product.badge === 'MÁS VENDIDO' ? 'bg-green-600' :
                              product.badge === 'TEMPORADA' ? 'bg-orange-600' :
                              product.badge === 'PERSONALIZADA' ? 'bg-purple-600' :
                              'bg-gray-600'
                            } text-white border-0 font-medium font-body`}>
                              {product.badge}
                            </Badge>
                          )}
                          <img 
                            src={product.realImage} 
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#7d8768] transition-colors duration-300 font-editorial-new line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 font-audrey line-clamp-2">{product.description}</p>

                          <div className="flex items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-[#7d8768] font-audrey">Q. {product.price.toFixed(2)}</span>
                              {product.originalPrice && (
                                <span className="text-base text-gray-500 line-through font-audrey">
                                  Q. {product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              className="flex-1 bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md hover:shadow-lg transition-all font-body"
                              onClick={() => addToCart(product, 1)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              <span className="font-body">Agregar</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={`border-2 transition-all shadow-sm ${
                                isInWishlist(product.id)
                                  ? 'border-red-300 text-red-600 hover:bg-red-50 bg-red-50/50'
                                  : 'border-gray-300 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5'
                              }`}
                              onClick={() => handleWishlistToggle(product)}
                            >
                              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white px-10 py-6 text-lg font-body shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" asChild>
                <Link to="/shop">
                  Ver Todos los Productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center group border border-gray-200/60 hover:border-[#7d8768] bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-[#7d8768]/10 rounded-xl group-hover:bg-[#7d8768] transition-all duration-300">
                        <div className="text-[#7d8768] group-hover:text-white transition-colors duration-300">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#7d8768] transition-colors duration-300 font-editorial-new">{feature.title}</h3>
                    <p className="text-sm text-gray-600 font-audrey leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video 4 Section */}
        <section className="py-16 bg-[#7d8768]/5">
          <div className="max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <video
                src="/BC Brand/videos/video4.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover max-h-[600px] lg:max-h-[800px]"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section - Enhanced */}
        <section className="py-24 bg-[#7d8768]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                <Award className="h-4 w-4 text-[#7d8768]" />
                <span className="text-sm font-medium text-[#7d8768] font-audrey">¿Por Qué Elegirnos?</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                ¿Por Qué Elegir <span className="text-[#7d8768]">Botanic Care</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">Estamos comprometidos a traerte lo mejor de la naturaleza con productos de la más alta calidad</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {benefits.map((benefit, index) => (
                 <Card key={index} className="group text-center h-full border border-gray-200/60 hover:border-[#7d8768] bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                   <CardContent className="p-8 h-full flex flex-col">
                     <div className="flex justify-center mb-6">
                       <div className={`p-5 ${benefit.color} rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                         {benefit.icon}
                       </div>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#7d8768] transition-colors duration-300 font-editorial-new">{benefit.title}</h3>
                     <p className="text-gray-600 leading-relaxed font-audrey flex-grow">{benefit.description}</p>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="py-24 bg-[#313522] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-8 left-8 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 right-8 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white font-audrey">Comienza Tu Transformación</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 font-editorial-new">¿Listo para Transformar tu Cuidado de la Piel?</h2>
            <p className="text-xl md:text-2xl mb-12 text-white/95 max-w-3xl mx-auto font-audrey leading-relaxed">
              Únete a miles de clientes que han descubierto el poder de los ingredientes naturales
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#7d8768] bg-transparent px-10 py-6 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link to="/about">
                  Conoce Más Sobre Nosotros
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Enhanced */}
        <section className="py-24 bg-[#7d8768]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                <Users className="h-4 w-4 text-[#7d8768]" />
                <span className="text-sm font-medium text-[#7d8768] font-audrey">Testimonios</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new">
                Lo Que Dicen Nuestros <span className="text-[#7d8768]">Clientes</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-audrey leading-relaxed">Descubre por qué miles de clientes confían en nuestros productos naturales</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="group border border-gray-200/60 hover:border-[#7d8768] bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow-lg mr-4 flex-shrink-0">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback a una imagen placeholder si falla
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="40" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + (testimonial.name.charAt(0).toUpperCase()) + '%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg font-editorial-new">{testimonial.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed font-audrey">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home; 