import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const HVACUnits = lazy(() => import('./pages/HVACUnits'));
const WorkOrders = lazy(() => import('./pages/WorkOrders'));
const WorkOrderCalendar = lazy(() => import('./pages/WorkOrderCalendar'));
const Technicians = lazy(() => import('./pages/Technicians'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Fleet Management
const FleetManagement = lazy(() => import('./pages/FleetManagement'));

// Inventory Management
const Inventory = lazy(() => import('./pages/inventory/Inventory'));
const InventoryTransactions = lazy(() => import('./pages/inventory/InventoryTransactions'));

// Customer and Vendor Pages
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetail = lazy(() => import('./pages/customers/CustomerDetail'));
const Vendors = lazy(() => import('./pages/vendors/Vendors'));
const VendorDetail = lazy(() => import('./pages/vendors/VendorDetail'));

// Purchase Orders
const PurchaseOrders = lazy(() => import('./pages/purchase-orders/PurchaseOrders'));
const PurchaseOrderForm = lazy(() => import('./pages/purchase-orders/PurchaseOrderForm'));
const PurchaseOrderDetail = lazy(() => import('./pages/purchase-orders/PurchaseOrderDetail'));

// Billing and Invoices
const Subscriptions = lazy(() => import('./pages/billing/Subscriptions'));
const Invoices = lazy(() => import('./pages/billing/Invoices'));
const Billing = lazy(() => import('./pages/billing/Billing'));

// Auth pages (keep these non-lazy for immediate access)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const AppRoutes = () => {
  const { user, authInitialized, loading } = useAuth();

  // Simplified loading state
  if (loading && !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="properties" element={<Suspense fallback={<PageLoader />}><Properties /></Suspense>} />
        <Route path="hvac-units" element={<Suspense fallback={<PageLoader />}><HVACUnits /></Suspense>} />
        <Route path="work-orders" element={<Suspense fallback={<PageLoader />}><WorkOrders /></Suspense>} />
        <Route path="work-orders/calendar" element={<Suspense fallback={<PageLoader />}><WorkOrderCalendar /></Suspense>} />
        <Route path="technicians" element={<Suspense fallback={<PageLoader />}><Technicians /></Suspense>} />
        
        {/* Fleet Management Route */}
        <Route path="fleet" element={<Suspense fallback={<PageLoader />}><FleetManagement /></Suspense>} />
        
        {/* Enhanced Inventory Routes */}
        <Route path="inventory" element={<Suspense fallback={<PageLoader />}><Inventory /></Suspense>} />
        <Route path="inventory/transactions" element={<Suspense fallback={<PageLoader />}><InventoryTransactions /></Suspense>} />
        
        {/* Reports */}
        <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        
        {/* Settings */}
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        
        {/* Customer Routes */}
        <Route path="customers" element={<Suspense fallback={<PageLoader />}><Customers /></Suspense>} />
        <Route path="customers/:customerId" element={<Suspense fallback={<PageLoader />}><CustomerDetail /></Suspense>} />
        
        {/* Vendor Routes */}
        <Route path="vendors" element={<Suspense fallback={<PageLoader />}><Vendors /></Suspense>} />
        <Route path="vendors/:vendorId" element={<Suspense fallback={<PageLoader />}><VendorDetail /></Suspense>} />
        
        {/* Purchase Order Routes */}
        <Route path="purchase-orders" element={<Suspense fallback={<PageLoader />}><PurchaseOrders /></Suspense>} />
        <Route path="purchase-orders/new" element={<Suspense fallback={<PageLoader />}><PurchaseOrderForm /></Suspense>} />
        <Route path="purchase-orders/:id" element={<Suspense fallback={<PageLoader />}><PurchaseOrderDetail /></Suspense>} />
        <Route path="purchase-orders/:id/edit" element={<Suspense fallback={<PageLoader />}><PurchaseOrderForm editMode={true} /></Suspense>} />
        
        {/* Billing Routes */}
        <Route path="billing" element={<Suspense fallback={<PageLoader />}><Billing /></Suspense>} />
        <Route path="billing/subscriptions" element={<Suspense fallback={<PageLoader />}><Subscriptions /></Suspense>} />
        <Route path="billing/invoices" element={<Suspense fallback={<PageLoader />}><Invoices /></Suspense>} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;