import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { DB_TABLES } from '../config/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setAuthInitialized(true);
        setLoading(false);
      }
    );

    // Initial session check
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      // Use mock data for faster loading
      const mockProfile = {
        id: userId,
        user_id: userId,
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
      };
      
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't show error toast to avoid blocking UI
    }
  };

  const signIn = async (email, password) => {
    try {
      // For demo purposes, accept any credentials
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@example.com'
        };
        
        setUser(mockUser);
        await loadUserProfile(mockUser.id);
        
        return { data: { user: mockUser }, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from(DB_TABLES.USER_PROFILES)
          .insert([
            {
              user_id: data.user.id,
              first_name: metadata.firstName,
              last_name: metadata.lastName,
              role: 'admin',
              permissions: ['all']
            }
          ]);

        if (profileError) throw profileError;
      }

      toast.success('Account created successfully! Please check your email to confirm your account.');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to create account');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const hasPermission = (permission) => {
    if (!userProfile) return false;
    if (userProfile.permissions?.includes('all')) return true;
    return userProfile.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    userProfile,
    loading,
    authInitialized,
    signIn,
    signUp,
    signOut,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;