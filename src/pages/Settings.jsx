import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const Settings = () => {
  const { userProfile, hasPermission } = useAuth();
  const { tenant, updateTenantSettings } = useTenant();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    companyName: tenant?.name || '',
    timezone: tenant?.settings?.timezone || 'UTC',
    currency: tenant?.settings?.currency || 'USD',
    dateFormat: tenant?.settings?.dateFormat || 'MM/DD/YYYY',
    language: tenant?.settings?.language || 'en'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: tenant?.settings?.notifications?.email || true,
    smsNotifications: tenant?.settings?.notifications?.sms || false,
    workOrderAssigned: tenant?.settings?.notifications?.workOrderAssigned || true,
    workOrderCompleted: tenant?.settings?.notifications?.workOrderCompleted || true,
    customerFeedback: tenant?.settings?.notifications?.customerFeedback || true,
    systemAlerts: tenant?.settings?.notifications?.systemAlerts || true
  });

  const handleGeneralSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update tenant settings
      await updateTenantSettings({
        ...tenant?.settings,
        timezone: generalSettings.timezone,
        currency: generalSettings.currency,
        dateFormat: generalSettings.dateFormat,
        language: generalSettings.language
      });
      
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update notification settings
      await updateTenantSettings({
        ...tenant?.settings,
        notifications: {
          email: notificationSettings.emailNotifications,
          sms: notificationSettings.smsNotifications,
          workOrderAssigned: notificationSettings.workOrderAssigned,
          workOrderCompleted: notificationSettings.workOrderCompleted,
          customerFeedback: notificationSettings.customerFeedback,
          systemAlerts: notificationSettings.systemAlerts
        }
      });
      
      alert('Notification settings updated successfully!');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'general', label: 'General', icon: FiIcons.FiSettings },
            { key: 'notifications', label: 'Notifications', icon: FiIcons.FiBell },
            { key: 'security', label: 'Security', icon: FiIcons.FiShield },
            { key: 'integrations', label: 'Integrations', icon: FiIcons.FiLink }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
          <form onSubmit={handleGeneralSettingsSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!hasPermission('settings_update')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!hasPermission('settings_update')}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!hasPermission('settings_update')}
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="CAD">Canadian Dollar (C$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date Format</label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!hasPermission('settings_update')}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!hasPermission('settings_update')}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            {hasPermission('settings_update') && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
          <form onSubmit={handleNotificationSettingsSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ 
                      ...notificationSettings, 
                      emailNotifications: e.target.checked 
                    })}
                    className="sr-only peer"
                    disabled={!hasPermission('settings_update')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({ 
                      ...notificationSettings, 
                      smsNotifications: e.target.checked 
                    })}
                    className="sr-only peer"
                    disabled={!hasPermission('settings_update')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Events</h4>
                
                <div className="space-y-3">
                  {[
                    { key: 'workOrderAssigned', label: 'Work Order Assigned' },
                    { key: 'workOrderCompleted', label: 'Work Order Completed' },
                    { key: 'customerFeedback', label: 'Customer Feedback' },
                    { key: 'systemAlerts', label: 'System Alerts' }
                  ].map((event) => (
                    <div key={event.key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={event.key}
                        checked={notificationSettings[event.key]}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          [event.key]: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={!hasPermission('settings_update')}
                      />
                      <label htmlFor={event.key} className="ml-2 block text-sm text-gray-700">
                        {event.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {hasPermission('settings_update') && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Set Up
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Login Sessions</h4>
                <p className="text-sm text-gray-500">Manage your active sessions</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                View Sessions
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Account Deletion</h4>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Integrations</h3>
          </div>
          <div className="p-6 space-y-6">
            {[
              { 
                name: 'QuickBooks', 
                icon: FiIcons.FiDollarSign, 
                description: 'Sync invoices and payments with your accounting software',
                connected: false
              },
              { 
                name: 'Google Calendar', 
                icon: FiIcons.FiCalendar, 
                description: 'Sync work orders with your Google Calendar',
                connected: true
              },
              { 
                name: 'Slack', 
                icon: FiIcons.FiMessageSquare, 
                description: 'Get notifications in your team\'s Slack workspace',
                connected: false
              },
              { 
                name: 'Stripe', 
                icon: FiIcons.FiCreditCard, 
                description: 'Process payments online',
                connected: true
              }
            ].map((integration, index) => (
              <div key={integration.name} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={integration.icon} className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <button 
                  className={`px-4 py-2 rounded-md text-sm ${
                    integration.connected 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;