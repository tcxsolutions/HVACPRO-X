import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Invoices = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    customRange: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [userProfile, filters, pagination.page]);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        const mockInvoices = [
          {
            id: 'INV-2024-001',
            invoice_number: 'INV-2024-001',
            description: 'Monthly subscription - Professional Plan',
            amount: 99.00,
            status: 'paid',
            created_at: '2024-03-01T10:00:00Z',
            due_date: '2024-03-15T10:00:00Z',
            paid_at: '2024-03-10T14:30:00Z',
            tenant_id: userProfile?.tenant_id
          },
          {
            id: 'INV-2024-002',
            invoice_number: 'INV-2024-002',
            description: 'Monthly subscription - Professional Plan',
            amount: 99.00,
            status: 'pending',
            created_at: '2024-04-01T10:00:00Z',
            due_date: '2024-04-15T10:00:00Z',
            paid_at: null,
            tenant_id: userProfile?.tenant_id
          },
          {
            id: 'INV-2024-003',
            invoice_number: 'INV-2024-003',
            description: 'API Usage Overage',
            amount: 25.50,
            status: 'overdue',
            created_at: '2024-03-15T10:00:00Z',
            due_date: '2024-03-30T10:00:00Z',
            paid_at: null,
            tenant_id: userProfile?.tenant_id
          }
        ];
        
        setInvoices(mockInvoices);
        setPagination(prev => ({ ...prev, total: mockInvoices.length }));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      // In a real app, this would generate and download a PDF
      // For now, we'll create a simple text representation
      const invoiceText = `
Invoice #${invoice.invoice_number}
Date: ${new Date(invoice.created_at).toLocaleDateString()}
Amount: $${invoice.amount.toFixed(2)}
Status: ${invoice.status}
      `;

      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handlePayInvoice = async (invoice) => {
    try {
      // In a real app, this would process payment
      // For now, we'll just update the local state
      const updatedInvoices = invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'paid', paid_at: new Date().toISOString() } 
          : inv
      );
      
      setInvoices(updatedInvoices);
      
      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'paid', paid_at: new Date().toISOString() });
      }
      
      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800' },
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      overdue: { color: 'bg-red-100 text-red-800' },
      cancelled: { color: 'bg-gray-100 text-gray-800' }
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status]?.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && invoices.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">View and manage your billing history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Time</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
                        </button>
                        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                          <button
                            onClick={() => handlePayInvoice(invoice)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Pay
                          </button>
                        ) : null}
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
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} invoices
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: Math.min(totalPages, pagination.page + 1) })}
                disabled={pagination.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <SafeIcon icon={FiIcons.FiX} className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Invoice #{selectedInvoice.invoice_number}</h2>
                    <p className="text-gray-600">
                      {new Date(selectedInvoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Description</span>
                    <span className="font-medium">{selectedInvoice.description}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Invoice Date</span>
                    <span className="font-medium">
                      {new Date(selectedInvoice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Due Date</span>
                    <span className="font-medium">
                      {new Date(selectedInvoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedInvoice.paid_at && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Paid Date</span>
                      <span className="font-medium">
                        {new Date(selectedInvoice.paid_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${(selectedInvoice.amount * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">${(selectedInvoice.amount * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-gray-900 font-bold">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
                  <span>Download</span>
                </button>
                {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                  <button
                    onClick={() => {
                      handlePayInvoice(selectedInvoice);
                      setShowInvoiceModal(false);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;