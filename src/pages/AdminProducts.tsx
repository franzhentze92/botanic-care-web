import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Loader2,
  Package,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  XCircle,
  BarChart3,
  Grid3x3,
  List,
  Code,
  Clock,
  PlayCircle,
  Eye as EyeIcon
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminProducts, 
  useDeleteProduct
} from '@/hooks/useAdminProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  // Hooks de autenticación
  const { user } = useAuth();
  
  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  
  // Hooks de Supabase
  const { data: products = [], isLoading, error } = useAdminProducts();
  const deleteProductMutation = useDeleteProduct();
  const { data: productCategories = [] } = useProductCategories();
  const { data: orders = [] } = useAdminOrders();
  
  // Obtener order_items para calcular productos vendidos
  const [orderItems, setOrderItems] = React.useState<any[]>([]);
  const [isLoadingOrderItems, setIsLoadingOrderItems] = React.useState(true);

  React.useEffect(() => {
    const fetchOrderItems = async () => {
      if (orders.length === 0) {
        setIsLoadingOrderItems(false);
        return;
      }
      
      try {
        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, order_id, quantity')
          .in('order_id', orderIds);

        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          setOrderItems([]);
        } else {
          setOrderItems(items || []);
        }
      } catch (error) {
        console.error('Error fetching order items:', error);
        setOrderItems([]);
      } finally {
        setIsLoadingOrderItems(false);
      }
    };

    fetchOrderItems();
  }, [orders]);

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // Estados para búsqueda, filtros, paginación y vista
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Map product categories from database to select format
  const categories = productCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  // Helper function to get category label by ID
  const getCategoryLabel = (categoryId: string) => {
    const category = productCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Helper function to get category color (cycling through colors for dynamic categories)
  const getCategoryColor = (categoryId: string) => {
    const categoryIndex = productCategories.findIndex(cat => cat.id === categoryId);
    const colors = [
      'bg-[#7d8768]',
      'bg-[#313522]',
      'bg-[#8e421e]',
      'bg-[#b9a035]',
    ];
    return colors[categoryIndex % colors.length] || 'bg-gray-600';
  };

  // Manejar eliminar producto
  const confirmDelete = async () => {
    if (deleteConfirm) {
      const productToDelete = products.find(p => p.id === deleteConfirm);
      try {
        await deleteProductMutation.mutateAsync(deleteConfirm);
        setDeleteConfirm(null);
        toast.success('Producto eliminado exitosamente', {
          description: productToDelete ? `El producto "${productToDelete.name}" ha sido eliminado.` : 'El producto ha sido eliminado.',
        });
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  // Calcular estadísticas reales de productos
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.in_stock).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.in_stock ? 1 : 0)), 0);
    const avgPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
    
    // Productos por categoría
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Productos nuevos (con badge NUEVO o creados en los últimos 30 días)
    const newProducts = products.filter(p => {
      if (p.badge === 'NUEVO') return true;
      if (!p.created_at) return false;
      const createdDate = new Date(p.created_at);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 30;
    }).length;
    
    // Productos en oferta (con badge OFERTA o con original_price mayor a price)
    const onSaleProducts = products.filter(p => {
      return p.badge === 'OFERTA' || (p.original_price && p.original_price > p.price);
    }).length;
    
    // Productos más vendidos (con badge MÁS VENDIDO)
    const bestsellersProducts = products.filter(p => p.badge === 'MÁS VENDIDO').length;
    
    // Productos de temporada (con badge TEMPORADA)
    const seasonalProducts = products.filter(p => p.badge === 'TEMPORADA').length;
    
    // Categoría con más productos
    const categoryWithMostProducts = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const topCategoryCount = categoryWithMostProducts ? categoryWithMostProducts[1] : 0;

    // Productos recientes (últimos 5)
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);

    return {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalValue,
      avgPrice,
      categoryCounts,
      recentProducts,
      newProducts,
      onSaleProducts,
      bestsellersProducts,
      seasonalProducts,
      topCategoryCount
    };
  }, [products, orderItems]);

  // Filtrar productos
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    // Filtro por categoría
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Filtro por stock
    if (filterStock === 'in-stock') {
      filtered = filtered.filter(p => p.in_stock);
    } else if (filterStock === 'out-of-stock') {
      filtered = filtered.filter(p => !p.in_stock);
    }

    return filtered;
  }, [products, searchQuery, filterCategory, filterStock]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStock]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-[#7d8768]" />
        </div>
      </AdminLayout>
    );
  }

  // Si no es el admin autorizado, mostrar mensaje de acceso denegado
  if (!isAuthorizedAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md bg-white border border-gray-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-[#9d627b] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">Acceso Denegado</h2>
              <p className="text-gray-600 mb-6 font-audrey">
                No tienes permisos para acceder al panel de administración. 
                Solo los administradores pueden acceder a esta sección.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Solo la cuenta admin@botaniccare.com tiene acceso al panel de administración.
              </p>
              <Button 
                asChild
                className="bg-[#7d8768] hover:bg-[#6d7660] text-white"
              >
                <a href="/dashboard">Ir a Mi Cuenta</a>
              </Button>
            </CardContent>
          </Card>
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
              <AlertTriangle className="h-12 w-12 text-[#9d627b] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar productos</h2>
              <p className="text-gray-600">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Gestión de Productos"
          description="Accede a información, credenciales, documentos entregables y todo lo necesario de tus productos"
          actionButton={{
            label: "Agregar Nuevo Producto",
            onClick: () => navigate('/admin/products/new'),
            icon: Plus
          }}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
              {/* Total Productos */}
              <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Total Productos</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.totalProducts}</p>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Package className="h-4 w-4 md:h-6 md:w-6 text-[#7d8768]" />
                      <p className="text-[10px] md:text-xs text-gray-600">Productos registrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* En Stock */}
              <Card className="bg-[#7d8768]/10 border border-[#7d8768]/30 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">En Stock</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.inStockProducts}</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-[#7d8768]" />
                      <p className="text-xs text-gray-600">Productos disponibles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nuevos */}
              <Card className="bg-purple-50 border border-purple-200 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Nuevos</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.newProducts}</p>
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-purple-600" />
                      <p className="text-xs text-gray-600">Productos nuevos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* En Oferta */}
              <Card className="bg-red-50 border border-red-200 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">En Oferta</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.onSaleProducts}</p>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                      <p className="text-xs text-gray-600">Productos con descuento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Temporada */}
              <Card className="bg-amber-50 border border-amber-200 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Temporada</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.seasonalProducts}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-6 w-6 text-amber-600" />
                      <p className="text-xs text-gray-600">Productos de temporada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agotados */}
              <Card className="bg-red-50 border border-red-200 shadow-md rounded-lg">
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col items-start">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Agotados</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{stats.outOfStockProducts}</p>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <p className="text-xs text-gray-600">Sin stock disponible</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 shadow-md rounded-lg mb-6 md:mb-8">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Buscar productos</p>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Buscar productos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="w-full md:w-[200px]">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Stock Filter */}
                    <div className="w-full md:w-[200px]">
                      <Select value={filterStock} onValueChange={setFilterStock}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="in-stock">En Stock</SelectItem>
                          <SelectItem value="out-of-stock">Agotados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sorting */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Ordenar por:</span>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 h-8"
                      >
                        Nombre ↑↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 h-8"
                      >
                        Tipo ↑↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 h-8"
                      >
                        Estado ↑↓
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-[#7d8768] hover:bg-[#6d7660] text-white h-8"
                      >
                        Fecha
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirm(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#9d627b]/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-[#9d627b]" />
                  </div>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-gray-900">Confirmar Eliminación</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar el producto "{products.find(p => p.id === deleteConfirm)?.name}"? 
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button 
                    onClick={confirmDelete}
                    disabled={deleteProductMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteProductMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Eliminar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteConfirm(null)}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        {/* Products List */}
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-editorial-new">
                Productos {filteredProducts.length !== products.length && `(${filteredProducts.length})`}
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-[#7d8768] text-white hover:bg-[#7a7539]' : ''}
                >
                  <List className="h-4 w-4 mr-2" />
                  Tabla
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#7d8768] text-white hover:bg-[#7a7539]' : ''}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            </div>
            
            {viewMode === 'table' ? (
              <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
                <CardContent className="p-0">
                  {paginatedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery || filterCategory !== 'all' || filterStock !== 'all' 
                          ? 'No se encontraron productos' 
                          : 'No hay productos'}
                      </h3>
                      <p className="text-gray-600">
                        {searchQuery || filterCategory !== 'all' || filterStock !== 'all'
                          ? 'Intenta ajustar tus filtros de búsqueda'
                          : 'Comienza agregando tu primer producto'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Imagen</TableHead>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedProducts.map((product) => (
                              <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                    <img 
                                      src={product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=64&h=64&fit=crop&crop=center'} 
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=64&h=64&fit=crop&crop=center';
                                      }}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 text-sm font-gilda-display">{product.name}</h3>
                                    <p className="text-xs text-gray-500 font-audrey">SKU: {product.sku}</p>
                                    {product.badge && (
                                      <Badge className={`mt-1 text-white border-0 text-xs font-body ${
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
                                </TableCell>
                                <TableCell>
                                  <Badge className={`text-white border-0 ${getCategoryColor(product.category)}`}>
                                    {getCategoryLabel(product.category)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-gray-600 font-audrey max-w-xs truncate" title={product.description}>
                                    {product.description}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[#7d8768]">Q. {product.price}</span>
                                    {product.original_price && product.original_price > product.price && (
                                      <span className="text-gray-500 line-through text-xs">Q. {product.original_price}</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm text-gray-600">
                                      {product.in_stock ? 'En Stock' : 'Sin Stock'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/products/${product.id}`);
                                      }}
                                      className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                                      title="Ver Producto"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/products/${product.id}/edit`);
                                      }}
                                      className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                      title="Editar Producto"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm(product.id);
                                      }}
                                      className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                                      title="Eliminar Producto"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-3">
                        {paginatedProducts.map((product) => (
                          <Card key={product.id} className="border-l-4 border-l-[#7d8768]">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                  <img 
                                    src={product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop&crop=center'} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop&crop=center';
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm text-gray-900 font-gilda-display line-clamp-1">{product.name}</h3>
                                      <p className="text-xs text-gray-500 font-audrey mt-0.5">SKU: {product.sku}</p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/admin/products/${product.id}`);
                                        }}
                                        title="Ver"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/admin/products/${product.id}/edit`);
                                        }}
                                        title="Editar"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-7 w-7 text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirm(product.id);
                                        }}
                                        title="Eliminar"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge className={`text-white border-0 text-[10px] ${getCategoryColor(product.category)}`}>
                                        {getCategoryLabel(product.category)}
                                      </Badge>
                                      {product.badge && (
                                        <Badge className={`text-white border-0 text-[10px] font-body ${
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
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-[#7d8768]">Q. {product.price}</span>
                                      {product.original_price && product.original_price > product.price && (
                                        <span className="text-gray-500 line-through text-[10px]">Q. {product.original_price}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                      <span className="text-gray-600 text-[10px]">
                                        {product.in_stock ? 'En Stock' : 'Sin Stock'}
                                      </span>
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
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery || filterCategory !== 'all' || filterStock !== 'all' 
                        ? 'No se encontraron productos' 
                        : 'No hay productos'}
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || filterCategory !== 'all' || filterStock !== 'all'
                        ? 'Intenta ajustar tus filtros de búsqueda'
                        : 'Comienza agregando tu primer producto'}
                    </p>
                  </div>
                ) : (
                  paginatedProducts.map((product) => {
                    // Determinar el estado y color del borde
                    let statusColor = 'botanic';
                    let statusText = 'Pendiente';
                    let borderColor = 'border-[#9d627b]/30';
                    let badgeBgColor = 'bg-[#9d627b]/10';
                    let badgeTextColor = 'text-[#9d627b]';
                    
                    if (product.in_stock) {
                      const createdDate = product.created_at ? new Date(product.created_at) : null;
                      const daysSinceCreation = createdDate 
                        ? (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
                        : 0;
                      
                      if (daysSinceCreation <= 7) {
                        statusColor = 'botanic-olive';
                        statusText = 'En Progreso';
                        borderColor = 'border-blue-200';
                        badgeBgColor = 'bg-blue-100';
                        badgeTextColor = 'text-blue-700';
                      } else {
                        statusColor = 'botanic-green';
                        statusText = 'Entregado';
                        borderColor = 'border-emerald-200';
                        badgeBgColor = 'bg-emerald-100';
                        badgeTextColor = 'text-emerald-700';
                      }
                    } else {
                      statusColor = 'botanic';
                      statusText = 'Pendiente';
                      borderColor = 'border-yellow-200';
                      badgeBgColor = 'bg-yellow-100';
                      badgeTextColor = 'text-yellow-700';
                    }

                    return (
                      <Card key={product.id} className={`bg-white border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all`}>
                        <CardContent className="p-5">
                          {/* Header with icon and title */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-[#7d8768] flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 mb-1 font-gilda-display line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 font-audrey mb-2">
                                {getCategoryLabel(product.category) || 'Producto'}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 font-audrey line-clamp-2 min-h-[2.5rem]">
                            {product.description || `SKU: ${product.sku} | Precio: Q. ${product.price}`}
                          </p>

                          {/* Price and info */}
                          <div className="mb-4 text-xs text-gray-500 space-y-1">
                            <p>SKU: {product.sku}</p>
                            <p>Precio: Q. {product.price}</p>
                            {product.original_price && product.original_price > product.price && (
                              <p className="line-through">Precio Original: Q. {product.original_price}</p>
                            )}
                          </div>

                          {/* Status badge */}
                          <div className="flex items-center justify-between">
                            <Badge className={`${badgeBgColor} ${badgeTextColor} border-0 px-3 py-1 rounded-full text-xs font-medium`}>
                              {statusText}
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/products/${product.id}`);
                                }}
                                className="h-8 w-8 p-0"
                                title="Ver Producto"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/products/${product.id}/edit`);
                                }}
                                className="h-8 w-8 p-0"
                                title="Editar Producto"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(product.id);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar Producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirm(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#9d627b]/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-[#9d627b]" />
                  </div>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-gray-900">Confirmar Eliminación</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar el producto "{products.find(p => p.id === deleteConfirm)?.name}"? 
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button 
                    onClick={confirmDelete}
                    disabled={deleteProductMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteProductMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Eliminar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteConfirm(null)}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

