import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOperationalAnalytics } from '@/hooks/useAdminOperationalAnalytics';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  Clock as ClockIcon,
  DollarSign,
  Activity,
  Factory,
  Warehouse,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminOperationalAnalytics: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [period, setPeriod] = useState<'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'last_year' | 'all'>('all');

  const { data: analytics, isLoading } = useAdminOperationalAnalytics({ period });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Valores por defecto
  const analyticsData = useMemo(() => {
    return analytics || {
      totalOrders: 0,
      monthlyOrders: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageOrderValue: 0,
      averageProcessingTime: 0,
      cancellationRate: 0,
      ordersByMonth: [],
      topProducts: [],
      ordersByStatus: [],
      ordersByDayOfWeek: [],
      ordersByHour: [],
      production: {
        totalBatches: 0,
        batchesByStatus: [],
        batchesByMonth: [],
        batchesByProduct: [],
        averageBatchSize: 0,
      },
      inventory: {
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        itemsByCategory: [],
        stockMovements: [],
      },
      distributors: {
        totalDistributors: 0,
        totalShipments: 0,
        totalReturns: 0,
        shipmentsByMonth: [],
        stockByDistributor: [],
        topProductsByDistributor: [],
      },
    };
  }, [analytics]);

  // Preparar datos para gráficos
  const chartDataMonthly = useMemo(() => {
    if (!analyticsData.ordersByMonth) return [];
    return analyticsData.ordersByMonth.map(item => ({
      mes: format(parseISO(item.month + '-01'), 'MMM yyyy', { locale: es }),
      Pedidos: item.orders,
      Ingresos: item.totalRevenue,
      'Ticket Promedio': item.averageOrderValue,
    }));
  }, [analyticsData]);

  const statusChartData = useMemo(() => {
    if (!analyticsData.ordersByStatus) return [];
    return analyticsData.ordersByStatus.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      percentage: item.percentage,
    }));
  }, [analyticsData]);

  const dayOfWeekData = useMemo(() => {
    if (!analyticsData.ordersByDayOfWeek) return [];
    return analyticsData.ordersByDayOfWeek;
  }, [analyticsData]);

  const hourData = useMemo(() => {
    if (!analyticsData.ordersByHour) return [];
    return analyticsData.ordersByHour.map(item => ({
      hora: `${item.hour}:00`,
      pedidos: item.count,
    }));
  }, [analyticsData]);

  const COLORS = ['#7d8768', '#9d627b', '#7a7539', '#8b6f47', '#6b8e9f', '#a67856', '#c8a882', '#5b7a6b'];

  const chartConfig = {
    Pedidos: {
      label: 'Pedidos',
      color: 'hsl(217, 91%, 60%)',
    },
    Ingresos: {
      label: 'Ingresos',
      color: 'hsl(142, 76%, 36%)',
    },
    'Ticket Promedio': {
      label: 'Ticket Promedio',
      color: 'hsl(43, 74%, 66%)',
    },
  };

  const statusColors: Record<string, string> = {
    pending: '#fbbf24',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Análisis Operativo"
          description="Métricas de eficiencia operativa, pedidos y productos más vendidos"
        />
        {/* Filtros */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div>
                <Label htmlFor="period" className="text-sm md:text-base font-semibold">Período de Análisis</Label>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor="period" className="whitespace-nowrap text-sm">Período:</Label>
                  <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                    <SelectTrigger id="period" className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_24h">Últimas 24 horas</SelectItem>
                      <SelectItem value="last_7d">Últimos 7 días</SelectItem>
                      <SelectItem value="last_30d">Últimos 30 días</SelectItem>
                      <SelectItem value="last_90d">Últimos 90 días</SelectItem>
                      <SelectItem value="last_year">Último año</SelectItem>
                      <SelectItem value="all">Todo el tiempo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{analyticsData.totalOrders}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {analyticsData.monthlyOrders} este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{analyticsData.averageProcessingTime.toFixed(1)} días</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Procesamiento promedio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ticket Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(analyticsData.averageOrderValue)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Por pedido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Tasa de Cancelación</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className={`text-xl md:text-2xl font-bold ${analyticsData.cancellationRate > 10 ? 'text-red-600' : analyticsData.cancellationRate > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                {formatPercentage(analyticsData.cancellationRate)}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {analyticsData.cancellationRate > 10 ? 'Alto' : analyticsData.cancellationRate > 5 ? 'Moderado' : 'Bajo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Pedidos por Mes */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Pedidos por Mes</CardTitle>
            <CardDescription className="text-xs md:text-sm">Evolución mensual de pedidos e ingresos</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="w-full overflow-x-auto">
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] md:h-[400px] w-full min-w-[300px]">
                <BarChart data={chartDataMonthly} width={undefined} height={undefined}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Pedidos" fill={chartConfig.Pedidos.color} />
                  <Bar dataKey="Ingresos" fill={chartConfig.Ingresos.color} />
                  <Bar dataKey="Ticket Promedio" fill={chartConfig['Ticket Promedio'].color} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos en Grid: Estado de Pedidos y Productos Más Vendidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Gráfico de Pastel - Pedidos por Estado */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Pedidos por Estado</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribución de pedidos según estado</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full min-w-[280px]">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.name.toLowerCase()] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">{payload[0].name}</span>
                                <span className="text-sm font-bold">{payload[0].value} pedidos</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Pedidos por Día de la Semana */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Pedidos por Día de la Semana</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribución semanal de pedidos</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full min-w-[300px]">
                  <BarChart data={dayOfWeekData} width={undefined} height={undefined}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill={chartConfig.Pedidos.color} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Pedidos por Hora del Día */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Pedidos por Hora del Día</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribución horaria de pedidos</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[280px] md:h-[300px] w-full min-w-[350px]">
                  <BarChart data={hourData} width={undefined} height={undefined}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pedidos" fill={chartConfig.Pedidos.color} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos Más Vendidos */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Productos Más Vendidos</CardTitle>
            <CardDescription className="text-xs md:text-sm">Top 10 productos por cantidad vendida</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {analyticsData.topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No hay datos de productos vendidos en este período</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm md:text-base">
                      #{index + 1}
                    </div>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{product.product_name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                        <span>Cantidad: {product.total_quantity}</span>
                        <span>Pedidos: {product.order_count}</span>
                        <span className="font-medium text-foreground">
                          Ingresos: {formatCurrency(product.total_revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==================== SECCIÓN DE PRODUCCIÓN ==================== */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Factory className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            <h2 className="text-xl md:text-2xl font-bold">Análisis de Producción</h2>
          </div>

          {/* KPIs de Producción */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Total de Batches</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold">{analyticsData.production.totalBatches}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Tamaño promedio: {analyticsData.production.averageBatchSize.toFixed(0)} unidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Batches Completados</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">
                  {analyticsData.production.batchesByStatus.find(s => s.status === 'completado')?.count || 0}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  {analyticsData.production.batchesByStatus.find(s => s.status === 'completado')?.quantity || 0} unidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">En Producción</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {analyticsData.production.batchesByStatus.find(s => s.status === 'en_produccion')?.count || 0}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Batches activos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Producción */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Batches por Estado */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Batches por Estado</CardTitle>
                <CardDescription className="text-xs md:text-sm">Distribución de batches según estado</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="w-full overflow-x-auto">
                  <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full min-w-[280px]">
                    <PieChart>
                      <Pie
                        data={analyticsData.production.batchesByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.production.batchesByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Batches por Mes */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Producción por Mes</CardTitle>
                <CardDescription className="text-xs md:text-sm">Evolución mensual de batches y cantidad producida</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="w-full overflow-x-auto">
                  <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full min-w-[300px]">
                    <BarChart data={analyticsData.production.batchesByMonth.map(item => ({
                      mes: format(parseISO(item.month + '-01'), 'MMM yyyy', { locale: es }),
                      Batches: item.batches,
                      Cantidad: item.quantity,
                    }))} width={undefined} height={undefined}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="Batches" fill={chartConfig.Pedidos.color} />
                      <Bar dataKey="Cantidad" fill={chartConfig.Ingresos.color} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Productos por Producción - Ancho Completo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Top Productos por Cantidad */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Top Productos por Cantidad</CardTitle>
                <CardDescription className="text-xs md:text-sm">Productos con más unidades producidas</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {analyticsData.production.batchesByProduct.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-sm">No hay datos de producción en este período</p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="h-[280px] md:h-[300px] w-full min-w-[350px]">
                      <BarChart data={analyticsData.production.batchesByProduct.slice(0, 5).map(item => ({
                        producto: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
                        cantidad: item.total_quantity,
                      }))} width={undefined} height={undefined}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="producto" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="cantidad" fill={chartConfig.Ingresos.color} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Productos por Batches */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Top Productos por Batches</CardTitle>
                <CardDescription className="text-xs md:text-sm">Productos con más batches producidos</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {analyticsData.production.batchesByProduct.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-sm">No hay datos de producción en este período</p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="h-[280px] md:h-[300px] w-full min-w-[350px]">
                      <BarChart data={analyticsData.production.batchesByProduct
                        .sort((a, b) => b.batches - a.batches)
                        .slice(0, 5)
                        .map(item => ({
                          producto: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
                          batches: item.batches,
                        }))} width={undefined} height={undefined}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="producto" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="batches" fill={chartConfig.Pedidos.color} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOperationalAnalytics;

