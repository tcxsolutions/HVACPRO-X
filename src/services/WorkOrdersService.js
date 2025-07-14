import { supabase, DB_TABLES } from '../config/supabase';

export const fetchWorkOrders = async (tenantId, filters = {}) => {
  try {
    let query = supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select(`
        *,
        property:${DB_TABLES.PROPERTIES}(id, name),
        hvac_unit:${DB_TABLES.HVAC_UNITS}(id, name, model, location),
        technician:${DB_TABLES.TECHNICIANS}(id, name),
        customer:${DB_TABLES.CUSTOMERS}(id, name, phone)
      `)
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    if (filters.technicianId) {
      query = query.eq('technician_id', filters.technicianId);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    // Order by
    query = query.order(filters.orderBy || 'created_at', { 
      ascending: filters.ascending === true 
    });

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return { data: null, error };
  }
};

export const getWorkOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select(`
        *,
        property:${DB_TABLES.PROPERTIES}(*),
        hvac_unit:${DB_TABLES.HVAC_UNITS}(*),
        technician:${DB_TABLES.TECHNICIANS}(*),
        customer:${DB_TABLES.CUSTOMERS}(*),
        history:${DB_TABLES.WORK_ORDER_HISTORY}(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching work order:', error);
    return { data: null, error };
  }
};

export const createWorkOrder = async (orderData) => {
  try {
    // No need to generate order_number, the trigger will handle that
    const { data, error } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .insert([{
        ...orderData,
        order_number: 'TEMP' // This will be replaced by the trigger
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating work order:', error);
    return { data: null, error };
  }
};

export const updateWorkOrder = async (orderId, orderData) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .update(orderData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    
    // If status is changing to completed, set the completed date
    if (orderData.status === 'completed' && !orderData.completed_date) {
      await supabase
        .from(DB_TABLES.WORK_ORDERS)
        .update({ completed_date: new Date().toISOString() })
        .eq('id', orderId);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating work order:', error);
    return { data: null, error };
  }
};

export const deleteWorkOrder = async (orderId) => {
  try {
    const { error } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .delete()
      .eq('id', orderId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting work order:', error);
    return { success: false, error };
  }
};

export const assignTechnician = async (orderId, technicianId) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.WORK_ORDERS)
      .update({
        technician_id: technicianId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    
    // Add to work order history
    await supabase
      .from(DB_TABLES.WORK_ORDER_HISTORY)
      .insert([{
        work_order_id: orderId,
        action: 'technician_assigned',
        new_status: 'assigned'
      }]);
    
    return { data, error: null };
  } catch (error) {
    console.error('Error assigning technician:', error);
    return { data: null, error };
  }
};