import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONSTANTS } from '../../config/constants';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewPO, setViewPO] = useState(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, [statusFilter, searchQuery]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
        .from('purchase_orders_hvac2024')
        .select(`
          *,
          vendor:vendors_hvac7539(id, name)
        `);
      
      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Apply search filter if provided
      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,vendor.name.ilike.%${searchQuery}%`);
      }
      
      // Order by created date
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get item counts for each purchase order
      const poWithItemCounts = await Promise.all(
        data.map(async (po) => {
          const { data: items, error: itemsError } = await supabase
            .from('purchase_order_items_hvac2024')
            .select('id')
            .eq('purchase_order_id', po.id);
            
          if (itemsError) throw itemsError;
          
          return {
            ...po,
            items_count: items.length
          };
        })
      );
      
      setPurchaseOrders(poWithItemCounts);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast.error('Failed to load purchase orders');
      
      // Fallback to mock data for demonstration
      const mockPurchaseOrders = [
        {
          id: 'PO-2024-001',
          vendor: { id: 1, name: 'HVAC Supply Co.' },
          status: 'ordered',
          ordered_date: '2024-03-15',
          expected_date: '2024-03-30',
          items_count: 5,
          total_amount: 2450.00,
          created_by: 'John Smith'
        },
        {
          id: 'PO-2024-002',
          vendor: { id: 2, name: 'CoolAir Components' },
          status: 'received',
          ordered_date: '2024-03-10',
          expected_date: '2024-03-25',
          received_date: '2024-03-23',
          items_count: 3,
          total_amount: 1850.00,
          created_by: 'Sarah Johnson'
        }
      ];
      
      setPurchaseOrders(mockPurchaseOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePO = async (id) => {
    try {
      const { error } = await supabase
        .from('purchase_orders_hvac2024')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Purchase order deleted successfully');
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error('Failed to delete purchase order');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handlePrint = (po) => {
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Create the print content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order ${po.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .po-details {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 20px;
          }
          .section-title {
            background-color: #f3f4f6;
            padding: 5px 10px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          table th {
            background-color: #f3f4f6;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 70px;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin-top: 50px;
            padding-top: 5px;
          }
          .address-box {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 15px;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9fafb;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HVAC Pro</div>
          <div>
            <h1>PURCHASE ORDER</h1>
            <p>PO Number: ${po.id}</p>
            <p>Date: ${new Date(po.ordered_date || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <div class="section-title">VENDOR</div>
            <div class="address-box">
              <p><strong>${po.vendor.name}</strong></p>
              <p>123 Vendor Street</p>
              <p>Supplier City, ST 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: contact@vendor.com</p>
            </div>
          </div>
          <div style="width: 48%;">
            <div class="section-title">SHIP TO</div>
            <div class="address-box">
              <p><strong>HVAC Pro Services</strong></p>
              <p>456 Company Avenue</p>
              <p>Business City, ST 67890</p>
              <p>Phone: (555) 987-6543</p>
              <p>Email: receiving@hvacpro.com</p>
            </div>
          </div>
        </div>

        <div class="po-details">
          <table>
            <tr>
              <td><strong>Expected Delivery Date:</strong></td>
              <td>${new Date(po.expected_date || Date.now()).toLocaleDateString()}</td>
              <td><strong>Payment Terms:</strong></td>
              <td>Net 30</td>
            </tr>
            <tr>
              <td><strong>Shipping Method:</strong></td>
              <td>Ground</td>
              <td><strong>Account Number:</strong></td>
              <td>HVAC-12345</td>
            </tr>
          </table>
        </div>

        <div class="section-title">ORDERED ITEMS</div>
        <table>
          <thead>
            <tr>
              <th>Item #</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Air Filter - HEPA 500</td>
              <td>20</td>
              <td>$24.99</td>
              <td>$499.80</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Refrigerant R-410A</td>
              <td>10</td>
              <td>$89.99</td>
              <td>$899.90</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Compressor 2.5 Ton</td>
              <td>2</td>
              <td>$389.99</td>
              <td>$779.98</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
              <td>$2,179.68</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" style="text-align: right;"><strong>Tax (7%):</strong></td>
              <td>$152.58</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" style="text-align: right;"><strong>Shipping:</strong></td>
              <td>$125.00</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" style="text-align: right;"><strong>TOTAL:</strong></td>
              <td>$2,457.26</td>
            </tr>
          </tbody>
        </table>

        <div>
          <div class="section-title">NOTES</div>
          <p>${po.notes || 'Standard delivery terms apply. Please confirm receipt of this purchase order.'}</p>
        </div>

        <div class="signatures">
          <div>
            <div class="signature-line">Authorized By</div>
          </div>
          <div>
            <div class="signature-line">Accepted By</div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p><strong>HVAC Pro Services</strong> • 456 Company Avenue • Business City, ST 67890 • (555) 987-6543</p>
        </div>

        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Print Purchase Order
        </button>
      </body>
      </html>
    `);
    
    printWindow.document.close();
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

  // Filter purchase orders based on search and status query
  const filteredOrders = purchaseOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toString().toLowerCase().includes(query) ||
        order.vendor.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600">Manage your supplier relationships</p>
        </div>
        {hasPermission('purchase_orders_create') && (
          <button
            onClick={() => navigate('/purchase-orders/new')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {['draft', 'ordered', 'received'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <SafeIcon
              icon={FiIcons.FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No purchase orders match your search criteria'
                      : 'No purchase orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">Created by {order.created_by || 'Admin User'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.ordered_date
                          ? new Date(order.ordered_date).toLocaleDateString()
                          : 'Not ordered'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Expected: {new Date(order.expected_date || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(order.total || order.total_amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{order.items_count} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handlePrint(order)}
                          className="text-green-600 hover:text-green-900"
                          title="Print"
                        >
                          <SafeIcon icon={FiIcons.FiPrinter} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewPO(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        {order.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/purchase-orders/${order.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission('purchase_orders_delete') && (
                          <button
                            onClick={() => setConfirmDelete(order)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title="Confirm Delete"
        >
          <div className="p-6">
            <p className="mb-4">Are you sure you want to delete purchase order {confirmDelete.id}?</p>
            <p className="mb-6 text-red-600 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePO(confirmDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View PO Modal */}
      {viewPO && (
        <Modal
          isOpen={!!viewPO}
          onClose={() => setViewPO(null)}
          title={`Purchase Order ${viewPO.id}`}
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Vendor</h4>
                <p className="text-sm">{viewPO.vendor.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Status</h4>
                <div>{getStatusBadge(viewPO.status)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Order Date</h4>
                <p className="text-sm">
                  {viewPO.ordered_date
                    ? new Date(viewPO.ordered_date).toLocaleDateString()
                    : 'Not ordered yet'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Expected Delivery</h4>
                <p className="text-sm">{new Date(viewPO.expected_date || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 text-sm">Air Filter - HEPA 500</td>
                    <td className="px-3 py-2 text-sm">20</td>
                    <td className="px-3 py-2 text-sm">$24.99</td>
                    <td className="px-3 py-2 text-sm">$499.80</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm">Refrigerant R-410A</td>
                    <td className="px-3 py-2 text-sm">10</td>
                    <td className="px-3 py-2 text-sm">$89.99</td>
                    <td className="px-3 py-2 text-sm">$899.90</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm">Compressor 2.5 Ton</td>
                    <td className="px-3 py-2 text-sm">2</td>
                    <td className="px-3 py-2 text-sm">$389.99</td>
                    <td className="px-3 py-2 text-sm">$779.98</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                    <td className="px-3 py-2 text-sm font-medium">${parseFloat(viewPO.total || viewPO.total_amount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {viewPO.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <p className="text-sm text-gray-600">{viewPO.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setViewPO(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handlePrint(viewPO)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
              >
                <SafeIcon icon={FiIcons.FiPrinter} className="h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseOrders;