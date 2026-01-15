import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useOrders, OrderWithItems, useAddresses, usePaymentMethods, Address, PaymentMethod } from '@/hooks/useDashboard';
import { useUserProfile } from '@/hooks/useDashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderIdNumber = orderId ? parseInt(orderId) : 0;
  const { data: orders = [], isLoading } = useOrders();
  const { data: userProfile } = useUserProfile();

  const order = orders.find(o => o.id === orderIdNumber);

  // Fetch shipping address if available
  const { data: shippingAddress } = useQuery<Address | null>({
    queryKey: ['shipping-address', order?.shipping_address_id],
    queryFn: async () => {
      if (!order?.shipping_address_id) return null;
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', order.shipping_address_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!order?.shipping_address_id,
  });

  // Fetch payment method if available
  const { data: paymentMethod } = useQuery<PaymentMethod | null>({
    queryKey: ['payment-method', order?.payment_method_id],
    queryFn: async () => {
      if (!order?.payment_method_id) return null;
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', order.payment_method_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!order?.payment_method_id,
  });

  // Refrescar datos cuando la página recibe foco (para ver actualizaciones del admin)
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En Proceso';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
              <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-editorial-new">Cargando pedido...</h3>
            <p className="text-gray-600 font-body">Por favor espera</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Card className="max-w-md border-2 border-red-100 bg-white shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-editorial-new">Pedido no encontrado</h2>
              <p className="text-gray-600 mb-8 font-body">El pedido que buscas no existe o no tienes permisos para verlo.</p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md font-body"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
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
        {/* Hero Section */}
        <section className="relative bg-[#7d8768] text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-8 text-white hover:bg-white/10 hover:text-white border border-white/20 font-body"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>

            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-editorial-new leading-tight">
                Detalles del Pedido
              </h1>
              <p className="text-xl text-white/95 font-audrey">
                Pedido {order.order_number}
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20">
          <Card className="border border-gray-200 shadow-2xl bg-white">
            <CardContent className="p-6 lg:p-12">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-5 w-5 text-[#7d8768]" />
                    <h2 className="text-2xl font-bold text-gray-900 font-editorial-new">Pedido {order.order_number}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 font-body">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                  <Badge className={`px-4 py-2 text-sm font-semibold border font-body ${getStatusColor(order.status)}`}>
                    <Clock className="h-4 w-4 mr-2" />
                    {getStatusLabel(order.status)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-body">Total</p>
                    <p className="text-3xl font-bold text-[#7d8768] font-body">Q. {order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-editorial-new">Productos del Pedido</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <Card key={item.id} className="border border-gray-200/60 hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product_image_url ? (
                              <img 
                                src={item.product_image_url} 
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 mb-2 font-editorial-new">{item.product_name}</h4>
                            {item.is_custom_cream && (
                              <Badge className="mb-2 bg-[#7d8768] text-white border-0 text-xs font-body">
                                Crema Personalizada
                              </Badge>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-4 text-sm text-gray-600 font-body">
                                <span>Cantidad: <strong>{item.quantity}</strong></span>
                                <span>Precio unitario: <strong>Q. {item.unit_price.toFixed(2)}</strong></span>
                              </div>
                              <p className="text-lg font-bold text-[#7d8768] font-body">
                                Total: Q. {item.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Order Summary and Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border border-gray-200/60">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 font-editorial-new flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#7d8768]" />
                      Resumen del Pedido
                    </h3>
                    <div className="space-y-3 font-body">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">Q. {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Envío:</span>
                        <span className="font-semibold">Q. {order.shipping_cost.toFixed(2)}</span>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Impuestos:</span>
                          <span className="font-semibold">Q. {order.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <span>Total:</span>
                        <span className="text-[#7d8768]">Q. {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200/60">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 font-editorial-new flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#7d8768]" />
                      Información de Envío
                    </h3>
                    <div className="space-y-3 font-body">
                      {order.estimated_delivery ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Entrega Estimada</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(order.estimated_delivery), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">La fecha de entrega será confirmada próximamente</p>
                      )}
                      {order.tracking_number && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Número de Seguimiento</p>
                          <p className="font-semibold text-gray-900">{order.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address and Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Shipping Address */}
                <Card className="border border-gray-200/60">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 font-editorial-new flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#7d8768]" />
                      Dirección de Envío
                    </h3>
                    {shippingAddress ? (
                      <div className="space-y-2 font-body text-gray-700">
                        <p className="font-semibold text-gray-900">{shippingAddress.name}</p>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}</p>
                        <p>{shippingAddress.country}</p>
                        {shippingAddress.phone && (
                          <p className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Teléfono:</span> {shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 font-body">No hay dirección de envío registrada para este pedido</p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border border-gray-200/60">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 font-editorial-new flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#7d8768]" />
                      Método de Pago
                    </h3>
                    {paymentMethod ? (
                      <div className="space-y-2 font-body text-gray-700">
                        {paymentMethod.type === 'card' && (
                          <>
                            <p className="font-semibold text-gray-900">
                              {paymentMethod.card_brand ? paymentMethod.card_brand.toUpperCase() : 'Tarjeta'} 
                              {paymentMethod.last4 ? ` •••• ${paymentMethod.last4}` : ''}
                            </p>
                            {paymentMethod.cardholder_name && (
                              <p className="text-sm text-gray-600">{paymentMethod.cardholder_name}</p>
                            )}
                            {paymentMethod.expiry_month && paymentMethod.expiry_year && (
                              <p className="text-sm text-gray-600">
                                Vence: {paymentMethod.expiry_month.toString().padStart(2, '0')}/{paymentMethod.expiry_year}
                              </p>
                            )}
                          </>
                        )}
                        {paymentMethod.type === 'paypal' && (
                          <>
                            <p className="font-semibold text-gray-900">PayPal</p>
                            {paymentMethod.paypal_email && (
                              <p className="text-sm text-gray-600">{paymentMethod.paypal_email}</p>
                            )}
                          </>
                        )}
                        {paymentMethod.type === 'cash_on_delivery' && (
                          <p className="font-semibold text-gray-900">Pago Contra Entrega</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 font-body">No hay método de pago registrado para este pedido</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => navigate(`/dashboard/invoices/${order.id}`)}
                  className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md hover:shadow-lg font-body"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ver Factura
                </Button>
                {order.tracking_number && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const trackingUrl = `https://www.google.com/search?q=track+${order.tracking_number}`;
                      window.open(trackingUrl, '_blank');
                    }}
                    className="border-2 border-gray-300 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Rastrear Envío
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;

