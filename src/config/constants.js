// Database tables with prefixes to avoid conflicts
export const DB_TABLES = {
  TENANTS: 'tenants_hvac2024',
  USER_PROFILES: 'user_profiles_hvac2024',
  PROPERTIES: 'properties_hvac2024',
  HVAC_UNITS: 'hvac_units_hvac2024',
  WORK_ORDERS: 'work_orders_hvac2024',
  WORK_ORDER_HISTORY: 'work_order_history_hvac2024',
  WORK_ORDER_ITEMS: 'work_order_items_hvac2024',
  WORK_ORDER_TASKS: 'work_order_tasks_hvac2024',
  WORK_ORDER_COMMENTS: 'work_order_comments_hvac2024',
  TECHNICIANS: 'technicians_hvac2024',
  INVENTORY_ITEMS: 'inventory_items_hvac2024',
  INVENTORY_TRANSACTIONS: 'inventory_transactions_hvac2024',
  CUSTOMERS: 'customers_hvac2024',
  CUSTOMER_CONTACTS: 'customer_contacts_hvac2024',
  CUSTOMER_NOTES: 'customer_notes_hvac2024',
  VENDORS: 'vendors_hvac2024',
  VENDOR_CONTACTS: 'vendor_contacts_hvac2024',
  PURCHASE_ORDERS: 'purchase_orders_hvac2024',
  PURCHASE_ORDER_ITEMS: 'purchase_order_items_hvac2024',
  INVOICES: 'invoices_hvac2024',
  INVOICE_ITEMS: 'invoice_items_hvac2024',
  PAYMENTS: 'payments_hvac2024'
};

// Application constants
export const APP_CONSTANTS = {
  DEFAULT_TENANT_ID: '00000000-0000-0000-0000-000000000001',
  DATE_FORMAT: 'MM/DD/YYYY',
  TIME_FORMAT: 'hh:mm A',
  DATETIME_FORMAT: 'MM/DD/YYYY hh:mm A',
  PAGINATION_LIMIT: 20,
  
  HVAC_UNIT_TYPES: [
    { value: 'rooftop', label: 'Rooftop Unit' },
    { value: 'split_system', label: 'Split System' },
    { value: 'mini_split', label: 'Mini Split' },
    { value: 'vrf', label: 'VRF System' },
    { value: 'precision', label: 'Precision Cooling' },
    { value: 'packaged', label: 'Packaged Unit' }
  ],
  
  WORK_ORDER_STATUS: [
    { value: 'pending', label: 'Pending', color: 'gray' },
    { value: 'assigned', label: 'Assigned', color: 'blue' },
    { value: 'scheduled', label: 'Scheduled', color: 'purple' },
    { value: 'in_progress', label: 'In Progress', color: 'yellow' },
    { value: 'on_hold', label: 'On Hold', color: 'orange' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'invoiced', label: 'Invoiced', color: 'indigo' },
    { value: 'paid', label: 'Paid', color: 'teal' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ],
  
  WORK_ORDER_PRIORITY: [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
    { value: 'emergency', label: 'Emergency', color: 'red' }
  ],
  
  WORK_ORDER_TYPES: [
    { value: 'installation', label: 'Installation' },
    { value: 'repair', label: 'Repair' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'emergency', label: 'Emergency' }
  ],
  
  TECHNICIAN_STATUS: [
    { value: 'available', label: 'Available', color: 'green' },
    { value: 'on_job', label: 'On Job', color: 'blue' },
    { value: 'on_break', label: 'On Break', color: 'yellow' },
    { value: 'off_duty', label: 'Off Duty', color: 'gray' }
  ],
  
  PROPERTY_TYPES: [
    { value: 'commercial', label: 'Commercial' },
    { value: 'residential', label: 'Residential' },
    { value: 'industrial', label: 'Industrial' }
  ],
  
  USER_ROLES: [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'technician', label: 'Technician' },
    { value: 'office_staff', label: 'Office Staff' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'customer', label: 'Customer' }
  ],
  
  INVENTORY_CATEGORIES: [
    { value: 'parts', label: 'Parts' },
    { value: 'tools', label: 'Tools' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'equipment', label: 'Equipment' }
  ],
  
  TRANSACTION_TYPES: [
    { value: 'received', label: 'Received' },
    { value: 'used', label: 'Used in Work Order' },
    { value: 'adjustment', label: 'Inventory Adjustment' },
    { value: 'returned', label: 'Returned to Vendor' },
    { value: 'transfer', label: 'Warehouse Transfer' }
  ],
  
  CUSTOMER_TYPES: [
    { value: 'commercial', label: 'Commercial' },
    { value: 'residential', label: 'Residential' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'government', label: 'Government' },
    { value: 'non_profit', label: 'Non-Profit' }
  ],
  
  VENDOR_CATEGORIES: [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'service_provider', label: 'Service Provider' }
  ],
  
  PURCHASE_ORDER_STATUS: [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'submitted', label: 'Submitted', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'indigo' },
    { value: 'ordered', label: 'Ordered', color: 'purple' },
    { value: 'partial_received', label: 'Partially Received', color: 'orange' },
    { value: 'received', label: 'Received', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ],
  
  INVOICE_STATUS: [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'partial_paid', label: 'Partially Paid', color: 'orange' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'overdue', label: 'Overdue', color: 'red' },
    { value: 'void', label: 'Void', color: 'red' }
  ],
  
  PAYMENT_METHODS: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'check', label: 'Check' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online_payment', label: 'Online Payment' }
  ]
};