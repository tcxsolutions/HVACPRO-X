import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

const Billing = () => {
  const { subscription, invoices, updateSubscription, payInvoice, hasFeature } = useSubscription();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');

  const plans = [
    {
      id: 'trial',
      name: 'Trial',
      price: 0,
      billing: 'Free for 14 days',
      features: [
        'Up to 10 properties',
        'Basic HVAC monitoring',
        'Work order management',
        'Email support'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      billing: 'per month',
      features: [
        'Up to 50 properties',
        'Full HVAC monitoring',
        'Work order management',
        'Customer management',
        'Basic reporting',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 199,
      billing: 'per month',
      features: [
        'Up to 200 properties',
        'Advanced HVAC monitoring',
        'Work order management',
        'Customer management',
        'Advanced reporting & analytics',
        'API access',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      billing: 'per month',
      features: [
        'Unlimited properties',
        'Enterprise HVAC monitoring',
        'Advanced work order management',
        'Customer management',
        'Custom reporting & analytics',
        'Full API access',
        'White-label options',
        'Dedicated support'
      ]
    }
  ];

  const handlePlanChange = async (planId) => {
    if (planId === subscription?.plan_id) return;

    const result = await updateSubscription(planId);
    if (result.success) {
      alert('Subscription updated successfully!');
    } else {
      alert('Failed to update subscription. Please try again.');
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    const result = await payInvoice(invoiceId);
    if (result.success) {
      alert('Invoice paid successfully!');
    } else {
      alert('Failed to pay invoice. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            subscription?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscription?.status?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'subscription', label: 'Subscription', icon: FiIcons.FiCreditCard },
            { key: 'invoices', label: 'Invoices', icon: FiIcons.FiFileText },
            { key: 'usage', label: 'Usage', icon: FiIcons.FiBarChart2 }
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

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {subscription?.plan_id?.charAt(0).toUpperCase() + subscription?.plan_id?.slice(1) || 'Trial'} Plan
                </h4>
                <p className="text-gray-600">
                  {subscription?.plan_id === 'trial' && subscription?.trial_ends_at && (
                    `Trial ends on ${new Date(subscription.trial_ends_at).toLocaleDateString()}`
                  )}
                  {subscription?.plan_id !== 'trial' && (
                    `Next billing date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${plans.find(p => p.id === subscription?.plan_id)?.price || 0}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
                  plan.id === subscription?.plan_id 
                    ? 'border-primary-500' 
                    : plan.popular 
                    ? 'border-primary-200' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.id === subscription?.plan_id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.billing}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <SafeIcon icon={FiIcons.FiCheck} className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={plan.id === subscription?.plan_id}
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                    plan.id === subscription?.plan_id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.id === subscription?.plan_id ? 'Current Plan' : 'Upgrade'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
                          </button>
                          {invoice.status === 'pending' && (
                            <button
                              onClick={() => handlePayInvoice(invoice.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Properties',
                current: 45,
                limit: subscription?.plan_id === 'trial' ? 10 : 
                       subscription?.plan_id === 'basic' ? 50 : 
                       subscription?.plan_id === 'professional' ? 200 : 999,
                icon: FiIcons.FiHome
              },
              {
                title: 'HVAC Units',
                current: 128,
                limit: 999,
                icon: FiIcons.FiWind
              },
              {
                title: 'API Calls',
                current: 2450,
                limit: hasFeature('api_access') ? 10000 : 0,
                icon: FiIcons.FiActivity
              }
            ].map((usage, index) => (
              <motion.div
                key={usage.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{usage.title}</h3>
                  <SafeIcon icon={usage.icon} className="h-6 w-6 text-primary-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span>{usage.current} / {usage.limit === 999 ? '∞' : usage.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        usage.limit === 0 ? 'bg-gray-400' :
                        (usage.current / usage.limit) > 0.8 ? 'bg-red-500' :
                        (usage.current / usage.limit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: usage.limit === 0 ? '0%' : 
                               usage.limit === 999 ? '25%' : 
                               `${Math.min((usage.current / usage.limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                  {usage.limit > 0 && usage.limit !== 999 && (
                    <p className="text-xs text-gray-500">
                      {Math.round(((usage.limit - usage.current) / usage.limit) * 100)}% remaining
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Usage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Basic HVAC Monitoring', available: hasFeature('basic_hvac') },
                { name: 'Work Order Management', available: hasFeature('work_orders') },
                { name: 'Customer Management', available: hasFeature('customer_management') },
                { name: 'Advanced Reports', available: hasFeature('advanced_reports') },
                { name: 'API Access', available: hasFeature('api_access') },
                { name: 'White-label Options', available: hasFeature('white_label') }
              ].map((feature, index) => (
                <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  <div className="flex items-center">
                    {feature.available ? (
                      <SafeIcon icon={FiIcons.FiCheck} className="h-5 w-5 text-green-500" />
                    ) : (
                      <SafeIcon icon={FiIcons.FiX} className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Billing;