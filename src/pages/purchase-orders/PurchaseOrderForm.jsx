import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONSTANTS } from '../../config/constants';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PurchaseOrderForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { userProfile, hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [formData, setFormData] = useState({
    vendor_id: '',
    expected_date: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    loadData();
    // Check if vendor was passed from state
    if (location.state?.vendor) {
      setFormData(prev => ({
        ...prev,
        vendor_id: location.state.vendor.id.toString()
      }));
    }
    // If editing mode, load purchase order data
    if (editMode && id) {
      loadPurchaseOrder(id);
    }
  }, [editMode, id, location.state]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors from Supabase
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors_hvac7539')
        .select('*');
      
      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // Fetch inventory items from Supabase
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items_hvac2024')
        .select('*');
      
      if (itemsError) throw itemsError;
      setInventoryItems(itemsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrder = async (orderId) => {
    try {
      const { data: order, error } = await supabase
        .from('purchase_orders_hvac2024')
        .select(`
          *,
          items:purchase_order_items_hvac2024(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (order) {
        setFormData({
          vendor_id: order.vendor_id.toString(),
          expected_date: order.expected_date,
          notes: order.notes || '',
          items: order.items.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        });
      }
    } catch (error) {
      console.error('Error loading purchase order:', error);
      toast.error('Failed to load purchase order');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { item_id: '', quantity: 1, unit_price: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'unit_price' || field === 'quantity' ? parseFloat(value) || 0 : value }
          : item
      )
    }));
  };

  const handleItemSelect = (index, itemId) => {
    const selectedItem = inventoryItems.find(item => item.id === itemId);
    if (selectedItem) {
      updateItem(index, 'item_id', itemId);
      updateItem(index, 'unit_price', selectedItem.unit_price);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission('purchase_orders_create') && !editMode) {
      toast.error('You do not have permission to create purchase orders');
      return;
    }
    
    if (!hasPermission('purchase_orders_edit') && editMode) {
      toast.error('You do not have permission to edit purchase orders');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);

      const purchaseOrderData = {
        vendor_id: formData.vendor_id,
        expected_date: formData.expected_date,
        notes: formData.notes,
        total_amount: calculateTotal(),
        status: 'draft'
      };

      let orderId;

      if (editMode) {
        // Update existing purchase order
        const { data, error } = await supabase
          .from('purchase_orders_hvac2024')
          .update(purchaseOrderData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        orderId = id;

        // Delete existing items
        await supabase
          .from('purchase_order_items_hvac2024')
          .delete()
          .eq('purchase_order_id', id);

      } else {
        // Create new purchase order
        const { data, error } = await supabase
          .from('purchase_orders_hvac2024')
          .insert([purchaseOrderData])
          .select()
          .single();

        if (error) throw error;
        orderId = data.id;
      }

      // Insert items
      const { error: itemsError } = await supabase
        .from('purchase_order_items_hvac2024')
        .insert(
          formData.items.map(item => ({
            purchase_order_id: orderId,
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        );

      if (itemsError) throw itemsError;

      toast.success(`Purchase order ${editMode ? 'updated' : 'created'} successfully!`);
      navigate('/purchase-orders');

    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast.error('Failed to save purchase order');
    } finally {
      setLoading(false);
    }
  };

  if (loading && formData.vendor_id === '') {
    return (
      <div className="flex items-center justify-center h-64">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {editMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </h1>
          <p className="text-gray-600">
            {editMode ? 'Update purchase order details' : 'Create a new purchase order for inventory items'}
          </p>
        </div>
        <button
          onClick={() => navigate('/vendors')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <SafeIcon icon={FiIcons.FiArrowLeft} className="h-4 w-4" />
          <span>Back to Vendors</span>
        </button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <select
                required
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
              <input
                type="date"
                required
                value={formData.expected_date}
                onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiIcons.FiBox} className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-200 rounded-md"
                >
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <select
                      required
                      value={item.item_id}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Item</option>
                      {inventoryItems.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.name} ({invItem.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-right font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
            <span>{editMode ? 'Update Purchase Order' : 'Create Purchase Order'}</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default PurchaseOrderForm;