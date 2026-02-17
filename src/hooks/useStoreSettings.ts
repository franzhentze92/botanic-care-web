import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface StoreSettings {
  freeShippingThreshold: number;
  shippingCost: number;
  minOrderAmount: number;
  storeName: string;
  storeCurrency: string;
}

// Hook público para acceder a los settings de la tienda
// No requiere permisos de admin, solo lectura
export const useStoreSettings = () => {
  return useQuery<StoreSettings>({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('*')
        .in('category', ['orders', 'general']);

      if (error) {
        // Si hay error, retornar valores por defecto
        console.warn('Error loading store settings, using defaults:', error);
        return {
          freeShippingThreshold: 50,
          shippingCost: 25,
          minOrderAmount: 50,
          storeName: 'Botanic Care',
          storeCurrency: 'GTQ',
        };
      }

      // Convertir settings a objeto
      const settingsData: Partial<StoreSettings> = {
        freeShippingThreshold: 50,
        shippingCost: 25,
        minOrderAmount: 50,
        storeName: 'Botanic Care',
        storeCurrency: 'GTQ',
      };

      (settings || []).forEach((setting: any) => {
        const key = setting.setting_key.split('.').pop() || setting.setting_key;
        
        if (setting.category === 'orders') {
          if (key === 'freeShippingThreshold') {
            // Asegurar que el valor sea un número
            const value = typeof setting.setting_value === 'number' 
              ? setting.setting_value 
              : parseFloat(setting.setting_value) || 50;
            settingsData.freeShippingThreshold = value;
          } else if (key === 'shippingCost') {
            const value = typeof setting.setting_value === 'number' 
              ? setting.setting_value 
              : parseFloat(setting.setting_value) || 25;
            settingsData.shippingCost = value;
          } else if (key === 'minOrderAmount') {
            const value = typeof setting.setting_value === 'number' 
              ? setting.setting_value 
              : parseFloat(setting.setting_value) || 50;
            settingsData.minOrderAmount = value;
          }
        } else if (setting.category === 'general') {
          if (key === 'storeName') {
            settingsData.storeName = setting.setting_value || 'Botanic Care';
          } else if (key === 'storeCurrency') {
            settingsData.storeCurrency = setting.setting_value || 'GTQ';
          }
        }
      });

      return settingsData as StoreSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo reintentar una vez si falla
  });
};

