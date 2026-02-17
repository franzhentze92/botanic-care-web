import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ==================== TYPES ====================

export interface RevenueOrder {
  id: number;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface Customer {
  user_id: string;
  email: string;
  name: string;
  total_orders: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  todayRevenue: number;
  todayOrders: number;
  revenueByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// ==================== HOOKS ====================

export const useAdminRevenue = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: string;
}) => {
  return useQuery<RevenueOrder[], Error>({
    queryKey: ['admin-revenue', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros de fecha
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate + 'T23:59:59');
      }

      // Aplicar filtro de estado
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Aplicar filtro de usuario
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data: orders, error: ordersError } = await query;

      if (ordersError) {
        console.error('Error fetching revenue orders:', ordersError);
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Obtener información de usuarios
      const userIds = [...new Set(orders.map(o => o.user_id))];
      
      // Intentar obtener desde user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);
      
      console.log('Perfiles obtenidos de user_profiles:', { profiles, error: profilesError, userIds });

      // Intentar obtener emails usando una función RPC
      let userEmailMap = new Map<string, string>();
      
      try {
        console.log('Obteniendo emails para usuarios:', userIds);
        const { data: userEmails, error: emailError } = await supabase
          .rpc('get_user_emails', { user_ids: userIds });
        
        console.log('Respuesta RPC get_user_emails:', { data: userEmails, error: emailError });
        
        if (userEmails && !emailError && Array.isArray(userEmails)) {
          console.log('Emails obtenidos correctamente:', userEmails.length, 'usuarios');
          userEmails.forEach((item: any) => {
            if (item.id && item.email) {
              userEmailMap.set(item.id, item.email);
              console.log(`Email para ${item.id}: ${item.email}`);
            }
          });
        } else if (emailError) {
          console.error('Error obteniendo emails:', emailError);
        } else {
          console.warn('No se recibieron datos de emails');
        }
      } catch (e) {
        console.error('Excepción al llamar get_user_emails:', e);
      }
      
      console.log('Mapa de emails creado:', Array.from(userEmailMap.entries()));

      // Crear mapa de usuarios con información completa
      const userMap = new Map<string, { email?: string; name?: string }>();
      
      // Procesar perfiles primero
      if (profiles && profiles.length > 0) {
        console.log('Perfiles obtenidos:', profiles.length, profiles);
        profiles.forEach(profile => {
          const firstName = (profile.first_name || '').trim();
          const lastName = (profile.last_name || '').trim();
          const fullName = `${firstName} ${lastName}`.trim();
          const email = userEmailMap.get(profile.user_id);
          
          console.log(`Perfil para ${profile.user_id}:`, { 
            first_name: profile.first_name, 
            last_name: profile.last_name,
            firstName, 
            lastName, 
            fullName, 
            email,
            hasName: fullName.length > 0
          });
          
          // Solo establecer nombre si realmente existe (no vacío)
          if (fullName && fullName.length > 0) {
            userMap.set(profile.user_id, {
              name: fullName,
              email: email,
            });
            console.log(`✅ Nombre establecido para ${profile.user_id}: ${fullName}`);
          } else {
            // Si no hay nombre, solo establecer email
            userMap.set(profile.user_id, {
              email: email,
            });
            console.log(`⚠️ No hay nombre para ${profile.user_id}, solo email: ${email}`);
          }
        });
      } else {
        console.warn('⚠️ No se obtuvieron perfiles de user_profiles');
      }

      // Para usuarios sin perfil, agregar al mapa si tienen email
      userIds.forEach(userId => {
        if (!userMap.has(userId)) {
          const email = userEmailMap.get(userId);
          if (email) {
            userMap.set(userId, { email });
          }
        }
      });

      console.log('Mapa final de usuarios:', Array.from(userMap.entries()));

      // Combinar orders con información de usuario
      return orders.map(order => {
        const userInfo = userMap.get(order.user_id) || {};
        const email = userInfo.email;
        let userName = userInfo.name;
        
        console.log(`Procesando orden ${order.order_number} para usuario ${order.user_id}:`, { 
          userInfo,
          userName, 
          email,
          hasName: !!userName && userName.length > 0
        });
        
        // IMPORTANTE: Si hay nombre completo, usarlo. Solo usar email si NO hay nombre.
        if (!userName || userName.trim() === '') {
          // Si no hay nombre pero hay email, usar la parte antes del @ como nombre
          if (email) {
            userName = email.split('@')[0];
            console.log(`No hay nombre, usando email como nombre: ${userName}`);
          } else {
            // Si no hay ni nombre ni email, usar formato genérico
            userName = `Usuario ${order.user_id.substring(0, 8)}`;
            console.log(`No hay nombre ni email, usando formato genérico: ${userName}`);
          }
        } else {
          console.log(`Usando nombre completo: ${userName}`);
        }
        
        // Para email, si no existe usar el ID truncado
        const userEmail = email || `${order.user_id.substring(0, 8)}...`;
        
        console.log(`Resultado final para orden ${order.order_number}:`, { user_name: userName, user_email: userEmail });
        
        return {
          ...order,
          user_email: userEmail,
          user_name: userName,
        } as RevenueOrder;
      });
    },
  });
};

