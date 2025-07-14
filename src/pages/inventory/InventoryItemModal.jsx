import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import { APP_CONSTANTS } from '../../config/constants';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const InventoryItemModal = ({ item = null, tenantId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'parts',
    sku: '',
    manufacturer: '',
    model: '',
    unit_price: '',
    quantity: 0,
    min_quantity: 0,
    location: '',
  });
  
  // Set initial form data when component mounts or item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'parts',
        sku: item.sku || '',
        manufacturer: item.manufacturer || '',
        model: item.model || '',
        unit_price: item.unit_price?.toString() || '',
        quantity: item.quantity || 0,
        min_quantity: item.min_quantity || 0,
        location: item.location || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Item name is required');
      }
      
      // Prepare item data for database
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        sku: formData.sku.trim(),
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        unit_price: formData.unit_price === '' ? null : parseFloat(formData.unit_price),
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 0,
        location: formData.location.trim(),
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      };

      if (item) {
        // Update existing item
        console.log('Updating item:', item.id, itemData);
        const { error } = await supabase
          .from('inventory_items_hvac2024')
          .update(itemData)
          .eq('id', item.id);

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
        
        toast.success('Item updated successfully!');
      } else {
        // Create new item with a generated item number
        const timestamp = new Date().getTime().toString().slice(-5);
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newItemNumber = `ITEM-${timestamp}${randomSuffix}`;
        
        const newItemData = {
          ...itemData,
          item_number: newItemNumber,
          created_at: new Date().toISOString()
        };
        
        console.log('Creating new inventory item:', newItemData);
        
        const { data, error } = await supabase
          .from('inventory_items_hvac2024')
          .insert([newItemData])
          .select();
        
        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
        
        console.log('Item created successfully:', data);
        toast.success('Item added successfully!');
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error(error.message || 'Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={() => onClose(false)} title={item ? 'Edit Inventory Item' : 'Add New Inventory Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Show item number for existing items */}
        {item && item.item_number && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Number</label>
            <input
              type="text"
              value={item.item_number}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter item description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {APP_CONSTANTS.INVENTORY_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter SKU"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter manufacturer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter model"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.min_quantity}
              onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Warehouse A, Shelf B5"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => onClose(false)}
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
            <span>{item ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryItemModal;