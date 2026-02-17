import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  ShoppingCart, 
  Heart,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Star as StarFilled,
  Loader2,
  AlertCircle,
  Leaf,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { ProductUI } from '@/types/product';
import { useNutrients } from '@/hooks/useNutrients';
import { useActiveProductCategories } from '@/hooks/useProductCategories';

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  
  // Initialize category from URL params or 'all'
  const urlCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  
  const [selectedNutrient, setSelectedNutrient] = useState<number | undefined>(undefined);
  
  // Initialize search query from URL params or empty string
  const urlSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  
  // State for mobile filters collapse/expand
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Get filter params from URL
  const isNew = searchParams.get('new') === 'true';
  const isBestsellers = searchParams.get('bestsellers') === 'true';
  const isSeasonal = searchParams.get('seasonal') === 'true';
  const isSale = searchParams.get('sale') === 'true';
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  // Update search query and category when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'all';
    setSearchQuery(urlSearch);
    
    // Only update category from URL if special filters are not active
    // Otherwise, preserve the current category selection
    if (!isNew && !isBestsellers && !isSeasonal && !isSale) {
      setSelectedCategory(urlCategory);
    } else {
      // If special filters are active, set to 'all' but don't update URL
      setSelectedCategory('all');
    }
  }, [searchParams, isNew, isBestsellers, isSeasonal, isSale]);
  
  // Fetch nutrients for the filter dropdown
  const { data: nutrients = [], isLoading: isLoadingNutrients, error: nutrientsError } = useNutrients();
  
  // Fetch product categories from database
  const { data: productCategories = [], isLoading: isLoadingCategories } = useActiveProductCategories();
  
  // Fetch products from Supabase - MUST be declared before using allProducts
  const { data: allProducts = [], isLoading, error } = useProducts({});
  
  // Calculate dynamic price range from products
  const priceRangeFromProducts = useMemo(() => {
    if (allProducts.length === 0) return [0, 100];
    const prices = allProducts.map(p => p.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return [min, max];
  }, [allProducts]);

  const [priceRange, setPriceRange] = useState([0, 100]);
  
  // Update price range when products load
  useEffect(() => {
    if (allProducts.length > 0 && priceRangeFromProducts[1] > 0) {
      setPriceRange(priceRangeFromProducts);
    }
  }, [priceRangeFromProducts, allProducts.length]);
  
  // Fetch filtered products based on current filters
  const { data: filteredProductsData = [] } = useProducts({
    category: selectedCategory,
    searchQuery: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    nutrientId: selectedNutrient,
  });

  // Calculate category counts from all products using real categories from database
  const categories = useMemo(() => {
    // Count products per category
    const categoryMap = allProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Build categories array with "Todos los Productos" first, then real categories
    const categoriesList = [
      { id: 'all', name: 'Todos los Productos', count: allProducts.length }
    ];

    // Add real categories from database with their counts
    productCategories.forEach(category => {
      categoriesList.push({
        id: category.id,
        name: category.name,
        count: categoryMap[category.id] || 0
      });
    });

    return categoriesList;
  }, [allProducts, productCategories]);

  // Use filtered products from Supabase
  let products = filteredProductsData;

  // Apply special filters from URL params
  products = useMemo(() => {
    let filtered = [...filteredProductsData];
    
    if (isNew) {
      // Filter products with badge 'NUEVO' or created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(p => {
        const isNewBadge = p.badge === 'NUEVO';
        // Note: created_at might not be in ProductUI, so we'll rely on badge for now
        return isNewBadge;
      });
    }
    
    if (isBestsellers) {
      // Filter products with badge 'MÁS VENDIDO' or high reviews/rating
      filtered = filtered.filter(p => {
        const isBestsellerBadge = p.badge === 'MÁS VENDIDO';
        const hasHighRating = p.rating >= 4.5 && p.reviews >= 10;
        return isBestsellerBadge || hasHighRating;
      });
    }
    
    if (isSeasonal) {
      // Filter products with badge 'TEMPORADA'
      filtered = filtered.filter(p => {
        return p.badge === 'TEMPORADA';
      });
    }
    
    if (isSale) {
      // Filter products with badge 'OFERTA' or original_price > price
      filtered = filtered.filter(p => {
        const isSaleBadge = p.badge === 'OFERTA';
        const hasDiscount = p.originalPrice !== null && p.originalPrice > p.price;
        return isSaleBadge || hasDiscount;
      });
    }
    
    return filtered;
  }, [filteredProductsData, isNew, isBestsellers, isSeasonal, isSale]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });
  }, [products, sortBy]);


  const handleWishlistToggle = (product: ProductUI) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };


  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl font-normal text-[#313522] font-editorial-new text-center">
              {isNew ? 'Recién Llegados' : 
               isBestsellers ? 'Más Vendidos' :
               isSeasonal ? 'Temporada' :
               isSale ? 'Ofertas' :
               'Tienda'}
            </h1>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Enhanced */}
            <div className="lg:w-1/4">
              <Card className="border border-gray-200/60 shadow-xl bg-white/95 backdrop-blur-sm sticky top-24">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="h-5 w-5 text-[#7d8768]" />
                      <h3 className="text-xl font-normal text-gray-900 font-gilda-display">Filtros</h3>
                    </div>
                    {/* Mobile collapse/expand button */}
                    <button
                      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                      className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
                      aria-label={isFiltersExpanded ? "Colapsar filtros" : "Expandir filtros"}
                    >
                      <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Filters Content - Collapsible on mobile */}
                  <div className={`lg:block ${isFiltersExpanded ? 'block' : 'hidden'}`}>
                  {/* Categories - Enhanced */}
                  <div className="mb-8">
                    <h4 className="font-normal text-gray-900 mb-4 font-gilda-display text-base">Categorías</h4>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between group">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <Checkbox
                              checked={selectedCategory === category.id}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Update state immediately
                                  setSelectedCategory(category.id);
                                  
                                  // Update URL when category changes
                                  const newParams = new URLSearchParams(searchParams);
                                  
                                  // Clear special filter params when selecting a category
                                  newParams.delete('new');
                                  newParams.delete('bestsellers');
                                  newParams.delete('seasonal');
                                  newParams.delete('sale');
                                  
                                  if (category.id === 'all') {
                                    newParams.delete('category');
                                  } else {
                                    newParams.set('category', category.id);
                                  }
                                  
                                  // Clear search when changing category
                                  newParams.delete('search');
                                  
                                  navigate(`/shop?${newParams.toString()}`, { replace: true });
                                }
                              }}
                              className="border-2 border-gray-300 data-[state=checked]:bg-[#7d8768] data-[state=checked]:border-[#7d8768]"
                            />
                            <span className={`text-sm font-body transition-colors ${
                              selectedCategory === category.id 
                                ? 'text-[#7d8768] font-semibold' 
                                : 'text-gray-700 group-hover:text-[#7d8768]'
                            }`}>
                              {category.name}
                            </span>
                          </label>
                          <span className={`text-xs font-body transition-colors ${
                            selectedCategory === category.id 
                              ? 'text-[#7d8768] font-semibold' 
                              : 'text-gray-500'
                          }`}>
                            ({category.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrients Filter - Enhanced */}
                  <div className="mb-8">
                    <h4 className="font-normal text-gray-900 mb-4 font-gilda-display text-base">Nutrientes</h4>
                    {nutrientsError && (
                      <div className="text-xs text-red-600 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg font-body">
                        Error al cargar nutrientes. Verifica que las tablas existan en la base de datos.
                      </div>
                    )}
                    <Select 
                      value={selectedNutrient?.toString() || 'all'} 
                      onValueChange={(value) => {
                        setSelectedNutrient(value === 'all' ? undefined : parseInt(value));
                      }}
                      disabled={isLoadingNutrients}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 h-11 rounded-xl font-body">
                        <SelectValue placeholder={isLoadingNutrients ? "Cargando..." : "Seleccionar nutriente"} />
                      </SelectTrigger>
                      <SelectContent className="font-body">
                        <SelectItem value="all">Todos los nutrientes</SelectItem>
                        {nutrients.length === 0 && !isLoadingNutrients ? (
                          <SelectItem value="no-nutrients" disabled>
                            No hay nutrientes disponibles
                          </SelectItem>
                        ) : (
                          nutrients.map((nutrient) => (
                            <SelectItem key={nutrient.id} value={nutrient.id.toString()}>
                              {nutrient.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {nutrients.length === 0 && !isLoadingNutrients && !nutrientsError && (
                      <p className="text-xs text-gray-500 mt-3 italic font-body">
                        💡 Ejecuta los scripts SQL (nutrients-schema.sql e insert-nutrients.sql) para cargar nutrientes
                      </p>
                    )}
                  </div>

                  {/* Price Range - Enhanced */}
                  <div className="mb-8">
                    <h4 className="font-normal text-gray-900 mb-4 font-gilda-display text-base">Rango de Precio</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-24 border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl font-body"
                        />
                        <span className="text-gray-500 font-body">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                          className="w-24 border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl font-body"
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-body">
                        Q. {priceRange[0]} - Q. {priceRange[1]}
                      </p>
                    </div>
                  </div>

                  {/* Clear Filters - Enhanced */}
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5 transition-all shadow-sm font-body"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedNutrient(undefined);
                      setPriceRange([0, 100]);
                      setSearchQuery('');
                      // Clear URL params
                      navigate('/shop', { replace: true });
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid - Enhanced */}
            <div className="lg:w-3/4">
              {/* Toolbar - Enhanced */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <p className="text-gray-600 font-body text-sm">
                  {isLoading ? (
                    'Cargando productos...'
                  ) : error ? (
                    'Error al cargar productos'
                  ) : (
                    `${sortedProducts.length} ${sortedProducts.length === 1 ? 'producto' : 'productos'}`
                  )}
                </p>
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl h-11 font-body">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="font-body">
                      <SelectItem value="featured">Destacados</SelectItem>
                      <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                      <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                      <SelectItem value="rating">Mejor Valorados</SelectItem>
                      <SelectItem value="newest">Más Nuevos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products - Enhanced */}
              {isLoading ? (
                <div className="text-center py-24">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
                    <div className="relative inline-block animate-spin rounded-full h-14 w-14 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-3 font-editorial-new">Cargando productos...</h3>
                  <p className="text-gray-600 font-body">Por favor espera mientras cargamos nuestros productos</p>
                </div>
              ) : error ? (
                <Card className="p-12 md:p-16 text-center border-2 border-red-100 bg-gradient-to-br from-red-50/50 to-white shadow-lg">
                  <div className="text-red-500 mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-3 font-editorial-new">Error al cargar productos</h3>
                  <p className="text-gray-600 mb-8 font-body max-w-md mx-auto">No pudimos cargar los productos. Por favor intenta de nuevo más tarde.</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md font-body"
                  >
                    Recargar Página
                  </Button>
                </Card>
              ) : sortedProducts.length === 0 ? (
                <Card className="p-12 md:p-16 text-center border border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white shadow-lg">
                  <div className="text-gray-300 mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
                      <Search className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-3 font-editorial-new">No se encontraron productos</h3>
                  <p className="text-gray-600 mb-8 font-body max-w-md mx-auto">Intenta ajustar tus filtros o términos de búsqueda para encontrar más productos</p>
                  <Button 
                    variant="outline"
                    className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white transition-all shadow-sm font-body"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedNutrient(undefined);
                      setPriceRange([0, 100]);
                      setSearchQuery('');
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  {sortedProducts.map((product, index) => (
                    <Card 
                      key={product.id} 
                      className="hover:shadow-xl transition-all duration-500 bg-white border border-gray-200/60 hover:-translate-y-2 group h-full flex flex-col"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative flex flex-col h-full">
                        {/* Product Image */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {product.badge && (
                            <Badge className={`absolute top-3 right-3 text-xs z-10 shadow-lg ${
                              product.badge === 'OFERTA' ? 'bg-red-600' :
                              product.badge === 'NUEVO' ? 'bg-blue-600' :
                              product.badge === 'MÁS VENDIDO' ? 'bg-green-600' :
                              product.badge === 'TEMPORADA' ? 'bg-orange-600' :
                              product.badge === 'PERSONALIZADA' ? 'bg-purple-600' :
                              'bg-gray-600'
                            } text-white border-0 font-medium font-body`}>
                              {product.badge}
                            </Badge>
                          )}
                          <img 
                            src={product.realImage} 
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white shadow-lg font-body"
                              onClick={() => navigate(`/shop/product/${product.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex flex-col h-full">
                            <h3 className="font-normal text-lg text-gray-900 mb-3 text-center font-gilda-display group-hover:text-[#7d8768] transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-center mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-[#7d8768] font-body">Q. {product.price.toFixed(2)}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through font-body">
                                    Q. {product.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm text-center mb-6 flex-grow min-h-[3rem] font-body line-clamp-3">
                              {product.description}
                            </p>
                            <div className="flex gap-2 mt-auto">
                              <Button 
                                className="flex-1 bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md hover:shadow-lg transition-all font-body"
                                onClick={() => {
                                  addToCart(product, 1);
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                <span>Agregar</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`border-2 transition-all duration-300 ${
                                  isInWishlist(product.id) 
                                    ? 'border-red-300 text-red-600 hover:bg-red-50 bg-red-50/50' 
                                    : 'border-gray-300 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5'
                                }`}
                                onClick={() => handleWishlistToggle(product)}
                              >
                                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default Shop; 