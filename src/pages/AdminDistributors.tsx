import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Edit,
  Trash2,
  Eye,
  Loader2,
  Store,
  Search,
  Mail,
  Phone,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDistributors, useCreateDistributor, useUpdateDistributor, useDeleteDistributor } from '@/hooks/useAdminDistributors';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminDistributors: React.FC = () => {
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
  const [editingDistributor, setEditingDistributor] = useState<any | null>(null);
  const [viewingDistributor, setViewingDistributor] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    store_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Guatemala',
    notes: '',
  });

  const { data: distributors = [], isLoading } = useAdminDistributors({ searchQuery });
  const createDistributorMutation = useCreateDistributor();
  const updateDistributorMutation = useUpdateDistributor();
  const deleteDistributorMutation = useDeleteDistributor();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalDistributors = distributors.length;
    
    return { totalDistributors };
  }, [distributors]);

  // Ordenar distribuidores
  const sortedDistributors = useMemo(() => {
    const sorted = [...distributors];
    
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortColumn) {
          case 'store_name':
            aValue = a.store_name.toLowerCase();
            bValue = b.store_name.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'city':
            aValue = (a.city || '').toLowerCase();
            bValue = (b.city || '').toLowerCase();
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
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
  }, [distributors, sortColumn, sortDirection]);

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

  const handleOpenDialog = (distributor?: any) => {
    if (distributor) {
      setEditingDistributor(distributor);
      setFormData({
        store_name: distributor.store_name || '',
        contact_name: distributor.contact_name || '',
        email: distributor.email || '',
        phone: distributor.phone || '',
        address: distributor.address || '',
        city: distributor.city || '',
        state: distributor.state || '',
        zip_code: distributor.zip_code || '',
        country: distributor.country || 'Guatemala',
        notes: distributor.notes || '',
      });
    } else {
      setEditingDistributor(null);
      setFormData({
        store_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Guatemala',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDistributor(null);
  };

  const handleViewDistributor = (distributor: any) => {
    setViewingDistributor(distributor);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDistributor) {
        // Actualizar distribuidor existente
        await updateDistributorMutation.mutateAsync({
          id: editingDistributor.id,
          store_name: formData.store_name,
          contact_name: formData.contact_name || null,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          country: formData.country || null,
          notes: formData.notes || null,
        });
      } else {
        // Crear nuevo distribuidor
        await createDistributorMutation.mutateAsync({
          store_name: formData.store_name,
          contact_name: formData.contact_name || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip_code: formData.zip_code || undefined,
          country: formData.country || undefined,
          notes: formData.notes || undefined,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving distributor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este distribuidor? Esta acción no se puede deshacer.')) {
      try {
        await deleteDistributorMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting distributor:', error);
      }
    }
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
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Gestión de Distribuidores"
          description="Gestiona las tiendas que distribuyen tus productos"
        />
        
        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Distribuidores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDistributors}</div>
              <p className="text-xs text-muted-foreground">Tiendas registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros y Búsqueda</CardTitle>
              <Button onClick={() => handleOpenDialog()} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Distribuidor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre de tienda, email, teléfono, ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Distribuidores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Distribuidores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : sortedDistributors.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No se encontraron distribuidores.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort('store_name')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Nombre de Tienda
                          {getSortIcon('store_name')}
                        </button>
                      </TableHead>
                      <TableHead>Contacto</TableHead>
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
                          onClick={() => handleSort('city')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Ubicación
                          {getSortIcon('city')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Fecha de Registro
                          {getSortIcon('created_at')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDistributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell className="font-medium">
                          {distributor.store_name}
                        </TableCell>
                        <TableCell>
                          {distributor.contact_name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {distributor.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {distributor.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {distributor.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {distributor.city ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{distributor.city}{distributor.state ? `, ${distributor.state}` : ''}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(distributor.created_at), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDistributor(distributor)}
                              title="Ver detalles"
                              className="hover:bg-blue-50 text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(distributor)}
                              title="Editar"
                              className="hover:bg-indigo-50 text-indigo-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(distributor.id)}
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
            )}
          </CardContent>
        </Card>

        {/* Diálogo de Formulario (Crear/Editar) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDistributor ? 'Editar Distribuidor' : 'Nuevo Distribuidor'}
              </DialogTitle>
              <DialogDescription>
                {editingDistributor 
                  ? 'Modifica la información del distribuidor' 
                  : 'Ingresa la información de la tienda distribuidora'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="store_name">Nombre de la Tienda *</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    required
                    placeholder="Ej: Tienda Natural"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nombre de Contacto</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="tienda@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+502 1234 5678"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle y número"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Departamento/Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Departamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">Código Postal</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="Código postal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="País"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional sobre el distribuidor..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDistributorMutation.isPending || updateDistributorMutation.isPending} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                  {(createDistributorMutation.isPending || updateDistributorMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingDistributor ? 'Actualizar' : 'Crear Distribuidor'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Ver Detalles */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Distribuidor</DialogTitle>
              <DialogDescription>
                Información completa del distribuidor
              </DialogDescription>
            </DialogHeader>
            {viewingDistributor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm text-gray-500">Nombre de la Tienda</Label>
                    <p className="font-medium text-lg">{viewingDistributor.store_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Contacto</Label>
                    <p className="font-medium">{viewingDistributor.contact_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium">{viewingDistributor.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Teléfono</Label>
                    <p className="font-medium">{viewingDistributor.phone || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-gray-500">Dirección</Label>
                    <p className="font-medium">
                      {viewingDistributor.address || '-'}
                      {viewingDistributor.city && `, ${viewingDistributor.city}`}
                      {viewingDistributor.state && `, ${viewingDistributor.state}`}
                      {viewingDistributor.zip_code && ` ${viewingDistributor.zip_code}`}
                      {viewingDistributor.country && `, ${viewingDistributor.country}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">ID</Label>
                    <p className="font-mono text-sm">{viewingDistributor.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Fecha de Registro</Label>
                    <p className="font-medium">
                      {format(new Date(viewingDistributor.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  {viewingDistributor.notes && (
                    <div className="md:col-span-2">
                      <Label className="text-sm text-gray-500">Notas</Label>
                      <p className="font-medium">{viewingDistributor.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => {
                    setViewDialogOpen(false);
                    handleOpenDialog(viewingDistributor);
                  }} className="bg-[#7d8768] hover:bg-[#6d7660] text-white">
                    Editar
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

export default AdminDistributors;

