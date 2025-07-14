import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import TransactionModal from './TransactionModal';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONSTANTS } from '../../config/constants';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const InventoryTransactions = () => {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    itemId: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20
  });

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadInventoryItems();
      loadTransactions();
    }
  }, [userProfile, filters]);

  const loadInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items_hvac2024')
        .select('id, name, sku, quantity')
        .order('name');
        
      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      // Use mock data as fallback
      setInventoryItems([
        { id: 1, name: 'Air Filter', sku: 'AF-1001', quantity: 35 },
        { id: 2, name: 'Refrigerant R-410A', sku: 'R410-20', quantity: 8 }
      ]);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would query a transactions table
      // Mock data for demonstration with multiple transactions
      const mockTransactions = [
        {
          id: 1,
          type: 'received',
          quantity: 20,
          date: new Date('2024-03-15').toISOString(),
          item: { id: 1, name: 'Air Filter', sku: 'AF-1001' },
          user: { first_name: 'John', last_name: 'Smith' },
          reference: 'PO-2024-001',
          notes: 'Regular stock replenishment'
        },
        {
          id: 2,
          type: 'used',
          quantity: 5,
          date: new Date('2024-03-16').toISOString(),
          item: { id: 1, name: 'Air Filter', sku: 'AF-1001' },
          user: { first_name: 'Mike', last_name: 'Wilson' },
          reference: 'WO-2024-001',
          notes: 'Used in maintenance work order'
        },
        {
          id: 3,
          type: 'adjustment',
          quantity: -2,
          date: new Date('2024-03-17').toISOString(),
          item: { id: 2, name: 'Refrigerant R-410A', sku: 'R410-20' },
          user: { first_name: 'Sarah', last_name: 'Johnson' },
          reference: 'ADJ-2024-001',
          notes: 'Inventory count adjustment'
        },
        {
          id: 4,
          type: 'received',
          quantity: 10,
          date: new Date('2024-03-18').toISOString(),
          item: { id: 2, name: 'Refrigerant R-410A', sku: 'R410-20' },
          user: { first_name: 'John', last_name: 'Smith' },
          reference: 'PO-2024-002',
          notes: 'Emergency order'
        }
      ];
      
      // Apply filters to mock data
      let filteredTransactions = [...mockTransactions];
      
      if (filters.type !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      
      if (filters.itemId !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.item.id.toString() === filters.itemId);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
      }
      
      // Sort by date descending
      filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Paginate
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      
      setTransactions(paginatedTransactions);
      setPagination({
        ...pagination,
        total: filteredTransactions.length
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load inventory transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleCreateTransaction = async (transactionData) => {
    try {
      // In a real app, this would insert a transaction record and update inventory
      // For now, we'll just add to the local state
      
      const newTransaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        user: { first_name: userProfile?.first_name || 'User', last_name: userProfile?.last_name || '' },
        ...transactionData
      };
      
      // Update the item quantity
      const updatedItem = inventoryItems.find(item => item.id.toString() === transactionData.item.id.toString());
      if (updatedItem) {
        if (transactionData.type === 'received') {
          updatedItem.quantity += transactionData.quantity;
        } else if (transactionData.type === 'used' || transactionData.type === 'returned') {
          updatedItem.quantity = Math.max(0, updatedItem.quantity - transactionData.quantity);
        } else if (transactionData.type === 'adjustment') {
          updatedItem.quantity = Math.max(0, updatedItem.quantity + transactionData.quantity);
        }
        
        // Update the item in the database
        const { error } = await supabase
          .from('inventory_items_hvac2024')
          .update({ quantity: updatedItem.quantity })
          .eq('id', updatedItem.id);
          
        if (error) throw error;
      }
      
      setTransactions([newTransaction, ...transactions]);
      toast.success(`Inventory ${transactionData.type} transaction created successfully`);
      setShowTransactionModal(false);
      
      // Reload inventory items to reflect the changes
      loadInventoryItems();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    }
  };

  const getTransactionTypeLabel = (type) => {
    const typeConfig = {
      received: { color: 'bg-green-100 text-green-800', label: 'Received' },
      used: { color: 'bg-blue-100 text-blue-800', label: 'Used in Work Order' },
      adjustment: { color: 'bg-yellow-100 text-yellow-800', label: 'Adjustment' },
      returned: { color: 'bg-red-100 text-red-800', label: 'Returned to Vendor' },
      transfer: { color: 'bg-purple-100 text-purple-800', label: 'Warehouse Transfer' }
    };
    
    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && transactions.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Transactions</h1>
          <p className="text-gray-600">Track inventory movement and adjustments</p>
        </div>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Types</option>
              {APP_CONSTANTS.TRANSACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              value={filters.itemId}
              onChange={(e) => handleFilterChange('itemId', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Items</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id.toString()}>
                  {item.name} ({item.sku || 'No SKU'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  type: 'all',
                  itemId: 'all',
                  startDate: '',
                  endDate: '',
                  page: 1,
                  limit: 20
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.item.name}</div>
                      <div className="text-xs text-gray-500">SKU: {transaction.item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTransactionTypeLabel(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'received' || (transaction.type === 'adjustment' && transaction.quantity > 0)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'received' || (transaction.type === 'adjustment' && transaction.quantity > 0)
                          ? `+${transaction.quantity}`
                          : transaction.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.reference}</div>
                      <div className="text-xs text-gray-500">{transaction.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.user.first_name} {transaction.user.last_name}
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
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          onClose={() => setShowTransactionModal(false)}
          onSubmit={handleCreateTransaction}
          inventoryItems={inventoryItems}
        />
      )}
    </div>
  );
};

export default InventoryTransactions;