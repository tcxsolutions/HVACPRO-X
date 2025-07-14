import { supabase } from '../lib/supabase'  // Changed to named import

// Database table names with prefixes to avoid conflicts
export const DB_TABLES = {
  USER_PROFILES: 'user_profiles',
  TENANTS: 'tenants',
  PROPERTIES: 'properties_hvac1234',
  HVAC_UNITS: 'hvac_units_hvac1234',
  WORK_ORDERS: 'work_orders_hvac1234',
  TECHNICIANS: 'technicians_hvac1234',
  CUSTOMERS: 'customers_hvac1234',
  MAINTENANCE_SCHEDULE: 'maintenance_schedule_hvac1234',
  WORK_ORDER_HISTORY: 'work_order_history_hvac1234',
  INVOICES: 'invoices_hvac1234',
  VENDORS: 'vendors_hvac7539',
  PURCHASE_ORDERS: 'purchase_orders_hvac7539',
  PURCHASE_ORDER_ITEMS: 'purchase_order_items_hvac7539'
}

// Mock data for demo
const mockData = {
  user_profiles: [
    {
      id: 'demo-user-id',
      user_id: 'demo-user-id',
      tenant_id: 'demo-tenant-id',
      first_name: 'Demo',
      last_name: 'User',
      role: 'admin',
      permissions: ['all'],
      tenant: {
        id: 'demo-tenant-id',
        name: 'Demo HVAC Company',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          features: ['basic_hvac', 'work_orders', 'customer_management']
        }
      }
    }
  ],
  properties: [
    {
      id: 1,
      name: 'Downtown Office Complex',
      address: '123 Business Ave, City, ST 12345',
      type: 'commercial',
      size: 50000,
      contact_person: 'John Smith',
      contact_phone: '(555) 123-4567',
      contact_email: 'john@company.com',
      tenant_id: 'demo-tenant-id',
      created_at: new Date().toISOString()
    }
  ],
  subscriptions: [
    {
      id: 'demo-subscription',
      tenant_id: 'demo-tenant-id',
      plan_id: 'trial',
      status: 'active',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  invoices: []
}

export { supabase, mockData }