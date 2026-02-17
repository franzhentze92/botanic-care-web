import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Task {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  assigned_to_user_id: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string | null;
  assigned_to?: number | null;
  assigned_to_user_id?: string | null;
  status?: Task['status'];
  priority?: Task['priority'];
  due_date?: string | null;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: number;
}

// ==================== HOOKS ====================

export const useAdminTasks = (filters?: {
  status?: string;
  priority?: string;
  assigned_to?: string;
  searchQuery?: string;
}) => {
  return useQuery<Task[], Error>({
    queryKey: ['admin-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assigned_to && filters.assigned_to !== 'all') {
        query = query.eq('assigned_to', parseInt(filters.assigned_to));
      }

      const { data: tasks, error: tasksError } = await query;

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Obtener información de empleados asignados
      const employeeIds = [...new Set(tasks?.map(t => t.assigned_to).filter(Boolean) || [])];
      let employeesMap = new Map<number, any>();

      if (employeeIds.length > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, first_name, last_name, email')
          .in('id', employeeIds);

        if (employees) {
          employees.forEach(emp => {
            employeesMap.set(emp.id, emp);
          });
        }
      }

      // Combinar datos
      let tasksWithEmployees = (tasks || []).map(task => ({
        ...task,
        employee: task.assigned_to ? employeesMap.get(task.assigned_to) : undefined,
      }));

      // Aplicar filtro de búsqueda
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        tasksWithEmployees = tasksWithEmployees.filter(task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.employee && `${task.employee.first_name} ${task.employee.last_name}`.toLowerCase().includes(query))
        );
      }

      return tasksWithEmployees;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData & { created_by: string }): Promise<Task> => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear la tarea', {
        description: error.message,
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateTaskData): Promise<Task> => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la tarea', {
        description: error.message,
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Tarea eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la tarea', {
        description: error.message,
      });
    },
  });
};

