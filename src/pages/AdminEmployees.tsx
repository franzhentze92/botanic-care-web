import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Users,
  Briefcase,
  Search,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, Employee } from '@/hooks/useAdminEmployees';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminEmployees: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estados para diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active' as Employee['status'],
    notes: '',
  });

  const { data: employees = [], isLoading } = useAdminEmployees({ 
    searchQuery, 
    status: filterStatus, 
    position: filterPosition,
    department: filterDepartment,
  });
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  // Obtener opciones únicas para filtros
  const positionOptions = useMemo(() => {
    const positions = new Set(employees.map(e => e.position).filter(Boolean));
    return Array.from(positions).sort();
  }, [employees]);

  const departmentOptions = useMemo(() => {
    const departments = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(departments).sort();
  }, [employees]);

  const statusOptions = [
    { value: 'active', label: 'Activo', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactivo', icon: XCircle, color: 'bg-gray-100 text-gray-800' },
    { value: 'on_leave', label: 'En Licencia', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'terminated', label: 'Terminado', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  ];

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const inactive = employees.filter(e => e.status === 'inactive').length;
    const totalSalary = employees
      .filter(e => e.salary)
      .reduce((sum, e) => sum + parseFloat((e.salary || 0).toString()), 0);
    
    return { total, active, inactive, totalSalary };
  }, [employees]);

  // Ordenar empleados
  const sortedEmployees = useMemo(() => {
    const sorted = [...employees];
    
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortColumn) {
          case 'name':
            const aName = `${a.first_name} ${a.last_name}`.toLowerCase();
            const bName = `${b.first_name} ${b.last_name}`.toLowerCase();
            aValue = aName;
            bValue = bName;
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'position':
            aValue = a.position.toLowerCase();
            bValue = b.position.toLowerCase();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'hire_date':
            aValue = new Date(a.hire_date).getTime();
            bValue = new Date(b.hire_date).getTime();
            break;
          case 'salary':
            aValue = a.salary || 0;
            bValue = b.salary || 0;
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
  }, [employees, sortColumn, sortDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
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

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        position: employee.position,
        department: employee.department || '',
        hire_date: employee.hire_date,
        salary: employee.salary?.toString() || '',
        status: employee.status,
        notes: employee.notes || '',
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        hire_date: new Date().toISOString().split('T')[0],
        salary: '',
        status: 'active',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      position: formData.position,
      department: formData.department || null,
      hire_date: formData.hire_date,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      status: formData.status,
      notes: formData.notes || null,
    };

    try {
      if (editingEmployee) {
        await updateEmployeeMutation.mutateAsync({ id: editingEmployee.id, ...employeeData });
      } else {
        await createEmployeeMutation.mutateAsync(employeeData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting employee:', error);
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
          title="Gestión de Trabajadores"
          description="Gestiona la información de empleados y trabajadores"
          actionButton={{
            label: "Nuevo Trabajador",
            onClick: () => handleOpenDialog(),
            icon: Plus
          }}
        />
        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total de Trabajadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Trabajadores registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Trabajadores activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Inactivos</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Trabajadores inactivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Nómina Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalSalary)}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Suma de salarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-base md:text-lg">Filtros y Búsqueda</CardTitle>
              <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Trabajador
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cargos</SelectItem>
                  {positionOptions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departmentOptions.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Trabajadores */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Lista de Trabajadores</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : sortedEmployees.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No se encontraron trabajadores con los filtros seleccionados.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Nombre
                          {getSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Email
                          {getSortIcon('email')}
                        </button>
                      </TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('position')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Cargo
                          {getSortIcon('position')}
                        </button>
                      </TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('hire_date')}
                          className="flex items-center hover:text-purple-600 transition-colors"
                        >
                          Fecha Contratación
                          {getSortIcon('hire_date')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          onClick={() => handleSort('salary')}
                          className="flex items-center justify-end ml-auto hover:text-purple-600 transition-colors"
                        >
                          Salario
                          {getSortIcon('salary')}
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
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEmployees.map((employee) => {
                      const statusInfo = getStatusInfo(employee.status);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-sm">{employee.employee_code}</TableCell>
                          <TableCell className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {employee.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {employee.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {employee.phone}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell className="text-right">
                            {employee.salary ? formatCurrency(employee.salary) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewEmployee(employee)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(employee)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(employee.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {sortedEmployees.map((employee) => {
                    const statusInfo = getStatusInfo(employee.status);
                    return (
                      <Card key={employee.id} className="border-l-4 border-l-[#7d8768]">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-mono text-xs text-gray-500">{employee.employee_code}</span>
                                </div>
                                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                                  {employee.first_name} {employee.last_name}
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600 truncate">{employee.email}</span>
                                  </div>
                                  {employee.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-600">{employee.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">
                                      {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: es })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewEmployee(employee)}
                                  title="Ver detalles"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenDialog(employee)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleDelete(employee.id)}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="pt-2 border-t space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <span className="text-xs text-muted-foreground">Cargo:</span>
                                  <p className="font-medium text-xs">{employee.position}</p>
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs text-muted-foreground">Departamento:</span>
                                  <p className="font-medium text-xs">{employee.department || '-'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-xs text-muted-foreground">Salario:</span>
                                  <p className="font-semibold text-sm text-[#7d8768]">
                                    {employee.salary ? formatCurrency(employee.salary) : '-'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Estado:</span>
                                  <div className="mt-1">
                                    <Badge className={`${statusInfo.color} text-xs`}>
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de Formulario (Crear/Editar) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Editar Trabajador' : 'Nuevo Trabajador'}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee 
                  ? 'Modifica la información del trabajador' 
                  : 'Ingresa la información del nuevo trabajador'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    placeholder="Juan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    placeholder="Pérez"
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
                    placeholder="empleado@ejemplo.com"
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

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo/Puesto *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    placeholder="Gerente, Vendedor, Contador..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ventas, Administración, Marketing..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Fecha de Contratación *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salario (Q)</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Employee['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Notas adicionales sobre el trabajador..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}>
                  {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingEmployee ? 'Actualizar' : 'Crear Trabajador'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Ver Detalles */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Trabajador</DialogTitle>
              <DialogDescription>
                Información completa del trabajador
              </DialogDescription>
            </DialogHeader>
            {viewingEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Código de Empleado</Label>
                    <p className="font-mono font-medium">{viewingEmployee.employee_code}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Estado</Label>
                    <Badge className={getStatusInfo(viewingEmployee.status).color}>
                      {getStatusInfo(viewingEmployee.status).label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Nombre</Label>
                    <p className="font-medium">{viewingEmployee.first_name} {viewingEmployee.last_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium">{viewingEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Teléfono</Label>
                    <p className="font-medium">{viewingEmployee.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Cargo/Puesto</Label>
                    <p className="font-medium">{viewingEmployee.position}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Departamento</Label>
                    <p className="font-medium">{viewingEmployee.department || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Fecha de Contratación</Label>
                    <p className="font-medium">
                      {format(new Date(viewingEmployee.hire_date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Salario</Label>
                    <p className="font-medium text-lg">
                      {viewingEmployee.salary ? formatCurrency(viewingEmployee.salary) : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Fecha de Registro</Label>
                    <p className="font-medium">
                      {format(new Date(viewingEmployee.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                {viewingEmployee.notes && (
                  <div>
                    <Label className="text-sm text-gray-500">Notas</Label>
                    <p className="mt-1 text-sm">{viewingEmployee.notes}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => {
                    setViewDialogOpen(false);
                    handleOpenDialog(viewingEmployee);
                  }}>
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

export default AdminEmployees;

