import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Store,
  Shield,
  Database,
  Save,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useAdminSettings, useSaveSettings, useExportData } from '@/hooks/useAdminSettings';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  // Fetch settings desde la base de datos
  const { data: savedSettings, isLoading: loadingSettings } = useAdminSettings();
  const saveSettingsMutation = useSaveSettings();
  const exportDataMutation = useExportData();

  // Estados para configuración general
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Botanic Care',
    storeDescription: 'Tienda de productos naturales para el cuidado de la piel',
    storeEmail: 'info@botaniccare.com',
    storePhone: '',
    storeAddress: '',
    storeCity: 'Guatemala',
    storeCountry: 'Guatemala',
    storeCurrency: 'GTQ',
    storeLanguage: 'es',
  });

  // Estados para configuración de pedidos
  const [orderSettings, setOrderSettings] = useState({
    minOrderAmount: 50,
    freeShippingThreshold: 50,
    shippingCost: 25,
    orderProcessingDays: 2,
    autoConfirmOrders: false,
    sendOrderEmails: true,
  });

  // Estados para seguridad
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    enable2FA: false,
    allowRegistration: true,
  });

  // Cargar valores guardados cuando están disponibles
  useEffect(() => {
    if (savedSettings) {
      if (savedSettings.general) {
        setGeneralSettings(prev => ({ ...prev, ...savedSettings.general }));
      }
      if (savedSettings.orders) {
        setOrderSettings(prev => ({ ...prev, ...savedSettings.orders }));
      }
      if (savedSettings.security) {
        setSecuritySettings(prev => ({ ...prev, ...savedSettings.security }));
      }
    }
  }, [savedSettings]);

  const handleSaveGeneral = async () => {
    await saveSettingsMutation.mutateAsync({ category: 'general', data: generalSettings });
  };

  const handleSaveOrders = async () => {
    await saveSettingsMutation.mutateAsync({ category: 'orders', data: orderSettings });
  };

  const handleSaveSecurity = async () => {
    await saveSettingsMutation.mutateAsync({ category: 'security', data: securitySettings });
  };

  const handleExportData = async () => {
    await exportDataMutation.mutateAsync();
  };

  const handleImportData = async () => {
    toast.info('Funcionalidad de importación en desarrollo');
  };

  const handleClearCache = async () => {
    try {
      localStorage.clear();
      toast.success('Caché limpiado exitosamente');
      toast.info('La página se recargará automáticamente');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error('Error al limpiar el caché');
    }
  };

  const saving = saveSettingsMutation.isPending || exportDataMutation.isPending;

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
          title="Ajustes"
          description="Configura las opciones generales de la plataforma"
        />

        <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="text-xs md:text-sm">
              <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">General</span>
              <span className="sm:hidden">Gen</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">
              <Store className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pedidos</span>
              <span className="sm:hidden">Ped</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs md:text-sm">
              <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Seguridad</span>
              <span className="sm:hidden">Seg</span>
            </TabsTrigger>
          </TabsList>

          {/* Configuración General */}
          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Información General de la Tienda</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Configura la información básica de tu tienda
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">Nombre de la Tienda *</Label>
                    <Input
                      id="storeName"
                      value={generalSettings.storeName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Email de Contacto *</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={generalSettings.storeEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">Descripción</Label>
                  <Textarea
                    id="storeDescription"
                    value={generalSettings.storeDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storePhone">Teléfono</Label>
                    <Input
                      id="storePhone"
                      value={generalSettings.storePhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeCurrency">Moneda</Label>
                    <Select
                      value={generalSettings.storeCurrency}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, storeCurrency: value })}
                    >
                      <SelectTrigger id="storeCurrency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GTQ">GTQ - Quetzal</SelectItem>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeCity">Ciudad</Label>
                    <Input
                      id="storeCity"
                      value={generalSettings.storeCity}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeCity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeCountry">País</Label>
                    <Input
                      id="storeCountry"
                      value={generalSettings.storeCountry}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeCountry: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeAddress">Dirección</Label>
                  <Input
                    id="storeAddress"
                    value={generalSettings.storeAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={saving} className="bg-[#7d8768] hover:bg-[#6a7559] w-full md:w-auto">
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración de Pedidos */}
          <TabsContent value="orders" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Configuración de Pedidos</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Ajusta las opciones relacionadas con pedidos y envíos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderAmount">Monto Mínimo de Pedido</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      min="0"
                      value={orderSettings.minOrderAmount}
                      onChange={(e) => setOrderSettings({ ...orderSettings, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeShippingThreshold">Umbral de Envío Gratis</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      min="0"
                      value={orderSettings.freeShippingThreshold}
                      onChange={(e) => setOrderSettings({ ...orderSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingCost">Costo de Envío</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      value={orderSettings.shippingCost}
                      onChange={(e) => setOrderSettings({ ...orderSettings, shippingCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderProcessingDays">Días de Procesamiento</Label>
                    <Input
                      id="orderProcessingDays"
                      type="number"
                      min="0"
                      value={orderSettings.orderProcessingDays}
                      onChange={(e) => setOrderSettings({ ...orderSettings, orderProcessingDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmar Pedidos Automáticamente</Label>
                      <p className="text-sm text-gray-500">Los pedidos se confirmarán automáticamente al ser creados</p>
                    </div>
                    <Switch
                      checked={orderSettings.autoConfirmOrders}
                      onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, autoConfirmOrders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enviar Emails de Pedidos</Label>
                      <p className="text-sm text-gray-500">Enviar emails automáticos cuando se crea un pedido</p>
                    </div>
                    <Switch
                      checked={orderSettings.sendOrderEmails}
                      onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, sendOrderEmails: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveOrders} disabled={saving} className="bg-[#7d8768] hover:bg-[#6a7559] w-full md:w-auto">
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración de Seguridad */}
          <TabsContent value="security" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Configuración de Seguridad</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Ajustes de seguridad y autenticación
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="20"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) || 8 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout de Sesión (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verificación de Email Requerida</Label>
                      <p className="text-sm text-gray-500">Los usuarios deben verificar su email para acceder</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permitir Registro de Usuarios</Label>
                      <p className="text-sm text-gray-500">Permitir que nuevos usuarios se registren en la plataforma</p>
                    </div>
                    <Switch
                      checked={securitySettings.allowRegistration}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, allowRegistration: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticación de Dos Factores (2FA)</Label>
                      <p className="text-sm text-gray-500">Requerir autenticación de dos factores para admins</p>
                    </div>
                    <Switch
                      checked={securitySettings.enable2FA}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enable2FA: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveSecurity} disabled={saving} className="bg-[#7d8768] hover:bg-[#6a7559] w-full md:w-auto">
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sección de Utilidades */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Database className="h-4 w-4 md:h-5 md:w-5" />
              Utilidades del Sistema
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Herramientas de mantenimiento y gestión de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </Button>
              <Button onClick={handleImportData} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Importar Datos
              </Button>
              <Button onClick={handleClearCache} variant="outline" className="w-full text-red-600 hover:text-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Caché
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

