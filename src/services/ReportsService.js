import { supabase, DB_TABLES } from '../config/supabase';

export const getWorkOrderStats = async (tenantId, dateRange = 'month') => {
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get work order counts by status
    const { data: statusData, error: statusError } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select('status, count')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .group('status');

    if (statusError) throw statusError;

    // Get work order counts by month
    const { data: timeData, error: timeError } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select('created_at, completed_date, status')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString());

    if (timeError) throw timeError;

    // Calculate average completion time
    const completedOrders = timeData.filter(order => order.status === 'completed' && order.completed_date);
    let avgCompletionTime = 0;
    
    if (completedOrders.length > 0) {
      const totalCompletionTime = completedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at);
        const completed = new Date(order.completed_date);
        return sum + (completed - created);
      }, 0);
      
      avgCompletionTime = totalCompletionTime / (completedOrders.length * 60 * 60 * 1000); // in hours
    }

    return { 
      data: {
        byStatus: statusData,
        byTime: timeData,
        avgCompletionTime: Math.round(avgCompletionTime)
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching work order stats:', error);
    return { data: null, error };
  }
};

export const getRevenueStats = async (tenantId, dateRange = 'month') => {
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get completed work orders with costs
    const { data: workOrders, error: workOrdersError } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select('completed_date, total_cost, labor_cost, parts_cost')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('completed_date', startDate.toISOString());

    if (workOrdersError) throw workOrdersError;

    // Get invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from(DB_TABLES.INVOICES)
      .select('created_at, amount, status')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString());

    if (invoicesError) throw invoicesError;

    // Calculate totals
    const totalRevenue = workOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0);
    const totalLaborCost = workOrders.reduce((sum, order) => sum + (order.labor_cost || 0), 0);
    const totalPartsCost = workOrders.reduce((sum, order) => sum + (order.parts_cost || 0), 0);
    const avgOrderValue = workOrders.length > 0 ? totalRevenue / workOrders.length : 0;

    return { 
      data: {
        workOrders,
        invoices,
        totalRevenue,
        totalLaborCost,
        totalPartsCost,
        avgOrderValue
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return { data: null, error };
  }
};

export const getMaintenanceStats = async (tenantId, dateRange = 'month') => {
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get maintenance schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from(DB_TABLES.MAINTENANCE_SCHEDULE)
      .select(`
        *,
        hvac_unit:${DB_TABLES.HVAC_UNITS}(name, model, property_id)
      `)
      .eq('tenant_id', tenantId);

    if (schedulesError) throw schedulesError;

    // Get upcoming maintenance
    const { data: upcomingMaintenance, error: upcomingError } = await supabase
      .from(DB_TABLES.MAINTENANCE_SCHEDULE)
      .select(`
        *,
        hvac_unit:${DB_TABLES.HVAC_UNITS}(name, model, property_id, property:${DB_TABLES.PROPERTIES}(name))
      `)
      .eq('tenant_id', tenantId)
      .gte('next_maintenance_date', now.toISOString())
      .lt('next_maintenance_date', new Date(now.setMonth(now.getMonth() + 1)).toISOString())
      .order('next_maintenance_date', { ascending: true });

    if (upcomingError) throw upcomingError;

    // Get maintenance work orders
    const { data: maintenanceOrders, error: ordersError } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select('*')
      .eq('tenant_id', tenantId)
      .ilike('description', '%maintenance%')
      .gte('created_at', startDate.toISOString());

    if (ordersError) throw ordersError;

    return { 
      data: {
        schedules,
        upcomingMaintenance,
        maintenanceOrders,
        totalScheduled: schedules.length,
        totalUpcoming: upcomingMaintenance.length
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    return { data: null, error };
  }
};