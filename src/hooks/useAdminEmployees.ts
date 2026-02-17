import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Employee {
  id: number;
  user_id: string | null;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  hire_date: string;
  salary: number | null;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeData {
  user_id?: string | null;
  employee_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  position: string;
  department?: string | null;
  hire_date: string;
  salary?: number | null;
  status?: Employee['status'];
  notes?: string | null;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: number;
}

// ==================== HOOKS ====================

export const useAdminEmployees = (filters?: {
  searchQuery?: string;
  status?: string;
  position?: string;
  department?: string;
}) => {
  return useQuery<Employee[], Error>({
    queryKey: ['admin-employees', filters],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.position && filters.position !== 'all') {
        query = query.eq('position', filters.position);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      let employees = data || [];

      // Aplicar filtro de búsqueda en memoria
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        employees = employees.filter(employee => 
          employee.first_name.toLowerCase().includes(query) ||
          employee.last_name.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query) ||
          employee.employee_code.toLowerCase().includes(query) ||
          (employee.phone && employee.phone.toLowerCase().includes(query)) ||
          employee.position.toLowerCase().includes(query)
        );
      }

      return employees;
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeData): Promise<Employee> => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast.success('Trabajador creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el trabajador', {
        description: error.message,
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateEmployeeData): Promise<Employee> => {
      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast.success('Trabajador actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el trabajador', {
        description: error.message,
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast.success('Trabajador eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el trabajador', {
        description: error.message,
      });
    },
  });
};

