import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext({});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.tenant_id) {
      fetchSubscription(userProfile.tenant_id);
      fetchInvoices(userProfile.tenant_id);
    }
  }, [userProfile]);

  const fetchSubscription = async (tenantId) => {
    try {
      setLoading(true);
      // Mock subscription data
      const mockSubscription = {
        id: 'demo-subscription',
        tenant_id: tenantId,
        plan_id: 'professional', // Changed from 'trial' to 'professional' for advanced features
        status: 'active',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async (tenantId) => {
    try {
      // Mock invoices data
      setInvoices([]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const updateSubscription = async (planId) => {
    try {
      const planPricing = {
        'trial': { price: 0, features: ['basic_hvac', 'work_orders'] },
        'basic': { price: 99, features: ['basic_hvac', 'work_orders', 'customer_management'] },
        'professional': { price: 199, features: ['basic_hvac', 'work_orders', 'customer_management', 'advanced_reports', 'api_access'] },
        'enterprise': { price: 399, features: ['all'] }
      };

      const plan = planPricing[planId];
      if (!plan) throw new Error('Invalid plan');

      // Mock update
      const updatedSubscription = {
        ...subscription,
        plan_id: planId,
        status: 'active',
        updated_at: new Date().toISOString()
      };
      setSubscription(updatedSubscription);
      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error };
    }
  };

  const createInvoice = async (invoiceData) => {
    try {
      // Mock invoice creation
      return { success: true, data: invoiceData };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error };
    }
  };

  const payInvoice = async (invoiceId) => {
    try {
      // Mock payment
      return { success: true, data: { id: invoiceId } };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { success: false, error };
    }
  };

  const hasFeature = (feature) => {
    if (!subscription) return false;
    
    const planFeatures = {
      'trial': ['basic_hvac', 'work_orders'],
      'basic': ['basic_hvac', 'work_orders', 'customer_management'],
      'professional': ['basic_hvac', 'work_orders', 'customer_management', 'advanced_reports', 'api_access'],
      'enterprise': ['all']
    };

    const features = planFeatures[subscription.plan_id] || [];
    return features.includes('all') || features.includes(feature);
  };

  const isTrialExpired = () => {
    if (!subscription || subscription.plan_id !== 'trial') return false;
    return new Date() > new Date(subscription.trial_ends_at);
  };

  const value = {
    subscription,
    invoices,
    loading,
    updateSubscription,
    createInvoice,
    payInvoice,
    hasFeature,
    isTrialExpired,
    fetchSubscription,
    fetchInvoices
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};