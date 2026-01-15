import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Settings,
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  LogOut,
  LogIn,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sprout
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useActiveProductCategories } from '@/hooks/useProductCategories';
import Chatbot from '@/components/Chatbot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(false);
  const [isMobileCategoriesExpanded, setIsMobileCategoriesExpanded] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const { getCartItemCount, getWishlistCount } = useCart();
  const { user, signOut } = useAuth();
  const { data: storeSettings } = useStoreSettings();
  const { data: productCategories = [], isLoading: isLoadingCategories } = useActiveProductCategories();
  
  // Debug: Log categories
  React.useEffect(() => {
    console.log('Product Categories:', productCategories);
    console.log('Is Loading:', isLoadingCategories);
    console.log('Categories Length:', productCategories?.length || 0);
    console.log('Is Categories Expanded:', isCategoriesExpanded);
  }, [productCategories, isLoadingCategories, isCategoriesExpanded]);
  
  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 50;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after navigation
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre Nosotros', href: '/about' },
    { name: 'Tienda', href: '/shop' },
    { name: 'Personalizar', href: '/custom-cream' },
    { name: 'Nutrición', href: '/nutrition' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contáctanos', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Categories for bottom navigation - from database
  // Convert product categories to navigation format
  const categories = productCategories.map(cat => ({
    name: cat.name,
    href: `/shop?category=${cat.id}`,
    id: cat.id
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner - Light Green */}
      <div className="bg-[#7d8768]/30 text-[#313522] py-2 px-3 relative">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-2 lg:hidden">
            {/* Center Content */}
            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-semibold font-body">
                {freeShippingThreshold ? `ENVÍO GRATIS EN COMPRAS MAYORES A Q.${freeShippingThreshold}` : 'ENVÍO GRATIS EN COMPRAS MAYORES A Q.50'}
              </span>
            </div>
            
            {/* Right Side - Mobile */}
            <div className="flex items-center justify-center gap-2">
              {/* Rewards Button */}
              <Button
                variant="outline"
                size="sm"
                className="border-[#313522] text-[#313522] bg-transparent hover:bg-[#7d8768]/20 rounded-full px-2 py-1 h-auto"
                asChild
              >
                <Link to="/rewards">
                  <Sprout className="h-3 w-3 mr-1" />
                  <span className="text-[10px] font-medium font-body">Botanic Care Rewards</span>
                </Link>
              </Button>
              
              {/* Contact Us */}
              <Link to="/contact" className="text-[10px] sm:text-xs font-medium text-[#313522] hover:underline font-body whitespace-nowrap">
                Contáctanos
              </Link>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center">
            {/* Left Side - Empty for centering */}
            <div className="flex-1"></div>
            
            {/* Center Content - Absolutely centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-xs font-semibold font-body whitespace-nowrap">
                {freeShippingThreshold ? `ENVÍO GRATIS EN COMPRAS MAYORES A Q.${freeShippingThreshold}` : 'ENVÍO GRATIS EN COMPRAS MAYORES A Q.50'}
              </span>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Rewards Button */}
              <Button
                variant="outline"
                size="sm"
                className="border-[#313522] text-[#313522] bg-transparent hover:bg-[#7d8768]/20 rounded-full px-2.5 py-1 h-auto"
                asChild
              >
                <Link to="/rewards">
                  <Sprout className="h-3 w-3 mr-1" />
                  <span className="text-[10px] font-medium font-body">Botanic Care Rewards</span>
                </Link>
              </Button>
              
              {/* Contact Us */}
              <Link to="/contact" className="text-xs font-medium text-[#313522] hover:underline font-body">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Off White */}
      <header className="bg-[#faf9f6] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              <DropdownMenu open={isShopDropdownOpen} onOpenChange={setIsShopDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                    className={`text-sm font-medium flex items-center gap-0.5 font-gilda-display ${
                      isActive('/shop') ? 'text-[#313522] underline' : 'text-gray-700 hover:text-[#313522]'
                    }`}>
                    Tienda
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-[#faf9f6] border-gray-200"
                  onMouseEnter={() => setIsShopDropdownOpen(true)}
                  onMouseLeave={() => setIsShopDropdownOpen(false)}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/shop" className="px-2 py-1.5 text-[#313522] text-xs font-normal uppercase font-audrey font-semibold">
                        TODOS LOS PRODUCTOS
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/shop?new=true" className="px-2 py-1.5 text-[#313522] text-xs font-normal uppercase underline font-audrey">
                        RECIÉN LLEGADOS
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/shop?bestsellers=true" className="px-2 py-1.5 text-[#313522] text-xs font-normal uppercase font-audrey">
                        MÁS VENDIDOS
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/shop?seasonal=true" className="px-2 py-1.5 text-[#313522] text-xs font-normal uppercase font-audrey">
                        TEMPORADA
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/shop?sale=true" className="px-2 py-1.5 text-[#313522] text-xs font-normal uppercase font-audrey">
                        OFERTAS
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuGroup>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Toggle clicked, current state:', isCategoriesExpanded);
                        setIsCategoriesExpanded(!isCategoriesExpanded);
                      }}
                      className="w-full px-2 py-1.5 text-[#313522] text-xs font-normal uppercase flex items-center justify-between hover:bg-gray-100 cursor-pointer font-audrey"
                    >
                      <span>TODAS LAS CATEGORÍAS</span>
                      <ChevronRight className={`h-3 w-3 transition-transform ${isCategoriesExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isCategoriesExpanded && (
                      <div className="w-full">
                        {isLoadingCategories ? (
                          <div className="px-2 py-1.5 pl-4 text-xs text-gray-500 font-body">
                            Cargando categorías...
                          </div>
                        ) : productCategories && productCategories.length > 0 ? (
                          productCategories.map((category) => (
                            <DropdownMenuItem key={category.id} asChild className="p-0">
                              <Link 
                                to={`/shop?category=${category.id}`} 
                                className="px-2 py-1.5 pl-4 text-xs text-[#313522] hover:bg-gray-100 w-full block font-body"
                                onClick={() => {
                                  console.log('Category clicked:', category);
                                }}
                              >
                                {category.name}
                              </Link>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 pl-4 text-xs text-gray-500 font-body">
                            No hay categorías disponibles (Total: {productCategories?.length || 0})
                          </div>
                        )}
                      </div>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                to="/shop?sale=true"
                className={`text-sm font-medium font-gilda-display ${
                  isActive('/shop?sale=true') ? 'text-red-600 underline' : 'text-red-600 hover:underline'
                }`}
              >
                Ofertas
              </Link>
              <DropdownMenu open={isAboutDropdownOpen} onOpenChange={setIsAboutDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    onMouseEnter={() => setIsAboutDropdownOpen(true)}
                    onMouseLeave={() => setIsAboutDropdownOpen(false)}
                    className={`text-sm font-medium flex items-center gap-0.5 font-gilda-display ${
                      isActive('/about') ? 'text-[#313522] underline' : 'text-gray-700 hover:text-[#313522]'
                    }`}>
                    Quiénes Somos
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onMouseEnter={() => setIsAboutDropdownOpen(true)}
                  onMouseLeave={() => setIsAboutDropdownOpen(false)}
                >
                  <DropdownMenuItem asChild>
                    <Link to="/about" className="font-body">Sobre Botanic Care</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/nutrition" className="font-body">Nutrición</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/blog" className="font-body">Blog</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Center Logo */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <Link to="/" className="text-center flex items-center justify-center gap-2">
                <img
                  src="/BC Brand/2. icono-20250730T203031Z-1-001/2. icono/Icono_BotanicCare_Verde Claro.png"
                  alt="Botanic Care Icon"
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-3xl font-normal text-[#7d8768] font-editorial-new leading-none">
                  Botanic Care
                </h1>
              </Link>
            </div>

            {/* Right Side - Search and Icons */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-48 pl-3 pr-8 py-1.5 text-xs rounded-full bg-white border-gray-300 focus:border-[#7d8768] font-body"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              </form>

              {/* Icons */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10" asChild>
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5" />
                    {getWishlistCount() > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[10px] bg-[#7d8768]">
                        {getWishlistCount()}
                      </Badge>
                    )}
                  </Link>
                </Button>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-normal font-gilda-display">
                          {user.user_metadata?.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 font-body">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer font-body">
                          <User className="mr-2 h-4 w-4" />
                          Mi Cuenta
                        </Link>
                      </DropdownMenuItem>
                      {isAuthorizedAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer font-body">
                            <Settings className="mr-2 h-4 w-4" />
                            Administración
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 font-body">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" asChild>
                    <Link to="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {getCartItemCount() > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[10px] bg-[#7d8768]">
                        {getCartItemCount()}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Bottom Navigation Bar - Dark Green */}
        <div className="bg-[#313522] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center justify-center gap-4 py-2">
              {isLoadingCategories ? (
                <div className="text-sm text-white/70 font-body">Cargando categorías...</div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id || category.href}
                    to={category.href}
                    className="text-sm font-medium text-white hover:underline py-1 font-gilda-display"
                  >
                    {category.name}
                  </Link>
                ))
              ) : null}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation - Sidebar Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-80 bg-[#313522] text-white z-[70] lg:hidden overflow-y-auto">
              {/* Header with Logo and Close Button */}
              <div className="relative flex items-center justify-center p-4 border-b border-white/10">
                <h2 className="text-xl font-normal font-editorial-new text-white">Botanic Care</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute right-4 h-8 w-8 border border-[#7d8768] rounded-md hover:bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="px-4 py-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 bg-gray-100 border-gray-200 text-gray-900 focus:border-[#7d8768] focus:ring-[#7d8768] font-body rounded-md"
                  />
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="px-4 py-4 space-y-1">
                {/* Main Navigation Links */}
                <Link
                  to="/"
                  className={`block py-2 text-sm font-medium font-body ${
                    location.pathname === '/'
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                
                <Link
                  to="/about"
                  className={`block py-2 text-sm font-medium font-body ${
                    location.pathname === '/about'
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Quiénes Somos
                </Link>

                {/* Shop Dropdown */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsMobileShopExpanded(!isMobileShopExpanded)}
                    className={`w-full flex items-center justify-between py-2 text-sm font-medium font-body ${
                      location.pathname === '/shop'
                        ? 'text-white'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Tienda
                    <ChevronRight className={`h-4 w-4 transition-transform ${isMobileShopExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isMobileShopExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      <Link
                        to="/shop"
                        className="block py-2 text-sm font-medium text-white font-semibold hover:text-white font-body"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Todos los Productos
                      </Link>
                      <Link
                        to="/shop?new=true"
                        className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Recién Llegados
                      </Link>
                      <Link
                        to="/shop?bestsellers=true"
                        className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Más Vendidos
                      </Link>
                      <Link
                        to="/shop?seasonal=true"
                        className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Temporada
                      </Link>
                      <Link
                        to="/shop?sale=true"
                        className="block py-2 text-sm font-medium text-red-400 hover:text-red-300 font-body"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ofertas
                      </Link>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setIsMobileCategoriesExpanded(!isMobileCategoriesExpanded)}
                          className="w-full flex items-center justify-between py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                        >
                          Todas las Categorías
                          <ChevronRight className={`h-4 w-4 transition-transform ${isMobileCategoriesExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        {isMobileCategoriesExpanded && (
                          <div className="pl-4 mt-1 space-y-1">
                            {isLoadingCategories ? (
                              <div className="text-sm text-white/70 font-body">Cargando categorías...</div>
                            ) : productCategories && productCategories.length > 0 ? (
                              productCategories.map((category) => (
                                <Link
                                  key={category.id}
                                  to={`/shop?category=${category.id}`}
                                  className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {category.name}
                                </Link>
                              ))
                            ) : (
                              <div className="text-sm text-white/70 font-body">No hay categorías disponibles</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/nutrition"
                  className={`block py-2 text-sm font-medium font-body ${
                    location.pathname === '/nutrition'
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Nutrición
                </Link>

                <Link
                  to="/blog"
                  className={`block py-2 text-sm font-medium font-body ${
                    location.pathname === '/blog'
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>

                <Link
                  to="/contact"
                  className={`block py-2 text-sm font-medium font-body ${
                    location.pathname === '/contact'
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </Link>

                {/* User Actions Section */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
                  {!user ? (
                    <Link
                      to="/login"
                      className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block py-2 text-sm font-medium text-red-400 hover:text-red-300 w-full text-left font-body"
                    >
                      Cerrar Sesión
                    </button>
                  )}
                  <Link
                    to="/wishlist"
                    className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    className="block py-2 text-sm font-medium text-white/90 hover:text-white font-body"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Carrito
                  </Link>
                </div>

                {/* Account Links */}
                {user && (
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <Link
                      to="/dashboard"
                      className={`block py-2 text-sm font-medium font-body ${
                        location.pathname === '/dashboard'
                          ? 'text-white'
                          : 'text-white/90 hover:text-white'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Cuenta
                    </Link>
                    {isAuthorizedAdmin && (
                      <Link
                        to="/admin"
                        className={`block py-2 text-sm font-medium font-body ${
                          location.pathname.startsWith('/admin')
                            ? 'text-white'
                            : 'text-white/90 hover:text-white'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administración
                      </Link>
                    )}
                  </div>
                )}
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#7d8768] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-col items-center md:items-start mb-4">
                <img
                  src="/BC Brand/1. logotipo-20250730T203052Z-1-001/1. logotipo/Logotipo_BotanicCare_Blanco.png"
                  alt="Botanic Care Logo"
                  className="h-16 md:h-20 mb-4"
                />
                <p className="text-white/90 mb-4 max-w-md text-center md:text-left font-body">
                  Descubre el poder de los ingredientes naturales. Creamos productos premium de cuidado de la piel 
                  a base de plantas que nutren tu piel y respetan el medio ambiente.
                </p>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/botanicaregt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded p-2 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.instagram.com/botanic_care/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded p-2 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-normal mb-4 font-gilda-display">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-white/80 hover:text-white transition-colors font-body">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-white/80 hover:text-white transition-colors font-body">
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-white/80 hover:text-white transition-colors font-body">
                    Tienda
                  </Link>
                </li>
                <li>
                  <Link to="/nutrition" className="text-white/80 hover:text-white transition-colors font-body">
                    Nutrición
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-white/80 hover:text-white transition-colors font-body">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/80 hover:text-white transition-colors font-body">
                    Contáctanos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-normal mb-4 font-gilda-display">Contáctanos</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="h-4 w-4" />
                  <span className="font-body">+502 57081058</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Mail className="h-4 w-4" />
                  <span className="font-body">info@botanicaregt.com</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span className="font-body">8AM-4PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p className="font-body">
              &copy; 2024 Botanic Care. Todos los derechos reservados. |{' '}
              <Link to="/privacy" className="hover:text-white underline transition-colors">
                Política de Privacidad
              </Link>
              {' '}|{' '}
              <Link to="/terms" className="hover:text-white underline transition-colors">
                Términos de Servicio
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout; 