import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Edit,
  Trash2,
  Eye,
  Loader2,
  Users,
  DollarSign,
  ShoppingCart,
  Search,
  Mail,
  Phone,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useAdminCustomers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estados para diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const { data: customers = [], isLoading } = useAdminCustomers({ searchQuery });
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalCustomers, totalOrders, totalRevenue, averageOrderValue };
  }, [customers]);

  // Ordenar clientes
  const sortedCustomers = useMemo(() => {
    const sorted = [...customers];
    
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortColumn) {
          case 'name':
            const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email;
            const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email;
            aValue = aName.toLowerCase();
            bValue = bName.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'total_orders':
            aValue = a.total_orders;
            bValue = b.total_orders;
            break;
          case 'total_spent':
            aValue = a.total_spent;
            bValue = b.total_spent;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sorted;
  }, [customers, sortColumn, sortDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCustomerName = (customer: any) => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    return fullName || customer.email.split('@')[0];
  };

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

  const handleOpenDialog = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        email: customer.email,
        password: '', // No mostramos la contraseña
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleViewCustomer = (customer: any) => {
    setViewingCustomer(customer);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        // Actualizar cliente existente
        await updateCustomerMutation.mutateAsync({
          user_id: editingCustomer.user_id,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          phone: formData.phone || null,
        });
      } else {
        // Crear nuevo cliente
        if (!formData.password) {
          toast.error('La contraseña es requerida para nuevos clientes');
          return;
        }
        await createCustomerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          phone: formData.phone || undefined,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteCustomerMutation.mutateAsync(userId);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleViewOrders = (customer: any) => {
    // Filtrar pedidos por este cliente y navegar a la página de pedidos con filtro
    navigate(`/admin/orders?customer=${customer.user_id}`);
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

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Gestión de Clientes"
          description="Gestiona la información y el historial de tus clientes"
        />
        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">De todos los clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ticket Promedio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Por pedido</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Clientes */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : sortedCustomers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No se encontraron clientes.</p>
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
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Nombre
                          {getSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Email
                          {getSortIcon('email')}
                        </button>
                      </TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Fecha de Registro
                          {getSortIcon('created_at')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('total_orders')}
                          className="flex items-center justify-end ml-auto hover:text-indigo-600 transition-colors"
                        >
                          Pedidos
                          {getSortIcon('total_orders')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('total_spent')}
                          className="flex items-center justify-end ml-auto hover:text-indigo-600 transition-colors"
                        >
                          Total Gastado
                          {getSortIcon('total_spent')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCustomers.map((customer) => (
                      <TableRow key={customer.user_id}>
                        <TableCell className="font-medium">
                          {getCustomerName(customer)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {customer.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">{customer.total_orders}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.total_spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewCustomer(customer)}
                              title="Ver detalles"
                              className="hover:bg-blue-50 text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(customer)}
                              title="Editar"
                              className="hover:bg-indigo-50 text-indigo-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(customer.user_id)}
                              title="Eliminar"
                              className="hover:bg-red-50 text-red-600"
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
                  {sortedCustomers.map((customer) => (
                    <Card key={customer.user_id} className="border-l-4 border-l-[#7d8768]">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 mb-2">{getCustomerName(customer)}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 truncate">{customer.email}</span>
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">{customer.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-600">
                                    {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: es })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => handleViewCustomer(customer)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-indigo-600"
                                onClick={() => handleOpenDialog(customer)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleDelete(customer.user_id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="pt-2 border-t space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs text-muted-foreground">Pedidos:</span>
                                <p className="font-semibold text-sm">
                                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs">
                                    {customer.total_orders}
                                  </Badge>
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Total Gastado:</span>
                                <p className="font-semibold text-sm text-[#7d8768]">{formatCurrency(customer.total_spent)}</p>
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

        {/* Diálogo de Formulario (Crear/Editar) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer 
                  ? 'Modifica la información del cliente' 
                  : 'Ingresa la información del nuevo cliente. Se creará una cuenta con este email y contraseña.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingCustomer}
                    placeholder="cliente@ejemplo.com"
                  />
                  {editingCustomer && (
                    <p className="text-xs text-gray-500">El email no se puede cambiar</p>
                  )}
                </div>

                {!editingCustomer && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Juan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Pérez"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+502 1234 5678"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                  {(createCustomerMutation.isPending || updateCustomerMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCustomer ? 'Actualizar' : 'Crear Cliente'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Ver Detalles */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
              <DialogDescription>
                Información completa del cliente
              </DialogDescription>
            </DialogHeader>
            {viewingCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Nombre</Label>
                    <p className="font-medium">{getCustomerName(viewingCustomer)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium">{viewingCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Teléfono</Label>
                    <p className="font-medium">{viewingCustomer.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">ID de Usuario</Label>
                    <p className="font-mono text-sm">{viewingCustomer.user_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Fecha de Registro</Label>
                    <p className="font-medium">
                      {format(new Date(viewingCustomer.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Último Pedido</Label>
                    <p className="font-medium">
                      {viewingCustomer.last_order_date
                        ? format(new Date(viewingCustomer.last_order_date), 'dd/MM/yyyy', { locale: es })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Total de Pedidos</Label>
                    <p className="font-medium text-lg">{viewingCustomer.total_orders}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Total Gastado</Label>
                    <p className="font-medium text-lg">{formatCurrency(viewingCustomer.total_spent)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => {
                    setViewDialogOpen(false);
                    handleViewOrders(viewingCustomer);
                  }} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                    Ver Pedidos
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;

