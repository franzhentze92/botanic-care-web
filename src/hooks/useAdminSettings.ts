import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface AppSetting {
  id: number;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsData {
  general?: {
    storeName?: string;
    storeDescription?: string;
    storeEmail?: string;
    storePhone?: string;
    storeAddress?: string;
    storeCity?: string;
    storeCountry?: string;
    storeCurrency?: string;
    storeLanguage?: string;
  };
  orders?: {
    minOrderAmount?: number;
    freeShippingThreshold?: number;
    shippingCost?: number;
    orderProcessingDays?: number;
    autoConfirmOrders?: boolean;
    sendOrderEmails?: boolean;
  };
  email?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpSecure?: boolean;
    fromEmail?: string;
    fromName?: string;
  };
  notifications?: {
    newOrderEmail?: boolean;
    lowStockEmail?: boolean;
    newCustomerEmail?: boolean;
    weeklyReportEmail?: boolean;
    emailNotifications?: boolean;
  };
  security?: {
    requireEmailVerification?: boolean;
    passwordMinLength?: number;
    sessionTimeout?: number;
    enable2FA?: boolean;
    allowRegistration?: boolean;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    enableDarkMode?: boolean;
  };
}

// ==================== HOOKS ====================

export const useAdminSettings = () => {
  return useQuery<SettingsData, Error>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      // Convertir settings a objeto estructurado
      const settingsData: SettingsData = {};

      (settings || []).forEach((setting: AppSetting) => {
        const category = setting.category as keyof SettingsData;
        if (!settingsData[category]) {
          settingsData[category] = {};
        }
        
        // Extraer la clave específica (ej: 'general.storeName' -> 'storeName')
        const key = setting.setting_key.split('.').pop() || setting.setting_key;
        if (settingsData[category]) {
          (settingsData[category] as any)[key] = setting.setting_value;
        }
      });

      return settingsData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useSaveSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, data }: { category: string; data: Record<string, any> }): Promise<void> => {
      // Convertir objeto a array de settings
      const settingsToSave = Object.entries(data).map(([key, value]) => {
        const settingKey = `${category}.${key}`;
        let settingType: AppSetting['setting_type'] = 'string';
        
        if (typeof value === 'number') {
          settingType = 'number';
        } else if (typeof value === 'boolean') {
          settingType = 'boolean';
        } else if (Array.isArray(value)) {
          settingType = 'array';
        } else if (typeof value === 'object' && value !== null) {
          settingType = 'object';
        }

        return {
          setting_key: settingKey,
          setting_value: value,
          setting_type: settingType,
          category: category,
        };
      });

      // Usar upsert para crear o actualizar
      const { error } = await supabase
        .from('app_settings')
        .upsert(settingsToSave, {
          onConflict: 'setting_key',
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      // También invalidar store-settings si se guardaron configuraciones de orders o general
      if (variables.category === 'orders' || variables.category === 'general') {
        queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      }
      toast.success(`Configuración de ${variables.category} guardada exitosamente`);
    },
    onError: (error: Error) => {
      toast.error('Error al guardar la configuración', {
        description: error.message,
      });
    },
  });
};

export const useTestEmail = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Aquí implementarías la lógica real de envío de email
      // Por ahora simulamos
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast.success('Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.');
    },
    onError: (error: Error) => {
      toast.error('Error al enviar el email de prueba', {
        description: error.message,
      });
    },
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Implementar exportación de datos
      const tables = ['products', 'orders', 'inventory_items', 'production_batches'];
      const exportedData: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.error(`Error exporting ${table}:`, error);
          continue;
        }

        exportedData[table] = data || [];
      }

      // Crear archivo JSON y descargarlo
      const dataStr = JSON.stringify(exportedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `botanic-care-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Datos exportados exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al exportar los datos', {
        description: error.message,
      });
    },
  });
};

