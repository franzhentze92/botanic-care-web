export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  emoji: string | null;
  rating: number;
  reviews_count: number;
  badge: string | null;
  description: string;
  long_description: string | null;
  ingredients: string[] | null;
  benefits: string[] | null;
  size: string | null;
  in_stock: boolean;
  sku: string;
  created_at?: string;
  updated_at?: string;
}

// Helper type for the Product interface used in the UI (with camelCase)
export interface ProductUI {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  realImage: string;
  rating: number;
  reviews: number;
  badge: string | null;
  description: string;
  longDescription: string;
  ingredients: string[];
  benefits: string[];
  size: string;
  inStock: boolean;
  sku: string;
}

// Convert database product to UI product
export function productToUI(product: Product): ProductUI {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.original_price,
    image: product.emoji || '🌿',
    realImage: product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    rating: product.rating,
    reviews: product.reviews_count,
    badge: product.badge,
    description: product.description,
    longDescription: product.long_description || product.description,
    ingredients: product.ingredients || [],
    benefits: product.benefits || [],
    size: product.size || 'N/A',
    inStock: product.in_stock,
    sku: product.sku,
  };
}

