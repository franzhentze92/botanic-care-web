export interface NutrientCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Nutrient {
  id: number;
  name: string;
  category_id: string;
  description: string;
  benefits: string[];
  sources: string[];
  created_at?: string;
  updated_at?: string;
}

export interface NutrientWithCategory extends Nutrient {
  category: NutrientCategory;
}

export interface ProductNutrient {
  id: number;
  product_id: number;
  nutrient_id: number;
  created_at?: string;
}

