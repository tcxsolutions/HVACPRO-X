import { supabase, DB_TABLES } from '../config/supabase';

export const fetchTechnicians = async (tenantId, filters = {}) => {
  try {
    let query = supabase
      .from(DB_TABLES.TECHNICIANS)
      .select('*')
      .eq('tenant_id', tenantId);
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    
    if (filters.specialization) {
      query = query.contains('specializations', [filters.specialization]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return { data: null, error };
  }
};

export const getTechnician = async (technicianId) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.TECHNICIANS)
      .select('*')
      .eq('id', technicianId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching technician:', error);
    return { data: null, error };
  }
};

export const createTechnician = async (technicianData) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.TECHNICIANS)
      .insert([technicianData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating technician:', error);
    return { data: null, error };
  }
};

export const updateTechnician = async (technicianId, technicianData) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.TECHNICIANS)
      .update(technicianData)
      .eq('id', technicianId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating technician:', error);
    return { data: null, error };
  }
};

export const deleteTechnician = async (technicianId) => {
  try {
    const { error } = await supabase
      .from(DB_TABLES.TECHNICIANS)
      .delete()
      .eq('id', technicianId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting technician:', error);
    return { success: false, error };
  }
};

export const getTechnicianWorkOrders = async (technicianId, status = null) => {
  try {
    let query = supabase
      .from(DB_TABLES.WORK_ORDERS)
      .select(`
        *,
        property:${DB_TABLES.PROPERTIES}(id, name),
        hvac_unit:${DB_TABLES.HVAC_UNITS}(id, name, model)
      `)
      .eq('technician_id', technicianId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order('scheduled_date', { ascending: true });
    
    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching technician work orders:', error);
    return { data: null, error };
  }
};

export const updateTechnicianStatus = async (technicianId, status) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.TECHNICIANS)
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', technicianId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating technician status:', error);
    return { data: null, error };
  }
};