export const useAdminRevenueStats = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  return useQuery<RevenueStats, Error>({
    queryKey: ['admin-revenue-stats', filters],
    queryFn: async () => {
      // Obtener todas las órdenes (o filtradas)
      let query = supabase
        .from('orders')
        .select('*');

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate + 'T23:59:59');
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      const allOrders = orders || [];

      // Calcular fechas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filtrar órdenes por período
      const todayOrders = allOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= today;
      });

      const monthlyOrders = allOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= monthStart;
      });

      // Calcular ingresos
      const totalRevenue = allOrders.reduce((sum, o) => {
        // Solo contar órdenes no canceladas
        return o.status !== 'cancelled' ? sum + parseFloat(o.total.toString()) : sum;
      }, 0);

      const monthlyRevenue = monthlyOrders.reduce((sum, o) => {
        return o.status !== 'cancelled' ? sum + parseFloat(o.total.toString()) : sum;
      }, 0);

      const todayRevenue = todayOrders.reduce((sum, o) => {
        return o.status !== 'cancelled' ? sum + parseFloat(o.total.toString()) : sum;
      }, 0);

      // Calcular ingresos por estado
      const revenueByStatus = {
        pending: allOrders
          .filter(o => o.status === 'pending')
          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
        processing: allOrders
          .filter(o => o.status === 'processing')
          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
        shipped: allOrders
          .filter(o => o.status === 'shipped')
          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
        delivered: allOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
        cancelled: allOrders
          .filter(o => o.status === 'cancelled')
          .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
      };

      // Calcular promedio
      const validOrders = allOrders.filter(o => o.status !== 'cancelled');
      const averageOrderValue = validOrders.length > 0
        ? totalRevenue / validOrders.length
        : 0;

      return {
        totalRevenue,
        totalOrders: allOrders.length,
        averageOrderValue,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        todayRevenue,
        todayOrders: todayOrders.length,
        revenueByStatus,
      };
    },
  });
};

// Hook para obtener lista de clientes únicos
export const useAdminCustomers = () => {
  return useQuery<Customer[], Error>({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Obtener todos los pedidos para extraer usuarios únicos
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return [];
      }

      // Obtener usuarios únicos
      const userIds = [...new Set(orders.map(o => o.user_id))];

      // Obtener información de perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);
      
      console.log('Perfiles de clientes obtenidos:', { profiles, error: profilesError, userIds });

      // Intentar obtener emails usando una función RPC
      let userEmailMap = new Map<string, string>();
      
      try {
        console.log('Obteniendo emails de clientes para usuarios:', userIds);
        const { data: userEmails, error: emailError } = await supabase
          .rpc('get_user_emails', { user_ids: userIds });
        
        console.log('Respuesta RPC get_user_emails (clientes):', { data: userEmails, error: emailError });
        
        if (userEmails && !emailError && Array.isArray(userEmails)) {
          console.log('Emails de clientes obtenidos correctamente:', userEmails.length, 'usuarios');
          userEmails.forEach((item: any) => {
            if (item.id && item.email) {
              userEmailMap.set(item.id, item.email);
            }
          });
        } else if (emailError) {
          console.error('Error obteniendo emails de clientes:', emailError);
        } else {
          console.warn('No se recibieron datos de emails de clientes');
        }
      } catch (e) {
        console.error('Excepción al llamar get_user_emails para clientes:', e);
      }
      
      console.log('Mapa de emails de clientes:', Array.from(userEmailMap.entries()));

      // Contar pedidos por usuario
      const orderCounts = new Map<string, number>();
      orders.forEach(order => {
        orderCounts.set(order.user_id, (orderCounts.get(order.user_id) || 0) + 1);
      });

      // Combinar información
      const customers: Customer[] = userIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        const firstName = (profile?.first_name || '').trim();
        const lastName = (profile?.last_name || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = userEmailMap.get(userId);
        
        console.log(`Cliente ${userId}:`, { firstName, lastName, fullName, email });
        
        // Determinar el nombre a mostrar - PRIORIZAR NOMBRE COMPLETO
        let name = fullName;
        // Solo usar email como nombre si NO hay nombre completo
        if (!name || name === '') {
          if (email) {
            name = email.split('@')[0];
          } else {
            name = `Usuario ${userId.substring(0, 8)}`;
          }
        }
        
        return {
          user_id: userId,
          email: email || `${userId.substring(0, 8)}...`,
          name,
          total_orders: orderCounts.get(userId) || 0,
        };
      });
      
      console.log('Clientes finales:', customers);

      // Ordenar por número de pedidos (descendente)
      return customers.sort((a, b) => b.total_orders - a.total_orders);
    },
  });
};


