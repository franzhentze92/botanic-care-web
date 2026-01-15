import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Droplet,
  Leaf,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdminCustomOils,
  useCreateCustomOil,
  useUpdateCustomOil,
  useDeleteCustomOil,
  CreateCustomOilData,
} from '@/hooks/useAdminCustomIngredients';
import {
  useAdminCustomExtracts,
  useCreateCustomExtract,
  useUpdateCustomExtract,
  useDeleteCustomExtract,
  CreateCustomExtractData,
} from '@/hooks/useAdminCustomIngredients';
import {
  useAdminCustomFunctions,
  useCreateCustomFunction,
  useUpdateCustomFunction,
  useDeleteCustomFunction,
  CreateCustomFunctionData,
} from '@/hooks/useAdminCustomIngredients';
import { CustomOil, CustomExtract, CustomFunction } from '@/types/custom-cream';
import { toast } from 'sonner';

const AdminCustomIngredients: React.FC = () => {
  const { user } = useAuth();

  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Estados para aceites base
  const [oilDialogOpen, setOilDialogOpen] = useState(false);
  const [editingOil, setEditingOil] = useState<CustomOil | null>(null);
  const [oilFormData, setOilFormData] = useState({
    id: '',
    name: '',
    emoji: '',
    description: '',
    price_modifier: '0',
  });

  // Estados para extractos
  const [extractDialogOpen, setExtractDialogOpen] = useState(false);
  const [editingExtract, setEditingExtract] = useState<CustomExtract | null>(null);
  const [extractFormData, setExtractFormData] = useState({
    id: '',
    name: '',
    emoji: '',
    price_modifier: '0',
  });

  // Estados para funciones
  const [functionDialogOpen, setFunctionDialogOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<CustomFunction | null>(null);
  const [functionFormData, setFunctionFormData] = useState({
    id: '',
    name: '',
    emoji: '',
    ingredients: [] as string[],
    price_modifier: '0',
  });
  const [newIngredient, setNewIngredient] = useState('');

  // Búsquedas
  const [oilSearch, setOilSearch] = useState('');
  const [extractSearch, setExtractSearch] = useState('');
  const [functionSearch, setFunctionSearch] = useState('');

  // Hooks para aceites
  const { data: oils = [], isLoading: oilsLoading } = useAdminCustomOils();
  const createOilMutation = useCreateCustomOil();
  const updateOilMutation = useUpdateCustomOil();
  const deleteOilMutation = useDeleteCustomOil();

  // Hooks para extractos
  const { data: extracts = [], isLoading: extractsLoading } = useAdminCustomExtracts();
  const createExtractMutation = useCreateCustomExtract();
  const updateExtractMutation = useUpdateCustomExtract();
  const deleteExtractMutation = useDeleteCustomExtract();

  // Hooks para funciones
  const { data: functions = [], isLoading: functionsLoading } = useAdminCustomFunctions();
  const createFunctionMutation = useCreateCustomFunction();
  const updateFunctionMutation = useUpdateCustomFunction();
  const deleteFunctionMutation = useDeleteCustomFunction();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ==================== ACEITES BASE ====================

  const filteredOils = oils.filter(oil =>
    oil.name.toLowerCase().includes(oilSearch.toLowerCase()) ||
    oil.id.toLowerCase().includes(oilSearch.toLowerCase())
  );

  const handleOpenOilDialog = (oil?: CustomOil) => {
    if (oil) {
      setEditingOil(oil);
      setOilFormData({
        id: oil.id,
        name: oil.name,
        emoji: oil.emoji || '',
        description: oil.description || '',
        price_modifier: oil.price_modifier?.toString() || '0',
      });
    } else {
      setEditingOil(null);
      setOilFormData({
        id: '',
        name: '',
        emoji: '',
        description: '',
        price_modifier: '0',
      });
    }
    setOilDialogOpen(true);
  };

  const handleCloseOilDialog = () => {
    setOilDialogOpen(false);
    setEditingOil(null);
  };

  const handleSubmitOil = async (e: React.FormEvent) => {
    e.preventDefault();

    const oilData: CreateCustomOilData = {
      id: oilFormData.id,
      name: oilFormData.name,
      emoji: oilFormData.emoji || null,
      description: oilFormData.description || null,
      price_modifier: parseFloat(oilFormData.price_modifier) || 0,
    };

    try {
      if (editingOil) {
        await updateOilMutation.mutateAsync({ id: editingOil.id, ...oilData });
      } else {
        await createOilMutation.mutateAsync(oilData);
      }
      handleCloseOilDialog();
    } catch (error) {
      console.error('Error saving oil:', error);
    }
  };

  const handleDeleteOil = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este aceite base?')) {
      try {
        await deleteOilMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting oil:', error);
      }
    }
  };

  // ==================== EXTRACTOS ====================

  const filteredExtracts = extracts.filter(extract =>
    extract.name.toLowerCase().includes(extractSearch.toLowerCase()) ||
    extract.id.toLowerCase().includes(extractSearch.toLowerCase())
  );

  const handleOpenExtractDialog = (extract?: CustomExtract) => {
    if (extract) {
      setEditingExtract(extract);
      setExtractFormData({
        id: extract.id,
        name: extract.name,
        emoji: extract.emoji || '',
        price_modifier: extract.price_modifier?.toString() || '0',
      });
    } else {
      setEditingExtract(null);
      setExtractFormData({
        id: '',
        name: '',
        emoji: '',
        price_modifier: '0',
      });
    }
    setExtractDialogOpen(true);
  };

  const handleCloseExtractDialog = () => {
    setExtractDialogOpen(false);
    setEditingExtract(null);
  };

  const handleSubmitExtract = async (e: React.FormEvent) => {
    e.preventDefault();

    const extractData: CreateCustomExtractData = {
      id: extractFormData.id,
      name: extractFormData.name,
      emoji: extractFormData.emoji || null,
      price_modifier: parseFloat(extractFormData.price_modifier) || 0,
    };

    try {
      if (editingExtract) {
        await updateExtractMutation.mutateAsync({ id: editingExtract.id, ...extractData });
      } else {
        await createExtractMutation.mutateAsync(extractData);
      }
      handleCloseExtractDialog();
    } catch (error) {
      console.error('Error saving extract:', error);
    }
  };

  const handleDeleteExtract = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este extracto botánico?')) {
      try {
        await deleteExtractMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting extract:', error);
      }
    }
  };

  // ==================== FUNCIONES ====================

  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(functionSearch.toLowerCase()) ||
    func.id.toLowerCase().includes(functionSearch.toLowerCase())
  );

  const handleOpenFunctionDialog = (func?: CustomFunction) => {
    if (func) {
      setEditingFunction(func);
      setFunctionFormData({
        id: func.id,
        name: func.name,
        emoji: func.emoji || '',
        ingredients: func.ingredients || [],
        price_modifier: func.price_modifier?.toString() || '0',
      });
    } else {
      setEditingFunction(null);
      setFunctionFormData({
        id: '',
        name: '',
        emoji: '',
        ingredients: [],
        price_modifier: '0',
      });
    }
    setFunctionDialogOpen(true);
  };

  const handleCloseFunctionDialog = () => {
    setFunctionDialogOpen(false);
    setEditingFunction(null);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFunctionFormData({
        ...functionFormData,
        ingredients: [...functionFormData.ingredients, newIngredient.trim()],
      });
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFunctionFormData({
      ...functionFormData,
      ingredients: functionFormData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleSubmitFunction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (functionFormData.ingredients.length === 0) {
      toast.error('Debes agregar al menos un ingrediente');
      return;
    }

    const functionData: CreateCustomFunctionData = {
      id: functionFormData.id,
      name: functionFormData.name,
      emoji: functionFormData.emoji || null,
      ingredients: functionFormData.ingredients,
      price_modifier: parseFloat(functionFormData.price_modifier) || 0,
    };

    try {
      if (editingFunction) {
        await updateFunctionMutation.mutateAsync({ id: editingFunction.id, ...functionData });
      } else {
        await createFunctionMutation.mutateAsync(functionData);
      }
      handleCloseFunctionDialog();
    } catch (error) {
      console.error('Error saving function:', error);
    }
  };

  const handleDeleteFunction = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta función activa?')) {
      try {
        await deleteFunctionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting function:', error);
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
          title="Gestión de Ingredientes para Cremas Personalizadas"
          description="Administra los aceites base, extractos botánicos y funciones activas disponibles para que los clientes personalicen sus cremas"
        />

        <Tabs defaultValue="oils" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="oils" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Droplet className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Aceites Base</span>
              <span className="sm:hidden">Aceites</span>
            </TabsTrigger>
            <TabsTrigger value="extracts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Leaf className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Extractos Botánicos</span>
              <span className="sm:hidden">Extractos</span>
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Funciones Activas</span>
              <span className="sm:hidden">Funciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Aceites Base */}
          <TabsContent value="oils" className="space-y-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <CardTitle className="text-lg md:text-xl">Aceites Base</CardTitle>
                  <Button onClick={() => handleOpenOilDialog()} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Aceite
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar aceites..."
                    value={oilSearch}
                    onChange={(e) => setOilSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {oilsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredOils.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No se encontraron aceites base.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Emoji</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Modificador Precio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOils.map((oil) => (
                            <TableRow key={oil.id}>
                              <TableCell className="font-mono text-sm">{oil.id}</TableCell>
                              <TableCell className="font-medium">{oil.name}</TableCell>
                              <TableCell>{oil.emoji || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate">{oil.description || '-'}</TableCell>
                              <TableCell className="text-right">{formatCurrency(oil.price_modifier || 0)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenOilDialog(oil)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteOil(oil.id)}
                                    title="Eliminar"
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
                      {filteredOils.map((oil) => (
                        <Card key={oil.id} className="border-l-4 border-l-[#7d8768]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {oil.emoji && <span className="text-lg">{oil.emoji}</span>}
                                    <h3 className="font-semibold text-sm text-gray-900">{oil.name}</h3>
                                  </div>
                                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit">{oil.id}</code>
                                  {oil.description && (
                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{oil.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenOilDialog(oil)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => handleDeleteOil(oil.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground">Modificador Precio:</span>
                                <p className="font-semibold text-sm">{formatCurrency(oil.price_modifier || 0)}</p>
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
          </TabsContent>

          {/* Tab: Extractos Botánicos */}
          <TabsContent value="extracts" className="space-y-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <CardTitle className="text-lg md:text-xl">Extractos Botánicos</CardTitle>
                  <Button onClick={() => handleOpenExtractDialog()} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Extracto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar extractos..."
                    value={extractSearch}
                    onChange={(e) => setExtractSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {extractsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredExtracts.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No se encontraron extractos botánicos.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Emoji</TableHead>
                            <TableHead className="text-right">Modificador Precio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExtracts.map((extract) => (
                            <TableRow key={extract.id}>
                              <TableCell className="font-mono text-sm">{extract.id}</TableCell>
                              <TableCell className="font-medium">{extract.name}</TableCell>
                              <TableCell>{extract.emoji || '-'}</TableCell>
                              <TableCell className="text-right">{formatCurrency(extract.price_modifier || 0)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenExtractDialog(extract)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteExtract(extract.id)}
                                    title="Eliminar"
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
                      {filteredExtracts.map((extract) => (
                        <Card key={extract.id} className="border-l-4 border-l-[#7d8768]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {extract.emoji && <span className="text-lg">{extract.emoji}</span>}
                                    <h3 className="font-semibold text-sm text-gray-900">{extract.name}</h3>
                                  </div>
                                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit">{extract.id}</code>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenExtractDialog(extract)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => handleDeleteExtract(extract.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground">Modificador Precio:</span>
                                <p className="font-semibold text-sm">{formatCurrency(extract.price_modifier || 0)}</p>
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
          </TabsContent>

          {/* Tab: Funciones Activas */}
          <TabsContent value="functions" className="space-y-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <CardTitle className="text-lg md:text-xl">Funciones Activas</CardTitle>
                  <Button onClick={() => handleOpenFunctionDialog()} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Función
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar funciones..."
                    value={functionSearch}
                    onChange={(e) => setFunctionSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {functionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredFunctions.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No se encontraron funciones activas.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Emoji</TableHead>
                            <TableHead>Ingredientes</TableHead>
                            <TableHead className="text-right">Modificador Precio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFunctions.map((func) => (
                            <TableRow key={func.id}>
                              <TableCell className="font-mono text-sm">{func.id}</TableCell>
                              <TableCell className="font-medium">{func.name}</TableCell>
                              <TableCell>{func.emoji || '-'}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {func.ingredients.map((ingredient, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {ingredient}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(func.price_modifier || 0)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenFunctionDialog(func)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFunction(func.id)}
                                    title="Eliminar"
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
                      {filteredFunctions.map((func) => (
                        <Card key={func.id} className="border-l-4 border-l-[#7d8768]">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {func.emoji && <span className="text-lg">{func.emoji}</span>}
                                    <h3 className="font-semibold text-sm text-gray-900">{func.name}</h3>
                                  </div>
                                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded block w-fit mb-2">{func.id}</code>
                                  {func.ingredients.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {func.ingredients.map((ingredient, idx) => (
                                        <Badge key={idx} variant="outline" className="text-[10px]">
                                          {ingredient}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenFunctionDialog(func)}
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => handleDeleteFunction(func.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground">Modificador Precio:</span>
                                <p className="font-semibold text-sm">{formatCurrency(func.price_modifier || 0)}</p>
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
          </TabsContent>
        </Tabs>

        {/* Diálogo de Aceite Base */}
        <Dialog open={oilDialogOpen} onOpenChange={setOilDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOil ? 'Editar Aceite Base' : 'Nuevo Aceite Base'}</DialogTitle>
              <DialogDescription>
                {editingOil ? 'Modifica la información del aceite base' : 'Agrega un nuevo aceite base para cremas personalizadas'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOil} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oil_id">ID *</Label>
                  <Input
                    id="oil_id"
                    value={oilFormData.id}
                    onChange={(e) => setOilFormData({ ...oilFormData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                    disabled={!!editingOil}
                    placeholder="uva, jojoba, almendra..."
                  />
                  {editingOil && <p className="text-xs text-gray-500">El ID no se puede cambiar</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oil_name">Nombre *</Label>
                  <Input
                    id="oil_name"
                    value={oilFormData.name}
                    onChange={(e) => setOilFormData({ ...oilFormData, name: e.target.value })}
                    required
                    placeholder="Aceite de semilla de uva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oil_emoji">Emoji</Label>
                  <Input
                    id="oil_emoji"
                    value={oilFormData.emoji}
                    onChange={(e) => setOilFormData({ ...oilFormData, emoji: e.target.value })}
                    placeholder="🍇"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oil_price">Modificador de Precio (Q) *</Label>
                  <Input
                    id="oil_price"
                    type="number"
                    step="0.01"
                    value={oilFormData.price_modifier}
                    onChange={(e) => setOilFormData({ ...oilFormData, price_modifier: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oil_description">Descripción</Label>
                <Textarea
                  id="oil_description"
                  value={oilFormData.description}
                    onChange={(e) => setOilFormData({ ...oilFormData, description: e.target.value })}
                  rows={3}
                  placeholder="Descripción del aceite..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseOilDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOilMutation.isPending || updateOilMutation.isPending}>
                  {(createOilMutation.isPending || updateOilMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingOil ? 'Actualizar' : 'Crear Aceite'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Extracto Botánico */}
        <Dialog open={extractDialogOpen} onOpenChange={setExtractDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExtract ? 'Editar Extracto Botánico' : 'Nuevo Extracto Botánico'}</DialogTitle>
              <DialogDescription>
                {editingExtract ? 'Modifica la información del extracto botánico' : 'Agrega un nuevo extracto botánico para cremas personalizadas'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitExtract} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extract_id">ID *</Label>
                  <Input
                    id="extract_id"
                    value={extractFormData.id}
                    onChange={(e) => setExtractFormData({ ...extractFormData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                    disabled={!!editingExtract}
                    placeholder="aloe, pepino, acerola..."
                  />
                  {editingExtract && <p className="text-xs text-gray-500">El ID no se puede cambiar</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extract_name">Nombre *</Label>
                  <Input
                    id="extract_name"
                    value={extractFormData.name}
                    onChange={(e) => setExtractFormData({ ...extractFormData, name: e.target.value })}
                    required
                    placeholder="Aloe vera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extract_emoji">Emoji</Label>
                  <Input
                    id="extract_emoji"
                    value={extractFormData.emoji}
                    onChange={(e) => setExtractFormData({ ...extractFormData, emoji: e.target.value })}
                    placeholder="🌱"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extract_price">Modificador de Precio (Q) *</Label>
                  <Input
                    id="extract_price"
                    type="number"
                    step="0.01"
                    value={extractFormData.price_modifier}
                    onChange={(e) => setExtractFormData({ ...extractFormData, price_modifier: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseExtractDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createExtractMutation.isPending || updateExtractMutation.isPending}>
                  {(createExtractMutation.isPending || updateExtractMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingExtract ? 'Actualizar' : 'Crear Extracto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Función Activa */}
        <Dialog open={functionDialogOpen} onOpenChange={setFunctionDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFunction ? 'Editar Función Activa' : 'Nueva Función Activa'}</DialogTitle>
              <DialogDescription>
                {editingFunction ? 'Modifica la información de la función activa' : 'Agrega una nueva función activa para cremas personalizadas'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitFunction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="function_id">ID *</Label>
                  <Input
                    id="function_id"
                    value={functionFormData.id}
                    onChange={(e) => setFunctionFormData({ ...functionFormData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                    disabled={!!editingFunction}
                    placeholder="anti-aging, hidratante..."
                  />
                  {editingFunction && <p className="text-xs text-gray-500">El ID no se puede cambiar</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function_name">Nombre *</Label>
                  <Input
                    id="function_name"
                    value={functionFormData.name}
                    onChange={(e) => setFunctionFormData({ ...functionFormData, name: e.target.value })}
                    required
                    placeholder="Anti-aging"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function_emoji">Emoji</Label>
                  <Input
                    id="function_emoji"
                    value={functionFormData.emoji}
                    onChange={(e) => setFunctionFormData({ ...functionFormData, emoji: e.target.value })}
                    placeholder="✨"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function_price">Modificador de Precio (Q) *</Label>
                  <Input
                    id="function_price"
                    type="number"
                    step="0.01"
                    value={functionFormData.price_modifier}
                    onChange={(e) => setFunctionFormData({ ...functionFormData, price_modifier: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredientes *</Label>
                <div className="flex gap-2">
                  <Input
                    id="ingredients"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="Agregar ingrediente..."
                  />
                  <Button type="button" onClick={handleAddIngredient} variant="outline">
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {functionFormData.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {functionFormData.ingredients.length === 0 && (
                  <p className="text-xs text-gray-500">Agrega al menos un ingrediente</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseFunctionDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createFunctionMutation.isPending || updateFunctionMutation.isPending}>
                  {(createFunctionMutation.isPending || updateFunctionMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingFunction ? 'Actualizar' : 'Crear Función'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomIngredients;

