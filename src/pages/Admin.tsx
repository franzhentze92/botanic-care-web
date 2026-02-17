import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useAdminRevenueStats } from '@/hooks/useAdminRevenue';
import { useAdminCosts } from '@/hooks/useAdminCosts';
import { useAdminInventoryItems } from '@/hooks/useAdminInventory';
import { useAdminProductionBatches } from '@/hooks/useAdminProduction';
import { useAdminCustomers } from '@/hooks/useAdminCustomers';
import { useAdminTasks } from '@/hooks/useAdminTasks';
import { useAdminEmployees } from '@/hooks/useAdminEmployees';
import { useBlogPosts } from '@/hooks/useBlog';
import { 
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  Code as CodeIcon,
  Eye,
  Factory,
  Warehouse,
  ClipboardList,
  Briefcase,
  FileText,
  FlaskConical,
  Activity
} from 'lucide-react';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Fetch data from all sections
  const { data: products = [], isLoading: productsLoading } = useAdminProducts();
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: revenueStats, isLoading: revenueLoading } = useAdminRevenueStats();
  const { data: costs = [], isLoading: costsLoading } = useAdminCosts();
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useAdminInventoryItems();
  const { data: productionBatches = [], isLoading: productionLoading } = useAdminProductionBatches();
  const { data: customers = [], isLoading: customersLoading } = useAdminCustomers();
  const { data: tasks = [], isLoading: tasksLoading } = useAdminTasks();
  const { data: employees = [], isLoading: employeesLoading } = useAdminEmployees();
  const { data: blogPosts = [], isLoading: blogLoading } = useBlogPosts({ limit: 100 });

  const isLoading = productsLoading || ordersLoading || revenueLoading || costsLoading || 
                    inventoryLoading || productionLoading || customersLoading || tasksLoading || 
                    employeesLoading || blogLoading;

  // Calcular estadísticas generales
  const stats = React.useMemo(() => {
    // Productos
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.in_stock).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const pendingProducts = products.filter(p => !p.in_stock && p.created_at).length;
    const needsReviewProducts = products.filter(p => !p.description || p.description.length < 20).length;

    // Pedidos
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    // Ingresos y Costos
    const totalRevenue = revenueStats?.totalRevenue || 0;
    const monthlyRevenue = revenueStats?.monthlyRevenue || 0;
    const todayRevenue = revenueStats?.todayRevenue || 0;
    const totalCosts = costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);
    const monthlyCosts = costs.filter(c => {
      const costDate = new Date(c.date);
      const now = new Date();
      return costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();
    }).reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);
    const netProfit = totalRevenue - totalCosts;
    const monthlyProfit = monthlyRevenue - monthlyCosts;

    // Inventario
    const totalInventoryItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => item.current_stock <= item.min_stock).length;

    // Producción
    const totalBatches = productionBatches.length;
    const activeBatches = productionBatches.filter(b => b.status === 'en_produccion').length;
    const completedBatches = productionBatches.filter(b => b.status === 'completado').length;

    // Clientes
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => (c.total_orders || 0) > 0).length;

    // Tareas
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    // Blog
    const totalBlogPosts = blogPosts.length;
    const publishedPosts = blogPosts.filter(p => p.status === 'published').length;

    // Empleados
    const totalEmployees = employees.length;

    return {
      products: {
        total: totalProducts,
        inStock: inStockProducts,
        outOfStock: outOfStockProducts,
        pending: pendingProducts,
        needsReview: needsReviewProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        delivered: deliveredOrders,
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        today: todayRevenue,
      },
      costs: {
        total: totalCosts,
        monthly: monthlyCosts,
      },
      profit: {
        total: netProfit,
        monthly: monthlyProfit,
      },
      inventory: {
        total: totalInventoryItems,
        lowStock: lowStockItems,
      },
      production: {
        total: totalBatches,
        active: activeBatches,
        completed: completedBatches,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
      },
      blog: {
        total: totalBlogPosts,
        published: publishedPosts,
      },
      employees: {
        total: totalEmployees,
      },
    };
  }, [products, orders, revenueStats, costs, inventoryItems, productionBatches, customers, tasks, blogPosts, employees]);

  if (!isAuthorizedAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md bg-white border border-gray-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-[#9d627b] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">Acceso Denegado</h2>
              <p className="text-gray-600 mb-6 font-audrey">
                No tienes permisos para acceder al panel de administración.
              </p>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Panel de Administración"
          description="Resumen general de todas las áreas de tu tienda"
        />

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-[#7d8768]">{formatCurrency(stats.revenue.total)}</p>
                  <p className="text-xs text-gray-500 mt-1">Este mes: {formatCurrency(stats.revenue.monthly)}</p>
                </div>
                <div className="w-12 h-12 bg-[#7d8768]/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#7d8768]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.orders.pending} pendientes</p>
                </div>
                <div className="w-12 h-12 bg-[#9d627b]/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-[#9d627b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.products.inStock} en stock</p>
                </div>
                <div className="w-12 h-12 bg-[#7d8768]/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#7d8768]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ganancia Neta</p>
                  <p className={`text-2xl font-bold ${stats.profit.total >= 0 ? 'text-[#7d8768]' : 'text-[#9d627b]'}`}>
                    {formatCurrency(stats.profit.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Este mes: {formatCurrency(stats.profit.monthly)}</p>
                </div>
                <div className="w-12 h-12 bg-[#7a7539]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[#7a7539]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#7d8768]" />
                  Productos
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">En Stock</p>
                  <p className="text-2xl font-bold text-[#7d8768]">{stats.products.inStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sin Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.products.outOfStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">En Revisión</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.products.needsReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#9d627b]" />
                  Pedidos
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.orders.pending}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procesando</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.orders.processing}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.orders.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos y Costos */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#7d8768]" />
                  Ingresos y Costos
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/revenue')}>
                  Ver detalles <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ingresos Totales</span>
                  <span className="text-lg font-bold text-[#7d8768]">{formatCurrency(stats.revenue.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Costos Totales</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(stats.costs.total)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-700">Ganancia Neta</span>
                  <span className={`text-xl font-bold ${stats.profit.total >= 0 ? 'text-[#7d8768]' : 'text-[#9d627b]'}`}>
                    {formatCurrency(stats.profit.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-[#7d8768]" />
                  Inventario
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Items Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inventory.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inventory.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Producción */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-[#7a7539]" />
                  Producción
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/production')}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Lotes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.production.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.production.active}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.production.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#7d8768]" />
                  Clientes
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/customers')}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.customers.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.customers.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tareas */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#9d627b]" />
                  Tareas
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tasks')}>
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tasks.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.tasks.pending}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.tasks.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog y Empleados */}
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#7d8768]" />
                Blog y Empleados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Posts del Blog</span>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blog')}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.blog.total}</p>
                  <p className="text-xs text-gray-500">{stats.blog.published} publicados</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Empleados</span>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/employees')}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.employees.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-editorial-new mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-blue-50 hover:border-blue-300" onClick={() => navigate('/admin/products')}>
              <Package className="h-5 w-5 mb-2 text-blue-600" />
              <span className="text-xs">Productos</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-purple-50 hover:border-purple-300" onClick={() => navigate('/admin/orders')}>
              <ShoppingCart className="h-5 w-5 mb-2 text-purple-600" />
              <span className="text-xs">Pedidos</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-indigo-50 hover:border-indigo-300" onClick={() => navigate('/admin/customers')}>
              <Users className="h-5 w-5 mb-2 text-indigo-600" />
              <span className="text-xs">Clientes</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-orange-50 hover:border-orange-300" onClick={() => navigate('/admin/inventory')}>
              <Warehouse className="h-5 w-5 mb-2 text-orange-600" />
              <span className="text-xs">Inventario</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-cyan-50 hover:border-cyan-300" onClick={() => navigate('/admin/analytics')}>
              <Activity className="h-5 w-5 mb-2 text-cyan-600" />
              <span className="text-xs">Análisis</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col hover:bg-gray-50 hover:border-gray-300" onClick={() => navigate('/admin/settings')}>
              <CodeIcon className="h-5 w-5 mb-2 text-gray-600" />
              <span className="text-xs">Ajustes</span>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
