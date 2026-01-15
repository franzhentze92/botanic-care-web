import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Leaf, 
  Sparkles,
  ArrowRight,
  Droplets,
  Zap,
  Shield,
  Heart,
  Flower2,
  Sun,
  Bean,
  Search,
  Filter
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useNutrientsWithCategories, useNutrientCategories } from '@/hooks/useNutrients';
import { Loader2 } from 'lucide-react';

// Map icon names to React components
const getCategoryIcon = (iconName: string | null): React.ReactNode => {
  const iconClass = "h-5 w-5";
  switch (iconName) {
    case 'Sun':
      return <Sun className={iconClass} />;
    case 'Bean':
      return <Bean className={iconClass} />;
    case 'Sparkles':
      return <Sparkles className={iconClass} />;
    case 'Droplets':
      return <Droplets className={iconClass} />;
    case 'Shield':
      return <Shield className={iconClass} />;
    case 'Zap':
      return <Zap className={iconClass} />;
    case 'Flower2':
      return <Flower2 className={iconClass} />;
    default:
      return <Leaf className={iconClass} />;
  }
};

const Nutrition: React.FC = () => {
  const { data: nutrientsWithCategories = [], isLoading: isLoadingNutrients } = useNutrientsWithCategories();
  const { data: categories = [], isLoading: isLoadingCategories } = useNutrientCategories();

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');


  // Group nutrients by category with filters
  const groupedCategories = useMemo(() => {
    let filteredNutrients = nutrientsWithCategories;

    // Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredNutrients = filteredNutrients.filter(nutrient =>
        nutrient.name.toLowerCase().includes(query) ||
        nutrient.description?.toLowerCase().includes(query) ||
        nutrient.benefits?.some(b => b.toLowerCase().includes(query)) ||
        nutrient.sources?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filteredNutrients = filteredNutrients.filter(nutrient => nutrient.category_id === selectedCategory);
    }

    const grouped: Record<string, typeof filteredNutrients> = {};
    
    filteredNutrients.forEach(nutrient => {
      const categoryId = nutrient.category_id;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(nutrient);
    });

    // Sort categories and nutrients within each category
    return categories
      .map(category => ({
        category,
        nutrients: (grouped[category.id] || []).sort((a, b) => a.name.localeCompare(b.name))
      }))
      .filter(item => item.nutrients.length > 0)
      .sort((a, b) => a.category.name.localeCompare(b.category.name));
  }, [nutrientsWithCategories, categories, searchQuery, selectedCategory]);

  const isLoading = isLoadingNutrients || isLoadingCategories;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-[#b9a035] text-white py-24 md:py-32 overflow-hidden">
          {/* Background decorative elements - enhanced */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
            {/* Subtle botanical pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <Leaf className="h-5 w-5 text-white/95" />
                  <Sparkles className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium tracking-wide font-gilda-display">Nutrición Natural</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 font-editorial-new leading-tight tracking-tight animate-slide-in">
                La Ciencia de la Nutrición
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-audrey font-light mb-8 text-justify">
                Descubre cómo los nutrientes naturales nutren, protegen y rejuvenecen tu piel
              </p>
              <div className="flex items-center justify-center gap-6 text-white/80 text-sm font-body flex-wrap">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  <span>100% Natural</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Científicamente Probado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section - Enhanced */}
        <section className="py-20 bg-white -mt-12 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-editorial-new leading-tight">¿Por Qué la Nutrición Importa?</h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed font-audrey text-justify">
                  Tu piel es el órgano más grande de tu cuerpo y, al igual que el resto de tu organismo, 
                  necesita nutrientes esenciales para funcionar correctamente. Los productos cosméticos naturales 
                  ricos en nutrientes no solo mejoran la apariencia de tu piel, sino que también la nutren desde 
                  el nivel celular.
                </p>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed font-audrey text-justify">
                  La diferencia entre los cosméticos naturales y los sintéticos radica en cómo estos nutrientes 
                  trabajan en armonía con los procesos naturales de tu piel. Los ingredientes naturales son 
                  reconocidos y utilizados eficientemente por tu organismo, proporcionando beneficios reales 
                  y duraderos.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a href="#nutrients">
                    <Button className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-lg hover:shadow-xl transition-all font-body">
                      <span>Explorar Nutrientes</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="/shop">
                    <Button variant="outline" className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white transition-all shadow-sm font-body">
                      <span>Ver Productos</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="relative">
                <Card className="border border-gray-200/60 shadow-xl bg-[#7d8768]/5">
                  <CardContent className="p-10">
                    <div className="text-6xl mb-6 text-center">🌱</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-editorial-new text-center">Beneficios de los Nutrientes Naturales</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <Leaf className="h-6 w-6 text-[#7d8768] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Mejor absorción por la piel</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Heart className="h-6 w-6 text-[#8e421e] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Compatible con la biología natural</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Shield className="h-6 w-6 text-[#b9a035] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Sin efectos secundarios dañinos</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Sparkles className="h-6 w-6 text-[#7d8768] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-body leading-relaxed">Resultados visibles y duraderos</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrients Categories - Enhanced */}
        <section id="nutrients" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-editorial-new">Categorías de Nutrientes</h2>
              <p className="text-xl text-gray-600 font-audrey max-w-2xl mx-auto text-justify">Explora cómo cada tipo de nutriente beneficia tu piel</p>
            </div>

            {/* Filtros */}
            <Card className="border border-gray-200/60 shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-gilda-display">
                  <Filter className="h-5 w-5" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Búsqueda por texto */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="font-body">Buscar Nutriente</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        type="text"
                        placeholder="Buscar por nombre, descripción, beneficios o fuentes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 font-body"
                      />
                    </div>
                  </div>

                  {/* Filtro por categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-body">Filtrar por Categoría</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category" className="font-body">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-body">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="font-body">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mostrar resultados del filtro */}
                {(searchQuery || selectedCategory !== 'all') && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600 font-body">
                      Mostrando {groupedCategories.reduce((sum, group) => sum + group.nutrients.length, 0)} nutriente(s)
                    </span>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="h-7 text-xs font-body"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#7d8768]" />
              <p className="text-gray-600 font-body">Cargando nutrientes...</p>
            </div>
          ) : groupedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-body">No hay nutrientes disponibles en este momento.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {groupedCategories.map(({ category, nutrients }, catIndex) => (
                <Card key={category.id} className="border border-gray-200/60 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-8 md:p-10 lg:p-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-[#7d8768] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-editorial-new">{category.name}</h2>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 mb-10 leading-relaxed font-audrey text-lg text-justify">{category.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nutrients.map((nutrient, index) => (
                        <Card 
                          key={nutrient.id} 
                          className="border border-gray-200/60 hover:border-[#7d8768] transition-all duration-300 bg-white hover:shadow-lg hover:-translate-y-1"
                          style={{ animationDelay: `${(catIndex * 0.1) + (index * 0.05)}s` }}
                        >
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-editorial-new">{nutrient.name}</h3>
                            <p className="text-gray-600 mb-5 text-sm leading-relaxed font-audrey text-justify">{nutrient.description}</p>
                            
                            <div className="mb-5">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm font-gilda-display">Beneficios:</h4>
                              <ul className="space-y-2">
                                {nutrient.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-[#7d8768] mt-1 font-bold">•</span>
                                    <span className="font-body">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm font-gilda-display">Fuentes Naturales:</h4>
                              <div className="flex flex-wrap gap-2">
                                {nutrient.sources.map((source, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-[#7d8768]/30 text-gray-700 hover:border-[#7d8768] hover:bg-[#7d8768]/5 font-body transition-colors">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

        {/* How It Works Section - Enhanced */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-editorial-new">¿Cómo Funcionan los Nutrientes en la Piel?</h2>
              <p className="text-xl text-gray-600 font-audrey max-w-3xl mx-auto text-justify">
                Los nutrientes naturales trabajan en múltiples niveles para nutrir, proteger y rejuvenecer tu piel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-gray-200/60 shadow-lg bg-[#7d8768]/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#7d8768] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Droplets className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-editorial-new">Absorción</h3>
                  <p className="text-gray-600 font-body leading-relaxed text-justify">
                    Los nutrientes naturales penetran la barrera cutánea y son reconocidos por las células, 
                    permitiendo una absorción eficiente y efectiva.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/60 shadow-lg bg-[#8e421e]/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#8e421e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-editorial-new">Activación</h3>
                  <p className="text-gray-600 font-body leading-relaxed text-justify">
                    Una vez dentro de las células, los nutrientes activan procesos naturales como la producción 
                    de colágeno y la regeneración celular.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/60 shadow-lg bg-[#b9a035]/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#b9a035] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-editorial-new">Transformación</h3>
                  <p className="text-gray-600 font-body leading-relaxed text-justify">
                    Los procesos activados resultan en una piel más saludable, hidratada, protegida y con 
                    una apariencia más joven y radiante.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Nutrition;
