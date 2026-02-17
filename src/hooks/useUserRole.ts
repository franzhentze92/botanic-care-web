import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'cliente' | null;

export interface UserRoleData {
  id: number;
  user_id: string;
  role: 'admin' | 'cliente';
  created_at?: string;
  updated_at?: string;
}

// Hook para obtener el rol del usuario actual
export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery<UserRoleData | null, Error>({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Si no existe el rol, retornar null (será cliente por defecto)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook para verificar si el usuario es admin
export const useIsAdmin = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'admin';
};

// Hook para verificar si el usuario es cliente
export const useIsCliente = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'cliente' || userRole === null; // null significa cliente por defecto
};

// Función helper para obtener el rol del usuario (para uso fuera de componentes)
export const getUserRole = async (userId: string): Promise<UserRole> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return 'cliente'; // Default role
  }

  return data.role as UserRole;
};

