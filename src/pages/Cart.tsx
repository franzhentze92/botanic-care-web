import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  Minus,
  Truck,
  Shield,
  CreditCard,
  Zap,
  CheckCircle,
  Lock,
  Star,
  Package,
  Sparkles
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder, useUserProfile, useAddresses, useCreateAddress, usePaymentMethods, useCreatePaymentMethod, useUpdateAddress, useUpdatePaymentMethod } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useQueryClient } from '@tanstack/react-query';

const Cart: React.FC = () => {
  const { state, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();
  const { user } = useAuth();
  const { data: storeSettings } = useStoreSettings();
  const createOrderMutation = useCreateOrder();
  const { data: userProfile } = useUserProfile();
  const { data: addresses = [] } = useAddresses();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const createAddressMutation = useCreateAddress();
  const createPaymentMethodMutation = useCreatePaymentMethod();
  const updateAddressMutation = useUpdateAddress();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 50;
  const shippingCostValue = storeSettings?.shippingCost || 25;
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Guatemala'
  });
  const [paymentMethod, setPaymentMethod] = useState('journey-pay');

  // Cargar información del perfil y dirección predeterminada cuando estén disponibles
  useEffect(() => {
    if (userProfile) {
      // Obtener la dirección predeterminada o la primera dirección disponible
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      
      setShippingInfo(prev => ({
        ...prev,
        firstName: userProfile.first_name || prev.firstName,
        lastName: userProfile.last_name || prev.lastName,
        email: user?.email || prev.email,
        phone: userProfile.phone || prev.phone,
        // Si hay una dirección predeterminada, usarla
        ...(defaultAddress && {
          address: defaultAddress.street || prev.address,
          city: defaultAddress.city || prev.city,
          state: defaultAddress.state || prev.state,
          zipCode: defaultAddress.zip_code || prev.zipCode,
          country: defaultAddress.country || prev.country,
        }),
      }));
    } else if (user) {
      // Si no hay perfil pero sí hay usuario, al menos usar el email
      setShippingInfo(prev => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [userProfile, addresses, user]);

  const shippingCost = getCartTotal() >= freeShippingThreshold ? 0 : shippingCostValue;
  const tax = getCartTotal() * 0.16; // 16% IVA
  const total = getCartTotal() + shippingCost + tax;

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
  };

  const handleBackToCart = () => {
    setIsCheckingOut(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar un pedido', {
        description: 'Por favor, inicia sesión o crea una cuenta',
      });
      navigate('/login');
      return;
    }

    // Validar información de envío
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.zipCode) {
      toast.error('Por favor completa toda la información de envío', {
        description: 'Todos los campos son requeridos',
      });
      return;
    }

    const orderTotal = total;
    const itemCount = getCartItemCount();
    const subtotal = getCartTotal();
    
    try {
      // Verificar si ya existe una dirección con los mismos datos
      const addressName = `${shippingInfo.firstName} ${shippingInfo.lastName}`;
      const existingAddress = addresses.find(addr => 
        addr.street.toLowerCase().trim() === shippingInfo.address.toLowerCase().trim() &&
        addr.city.toLowerCase().trim() === shippingInfo.city.toLowerCase().trim() &&
        addr.state.toLowerCase().trim() === shippingInfo.state.toLowerCase().trim() &&
        addr.zip_code.trim() === shippingInfo.zipCode.trim() &&
        addr.country.toLowerCase().trim() === shippingInfo.country.toLowerCase().trim()
      );

      let address;
      if (existingAddress) {
        // Usar la dirección existente
        address = existingAddress;
        // Si no es la predeterminada, actualizarla para que lo sea
        if (!existingAddress.is_default) {
          await updateAddressMutation.mutateAsync({
            id: existingAddress.id,
            is_default: true,
          });
        }
      } else {
        // Crear nueva dirección solo si no existe
        address = await createAddressMutation.mutateAsync({
          type: 'home',
          name: addressName,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip_code: shippingInfo.zipCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
          is_default: true,
        });
      }

      // Verificar si ya existe un método de pago del mismo tipo
      let paymentMethodType: 'card' | 'paypal' | 'cash_on_delivery' = 'cash_on_delivery';
      if (paymentMethod === 'credit-card') {
        paymentMethodType = 'card';
      } else if (paymentMethod === 'paypal') {
        paymentMethodType = 'paypal';
      }

      // Para cash_on_delivery, siempre buscar o crear uno genérico
      // Para card y paypal, buscar uno existente del mismo tipo
      const existingPaymentMethod = paymentMethods.find(pm => 
        pm.type === paymentMethodType
      );

      let paymentMethodData;
      if (existingPaymentMethod) {
        // Usar el método de pago existente
        paymentMethodData = existingPaymentMethod;
        // Si no es el predeterminado, actualizarlo para que lo sea
        if (!existingPaymentMethod.is_default) {
          await updatePaymentMethodMutation.mutateAsync({
            id: existingPaymentMethod.id,
            is_default: true,
          });
        }
      } else {
        // Crear nuevo método de pago solo si no existe
        paymentMethodData = await createPaymentMethodMutation.mutateAsync({
          type: paymentMethodType,
          is_default: true,
        });
      }

      // Crear la orden en la base de datos
      await createOrderMutation.mutateAsync({
        subtotal,
        shipping_cost: shippingCost,
        tax,
        total: orderTotal,
        shipping_address_id: address.id,
        payment_method_id: paymentMethodData.id,
        notes: null,
        items: state.items.map(item => {
          // Detectar si es una crema personalizada (SKU que comienza con "CUSTOM-")
          const isCustomCream = item.product.sku?.startsWith('CUSTOM-') || false;
          
          return {
            product_id: isCustomCream ? null : (typeof item.product.id === 'number' ? item.product.id : null),
            product_name: item.product.name,
            product_image_url: item.product.realImage || null,
            product_sku: item.product.sku || null,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity,
            is_custom_cream: isCustomCream,
            custom_cream_id: null, // TODO: Si es crema personalizada, crear registro en custom_creams y usar su ID
          };
        }),
      });

      // Mostrar notificación bonita de éxito
      toast.success(
        '¡Orden realizada con éxito! ✨',
        {
          description: (
            <div className="space-y-1">
              <p className="font-semibold font-body">Gracias por tu compra. Recibirás un email de confirmación.</p>
              <p className="text-sm opacity-90 font-body">Total de la compra: <span className="font-bold">Q. {orderTotal.toFixed(2)}</span> ({itemCount} productos)</p>
            </div>
          ),
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          duration: 5000,
          action: {
            label: 'Ver mi pedido',
            onClick: () => {
              navigate('/dashboard');
            },
          },
          onAutoClose: () => {
            // Opcional: redirigir automáticamente después de un tiempo si el usuario no hace clic
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500); // Redirigir 1.5 segundos después de que la notificación se cierre automáticamente
          }
        }
      );
      
      clearCart();
      setIsCheckingOut(false);
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error('Error al crear la orden', {
        description: error.message || 'Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo.',
      });
    }
  };

  if (state.items.length === 0 && !isCheckingOut) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-editorial-new">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8 font-body">Agrega algunos productos para comenzar tu compra</p>
            <Button asChild className="bg-[#7d8768] hover:bg-[#6d7660] text-white font-body">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
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
        {!isCheckingOut ? (
          // Cart View
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 font-editorial-new">Carrito de Compras</h1>
              <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700 font-body">
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center font-editorial-new">
                      <ShoppingCart className="h-5 w-5 mr-2 text-[#7d8768]" />
                      Productos ({getCartItemCount()})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img 
                          src={item.product.realImage} 
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 font-gilda-display">{item.product.name}</h3>
                          <p className="text-sm text-gray-600 font-body">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600 font-body">Tamaño: {item.product.size}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="font-bold text-[#7d8768] font-body">Q. {item.product.price}</span>
                            {item.product.originalPrice && (
                                                              <span className="text-sm text-gray-500 line-through font-body">
                                  Q. {item.product.originalPrice}
                                </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="font-body"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold font-body">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="font-body"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 font-body">
                            Q. {(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700 mt-1 font-body"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-white border border-gray-200 shadow-xl sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-editorial-new">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-body">
                        <span>Subtotal ({getCartItemCount()} items)</span>
                        <span>Q. {getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span>Envío</span>
                        <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                          {shippingCost === 0 ? 'Gratis' : `Q. ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span>IVA (16%)</span>
                        <span>Q. {tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg font-body">
                          <span>Total</span>
                          <span>Q. {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {shippingCost > 0 && (
                      <div className="bg-[#7d8768]/10 p-3 rounded-lg">
                        <p className="text-sm text-[#7d8768] font-body">
                          Agrega Q. {(freeShippingThreshold - getCartTotal()).toFixed(2)} más para envío gratis
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-[#7d8768] hover:bg-[#6d7660] text-white py-3 font-body"
                    >
                      Proceder al Checkout
                    </Button>

                    <Button variant="outline" asChild className="w-full font-body">
                      <Link to="/shop">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continuar Comprando
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          // Checkout View
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 font-editorial-new">Checkout</h1>
              <Button variant="outline" onClick={handleBackToCart} className="font-body">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Carrito
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="space-y-6">
                {/* Shipping Information */}
                <Card className="bg-white border border-gray-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center font-editorial-new">
                      <Truck className="h-5 w-5 mr-2 text-[#7d8768]" />
                      Información de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Nombre</label>
                        <Input
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                          placeholder="Nombre"
                          className="font-body"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Apellido</label>
                        <Input
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                          placeholder="Apellido"
                          className="font-body"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Email</label>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        placeholder="tu@email.com"
                        className="font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Teléfono</label>
                      <Input
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        placeholder="+52 55 1234 5678"
                        className="font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Dirección</label>
                      <Input
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        placeholder="Calle y número"
                        className="font-body"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Ciudad</label>
                        <Input
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          placeholder="Ciudad"
                          className="font-body"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Estado</label>
                        <Input
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                          placeholder="Estado"
                          className="font-body"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-body">CP</label>
                        <Input
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                          placeholder="12345"
                          className="font-body"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="bg-white border border-gray-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center font-editorial-new">
                      <CreditCard className="h-5 w-5 mr-2 text-[#7d8768]" />
                      Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'journey-pay' ? 'border-[#7d8768] bg-[#7d8768]/10' : 'border-gray-200'
                      }`} onClick={() => setPaymentMethod('journey-pay')}>
                        <div className="flex items-center space-x-3">
                          <Zap className="h-6 w-6 text-[#7d8768]" />
                          <div>
                            <div className="font-medium text-gray-900 font-body">Journey to Pay</div>
                            <div className="text-sm text-gray-600 font-body">Paga en cuotas sin intereses</div>
                          </div>
                        </div>
                        <Badge className="bg-[#7d8768]/20 text-[#7d8768] border-0 font-body">Recomendado</Badge>
                      </div>

                      <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'credit-card' ? 'border-[#7d8768] bg-[#7d8768]/10' : 'border-gray-200'
                      }`} onClick={() => setPaymentMethod('credit-card')}>
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-6 w-6 text-[#8e421e]" />
                          <div>
                            <div className="font-medium text-gray-900 font-body">Tarjeta de Crédito/Débito</div>
                            <div className="text-sm text-gray-600 font-body">Visa, Mastercard, American Express</div>
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'paypal' ? 'border-[#7d8768] bg-[#7d8768]/10' : 'border-gray-200'
                      }`} onClick={() => setPaymentMethod('paypal')}>
                        <div className="flex items-center space-x-3">
                          <Shield className="h-6 w-6 text-[#b9a035]" />
                          <div>
                            <div className="font-medium text-gray-900 font-body">PayPal</div>
                            <div className="text-sm text-gray-600 font-body">Pago seguro y rápido</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-editorial-new">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <img 
                          src={item.product.realImage} 
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">Q. {(item.product.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Q. {getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío</span>
                        <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                          {shippingCost === 0 ? 'Gratis' : `Q. ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (16%)</span>
                        <span>Q. {tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>Q. {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Compra Segura</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Tu información está protegida con encriptación SSL
                      </p>
                    </div>

                    <Button 
                      onClick={handlePlaceOrder}
                      className="w-full bg-[#7d8768] hover:bg-[#6d7660] text-white py-3 font-body"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Realizar Pedido - Q. {total.toFixed(2)}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart; 