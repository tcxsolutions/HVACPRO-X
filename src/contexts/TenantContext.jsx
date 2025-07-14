import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const TenantContext = createContext({});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.tenant) {
      setTenant(userProfile.tenant);
      fetchTenantUsers(userProfile.tenant.id);
    }
  }, [userProfile]);

  const fetchTenantUsers = async (tenantId) => {
    try {
      setLoading(true);
      // Mock tenant users data
      const mockUsers = [
        {
          user_id: 'demo-user-id',
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin',
          permissions: ['all'],
          user: { email: 'demo@example.com' }
        }
      ];
      
      setTenantUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching tenant users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTenantSettings = async (settings) => {
    try {
      // Mock update
      const updatedTenant = { ...tenant, settings };
      setTenant(updatedTenant);
      return { success: true };
    } catch (error) {
      console.error('Error updating tenant settings:', error);
      return { success: false, error };
    }
  };

  const addTenantUser = async (userData) => {
    try {
      // Mock add user
      const newUser = {
        user_id: Date.now().toString(),
        ...userData,
        tenant_id: tenant.id,
      };
      
      setTenantUsers([...tenantUsers, newUser]);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error adding tenant user:', error);
      return { success: false, error };
    }
  };

  const updateTenantUser = async (userId, updates) => {
    try {
      // Mock update user
      const updatedUsers = tenantUsers.map(user => 
        user.user_id === userId ? { ...user, ...updates } : user
      );
      
      setTenantUsers(updatedUsers);
      return { success: true, data: updates };
    } catch (error) {
      console.error('Error updating tenant user:', error);
      return { success: false, error };
    }
  };

  const removeTenantUser = async (userId) => {
    try {
      // Mock remove user
      const filteredUsers = tenantUsers.filter(user => user.user_id !== userId);
      setTenantUsers(filteredUsers);
      return { success: true };
    } catch (error) {
      console.error('Error removing tenant user:', error);
      return { success: false, error };
    }
  };

  const value = {
    tenant,
    tenantUsers,
    loading,
    updateTenantSettings,
    addTenantUser,
    updateTenantUser,
    removeTenantUser,
    fetchTenantUsers
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};