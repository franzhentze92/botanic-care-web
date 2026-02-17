import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAdminProducts } from '@/hooks/useAdminProducts';

const AdminProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useAdminProducts();
  const productId = id ? parseInt(id) : 0;
  const product = products.find(p => p.id === productId);

  const categories = [
    { value: 'skin-care', label: 'Cuidado de la Piel' },
    { value: 'body-care', label: 'Cuidado Corporal' },
    { value: 'baby-care', label: 'Cuidado del Bebé' },
    { value: 'home-care', label: 'Cuidado del Hogar' }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7d8768]" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Producto no encontrado</p>
              <Button onClick={() => navigate('/admin')} className="mt-4">
                Volver a la lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#7d8768]/10 via-[#9d627b]/10 to-[#7a7539]/10 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-editorial-new">
              Ver <span className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] bg-clip-text text-transparent">Producto</span>
            </h1>
            <p className="text-lg text-gray-600 font-audrey">
              Detalles completos del producto
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-editorial-new">
                <Eye className="h-5 w-5" />
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center'} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center';
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-gilda-display">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-white border-0 ${
                        product.category === 'skin-care' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                          : product.category === 'body-care'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : product.category === 'baby-care'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}>
                        {categories.find(c => c.value === product.category)?.label}
                      </Badge>
                      {product.badge && (
                        <Badge className={`text-white border-0 font-body ${
                          product.badge === 'OFERTA' ? 'bg-red-600' :
                          product.badge === 'NUEVO' ? 'bg-blue-600' :
                          product.badge === 'MÁS VENDIDO' ? 'bg-green-600' :
                          product.badge === 'TEMPORADA' ? 'bg-orange-600' :
                          product.badge === 'PERSONALIZADA' ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}>
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Precio:</span>
                      <span className="font-bold text-[#7d8768] text-lg">Q. {product.price}</span>
                    </div>
                    {product.original_price && product.original_price > product.price && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Precio Original:</span>
                        <span className="text-gray-500 line-through">Q. {product.original_price}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">SKU:</span>
                      <span className="text-gray-600">{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Tamaño:</span>
                      <span className="text-gray-600">{product.size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Stock:</span>
                      <span className={`font-semibold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.in_stock ? 'En Stock' : 'Sin Stock'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Rating:</span>
                      <span className="text-gray-600">{product.rating}/5 ({product.reviews_count} reseñas)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción Corta</h4>
                  <p className="text-gray-600 font-audrey">{product.description}</p>
                </div>
                
                {product.long_description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción Larga</h4>
                    <p className="text-gray-600 font-audrey">{product.long_description}</p>
                  </div>
                )}
                
                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ingredientes</h4>
                    <p className="text-gray-600 font-audrey">
                      {Array.isArray(product.ingredients) 
                        ? product.ingredients.join(', ')
                        : product.ingredients}
                    </p>
                  </div>
                )}
                
                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Beneficios</h4>
                    <p className="text-gray-600 font-audrey">
                      {Array.isArray(product.benefits) 
                        ? product.benefits.join(', ')
                        : product.benefits}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                  className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] hover:from-[#7a7539] hover:to-[#9d627b] text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Producto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768]/10"
                >
                  Volver a la lista
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProductView;

