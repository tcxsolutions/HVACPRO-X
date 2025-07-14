import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const PurchaseOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);

  useEffect(() => {
    loadPurchaseOrderData();
  }, [id]);

  const loadPurchaseOrderData = async () => {
    try {
      setLoading(true);

      // Load purchase order data
      const { data: po, error: poError } = await supabase
        .from('purchase_orders_hvac2024')
        .select(`
          *,
          vendor:vendors_hvac7539(*),
          items:purchase_order_items_hvac2024(
            *,
            inventory_item:inventory_items_hvac2024(*)
          )
        `)
        .eq('id', id)
        .single();

      if (poError) throw poError;

      setPurchaseOrder(po);
      setItems(po.items || []);
      setVendor(po.vendor);

    } catch (error) {
      console.error('Error loading purchase order:', error);
      toast.error('Failed to load purchase order details');
      
      // Mock data for demonstration
      setPurchaseOrder({
        id: id,
        status: 'ordered',
        ordered_date: '2024-03-15',
        expected_date: '2024-03-30',
        notes: 'Standard delivery terms apply',
        total_amount: 2457.26
      });
      
      setVendor({
        id: 1,
        name: 'HVAC Supply Co.',
        address: '789 Industrial Pkwy, City, ST 12345',
        email: 'orders@hvacsupply.com',
        phone: '(555) 123-4567'
      });
      
      setItems([
        {
          id: 1,
          inventory_item: {
            name: 'Air Filter - HEPA 500',
            sku: 'AF-1001'
          },
          quantity: 20,
          unit_price: 24.99,
          total: 499.80
        },
        {
          id: 2,
          inventory_item: {
            name: 'Refrigerant R-410A',
            sku: 'R410-20'
          },
          quantity: 10,
          unit_price: 89.99,
          total: 899.90
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      ordered: { color: 'bg-blue-100 text-blue-800', label: 'Ordered' },
      partial_received: { color: 'bg-yellow-100 text-yellow-800', label: 'Partially Received' },
      received: { color: 'bg-green-100 text-green-800', label: 'Received' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiIcons.FiAlertCircle} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Order not found</h3>
        <p className="text-gray-600 mb-4">The purchase order you're looking for doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/purchase-orders')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{`Purchase Order ${purchaseOrder.id}`}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(purchaseOrder.status)}
              <span className="text-sm text-gray-500">
                Created on {new Date(purchaseOrder.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          {purchaseOrder.status === 'draft' && hasPermission('purchase_orders_edit') && (
            <button
              onClick={() => navigate(`/purchase-orders/${id}/edit`)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          {['approved', 'ordered', 'partial_received'].includes(purchaseOrder.status) && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPackage} className="h-4 w-4" />
              <span>Receive Items</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiPrinter} className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Purchase Order Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Vendor and Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Information</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                <p className="text-sm text-gray-600">{vendor.address}</p>
                <p className="text-sm text-gray-600">{vendor.email}</p>
                <p className="text-sm text-gray-600">{vendor.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Expected Delivery: {new Date(purchaseOrder.expected_date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Shipping Method: Ground</p>
                <p className="text-sm text-gray-600">Payment Terms: Net 30</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.inventory_item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.inventory_item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Total Amount:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ${purchaseOrder.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{purchaseOrder.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;