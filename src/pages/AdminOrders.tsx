import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  Loader2,
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  User,
  Mail,
  Package,
  MapPin
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import { toast } from 'sonner';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading, error } = useAdminOrders();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para búsqueda, filtros y diálogos
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <AlertCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    // Calcular ingresos sumando todas las órdenes no canceladas (igual que el dashboard)
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  }, [orders]);

  // Filtrar pedidos
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number.toLowerCase().includes(query) ||
        o.user_email?.toLowerCase().includes(query) ||
        o.user_name?.toLowerCase().includes(query) ||
        o.items.some(item => item.product_name.toLowerCase().includes(query))
      );
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    return filtered;
  }, [orders, searchQuery, filterStatus]);

  const handleEditOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(orderId);
      setTrackingNumber(order.tracking_number || '');
      setEstimatedDelivery(order.estimated_delivery || '');
      setEditDialogOpen(true);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder,
        status: newStatus as any,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      });
      setEditDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md bg-white border border-gray-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-[#9d627b] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">Acceso Denegado</h2>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-[#7d8768]" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar pedidos</h2>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <p className="text-sm text-gray-500">
                Nota: Puede ser un problema de permisos RLS. Los administradores necesitan una política especial para ver todos los pedidos.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Gestión de Pedidos"
          description="Gestiona y rastrea todos los pedidos de tus clientes"
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Pedidos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-[#7d8768]/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-[#7d8768]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-[#7d8768]">Q. {stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-[#7d8768]/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#7d8768]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Procesando</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.processingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Enviado</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.shippedOrders}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Entregado</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.deliveredOrders}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cancelado</p>
                  <p className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Buscar pedidos</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por número de pedido, cliente o producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-[250px]">
                <p className="text-sm font-medium text-gray-700 mb-2">Estado</p>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No se encontraron pedidos' : 'No hay pedidos'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Intenta ajustar tus filtros de búsqueda'
                    : 'Los pedidos aparecerán aquí cuando los clientes realicen compras'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white border border-gray-200 shadow-md rounded-lg hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left side - Order info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 font-gilda-display">
                            Pedido #{order.order_number}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            {order.user_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {order.user_email}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} border px-3 py-1 flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </Badge>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            {item.product_image_url && (
                              <img
                                src={item.product_image_url}
                                alt={item.product_name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {item.quantity} × Q. {item.unit_price.toFixed(2)} = Q. {item.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking info */}
                      {order.tracking_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Truck className="h-4 w-4" />
                          <span>Tracking: {order.tracking_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Right side - Total and actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-gray-900">Q. {order.total.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOrder(order.id)}
                        className="w-full md:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Actualizar Estado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Order Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
              <DialogDescription>
                Cambia el estado del pedido y agrega información de seguimiento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Estado del Pedido
                </label>
                <Select
                  defaultValue={orders.find(o => o.id === selectedOrder)?.status}
                  onValueChange={(value) => {
                    const order = orders.find(o => o.id === selectedOrder);
                    if (order) {
                      handleUpdateStatus(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter(o => o.value !== 'all').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Número de Seguimiento
                </label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ingresa el número de seguimiento"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha Estimada de Entrega
                </label>
                <Input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

