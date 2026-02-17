import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval, parseISO } from 'date-fns';

// ==================== TYPES ====================

export interface AnalyticsData {
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number; // porcentaje
}

export interface DailyAnalytics {
  date: string;
  revenue: number;
  costs: number;
  profit: number;
}

export interface MonthlyAnalytics {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

export interface CategoryCostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  revenueByMonth: MonthlyAnalytics[];
  dailyAnalytics: DailyAnalytics[];
  costByCategory: CategoryCostBreakdown[];
  revenueGrowth: number; // porcentaje vs período anterior
  costGrowth: number; // porcentaje vs período anterior
}

// ==================== HOOKS ====================

export const useAdminAnalytics = (filters?: {
  startDate?: string;
  endDate?: string;
  period?: 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'last_year' | 'all' | 'custom';
}) => {
  return useQuery<FinancialAnalytics, Error>({
    queryKey: ['admin-analytics', filters],
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 10000, // Los datos se consideran "stale" después de 10 segundos
    refetchOnWindowFocus: true, // Refrescar cuando la ventana recupera el foco
    refetchOnMount: true, // Refrescar al montar el componente
    queryFn: async () => {
      // Determinar fechas según el período seleccionado
      let startDate: Date;
      let endDate: Date = new Date();

      const today = new Date();
      switch (filters?.period) {
        case 'last_24h':
          startDate = subDays(today, 1);
          break;
        case 'last_7d':
          startDate = subDays(today, 7);
          break;
        case 'last_30d':
          startDate = subDays(today, 30);
          break;
        case 'last_90d':
          startDate = subDays(today, 90);
          break;
        case 'last_year':
          startDate = subDays(today, 365);
          break;
        case 'custom':
          startDate = filters.startDate ? parseISO(filters.startDate) : subDays(today, 30);
          endDate = filters.endDate ? parseISO(filters.endDate) : today;
          break;
        case 'all':
        default:
          startDate = new Date(2020, 0, 1); // Fecha muy antigua
          break;
      }

      // Formatear fechas con timezone completo para Supabase
      const startDateStr = startOfDay(startDate).toISOString();
      const endDateStr = endOfDay(endDate).toISOString();

      // Debug: Log de fechas para verificar
      console.log('Analytics Date Range:', {
        period: filters?.period,
        startDate: startDateStr,
        endDate: endDateStr,
        currentYear: new Date().getFullYear()
      });

      // Obtener ingresos (orders)
      let orders: any[] = [];
      let costs: any[] = [];

      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total, created_at, status')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: true });

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          // No lanzar error, solo loguear y continuar con datos vacíos
        } else {
          orders = ordersData || [];
          console.log(`Fetched ${orders.length} orders for analytics`);
          if (orders.length > 0) {
            const firstOrder = orders[0];
            const lastOrder = orders[orders.length - 1];
            console.log('Order date range:', {
              first: firstOrder.created_at,
              last: lastOrder.created_at
            });
          }
        }
      } catch (e) {
        console.error('Exception fetching orders:', e);
      }

      try {
        // Obtener costos (usar formato de fecha simple para campo DATE)
        const startDateOnly = format(startOfDay(startDate), 'yyyy-MM-dd');
        const endDateOnly = format(endOfDay(endDate), 'yyyy-MM-dd');
        const { data: costsData, error: costsError } = await supabase
          .from('costs')
          .select('amount, date, category')
          .gte('date', startDateOnly)
          .lte('date', endDateOnly)
          .order('date', { ascending: true });

        if (costsError) {
          console.error('Error fetching costs:', costsError);
          // No lanzar error, solo loguear y continuar con datos vacíos
        } else {
          costs = costsData || [];
        }
      } catch (e) {
        console.error('Exception fetching costs:', e);
      }

      const revenueOrders = orders;
      const allCosts = costs;

      // Calcular totales
      const totalRevenue = revenueOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);

      const totalCosts = allCosts.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
      const netProfit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calcular datos por mes
      const revenueByMonthMap = new Map<string, number>();
      const costsByMonthMap = new Map<string, number>();

      revenueOrders
        .filter(o => o.status !== 'cancelled')
        .forEach(order => {
          try {
            const monthKey = format(parseISO(order.created_at), 'yyyy-MM');
            const current = revenueByMonthMap.get(monthKey) || 0;
            revenueByMonthMap.set(monthKey, current + parseFloat(order.total.toString()));
          } catch (e) {
            console.error('Error processing order for monthly data:', order, e);
          }
        });

      allCosts.forEach(cost => {
        try {
          const monthKey = format(parseISO(cost.date), 'yyyy-MM');
          const current = costsByMonthMap.get(monthKey) || 0;
          costsByMonthMap.set(monthKey, current + parseFloat(cost.amount.toString()));
        } catch (e) {
          console.error('Error processing cost for monthly data:', cost, e);
        }
      });

      const allMonths = new Set([...revenueByMonthMap.keys(), ...costsByMonthMap.keys()]);
      const revenueByMonth: MonthlyAnalytics[] = Array.from(allMonths)
        .sort()
        .map(month => ({
          month,
          revenue: revenueByMonthMap.get(month) || 0,
          costs: costsByMonthMap.get(month) || 0,
          profit: (revenueByMonthMap.get(month) || 0) - (costsByMonthMap.get(month) || 0),
        }));

      // Calcular datos diarios (últimos 30 días para evitar demasiados datos)
      const daysToShow = 30;
      const dailyStartDate = subDays(endDate, daysToShow);
      const daysArray = eachDayOfInterval({ start: dailyStartDate, end: endDate });

      const dailyRevenueMap = new Map<string, number>();
      const dailyCostsMap = new Map<string, number>();

      revenueOrders
        .filter(o => {
          try {
            const orderDate = parseISO(o.created_at);
            return orderDate >= dailyStartDate && o.status !== 'cancelled';
          } catch (e) {
            console.error('Error parsing order date:', o.created_at, e);
            return false;
          }
        })
        .forEach(order => {
          try {
            const dayKey = format(parseISO(order.created_at), 'yyyy-MM-dd');
            const current = dailyRevenueMap.get(dayKey) || 0;
            dailyRevenueMap.set(dayKey, current + parseFloat(order.total.toString()));
          } catch (e) {
            console.error('Error processing order:', order, e);
          }
        });

      allCosts
        .filter(c => {
          try {
            return parseISO(c.date) >= dailyStartDate;
          } catch (e) {
            console.error('Error parsing cost date:', c.date, e);
            return false;
          }
        })
        .forEach(cost => {
          try {
            const dayKey = format(parseISO(cost.date), 'yyyy-MM-dd');
            const current = dailyCostsMap.get(dayKey) || 0;
            dailyCostsMap.set(dayKey, current + parseFloat(cost.amount.toString()));
          } catch (e) {
            console.error('Error processing cost:', cost, e);
          }
        });

      const dailyAnalytics: DailyAnalytics[] = daysArray.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const revenue = dailyRevenueMap.get(dayKey) || 0;
        const costs = dailyCostsMap.get(dayKey) || 0;
        return {
          date: dayKey,
          revenue,
          costs,
          profit: revenue - costs,
        };
      });

      // Desglose de costos por categoría
      const costByCategoryMap = new Map<string, number>();
      allCosts.forEach(cost => {
        const current = costByCategoryMap.get(cost.category) || 0;
        costByCategoryMap.set(cost.category, current + parseFloat(cost.amount.toString()));
      });

      const totalCostsForPercentage = totalCosts || 1;
      const costByCategory: CategoryCostBreakdown[] = Array.from(costByCategoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalCostsForPercentage) * 100,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Calcular crecimiento (comparar con período anterior de misma duración)
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = subDays(startDate, periodDays);

      // Obtener datos del período anterior para comparación
      let previousOrders: any[] = [];
      let previousCosts: any[] = [];

      try {
        const previousStartDateStr = startOfDay(previousStartDate).toISOString();
        const { data: prevOrdersData } = await supabase
          .from('orders')
          .select('total, status')
          .gte('created_at', previousStartDateStr)
          .lt('created_at', startDateStr);
        previousOrders = prevOrdersData || [];
      } catch (e) {
        console.error('Error fetching previous orders:', e);
      }

      try {
        const previousStartDateOnly = format(startOfDay(previousStartDate), 'yyyy-MM-dd');
        const startDateOnly = format(startOfDay(startDate), 'yyyy-MM-dd');
        const { data: prevCostsData } = await supabase
          .from('costs')
          .select('amount')
          .gte('date', previousStartDateOnly)
          .lt('date', startDateOnly);
        previousCosts = prevCostsData || [];
      } catch (e) {
        console.error('Error fetching previous costs:', e);
      }

      const previousRevenue = previousOrders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + parseFloat(o.total.toString()), 0);

      const previousCostsTotal = previousCosts.reduce(
        (sum: number, c: any) => sum + parseFloat(c.amount.toString()),
        0
      );

      const revenueGrowth = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      const costGrowth = previousCostsTotal > 0
        ? ((totalCosts - previousCostsTotal) / previousCostsTotal) * 100
        : 0;

      return {
        totalRevenue,
        totalCosts,
        netProfit,
        profitMargin,
        revenueByMonth,
        dailyAnalytics,
        costByCategory,
        revenueGrowth,
        costGrowth,
      };
    },
  });
};

