import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Heart,
  ArrowLeft,
  Star,
  CheckCircle,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
  Truck,
  Leaf,
  Sparkles,
  Package,
  Award,
  Info
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { useProductNutrients } from '@/hooks/useNutrients';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: storeSettings } = useStoreSettings();
  const productId = id ? parseInt(id) : 0;
  
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 50;
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: productNutrients = [], isLoading: isLoadingProductNutrients } = useProductNutrients(productId);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscription'>('one-time');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<number>(1);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  const subscriptionDiscount = 0.15; // 15% discount
  const originalPrice = product ? product.price : 0;
  const subscriptionPrice = originalPrice * (1 - subscriptionDiscount);
  const finalPrice = purchaseType === 'subscription' ? subscriptionPrice : originalPrice;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
              <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-editorial-new">Cargando producto...</h3>
            <p className="text-gray-600 font-audrey">Por favor espera</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
          <Card className="max-w-md border-2 border-red-100 bg-gradient-to-br from-red-50/50 to-white shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-editorial-new">Producto no encontrado</h2>
              <p className="text-gray-600 mb-8 font-audrey">El producto que buscas no existe o ha sido eliminado.</p>
              <Button 
                onClick={() => navigate('/shop')} 
                className="bg-gradient-to-r from-[#7d8768] to-[#8d756e] hover:from-[#6d7660] hover:to-[#7d655e] text-white shadow-md"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la Tienda
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="mb-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-body"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la Tienda
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                <img 
                  src={product.realImage} 
                  alt={product.name}
                  className="w-full aspect-square object-contain p-8"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              {/* Product Info */}
              <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-body">SKU: <span className="font-semibold text-gray-900">{product.sku}</span></span>
                </div>
                {product.size && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 font-body font-medium">{product.size}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Badge and Title */}
              <div className="space-y-4">
                {product.badge && (
                  <Badge className={`text-xs px-3 py-1.5 font-body font-medium ${
                    product.badge === 'OFERTA' ? 'bg-red-600 text-white' :
                    product.badge === 'NUEVO' ? 'bg-blue-600 text-white' :
                    product.badge === 'MÁS VENDIDO' ? 'bg-green-600 text-white' :
                    product.badge === 'TEMPORADA' ? 'bg-orange-600 text-white' :
                    product.badge === 'PERSONALIZADA' ? 'bg-purple-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {product.badge}
                  </Badge>
                )}
                <h1 className="text-4xl md:text-5xl font-normal text-gray-900 font-editorial-new leading-tight">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 font-body leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price and Stock */}
              <div className="space-y-5 pt-4 border-t border-gray-200">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-3xl md:text-4xl font-semibold text-[#7d8768] font-body">Q. {product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through font-body">
                      Q. {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium font-body ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                    {product.inStock ? 'En stock' : 'Agotado'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {(product.longDescription || product.description) && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-base text-gray-900 mb-3 font-editorial-new uppercase tracking-wide">Descripción</h4>
                  <p className="text-gray-700 leading-relaxed font-body">{product.longDescription || product.description}</p>
                </div>
              )}

              {/* Quantity */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-normal text-base text-gray-900 mb-4 font-gilda-display">Cantidad</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="rounded-none border-0 hover:bg-gray-50 disabled:opacity-30 h-11 w-11"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-16 text-center font-body text-gray-900">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="rounded-none border-0 hover:bg-gray-50 disabled:opacity-30 h-11 w-11"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500 font-body">Máximo 10 unidades</span>
                </div>
              </div>

              {/* Purchase Type Selection */}
              <div className="pt-4 border-t border-gray-200">
                <RadioGroup value={purchaseType} onValueChange={(value) => setPurchaseType(value as 'one-time' | 'subscription')} className="space-y-4">
                  {/* One-time Option */}
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    purchaseType === 'one-time' 
                      ? 'border-[#7d8768] bg-[#7d8768]/5' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <RadioGroupItem value="one-time" id="one-time" className="border-2" />
                    <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 font-gilda-display">Compra Única</div>
                          <div className="text-xl font-semibold text-gray-900 font-body mt-1">Q. {originalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Subscription Option */}
                  <div className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                    purchaseType === 'subscription' 
                      ? 'border-[#7d8768] bg-[#7d8768]/5' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <RadioGroupItem value="subscription" id="subscription" className="border-2 mt-1" />
                    <Label htmlFor="subscription" className="flex-1 cursor-pointer">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-semibold text-gray-900 font-gilda-display">Suscríbete y Ahorra</div>
                              <Info className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg text-gray-400 line-through font-body">Q. {originalPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-2xl font-semibold text-gray-900 font-body">Q. {subscriptionPrice.toFixed(2)}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-600 text-white border-0 font-body text-xs px-3 py-1">
                            Ahorra 15%
                          </Badge>
                        </div>

                        {purchaseType === 'subscription' && (
                          <>
                            {/* Benefits */}
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 font-body">Ahorra 15%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 font-body">Sin compromiso. Cancela cuando quieras</span>
                              </div>
                            </div>

                            {/* Frequency Selection */}
                            <div className="pt-2 border-t border-gray-200">
                              <div className="text-sm font-medium text-gray-900 mb-3 font-gilda-display">Entregar cada:</div>
                              <div className="flex gap-2">
                                {[1, 2, 3].map((months) => (
                                  <button
                                    key={months}
                                    type="button"
                                    onClick={() => setSubscriptionFrequency(months)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium font-body transition-all ${
                                      subscriptionFrequency === months
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                  >
                                    {months} {months === 1 ? 'mes' : 'meses'}
                                    <div className="text-xs mt-0.5 opacity-75">ahorra 15%</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  className="flex-1 bg-[#7d8768] hover:bg-[#6d7660] text-white h-14 text-base shadow-md hover:shadow-lg transition-all font-body font-medium"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span>Agregar al Carrito - Q. {(finalPrice * quantity).toFixed(2)}</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={`h-14 w-14 border-2 p-0 ${
                    isInWishlist(product.id)
                      ? 'border-red-300 text-red-600 hover:bg-red-50 bg-red-50/50'
                      : 'border-gray-200 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5'
                  } transition-all`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Shipping Info */}
              <Card className="bg-[#7d8768]/5 border border-[#7d8768]/20 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[#7d8768] rounded-xl">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 font-body mb-0.5">Envío Gratis</div>
                      <div className="text-sm text-gray-600 font-body">En pedidos superiores a Q. {freeShippingThreshold}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Tabs */}
          <Tabs defaultValue="nutrients" className="mt-20 pt-12 border-t border-gray-200">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <TabsTrigger 
                value="nutrients" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#7d8768] data-[state=active]:shadow-sm font-body font-medium text-sm"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Nutrientes
              </TabsTrigger>
              <TabsTrigger 
                value="benefits"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#7d8768] data-[state=active]:shadow-sm font-body font-medium text-sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Beneficios
              </TabsTrigger>
              <TabsTrigger 
                value="info"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#7d8768] data-[state=active]:shadow-sm font-body font-medium text-sm"
              >
                <Award className="h-4 w-4 mr-2" />
                Información
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="nutrients" className="mt-10">
              {isLoadingProductNutrients ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
                    <Loader2 className="h-6 w-6 animate-spin text-[#7d8768] relative" />
                  </div>
                  <span className="ml-3 text-sm text-gray-600 font-body">Cargando nutrientes...</span>
                </div>
              ) : productNutrients.length === 0 ? (
                <Card className="p-16 text-center border border-gray-100 bg-gray-50/50 rounded-3xl">
                  <div className="text-gray-400 mb-4">
                    <Leaf className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-body">Este producto no tiene nutrientes asociados.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {productNutrients.map((nutrient) => (
                    <Card key={nutrient.id} className="border border-gray-100 hover:border-[#7d8768]/30 hover:shadow-md transition-all bg-white rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-bold text-lg text-gray-900 font-editorial-new">{nutrient.name}</h4>
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-3" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 font-body leading-relaxed">{nutrient.description}</p>
                        {nutrient.benefits && nutrient.benefits.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-900 mb-3 font-body uppercase tracking-wide">Beneficios:</p>
                            <ul className="text-sm text-gray-700 space-y-2 font-body">
                              {nutrient.benefits.slice(0, 3).map((benefit, idx) => (
                                <li key={idx} className="flex items-start">
                                  <Star className="h-4 w-4 text-[#7d8768] fill-current mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          
            <TabsContent value="benefits" className="mt-10">
              {product.benefits && product.benefits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {product.benefits.map((benefit, index) => (
                    <Card key={index} className="border border-gray-100 hover:border-[#7d8768]/30 hover:shadow-md transition-all bg-white rounded-2xl">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="p-2.5 bg-yellow-50 rounded-xl">
                          <Star className="h-5 w-5 text-yellow-600 fill-current flex-shrink-0" />
                        </div>
                        <span className="text-gray-800 font-body leading-relaxed pt-1">{benefit}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-16 text-center border border-gray-100 bg-gray-50/50 rounded-3xl">
                  <div className="text-gray-400 mb-4">
                    <Sparkles className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-body">Este producto no tiene beneficios registrados.</p>
                </Card>
              )}
            </TabsContent>
          
            <TabsContent value="info" className="mt-10">
              <div className="space-y-5 max-w-3xl">
                <Card className="border border-gray-100 bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-base text-gray-900 mb-2 font-editorial-new uppercase tracking-wide">SKU</h4>
                    <p className="text-gray-700 font-body text-lg">{product.sku}</p>
                  </CardContent>
                </Card>
                {product.size && (
                  <Card className="border border-gray-100 bg-white rounded-2xl">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-base text-gray-900 mb-2 font-editorial-new uppercase tracking-wide">Tamaño</h4>
                      <p className="text-gray-700 font-body text-lg">{product.size}</p>
                    </CardContent>
                  </Card>
                )}
                {product.longDescription && (
                  <Card className="border border-gray-100 bg-white rounded-2xl">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-base text-gray-900 mb-4 font-editorial-new uppercase tracking-wide">Descripción Completa</h4>
                      <p className="text-gray-700 leading-relaxed font-body">{product.longDescription}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
