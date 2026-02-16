import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  Loader2,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRevenue, useAdminRevenueStats, useAdminCustomers } from '@/hooks/useAdminRevenue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminRevenue: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  
  // Estados para ordenamiento
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todos los períodos' },
    { value: '24h', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Último mes' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '9m', label: 'Últimos 9 meses' },
    { value: '12m', label: 'Últimos 12 meses' },
    { value: '18m', label: 'Últimos 18 meses' },
    { value: '24m', label: 'Últimos 24 meses' },
  ];

  // Función para calcular fechas basadas en el rango seleccionado
  const getDateRange = (range: string): { startDate?: string; endDate?: string } => {
    if (range === 'all') {
      return {};
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999); // Final del día actual
    
    let startDate = new Date(now);

    switch (range) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '9m':
        startDate.setMonth(now.getMonth() - 9);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '12m':
        startDate.setMonth(now.getMonth() - 12);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '18m':
        startDate.setMonth(now.getMonth() - 18);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '24m':
        startDate.setMonth(now.getMonth() - 24);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return {};
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Preparar filtros para los hooks
  const filters = useMemo(() => {
    const f: any = {};
    if (filterStatus !== 'all') f.status = filterStatus;
    if (filterCustomer !== 'all') f.userId = filterCustomer;
    
    // Agregar fechas basadas en el rango seleccionado
    const dateRangeValues = getDateRange(dateRange);
    if (dateRangeValues.startDate) f.startDate = dateRangeValues.startDate;
    if (dateRangeValues.endDate) f.endDate = dateRangeValues.endDate;
    
    return f;
  }, [filterStatus, filterCustomer, dateRange]);

  const { data: orders = [], isLoading, error } = useAdminRevenue(filters);
  const { data: stats, isLoading: statsLoading } = useAdminRevenueStats(filters);
  const { data: customers = [] } = useAdminCustomers();

  // Filtrar y ordenar órdenes
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query) ||
        order.user_name?.toLowerCase().includes(query)
      );
    }
    
    // Ordenar
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortColumn) {
          case 'order_number':
            aValue = a.order_number;
            bValue = b.order_number;
            break;
          case 'customer':
            aValue = a.user_name || '';
            bValue = b.user_name || '';
            break;
          case 'date':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'subtotal':
            aValue = parseFloat(a.subtotal.toString());
            bValue = parseFloat(b.subtotal.toString());
            break;
          case 'shipping':
            aValue = parseFloat(a.shipping_cost.toString());
            bValue = parseFloat(b.shipping_cost.toString());
            break;
          case 'tax':
            aValue = parseFloat(a.tax.toString());
            bValue = parseFloat(b.tax.toString());
            break;
          case 'total':
            aValue = parseFloat(a.total.toString());
            bValue = parseFloat(b.total.toString());
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [orders, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = () => {
    // Preparar datos para exportar
    const csvContent = [
      ['Número de Pedido', 'Cliente', 'Email', 'Fecha', 'Estado', 'Subtotal', 'Envío', 'Impuestos', 'Total'],
      ...filteredOrders.map(order => [
        order.order_number,
        order.user_name || 'N/A',
        order.user_email || 'N/A',
        format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es }),
        getStatusText(order.status),
        order.subtotal.toString(),
        order.shipping_cost.toString(),
        order.tax.toString(),
        order.total.toString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ingresos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorizedAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No tienes permiso para acceder a esta página.</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error al cargar los datos de ingresos: {error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Gestión de Ingresos"
          description="Visualiza y gestiona todos los ingresos de la tienda"
        />
        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {stats?.totalOrders || 0} {stats?.totalOrders === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ingresos del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {stats?.monthlyOrders || 0} {stats?.monthlyOrders === 1 ? 'pedido' : 'pedidos'} este mes
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ingresos de Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats?.todayRevenue || 0)}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {stats?.todayOrders || 0} {stats?.todayOrders === 1 ? 'pedido' : 'pedidos'} hoy
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ticket Promedio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats?.averageOrderValue || 0)}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Por pedido
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Acciones */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <CardTitle className="text-base md:text-lg">Filtros y Búsqueda</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por pedido, cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Cliente */}
              <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.user_id} value={customer.user_id}>
                      {customer.name} ({customer.total_orders} {customer.total_orders === 1 ? 'pedido' : 'pedidos'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Estado */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Período */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Ingresos */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Detalle de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No se encontraron ingresos con los filtros seleccionados.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort('order_number')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Número de Pedido
                          {getSortIcon('order_number')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('customer')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Cliente
                          {getSortIcon('customer')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Fecha
                          {getSortIcon('date')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Estado
                          {getSortIcon('status')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('subtotal')}
                          className="flex items-center justify-end ml-auto hover:text-purple-600 transition-colors"
                        >
                          Subtotal
                          {getSortIcon('subtotal')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('shipping')}
                          className="flex items-center justify-end ml-auto hover:text-purple-600 transition-colors"
                        >
                          Envío
                          {getSortIcon('shipping')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('tax')}
                          className="flex items-center justify-end ml-auto hover:text-purple-600 transition-colors"
                        >
                          Impuestos
                          {getSortIcon('tax')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('total')}
                          className="flex items-center justify-end ml-auto hover:text-purple-600 transition-colors"
                        >
                          Total
                          {getSortIcon('total')}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.user_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.user_email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(parseFloat(order.subtotal.toString()))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(parseFloat(order.shipping_cost.toString()))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(parseFloat(order.tax.toString()))}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(parseFloat(order.total.toString()))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-[#7d8768]">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 mb-1">{order.order_number}</h3>
                              <div className="mb-2">
                                <p className="font-medium text-sm">{order.user_name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{order.user_email || 'N/A'}</p>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </p>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="pt-2 border-t space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Subtotal:</span>
                                <p className="font-semibold text-sm">{formatCurrency(parseFloat(order.subtotal.toString()))}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Envío:</span>
                                <p className="font-semibold text-sm">{formatCurrency(parseFloat(order.shipping_cost.toString()))}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Impuestos:</span>
                                <p className="font-semibold text-sm">{formatCurrency(parseFloat(order.tax.toString()))}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Total:</span>
                                <p className="font-bold text-sm text-[#7d8768]">{formatCurrency(parseFloat(order.total.toString()))}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Resumen al final */}
            {filteredOrders.length > 0 && (
              <div className="mt-4 md:mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-xs md:text-sm text-gray-500">Total de pedidos mostrados: {filteredOrders.length}</p>
                    <p className="text-base md:text-lg font-bold mt-1 md:mt-2">
                      Total: {formatCurrency(
                        filteredOrders
                          .filter(o => o.status !== 'cancelled')
                          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;

