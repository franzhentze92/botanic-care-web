import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBlogPost } from '@/hooks/useBlog';
import { ArrowLeft, Clock, Leaf } from 'lucide-react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de lectura`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-24">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#7d8768]/20"></div>
                <div className="relative inline-block animate-spin rounded-full h-14 w-14 border-4 border-[#7d8768]/20 border-t-[#7d8768]"></div>
              </div>
              <p className="text-gray-600 text-lg font-audrey">Cargando artículo...</p>
              <p className="text-gray-400 text-sm mt-2 font-audrey">Preparando el contenido para ti</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-12 md:p-16 text-center border-2 border-red-100 bg-white shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-editorial-new">Artículo no encontrado</h1>
              <p className="text-gray-600 mb-8 font-body">El artículo que buscas no existe o ha sido eliminado.</p>
              <Link to="/blog">
                <Button className="bg-[#7d8768] hover:bg-[#6d7660] text-white shadow-md font-body">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Blog
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const htmlContent = marked(post.content || '') as string;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/blog">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-[#7d8768] hover:bg-[#7d8768]/5 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-body">Volver al Blog</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Image Section - Contained */}
          {post.featured_image && (
            <div className="relative mb-12 rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                }}
              />
              {/* Category badge on image */}
              {post.category && (
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/95 backdrop-blur-sm text-[#7d8768] border-0 shadow-lg font-medium px-4 py-1.5">
                    {post.category}
                  </Badge>
                </div>
              )}
            </div>
          )}
          {/* Article Header */}
          <header className="mb-10">
            {/* Category badge - only show if no featured image */}
            {!post.featured_image && post.category && (
              <div className="mb-6">
                <Badge className="bg-[#7d8768] text-white border-0 shadow-md px-4 py-1.5 font-medium font-body">
                  {post.category}
                </Badge>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-editorial-new leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Article Meta - Reading Time Only */}
            {post.content && (
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 font-body">
                  <Clock className="h-4 w-4 text-[#7d8768]" />
                  <span>{formatReadingTime(post.content)}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5 transition-colors font-body"
                  >
                    <Leaf className="h-3 w-3 mr-1.5" />
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Article Body */}
          <Card className="border border-gray-200 shadow-lg bg-white">
            <div className="p-8 md:p-12 lg:p-16">
              <div
                className="prose prose-lg prose-slate max-w-none 
                  prose-headings:font-editorial-new prose-headings:text-gray-900 prose-headings:font-bold
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
                  prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8
                  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:font-body prose-p:text-base md:prose-p:text-lg prose-p:text-justify
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-a:text-[#7d8768] prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:transition-all
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                  prose-li:text-gray-700 prose-li:mb-2 prose-li:font-body
                  prose-blockquote:border-l-4 prose-blockquote:border-[#7d8768] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-[#7d8768]/5 prose-blockquote:py-2 prose-blockquote:my-6
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                  prose-code:text-[#7d8768] prose-code:bg-[#7d8768]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg
                  prose-hr:border-gray-200 prose-hr:my-8"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </Card>

          {/* Back to Blog CTA */}
          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button 
                variant="outline"
                className="border-2 border-[#7d8768] text-[#7d8768] hover:bg-[#7d8768] hover:text-white transition-all shadow-sm px-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="font-body">Ver más artículos</span>
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;

