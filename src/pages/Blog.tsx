import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlog';
import { Search, ArrowRight, Calendar, User, Clock, Sparkles, Leaf, AlertCircle, Eye, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: posts, isLoading, error } = useBlogPosts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    searchQuery: searchQuery || undefined,
  });

  const { data: categories } = useBlogCategories();

  // Featured post (first post) - only show when no filters applied
  const featuredPost = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery) return null;
    return posts && posts.length > 0 ? posts[0] : null;
  }, [posts, selectedCategory, searchQuery]);

  // Regular posts (excluding featured when featured is shown)
  const regularPosts = useMemo(() => {
    if (!posts) return [];
    // If featured post is being shown, exclude it from regular posts
    if (featuredPost) {
      return posts.filter(p => p.id !== featuredPost.id);
    }
    return posts;
  }, [posts, featuredPost]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: es });
    } catch {
      return '';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#b9a035] text-white py-24 md:py-32 overflow-hidden">
          {/* Background decorative elements - enhanced */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <Leaf className="h-5 w-5 text-white/95" />
                  <Sparkles className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium tracking-wide font-gilda-display">Blog de Cuidado Natural</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 font-editorial-new leading-tight tracking-tight animate-slide-in">
                Blog Botanic Care
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-audrey font-light mb-8">
                Descubre consejos, tendencias y todo sobre cuidado natural de la piel
              </p>
              <div className="flex items-center justify-center gap-4 text-white/80 text-sm font-body">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Ingredientes 100% Naturales</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  <span>Cuidado de la Piel</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-16 relative z-20">
          <div className="flex flex-col gap-8 mb-16">
            {/* Search Bar - Enhanced */}
            <div className="relative max-w-3xl mx-auto w-full">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  placeholder="Buscar artículos, temas, ingredientes naturales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-6 py-7 text-lg rounded-2xl border-0 bg-transparent focus:ring-2 focus:ring-[#7d8768]/20 shadow-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Category Filter Pills - Enhanced */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 px-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={`rounded-full transition-all duration-300 font-medium font-body ${
                    selectedCategory === 'all'
                      ? 'bg-[#7d8768] text-white hover:bg-[#6d7660] shadow-lg shadow-[#7d8768]/20 border-0'
                      : 'border-2 border-gray-200 bg-white hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5 shadow-sm'
                  }`}
                >
                  Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full transition-all duration-300 font-medium font-body ${
                      selectedCategory === category
                        ? 'bg-[#7d8768] text-white hover:bg-[#6d7660] shadow-lg shadow-[#7d8768]/20 border-0'
                        : 'border-2 border-gray-200 bg-white hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5 shadow-sm'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Featured Post - Enhanced */}
          {!isLoading && !error && featuredPost && selectedCategory === 'all' && !searchQuery && (
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                  <Sparkles className="h-5 w-5 text-[#7d8768]" />
                  <h2 className="text-2xl font-bold text-gray-900 font-editorial-new">Artículo Destacado</h2>
                </div>
              </div>
              <Link to={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200/50 bg-white shadow-lg hover:shadow-xl hover:-translate-y-1">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featuredPost.featured_image && (
                      <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={featuredPost.featured_image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 group-hover:from-black/40 transition-all duration-500"></div>
                        {/* Overlay badge on image */}
                        {featuredPost.category && (
                          <div className="absolute top-6 left-6">
                            <Badge className="bg-white/95 backdrop-blur-sm text-[#7d8768] border-0 shadow-lg font-medium px-4 py-1.5">
                              {featuredPost.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
                      {!featuredPost.featured_image && featuredPost.category && (
                        <Badge className="mb-6 w-fit bg-[#7d8768] text-white border-0 shadow-md px-4 py-1.5 font-medium font-body">
                          {featuredPost.category}
                        </Badge>
                      )}
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-editorial-new leading-tight group-hover:text-[#7d8768] transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed line-clamp-3 font-body">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-500 font-body">
                        {featuredPost.published_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#7d8768]" />
                            <span>{formatDate(featuredPost.published_at)}</span>
                          </div>
                        )}
                        {featuredPost.author?.email && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#7d8768]" />
                            <span>{featuredPost.author.email.split('@')[0]}</span>
                          </div>
                        )}
                        {featuredPost.views && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#7d8768]" />
                            <span>{featuredPost.views} vistas</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-[#7d8768] font-semibold group-hover:text-[#6d7660] transition-colors">
                        <span className="font-body text-lg">Leer artículo completo</span>
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </section>
          )}

          {/* Posts Grid */}
          <section>
            {!isLoading && !error && (!featuredPost || selectedCategory !== 'all' || searchQuery) && (
              <div className="flex items-center gap-3 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#7d8768]/10 rounded-full border border-[#7d8768]/20">
                  <Leaf className="h-5 w-5 text-[#7d8768]" />
                  <h2 className="text-2xl font-bold text-gray-900 font-editorial-new">
                    {searchQuery ? 'Resultados de búsqueda' : selectedCategory !== 'all' ? selectedCategory : 'Todos los Artículos'}
                  </h2>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-24">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
                  <div className="relative inline-block animate-spin rounded-full h-14 w-14 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
                </div>
                <p className="text-gray-600 text-lg font-body">Cargando artículos...</p>
                <p className="text-gray-400 text-sm mt-2 font-body">Descubre contenido sobre cuidado natural</p>
              </div>
            )}

            {error && (
              <Card className="p-12 md:p-16 text-center border-2 border-red-100 bg-white shadow-lg">
                <div className="text-red-500 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-editorial-new">Error al cargar los artículos</h3>
                <p className="text-gray-600 mb-8 font-body max-w-md mx-auto">{error.message}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md font-body"
                >
                  Intentar de nuevo
                </Button>
              </Card>
            )}

            {!isLoading && !error && regularPosts.length === 0 && (
              <Card className="p-12 md:p-16 text-center border border-gray-200/60 bg-white shadow-lg">
                <div className="text-gray-300 mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
                    <Search className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-editorial-new">No se encontraron artículos</h3>
                <p className="text-gray-600 mb-8 font-body max-w-md mx-auto leading-relaxed">
                  {searchQuery 
                    ? `No hay resultados para "${searchQuery}". Intenta con otros términos o explora nuestras categorías.`
                    : selectedCategory !== 'all'
                    ? `No hay artículos en la categoría "${selectedCategory}". Prueba con otra categoría o vuelve a ver todos los artículos.`
                    : 'Aún no hay artículos publicados. Vuelve pronto para descubrir contenido sobre cuidado natural.'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button 
                    variant="outline"
                    className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white transition-all shadow-sm font-body"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    <Leaf className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </Card>
            )}

            {!isLoading && !error && regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer border border-gray-200/60 bg-white shadow-sm hover:-translate-y-2">
                      {post.featured_image && (
                        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          {/* Category badge overlay */}
                          {post.category && (
                            <div className="absolute top-4 left-4 opacity-90 group-hover:opacity-100 transition-opacity">
                              <Badge className="bg-white/95 backdrop-blur-sm text-[#7d8768] border-0 shadow-md font-medium">
                                {post.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col bg-white">
                        {!post.featured_image && post.category && (
                          <Badge className="mb-4 w-fit bg-[#7d8768] text-white border-0 shadow-sm font-medium font-body">
                            {post.category}
                          </Badge>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 mb-3 font-editorial-new group-hover:text-[#7d8768] transition-colors duration-300 line-clamp-2 leading-tight">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-5 line-clamp-3 flex-1 leading-relaxed font-body text-sm">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-gray-500 font-body">
                          {post.published_at && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-[#7d8768]" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                          )}
                          {post.author?.email && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-[#7d8768]" />
                              <span>{post.author.email.split('@')[0]}</span>
                            </div>
                          )}
                          {post.views && (
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 text-[#7d8768]" />
                              <span>{post.views}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto flex items-center text-[#7d8768] font-semibold group-hover:text-[#6d7660] transition-colors">
                          <span className="font-body">Leer más</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;

