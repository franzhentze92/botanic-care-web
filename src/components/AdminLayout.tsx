import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Home,
  User,
  LogOut,
  Menu,
  X,
  DollarSign,
  TrendingDown,
  Briefcase,
  Activity,
  ClipboardList,
  FlaskConical,
  FileText,
  Factory,
  Warehouse,
  ChefHat,
  Tag,
  ChevronDown,
  ChevronRight,
  Store
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false); // Por defecto colapsado
  const [isHovering, setIsHovering] = React.useState(false);
  
  // Para que /admin/products coincida con la ruta
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Estructura de menú con grupos
  const menuStructure = [
    { type: 'item', name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { type: 'item', name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { type: 'item', name: 'Tareas', href: '/admin/tasks', icon: ClipboardList },
    {
      type: 'group',
      name: 'Productos',
      icon: Package,
      items: [
        { name: 'Productos', href: '/admin/products', icon: Package },
        { name: 'Categorías Productos', href: '/admin/product-categories', icon: Tag },
        { name: 'Recetas', href: '/admin/recipes', icon: ChefHat },
        { name: 'Personalización', href: '/admin/custom-ingredients', icon: FlaskConical },
      ]
    },
    {
      type: 'group',
      name: 'Producción',
      icon: Factory,
      items: [
        { name: 'Producción', href: '/admin/production', icon: Factory },
        { name: 'Materia Prima BC', href: '/admin/inventory', icon: Warehouse },
        { name: 'Inventario BC', href: '/admin/finished-products-inventory', icon: Package },
        { name: 'Inventario Dist.', href: '/admin/distributor-inventory', icon: Store },
      ]
    },
    {
      type: 'group',
      name: 'Finanzas',
      icon: DollarSign,
      items: [
        { name: 'Ingresos', href: '/admin/revenue', icon: DollarSign },
        { name: 'Costos', href: '/admin/costs', icon: TrendingDown },
      ]
    },
    {
      type: 'group',
      name: 'Análisis',
      icon: BarChart3,
      items: [
        { name: 'Análisis Operativo', href: '/admin/operational-analytics', icon: Activity },
        { name: 'Análisis Financiero', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      type: 'group',
      name: 'Miembros',
      icon: Users,
      items: [
        { name: 'Clientes', href: '/admin/customers', icon: Users },
        { name: 'Distribuidores', href: '/admin/distributors', icon: Store },
        { name: 'Trabajadores', href: '/admin/employees', icon: Briefcase },
      ]
    },
    { type: 'item', name: 'Blog', href: '/admin/blog', icon: FileText },
    { type: 'item', name: 'Ajustes', href: '/admin/settings', icon: Settings },
  ];

  // Estado para grupos expandidos/colapsados
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Productos': false,
    'Producción': false,
    'Finanzas': false,
    'Análisis': false,
    'Miembros': false,
  });

  // Auto-expandir grupos que tienen items activos
  React.useEffect(() => {
    setExpandedGroups(prev => {
      const newExpandedGroups = { ...prev };
      menuStructure.forEach((item) => {
        if (item.type === 'group') {
          const hasActiveItem = item.items.some(subItem => isActive(subItem.href));
          if (hasActiveItem) {
            newExpandedGroups[item.name] = true;
          }
        }
      });
      return newExpandedGroups;
    });
  }, [location.pathname]);

  // Función para obtener el nombre de la página activa (incluyendo items en grupos)
  const getActivePageName = () => {
    for (const item of menuStructure) {
      if (item.type === 'item' && isActive(item.href)) {
        return item.name;
      }
      if (item.type === 'group') {
        const activeSubItem = item.items.find(subItem => isActive(subItem.href));
        if (activeSubItem) {
          return activeSubItem.name;
        }
      }
    }
    return 'Dashboard';
  };


  // Determinar si el sidebar debe estar expandido (hover o click)
  const isExpanded = sidebarOpen || isHovering;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${isExpanded ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-screen z-40`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7d8768] flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 font-editorial-new">Botanic Care</span>
              </div>
            )}
            {!isExpanded && (
              <div className="w-8 h-8 rounded-lg bg-[#7d8768] flex items-center justify-center mx-auto">
                <Package className="h-5 w-5 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuStructure.map((item, index) => {
              if (item.type === 'item') {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#7d8768]/10 text-[#7d8768] border-l-4 border-[#7d8768]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-[#7d8768]' : 'text-gray-500'}`} />
                    {isExpanded && (
                      <span className={`font-medium ${active ? 'font-semibold' : ''}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              } else if (item.type === 'group') {
                const hasActiveItem = item.items.some(subItem => isActive(subItem.href));
                const isGroupExpanded = expandedGroups[item.name] ?? false;
                const GroupIcon = item.icon || Package;

                return (
                  <Collapsible
                    key={`group-${index}`}
                    open={isGroupExpanded}
                    onOpenChange={(open) => setExpandedGroups(prev => ({ ...prev, [item.name]: open }))}
                    className="space-y-1"
                  >
                    {/* Título del grupo - parece una página normal con flecha */}
                    <CollapsibleTrigger
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        hasActiveItem
                          ? 'bg-[#7d8768]/10 text-[#7d8768] border-l-4 border-[#7d8768]'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!isExpanded ? 'justify-center' : ''}`}
                      disabled={!isExpanded}
                    >
                      <GroupIcon className={`h-5 w-5 flex-shrink-0 ${hasActiveItem ? 'text-[#7d8768]' : 'text-gray-500'}`} />
                      {isExpanded && (
                        <>
                          <span className={`font-medium flex-1 text-left ${hasActiveItem ? 'font-semibold' : ''}`}>
                            {item.name}
                          </span>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${isGroupExpanded ? 'rotate-90' : 'rotate-0'} ${hasActiveItem ? 'text-[#7d8768]' : 'text-gray-500'}`} />
                        </>
                      )}
                    </CollapsibleTrigger>
                    {/* Items del grupo */}
                    <CollapsibleContent className="space-y-1">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const active = isActive(subItem.href);
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isExpanded ? 'pl-6' : 'pl-3'
                            } ${
                              active
                                ? 'bg-[#7d8768]/10 text-[#7d8768] border-l-4 border-[#7d8768]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <SubIcon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-[#7d8768]' : 'text-gray-500'}`} />
                            {isExpanded && (
                              <span className={`font-medium ${active ? 'font-semibold' : ''}`}>
                                {subItem.name}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              return null;
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${!sidebarOpen && 'justify-center px-0'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#7d8768] flex items-center justify-center text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col items-start ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        {user?.email?.split('@')[0] || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-500">Administrador</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{user?.email}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Ir al Sitio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - could add breadcrumbs here */}
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {getActivePageName()}
              </h2>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="w-8 h-8 rounded-full bg-[#7d8768] flex items-center justify-center text-white text-sm font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">
                      {userProfile?.first_name && userProfile?.last_name 
                        ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
                        : userProfile?.first_name 
                        ? userProfile.first_name
                        : user?.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      Ir al Sitio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

