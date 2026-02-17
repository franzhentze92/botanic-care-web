import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Trash2, 
  ArrowLeft, 
  ShoppingCart,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';

const Wishlist: React.FC = () => {
  const { state, removeFromWishlist, addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  if (state.wishlist.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Heart className="h-24 w-24 text-[#7d8768] fill-[#7d8768]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-editorial-new">Tu lista de deseos está vacía</h1>
            <p className="text-gray-600 mb-8 font-body">Guarda tus productos favoritos para comprarlos más tarde</p>
            <Button asChild className="bg-[#7d8768] hover:bg-[#6d7660] text-white font-body">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Explorar Productos
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-editorial-new">Lista de Deseos</h1>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-[#7d8768]" />
            <span className="text-gray-600 font-body">({state.wishlist.length} productos)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.wishlist.map((item) => (
            <Card key={item.product.id} className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="relative flex flex-col flex-grow">
                  {/* Product Image */}
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={item.product.realImage} 
                      alt={item.product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-900 hover:bg-white font-body"
                        asChild
                      >
                        <Link to={`/shop/product/${item.product.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <h3 className="font-semibold text-gray-900 mb-4 text-center group-hover:text-[#7d8768] transition-colors font-gilda-display">
                    {item.product.name}
                  </h3>

                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-[#7d8768] font-body">Q. {item.product.price}</span>
                      {item.product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-body">
                          Q. {item.product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm text-center mb-4 font-body">
                    SKU: {item.product.sku} • Tamaño: {item.product.size}
                  </p>

                  {/* Action Buttons - Empujados hacia abajo con mt-auto */}
                  <div className="space-y-2 mt-auto">
                    <Button 
                      className="w-full bg-[#7d8768] hover:bg-[#6d7660] text-white font-body"
                      onClick={() => handleAddToCart(item.product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 font-body"
                      onClick={() => removeFromWishlist(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768]/10 font-body">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Link>
            </Button>
            <Button asChild className="bg-[#7d8768] hover:bg-[#6d7660] text-white font-body">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Carrito
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist; 