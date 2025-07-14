import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      billing: 'per month',
      features: [
        'Up to 10 properties',
        'Basic HVAC monitoring',
        'Work order management',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      billing: 'per month',
      features: [
        'Up to 50 properties',
        'Full HVAC monitoring',
        'Work order management',
        'Customer management',
        'Basic reporting',
        'Priority email support'
      ],
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 199,
      billing: 'per month',
      features: [
        'Up to 200 properties',
        'Advanced HVAC monitoring',
        'Work order management',
        'Customer management',
        'Advanced reporting & analytics',
        'API access',
        'Phone support'
      ]
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
        'Dedicated support',
        'Custom integrations'
      ]
    }
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, [userProfile]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions_hvac2024')
        .select(`
          *,
          billing_details:billing_details_hvac2024(*),
          payment_methods:payment_methods_hvac2024(*)
        `)
        .eq('tenant_id', userProfile?.tenant_id)
        .single();

      if (error) throw error;

      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    try {
      setShowUpgradeModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error preparing upgrade:', error);
      toast.error('Failed to prepare plan upgrade');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      // Update subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions_hvac2024')
        .update({
          plan_id: selectedPlan.id,
          price: selectedPlan.price,
          status: 'active',
          updated_at: new Date().toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('tenant_id', userProfile?.tenant_id);

      if (subscriptionError) throw subscriptionError;

      // Create invoice
      const { error: invoiceError } = await supabase
        .from('invoices_hvac2024')
        .insert([
          {
            tenant_id: userProfile?.tenant_id,
            subscription_id: subscription.id,
            amount: selectedPlan.price,
            status: 'paid',
            payment_method: paymentMethod,
            billing_period_start: new Date().toISOString(),
            billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paid_at: new Date().toISOString()
          }
        ]);

      if (invoiceError) throw invoiceError;

      toast.success('Subscription upgraded successfully!');
      loadSubscriptionData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === subscription?.plan_id) || plans[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription and billing preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscription?.status?.toUpperCase() || 'INACTIVE'}
          </div>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Current Plan: {getCurrentPlan().name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Next billing date: {new Date(subscription?.next_billing_date).toLocaleDateString()}
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">${getCurrentPlan().price}/month</p>
              <p className="mt-1 text-sm text-gray-500">
                Last invoice: {new Date(subscription?.last_invoice_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => navigate('/billing/invoices')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiFileText} className="h-4 w-4" />
              <span>View Invoices</span>
            </button>
            <button
              onClick={() => navigate('/billing/payment-methods')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiCreditCard} className="h-4 w-4" />
              <span>Manage Payment Methods</span>
            </button>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900">Current Usage</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Properties</p>
                <span className="text-sm text-gray-900">45/50</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: '90%' }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">API Calls</p>
                <span className="text-sm text-gray-900">8.2k/10k</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: '82%' }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Storage</p>
                <span className="text-sm text-gray-900">450MB/1GB</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>
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
                  <SafeIcon
                    icon={FiIcons.FiCheck}
                    className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(plan)}
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

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Confirm Plan Upgrade"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">{selectedPlan?.name} Plan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your subscription will be upgraded immediately.
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">${selectedPlan?.price}/month</p>
              <p className="mt-1 text-sm text-gray-500">
                Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
            <ul className="mt-2 space-y-2">
              {selectedPlan?.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm text-gray-600">
                  <SafeIcon icon={FiIcons.FiCheck} className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpgradeConfirm}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Confirm Upgrade
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Details"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {paymentMethod === 'credit_card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Plan Price</span>
              <span className="text-sm font-medium text-gray-900">${selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium text-gray-900">
                ${(selectedPlan?.price * 0.1).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-sm font-medium text-gray-900">
                ${(selectedPlan?.price * 1.1).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingPayment}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              {processingPayment && (
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />
              )}
              <span>Complete Payment</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;