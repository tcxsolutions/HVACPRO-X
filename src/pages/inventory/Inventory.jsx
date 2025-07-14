import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import InventoryItemModal from './InventoryItemModal';
import InventoryBulkUpload from './InventoryBulkUpload';
import InventoryFilterPanel from './InventoryFilterPanel';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { APP_CONSTANTS } from '../../config/constants';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { userProfile, hasPermission } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [stockStatus, setStockStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadInventoryItems();
    }
  }, [userProfile, pagination.page, categoryFilter, lowStockOnly, stockStatus, searchQuery]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('inventory_items_hvac2024')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      if (lowStockOnly) {
        query = query.lte('quantity', supabase.raw('min_quantity'));
      }
      
      if (stockStatus === 'in_stock') {
        query = query.gt('quantity', 0);
      } else if (stockStatus === 'out_of_stock') {
        query = query.eq('quantity', 0);
      }
      
      if (searchQuery) {
        query = query.or(
          `item_number.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }
      
      // Add pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Update state with results
      if (data) {
        setInventoryItems(data);
        setPagination(prev => ({ ...prev, total: count || 0 }));
      }
      
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
      
      // Fallback mock data
      setInventoryItems([
        {
          id: 1,
          item_number: 'ITEM-00001',
          name: 'Air Filter - HEPA 500',
          description: 'High-efficiency particulate air filter',
          category: 'parts',
          sku: 'AF-1001',
          manufacturer: 'FilterPro',
          model: 'HEPA500',
          unit_price: 24.99,
          quantity: 35,
          min_quantity: 10,
          location: 'Warehouse A, Shelf B5'
        },
        {
          id: 2,
          item_number: 'ITEM-00002',
          name: 'Refrigerant R-410A',
          description: 'Environmentally friendly refrigerant',
          category: 'supplies',
          sku: 'R410-20',
          manufacturer: 'CoolGas',
          model: 'R410A-20LB',
          unit_price: 89.99,
          quantity: 8,
          min_quantity: 5,
          location: 'Warehouse A, Cold Storage'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setShowModal(false);
    setEditingItem(null);
    if (shouldRefresh) {
      loadInventoryItems();
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUploadModal(false);
    loadInventoryItems();
    toast.success('Bulk upload completed successfully');
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('inventory_items_hvac2024')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      toast.success('Item deleted successfully');
      loadInventoryItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleAdjustStock = async (item, adjustment) => {
    try {
      const newQuantity = Math.max(0, item.quantity + adjustment);
      
      const { error } = await supabase
        .from('inventory_items_hvac2024')
        .update({ quantity: newQuantity })
        .eq('id', item.id);
        
      if (error) throw error;
      
      // Create transaction record (in a real app)
      // await createTransaction({ item_id: item.id, type: adjustment > 0 ? 'received' : 'used', quantity: Math.abs(adjustment) });
      
      toast.success(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`);
      loadInventoryItems();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      parts: 'bg-blue-100 text-blue-800',
      tools: 'bg-green-100 text-green-800',
      supplies: 'bg-yellow-100 text-yellow-800',
      equipment: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (item.quantity <= item.min_quantity) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        In Stock
      </span>
    );
  };

  const handleExportInventory = () => {
    try {
      // Create CSV content
      let csvContent = "Item Number,Name,Category,SKU,Manufacturer,Quantity,Min Quantity,Unit Price,Location\n";
      
      inventoryItems.forEach(item => {
        csvContent += `"${item.item_number}","${item.name}","${item.category}","${item.sku || ''}","${item.manufacturer || ''}",${item.quantity},${item.min_quantity},${item.unit_price || 0},"${item.location || ''}"\n`;
      });
      
      // Create and download the file
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Inventory exported successfully');
    } catch (error) {
      console.error('Error exporting inventory:', error);
      toast.error('Failed to export inventory');
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && inventoryItems.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your HVAC parts and supplies</p>
        </div>
        <div className="flex space-x-2">
          <div className="dropdown dropdown-end">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiMoreVertical} className="h-4 w-4" />
              <span>Actions</span>
            </button>
            <ul className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <li>
                <button 
                  onClick={handleExportInventory}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export to CSV
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowBulkUploadModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Bulk Upload
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => window.print()}
                >
                  Print Inventory List
                </button>
              </li>
            </ul>
          </div>
          
          {hasPermission('inventory_create') && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Items',
            value: pagination.total.toString(),
            icon: FiIcons.FiBox,
            color: 'bg-blue-500'
          },
          {
            title: 'Low Stock Items',
            value: inventoryItems.filter(item => item.quantity <= item.min_quantity).length.toString(),
            icon: FiIcons.FiAlertTriangle,
            color: 'bg-red-500'
          },
          {
            title: 'Total Value',
            value: `$${inventoryItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0).toLocaleString()}`,
            icon: FiIcons.FiDollarSign,
            color: 'bg-green-500'
          },
          {
            title: 'Categories',
            value: [...new Set(inventoryItems.map(item => item.category))].length.toString(),
            icon: FiIcons.FiGrid,
            color: 'bg-purple-500'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                categoryFilter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {APP_CONSTANTS.INVENTORY_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === category.value ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
            
            <div className="border-l border-gray-300 mx-2"></div>
            
            <button
              onClick={() => setStockStatus('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                stockStatus === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockStatus('in_stock')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                stockStatus === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockStatus('out_of_stock')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Out of Stock
            </button>
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lowStockOnly ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Low Stock Only
            </button>
          </div>
          
          <div className="relative w-full md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || categoryFilter !== 'all' || lowStockOnly
                      ? 'No items match your search criteria'
                      : 'No inventory items found. Add your first item to get started.'}
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.item_number || `ITEM-${item.id.toString().padStart(5, '0')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.sku && `SKU: ${item.sku}`}
                        {item.manufacturer && ` • ${item.manufacturer}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleAdjustStock(item, -1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                          disabled={item.quantity <= 0}
                        >
                          <SafeIcon icon={FiIcons.FiMinus} className="h-3 w-3" />
                        </button>
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                        <button 
                          onClick={() => handleAdjustStock(item, 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <SafeIcon icon={FiIcons.FiPlus} className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">Min: {item.min_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.unit_price?.toFixed(2) || '0.00'}</div>
                      <div className="text-xs text-gray-500">
                        Total: ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockStatus(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('inventory_edit') && (
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('inventory_delete') && (
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-1 border rounded-md ${
                      pagination.page === pageNum
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showModal && (
        <InventoryItemModal
          item={editingItem}
          tenantId={userProfile?.tenant_id}
          onClose={handleCloseModal}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <InventoryBulkUpload
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleBulkUploadSuccess}
          tenantId={userProfile?.tenant_id}
        />
      )}
    </div>
  );
};

export default Inventory;