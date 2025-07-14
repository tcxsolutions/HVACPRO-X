import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const Billing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invoices');

  // Redirect to the appropriate billing page based on the active tab
  React.useEffect(() => {
    if (activeTab === 'invoices') {
      navigate('/billing/invoices');
    } else if (activeTab === 'subscriptions') {
      navigate('/billing/subscriptions');
    }
  }, [activeTab, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'invoices', label: 'Invoices', icon: FiIcons.FiFileText },
            { key: 'subscriptions', label: 'Subscriptions', icon: FiIcons.FiCreditCard },
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
    </div>
  );
};

export default Billing;