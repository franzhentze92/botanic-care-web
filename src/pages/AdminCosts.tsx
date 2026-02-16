import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  TrendingDown,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCosts, useCreateCost, useUpdateCost, useDeleteCost, Cost } from '@/hooks/useAdminCosts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminCosts: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Estados para diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: 'otros' as Cost['category'],
    frequency: 'monthly' as Cost['frequency'],
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    next_payment_date: '',
  });

  const categoryOptions = [
    { value: 'sueldo', label: 'Sueldo' },
    { value: 'redes_sociales', label: 'Redes Sociales' },
    { value: 'impuestos', label: 'Impuestos' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'otros', label: 'Otros' },
  ];

  const frequencyOptions = [
    { value: 'one_time', label: 'Puntual' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
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

  // Preparar filtros
  const filters = useMemo(() => {
    const f: any = {};
    if (filterCategory !== 'all') f.category = filterCategory;
    if (filterFrequency !== 'all') f.frequency = filterFrequency;
    
    // Agregar fechas basadas en el rango seleccionado
    const dateRangeValues = getDateRange(dateRange);
    if (dateRangeValues.startDate) f.startDate = dateRangeValues.startDate;
    if (dateRangeValues.endDate) f.endDate = dateRangeValues.endDate;
    
    return f;
  }, [filterCategory, filterFrequency, dateRange]);

  const { data: costs = [], isLoading } = useAdminCosts(filters);
  const createCostMutation = useCreateCost();
  const updateCostMutation = useUpdateCost();
  const deleteCostMutation = useDeleteCost();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);
    const monthly = costs
      .filter(c => c.frequency === 'monthly')
      .reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);
    const thisMonth = costs
      .filter(c => {
        const costDate = new Date(c.date);
        const now = new Date();
        return costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);
    
    return { total, monthly, thisMonth };
  }, [costs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sueldo: 'bg-blue-100 text-blue-800 border-blue-300',
      redes_sociales: 'bg-pink-100 text-pink-800 border-pink-300',
      impuestos: 'bg-red-100 text-red-800 border-red-300',
      marketing: 'bg-purple-100 text-purple-800 border-purple-300',
      servicios: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      alquiler: 'bg-amber-100 text-amber-800 border-amber-300',
      otros: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return colors[category] || colors.otros;
  };

  const getFrequencyLabel = (frequency: string) => {
    return frequencyOptions.find(opt => opt.value === frequency)?.label || frequency;
  };

  const handleOpenDialog = (cost?: Cost) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        name: cost.name,
        description: cost.description || '',
        amount: cost.amount.toString(),
        category: cost.category,
        frequency: cost.frequency,
        date: cost.date,
        is_recurring: cost.is_recurring,
        next_payment_date: cost.next_payment_date || '',
      });
    } else {
      setEditingCost(null);
      setFormData({
        name: '',
        description: '',
        amount: '',
        category: 'otros',
        frequency: 'monthly',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        next_payment_date: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const costData = {
      name: formData.name,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      date: formData.date,
      is_recurring: formData.is_recurring,
      next_payment_date: formData.next_payment_date || null,
    };

    try {
      if (editingCost) {
        await updateCostMutation.mutateAsync({ id: editingCost.id, ...costData });
      } else {
        await createCostMutation.mutateAsync(costData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving cost:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este costo?')) {
      try {
        await deleteCostMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting cost:', error);
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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Gestión de Costos"
          description="Registra y gestiona todos los costos operativos"
          actionButton={{
            label: "Nuevo Costo",
            onClick: () => handleOpenDialog(),
            icon: Plus
          }}
        />
        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total de Costos</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.total)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {costs.length} {costs.length === 1 ? 'costo registrado' : 'costos registrados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Costos Mensuales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.monthly)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Costos recurrentes mensuales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Este Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Costos del mes actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Botón Agregar */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <CardTitle className="text-base md:text-lg">Filtros</CardTitle>
              <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Costo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las frecuencias</SelectItem>
                  {frequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

        {/* Tabla de Costos */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Lista de Costos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : costs.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No se encontraron costos con los filtros seleccionados.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Recurrente</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costs.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {cost.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cost.category)}>
                            {categoryOptions.find(c => c.value === cost.category)?.label || cost.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{getFrequencyLabel(cost.frequency)}</TableCell>
                        <TableCell>
                          {format(new Date(cost.date), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(parseFloat(cost.amount.toString()))}
                        </TableCell>
                        <TableCell>
                          {cost.is_recurring ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Sí
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(cost)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cost.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
                  {costs.map((cost) => (
                    <Card key={cost.id} className="border-l-4 border-l-[#7d8768]">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 mb-1">{cost.name}</h3>
                              {cost.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{cost.description}</p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge className={getCategoryColor(cost.category)}>
                                  {categoryOptions.find(c => c.value === cost.category)?.label || cost.category}
                                </Badge>
                                {cost.is_recurring ? (
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                    Recurrente
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-600 text-xs">
                                    Puntual
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDialog(cost)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleDelete(cost.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="pt-2 border-t space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs text-muted-foreground">Frecuencia:</span>
                                <p className="font-semibold text-sm">{getFrequencyLabel(cost.frequency)}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Fecha:</span>
                                <p className="font-semibold text-sm">
                                  {format(new Date(cost.date), 'dd/MM/yyyy', { locale: es })}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Monto:</span>
                              <p className="font-bold text-base text-[#7d8768]">
                                {formatCurrency(parseFloat(cost.amount.toString()))}
                              </p>
                            </div>
                            {cost.is_recurring && cost.next_payment_date && (
                              <div>
                                <span className="text-xs text-muted-foreground">Próximo Pago:</span>
                                <p className="font-semibold text-sm">
                                  {format(new Date(cost.next_payment_date), 'dd/MM/yyyy', { locale: es })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Resumen */}
            {costs.length > 0 && (
              <div className="mt-4 md:mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-xs md:text-sm text-gray-500">Total de costos mostrados: {costs.length}</p>
                    <p className="text-base md:text-lg font-bold mt-1 md:mt-2">
                      Total: {formatCurrency(
                        costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de Formulario */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCost ? 'Editar Costo' : 'Nuevo Costo'}
              </DialogTitle>
              <DialogDescription>
                {editingCost ? 'Modifica la información del costo' : 'Ingresa la información del nuevo costo'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (Q) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Cost['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value as Cost['frequency'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_recurring" className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Es recurrente
                  </Label>
                </div>

                {formData.is_recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="next_payment_date">Próxima Fecha de Pago</Label>
                    <Input
                      id="next_payment_date"
                      type="date"
                      value={formData.next_payment_date}
                      onChange={(e) => setFormData({ ...formData, next_payment_date: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCostMutation.isPending || updateCostMutation.isPending}>
                  {(createCostMutation.isPending || updateCostMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCost ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCosts;

