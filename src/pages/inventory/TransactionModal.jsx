import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import { APP_CONSTANTS } from '../../config/constants';

const TransactionModal = ({ onClose, onSubmit, inventoryItems }) => {
  const [formData, setFormData] = useState({
    type: 'received',
    item: { id: '', name: '' },
    quantity: 1,
    reference: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.item.id) {
      newErrors.item = 'Please select an item';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (formData.type === 'used' || formData.type === 'returned') {
      const selectedItem = inventoryItems.find(item => item.id.toString() === formData.item.id.toString());
      if (selectedItem && formData.quantity > selectedItem.quantity) {
        newErrors.quantity = `Cannot exceed current quantity (${selectedItem.quantity})`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the full item details
      const selectedItem = inventoryItems.find(item => item.id.toString() === formData.item.id.toString());
      
      await onSubmit({
        type: formData.type,
        item: selectedItem,
        quantity: parseInt(formData.quantity),
        reference: formData.reference,
        notes: formData.notes
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (e) => {
    const itemId = e.target.value;
    const selectedItem = inventoryItems.find(item => item.id.toString() === itemId);
    
    setFormData({
      ...formData,
      item: {
        id: itemId,
        name: selectedItem ? selectedItem.name : ''
      }
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="New Inventory Transaction"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction Type <span className="text-red-500">*</span></label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {APP_CONSTANTS.TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Item <span className="text-red-500">*</span></label>
          <select
            required
            value={formData.item.id}
            onChange={handleItemSelect}
            className={`mt-1 block w-full px-3 py-2 border ${errors.item ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
          >
            <option value="">Select an item</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id.toString()}>
                {item.name} ({item.sku || 'No SKU'}) - Qty: {item.quantity}
              </option>
            ))}
          </select>
          {errors.item && <p className="mt-1 text-sm text-red-600">{errors.item}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className={`mt-1 block w-full px-3 py-2 border ${errors.quantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Reference</label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="e.g., PO-2024-001, WO-2024-002"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional notes about this transaction..."
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
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
            <span>Create Transaction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;