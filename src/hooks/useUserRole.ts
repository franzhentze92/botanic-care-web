import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'cliente' | null;

export interface UserRoleData {
  id: number;
  user_id: string;
  role: 'admin' | 'cliente';
  created_at?: string;
  updated_at?: string;
}

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery<UserRoleData | null, Error>({
    queryKey: ['user-role', user?.id],
    queryFn: async () => null,
    enabled: false,
    staleTime: Infinity,
  });
};

export const useIsAdmin = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'admin';
};

export const useIsCliente = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'cliente' || userRole === null;
};

export const getUserRole = async (_userId: string): Promise<UserRole> => {
  return 'cliente';
};
