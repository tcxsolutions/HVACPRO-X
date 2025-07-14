import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { TenantProvider } from './contexts/TenantContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import './App.css';

// Set low-motion preferences for performance
const toastOptions = {
  duration: 2000,
  style: {
    background: '#333',
    color: '#fff',
  },
  position: 'top-right',
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <TenantProvider>
            <AppRoutes />
            <Toaster toastOptions={toastOptions} />
          </TenantProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;