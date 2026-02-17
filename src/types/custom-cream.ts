// Tipos para el Constructor de Cremas Personalizadas

export interface CustomOil {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  price_modifier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomExtract {
  id: string;
  name: string;
  emoji: string | null;
  price_modifier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomFunction {
  id: string;
  name: string;
  emoji: string | null;
  ingredients: string[];
  price_modifier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomCream {
  id: number;
  user_id: string | null;
  oil_id: string;
  extract_ids: string[];
  function_id: string;
  base_price: number;
  final_price: number;
  name: string | null;
  status: 'draft' | 'in_cart' | 'ordered' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface CustomCreamOrder {
  id: number;
  custom_cream_id: number;
  order_id: number | null;
  user_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  subscription: boolean;
  subscription_frequency: 'monthly' | 'bimonthly' | 'quarterly' | null;
  status: 'pending' | 'processing' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// Tipos para el UI (camelCase)
export interface CustomOilUI {
  id: string;
  name: string;
  emoji: string;
  description: string;
  priceModifier: number;
}

export interface CustomExtractUI {
  id: string;
  name: string;
  emoji: string;
  priceModifier: number;
}

export interface CustomFunctionUI {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  priceModifier: number;
}

export interface CustomCreamUI {
  id: number;
  userId: string | null;
  oilId: string;
  extractIds: string[];
  functionId: string;
  basePrice: number;
  finalPrice: number;
  name: string | null;
  status: 'draft' | 'in_cart' | 'ordered' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions para convertir de DB a UI
export function customOilToUI(oil: CustomOil): CustomOilUI {
  return {
    id: oil.id,
    name: oil.name,
    emoji: oil.emoji || '🌿',
    description: oil.description || '',
    priceModifier: oil.price_modifier,
  };
}

export function customExtractToUI(extract: CustomExtract): CustomExtractUI {
  return {
    id: extract.id,
    name: extract.name,
    emoji: extract.emoji || '🌱',
    priceModifier: extract.price_modifier,
  };
}

export function customFunctionToUI(func: CustomFunction): CustomFunctionUI {
  return {
    id: func.id,
    name: func.name,
    emoji: func.emoji || '✨',
    ingredients: func.ingredients,
    priceModifier: func.price_modifier,
  };
}

