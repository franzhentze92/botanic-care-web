import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  Factory,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useFinishedProductsStock, FinishedProductStock } from '@/hooks/useAdminFinishedProductsInventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminFinishedProductsInventory: React.FC = () => {
  const { user } = useAuth();

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [minStockFilter, setMinStockFilter] = useState<boolean>(false);

  // Fetch stock
  const { data: stock = [], isLoading } = useFinishedProductsStock({
    searchQuery: searchQuery || undefined,
    minStock: minStockFilter ? 0 : undefined,
  });

  // Filtrar por stock bajo (solo si está activo el filtro)
  const filteredStock = useMemo(() => {
    if (minStockFilter) {
      return stock.filter(s => s.total_stock === 0);
    }
    return stock;
  }, [stock, minStockFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const totalProducts = stock.length;
    const totalStock = stock.reduce((sum, s) => sum + s.total_stock, 0);
    const inProduction = stock.reduce((sum, s) => sum + s.in_production, 0);
    const inWarehouse = stock.reduce((sum, s) => sum + s.in_warehouse, 0);
    const completed = stock.reduce((sum, s) => sum + s.completed, 0);
    const lowStock = stock.filter(s => s.total_stock === 0).length;

    return {
      totalProducts,
      totalStock,
      inProduction,
      inWarehouse,
      completed,
      lowStock,
    };
  }, [stock]);

  const getStockStatus = (item: FinishedProductStock) => {
    if (item.total_stock === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-800 border-red-300' };
    } else if (item.total_stock <= 10) {
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  if (!user) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-editorial-new">Acceso Denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Inventario de Productos Terminados"
          description="Gestiona el stock de productos terminados basado en la producción"
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Productos</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{kpis.totalProducts}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-[#7d8768]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Stock Total</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{kpis.totalStock.toFixed(0)}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">En Producción</p>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">{kpis.inProduction.toFixed(0)}</p>
                </div>
                <Factory className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Completados</p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-600">{kpis.completed.toFixed(0)}</p>
                </div>
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">En Almacén</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{kpis.inWarehouse.toFixed(0)}</p>
                </div>
                <Warehouse className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Sin Stock</p>
                  <p className="text-xl md:text-2xl font-bold text-red-600">{kpis.lowStock}</p>
                </div>
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                <Input
                  placeholder="Buscar por producto o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10"
                />
              </div>
              <Button
                variant={minStockFilter ? 'default' : 'outline'}
                onClick={() => setMinStockFilter(!minStockFilter)}
                className={`w-full sm:w-auto ${minStockFilter ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Sin Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Stock */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7d8768]" />
            <p className="text-gray-600 mt-2">Cargando inventario...</p>
          </Card>
        ) : filteredStock.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">
              {searchQuery || minStockFilter
                ? 'No se encontraron productos para los filtros seleccionados.'
                : 'Aún no se han producido productos terminados. Ve a la página de Producción para crear batches.'}
            </p>
          </Card>
        ) : (
          <Card>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock Disponible</TableHead>
                    <TableHead className="text-right">Completados</TableHead>
                    <TableHead className="text-right">Batches</TableHead>
                    <TableHead>Última Producción</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((stockItem) => {
                    const stockStatus = getStockStatus(stockItem);
                    return (
                      <TableRow key={stockItem.product_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {stockItem.product_image_url && (
                              <img
                                src={stockItem.product_image_url}
                                alt={stockItem.product_name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{stockItem.product_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{stockItem.product_sku}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${stockItem.total_stock === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {stockItem.total_stock.toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {stockItem.completed > 0 ? (
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                              {stockItem.completed.toFixed(0)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{stockItem.batches_count}</Badge>
                        </TableCell>
                        <TableCell>
                          {stockItem.last_production_date ? (
                            <span className="text-sm text-gray-600">
                              {format(new Date(stockItem.last_production_date), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-3">
              {filteredStock.map((stockItem) => {
                const stockStatus = getStockStatus(stockItem);
                return (
                  <Card key={stockItem.product_id} className={`border-l-4 ${stockItem.total_stock === 0 ? 'border-l-red-500' : stockItem.total_stock <= 10 ? 'border-l-yellow-500' : 'border-l-[#7d8768]'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {stockItem.product_image_url && (
                            <img
                              src={stockItem.product_image_url}
                              alt={stockItem.product_name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">{stockItem.product_name}</h3>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit mb-2">{stockItem.product_sku}</code>
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                          </div>
                        </div>
                        <div className="pt-2 border-t space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-muted-foreground">Stock Disponible:</span>
                              <p className={`font-bold text-sm ${stockItem.total_stock === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {stockItem.total_stock.toFixed(0)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Completados:</span>
                              <p className="font-semibold text-sm">
                                {stockItem.completed > 0 ? (
                                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-xs">
                                    {stockItem.completed.toFixed(0)}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-muted-foreground">Batches:</span>
                              <p className="font-semibold text-sm">
                                <Badge variant="outline" className="text-xs">{stockItem.batches_count}</Badge>
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Última Producción:</span>
                              <p className="font-semibold text-sm text-gray-600">
                                {stockItem.last_production_date ? (
                                  format(new Date(stockItem.last_production_date), 'dd/MM/yyyy', { locale: es })
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFinishedProductsInventory;

