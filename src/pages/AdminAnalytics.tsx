import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [period, setPeriod] = useState<'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'last_year' | 'all'>('all');

  const { data: analytics, isLoading } = useAdminAnalytics({ period });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Si no hay datos, mostrar valores por defecto en lugar de error
  const analyticsData = useMemo(() => {
    return analytics || {
      totalRevenue: 0,
      totalCosts: 0,
      netProfit: 0,
      profitMargin: 0,
      revenueByMonth: [],
      dailyAnalytics: [],
      costByCategory: [],
      revenueGrowth: 0,
      costGrowth: 0,
    };
  }, [analytics]);

  // Preparar datos para gráficos
  const chartDataMonthly = useMemo(() => {
    if (!analyticsData || !analyticsData.revenueByMonth) return [];
    return analyticsData.revenueByMonth.map(item => ({
      mes: format(parseISO(item.month + '-01'), 'MMM yyyy', { locale: es }),
      Ingresos: item.revenue,
      Costos: item.costs,
      Ganancia: item.profit,
    }));
  }, [analyticsData]);

  const chartDataDaily = useMemo(() => {
    if (!analyticsData || !analyticsData.dailyAnalytics) return [];
    // Mostrar solo los últimos 30 días
    return analyticsData.dailyAnalytics.slice(-30).map(item => ({
      fecha: format(parseISO(item.date), 'dd/MM'),
      Ingresos: item.revenue,
      Costos: item.costs,
      Ganancia: item.profit,
    }));
  }, [analyticsData]);

  const pieChartData = useMemo(() => {
    if (!analyticsData || !analyticsData.costByCategory) return [];
    return analyticsData.costByCategory.map(item => ({
      name: item.category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: item.amount,
      percentage: item.percentage,
    }));
  }, [analyticsData]);

  const COLORS = ['#7d8768', '#9d627b', '#7a7539', '#8b6f47', '#6b8e9f', '#a67856', '#c8a882'];

  const chartConfig = {
    Ingresos: {
      label: 'Ingresos',
      color: 'hsl(142, 76%, 36%)',
    },
    Costos: {
      label: 'Costos',
      color: 'hsl(0, 84%, 60%)',
    },
    Ganancia: {
      label: 'Ganancia',
      color: 'hsl(217, 91%, 60%)',
    },
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
          title="Análisis Financiero"
          description="Visualización completa de ingresos, costos y ganancias"
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
              <CardTitle className="text-xs md:text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
              <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mt-1">
                {analyticsData.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                )}
                <span className={`${analyticsData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                  {formatPercentage(analyticsData.revenueGrowth)} vs anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Costos Totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(analyticsData.totalCosts)}</div>
              <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mt-1">
                {analyticsData.costGrowth <= 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
                )}
                <span className={`${analyticsData.costGrowth <= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                  {formatPercentage(analyticsData.costGrowth)} vs anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ganancia Neta</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className={`text-xl md:text-2xl font-bold ${analyticsData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(analyticsData.netProfit)}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Margen: {analyticsData.profitMargin.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Margen de Ganancia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className={`text-xl md:text-2xl font-bold ${analyticsData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.profitMargin.toFixed(2)}%
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {analyticsData.profitMargin >= 0 ? 'Negocio rentable' : 'Pérdidas'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Ingresos vs Costos por Mes */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Ingresos vs Costos por Mes</CardTitle>
            <CardDescription className="text-xs md:text-sm">Comparación mensual de ingresos, costos y ganancias</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px] w-full">
              <BarChart data={chartDataMonthly} width={undefined} height={400}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Ingresos" fill={chartConfig.Ingresos.color} />
                <Bar dataKey="Costos" fill={chartConfig.Costos.color} />
                <Bar dataKey="Ganancia" fill={chartConfig.Ganancia.color} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Análisis Diario */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Análisis Diario (Últimos 30 días)</CardTitle>
            <CardDescription className="text-xs md:text-sm">Tendencias diarias de ingresos, costos y ganancias</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px] w-full">
              <BarChart data={chartDataDaily} width={undefined} height={400}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Ingresos" fill={chartConfig.Ingresos.color} />
                <Bar dataKey="Costos" fill={chartConfig.Costos.color} />
                <Bar dataKey="Ganancia" fill={chartConfig.Ganancia.color} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráficos en Grid: Desglose de Costos y Comparación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Gráfico de Pastel - Desglose de Costos por Categoría */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Desglose de Costos por Categoría</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribución de costos según categoría</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                <span className="text-sm font-bold">
                                  {formatCurrency(payload[0].value as number)}
                                </span>
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
            </CardContent>
          </Card>

          {/* Tabla de Resumen de Categorías */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Resumen de Costos por Categoría</CardTitle>
              <CardDescription className="text-xs md:text-sm">Detalle de costos agrupados por categoría</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {analyticsData.costByCategory.map((item, index) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="h-4 w-4 rounded flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs md:text-sm font-medium truncate">
                          {item.category
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs md:text-sm font-bold">{formatCurrency(item.amount)}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
                {analyticsData.costByCategory.length === 0 && (
                  <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
                    No hay costos registrados en este período
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

