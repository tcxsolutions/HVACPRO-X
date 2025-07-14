import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import PhoneNumberManager from '../components/common/PhoneNumberManager';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONSTANTS } from '../config/constants';
import toast from 'react-hot-toast';

const Customers = () => {
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form data state with phone numbers
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    type: 'commercial',
    email: '',
    address: '',
    phoneNumbers: [
      { number: '', type: 'work', isPrimary: true }
    ],
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, [userProfile]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockCustomers = [
        {
          id: 1,
          name: 'Acme Corporation',
          company: 'Acme Corp',
          type: 'commercial',
          email: 'contact@acme.com',
          address: '123 Business Ave, City, ST 12345',
          phoneNumbers: [
            { number: '(555) 123-4567', type: 'work', isPrimary: true },
            { number: '(555) 987-6543', type: 'emergency', isPrimary: false }
          ],
          properties: 3,
          work_orders: 12,
          created_at: '2024-01-15',
          status: 'active'
        },
        {
          id: 2,
          name: 'Tech Solutions Inc',
          company: 'Tech Solutions',
          type: 'commercial',
          email: 'info@techsolutions.com',
          address: '456 Tech Park, City, ST 12345',
          phoneNumbers: [
            { number: '(555) 234-5678', type: 'work', isPrimary: true }
          ],
          properties: 2,
          work_orders: 8,
          created_at: '2024-02-01',
          status: 'active'
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomers = customers.map(customer =>
          customer.id === editingCustomer.id
            ? { ...customer, ...formData, updated_at: new Date().toISOString() }
            : customer
        );
        setCustomers(updatedCustomers);
        toast.success('Customer updated successfully!');
      } else {
        // Create new customer
        const newCustomer = {
          id: Date.now(),
          ...formData,
          properties: 0,
          work_orders: 0,
          created_at: new Date().toISOString(),
          status: 'active'
        };
        setCustomers([...customers, newCustomer]);
        toast.success('Customer added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        company: customer.company,
        type: customer.type,
        email: customer.email,
        address: customer.address,
        phoneNumbers: customer.phoneNumbers || [{ number: '', type: 'work', isPrimary: true }],
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        company: '',
        type: 'commercial',
        email: '',
        address: '',
        phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      company: '',
      type: 'commercial',
      email: '',
      address: '',
      phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
      notes: ''
    });
  };

  const getTypeBadge = (type) => {
    const typeConfig = APP_CONSTANTS.CUSTOMER_TYPES.find(t => t.value === type) || { value: type, label: type };
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {typeConfig.label}
      </span>
    );
  };

  // Filter customers based on search and type
  const filteredCustomers = customers.filter(customer => {
    if (typeFilter !== 'all' && customer.type !== typeFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.company.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phoneNumbers.some(phone => phone.number.includes(query))
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        {hasPermission('customers_create') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Customers
            </button>
            {APP_CONSTANTS.CUSTOMER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  typeFilter === type.value
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.label}
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
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getTypeBadge(customer.type)}
                  <span className="text-sm text-gray-500">ID: {customer.id}</span>
                </div>
              </div>
              {hasPermission('customers_edit') && (
                <button
                  onClick={() => handleOpenModal(customer)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiMail} className="h-4 w-4 mr-2" />
                <a href={`mailto:${customer.email}`} className="hover:text-primary-600">
                  {customer.email}
                </a>
              </div>
              
              <div className="space-y-1">
                {customer.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <SafeIcon
                      icon={phone.type === 'mobile' ? FiIcons.FiSmartphone : FiIcons.FiPhone}
                      className="h-4 w-4 mr-2"
                    />
                    <span>{phone.number}</span>
                    {phone.type !== 'work' && (
                      <span className="ml-1 text-xs text-gray-500">({phone.type})</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiMapPin} className="h-4 w-4 mr-2" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Properties</p>
                  <p className="font-medium text-gray-900">{customer.properties}</p>
                </div>
                <div>
                  <p className="text-gray-500">Work Orders</p>
                  <p className="font-medium text-gray-900">{customer.work_orders}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/customers/${customer.id}`)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
              >
                View Details
              </button>
              <button
                onClick={() => navigate('/work-orders/new', {
                  state: { customer: { id: customer.id, name: customer.name } }
                })}
                className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
              >
                Create Work Order
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <SafeIcon icon={FiIcons.FiUsers} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">
            {searchQuery || typeFilter !== 'all'
              ? 'No customers match your current filters'
              : 'Add your first customer to get started'}
          </p>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {APP_CONSTANTS.CUSTOMER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <PhoneNumberManager
            phoneNumbers={formData.phoneNumbers}
            onChange={(phoneNumbers) => setFormData({ ...formData, phoneNumbers })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes about the customer..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;