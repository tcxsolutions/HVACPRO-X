import { supabase } from '../lib/supabase'
import { DB_TABLES } from '../config/constants'
import { logger } from '../lib/logger'

// Get inventory transactions with filters
export const getInventoryTransactions = async (tenantId, filters = {}) => {
  try {
    let query = supabase
      .from(DB_TABLES.INVENTORY_TRANSACTIONS)
      .select(`
        *,
        item:${DB_TABLES.INVENTORY_ITEMS}(id, name, sku),
        user:${DB_TABLES.USER_PROFILES}(id, first_name, last_name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.itemId) {
      query = query.eq('item_id', filters.itemId);
    }

    // Handle pagination
    const start = (filters.page - 1) * filters.limit;
    query = query.range(start, start + filters.limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error fetching inventory transactions:', error);
    return { data: null, error };
  }
};

// Get inventory item details
export const getInventoryItem = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.INVENTORY_ITEMS)
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Error fetching inventory item:', error);
    return { data: null, error };
  }
};

// Create inventory transaction
export const createInventoryTransaction = async (transactionData) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.INVENTORY_TRANSACTIONS)
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Error creating inventory transaction:', error);
    return { data: null, error };
  }
};

// Update inventory item stock
export const updateInventoryStock = async (itemId, quantity, type = 'received') => {
  try {
    const { data: item, error: itemError } = await getInventoryItem(itemId);
    if (itemError) throw itemError;

    const newQuantity = type === 'received' 
      ? item.quantity + quantity 
      : item.quantity - quantity;

    const { data, error } = await supabase
      .from(DB_TABLES.INVENTORY_ITEMS)
      .update({ quantity: newQuantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Error updating inventory stock:', error);
    return { data: null, error };
  }
};

// Get low stock items
export const getLowStockItems = async (tenantId) => {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.INVENTORY_ITEMS)
      .select('*')
      .eq('tenant_id', tenantId)
      .lt('quantity', supabase.raw('min_quantity'))
      .order('quantity', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Error fetching low stock items:', error);
    return { data: null, error };
  }
};

// Get inventory statistics
export const getInventoryStats = async (tenantId) => {
  try {
    const { data: items, error: itemsError } = await supabase
      .from(DB_TABLES.INVENTORY_ITEMS)
      .select('*')
      .eq('tenant_id', tenantId);

    if (itemsError) throw itemsError;

    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      lowStockItems: items.filter(item => item.quantity <= item.min_quantity).length,
      categoryCounts: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    };

    return { data: stats, error: null };
  } catch (error) {
    logger.error('Error getting inventory statistics:', error);
    return { data: null, error };
  }
};