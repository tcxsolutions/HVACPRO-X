import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import PhoneNumberManager from '../../components/common/PhoneNumberManager';
import PhoneNumberDisplay from '../../components/common/PhoneNumberDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONSTANTS } from '../../config/constants';
import toast from 'react-hot-toast';

const Vendors = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'distributor',
    address: '',
    phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
    email: '',
    website: '',
    tax_id: '',
    payment_terms: 'Net 30',
    notes: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration with multiple phone numbers
      const mockVendors = [
        {
          id: 1,
          name: 'HVAC Supply Co.',
          category: 'distributor',
          address: '789 Industrial Pkwy, City, ST 12345',
          phoneNumbers: [
            { number: '(555) 987-6543', type: 'work', isPrimary: true },
            { number: '(555) 987-6544', type: 'fax', isPrimary: false }
          ],
          email: 'orders@hvacsupply.com',
          website: 'www.hvacsupply.com',
          status: 'active',
          items_count: 145,
          total_orders: 28,
          last_order_date: '2024-02-15'
        },
        {
          id: 2,
          name: 'CoolAir Components',
          category: 'manufacturer',
          address: '456 Manufacturing Dr, City, ST 12345',
          phoneNumbers: [
            { number: '(555) 456-7890', type: 'work', isPrimary: true },
            { number: '(555) 456-7891', type: 'mobile', isPrimary: false },
            { number: '(555) 456-7892', type: 'emergency', isPrimary: false }
          ],
          email: 'sales@coolaircomp.com',
          website: 'www.coolaircomp.com',
          status: 'active',
          items_count: 89,
          total_orders: 15,
          last_order_date: '2024-03-01'
        },
        {
          id: 3,
          name: 'Tech Parts Wholesale',
          category: 'wholesaler',
          address: '123 Commerce Blvd, City, ST 12345',
          phoneNumbers: [
            { number: '(555) 234-5678', type: 'work', isPrimary: true }
          ],
          email: 'orders@techparts.com',
          website: 'www.techparts.com',
          status: 'active',
          items_count: 234,
          total_orders: 42,
          last_order_date: '2024-03-10'
        }
      ];
      setVendors(mockVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        category: vendor.category,
        address: vendor.address,
        phoneNumbers: vendor.phoneNumbers || [{ number: '', type: 'work', isPrimary: true }],
        email: vendor.email,
        website: vendor.website || '',
        tax_id: vendor.tax_id || '',
        payment_terms: vendor.payment_terms || 'Net 30',
        notes: vendor.notes || ''
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        category: 'distributor',
        address: '',
        phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
        email: '',
        website: '',
        tax_id: '',
        payment_terms: 'Net 30',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'distributor',
      address: '',
      phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
      email: '',
      website: '',
      tax_id: '',
      payment_terms: 'Net 30',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVendor) {
        // Update existing vendor
        const updatedVendors = vendors.map(vendor =>
          vendor.id === editingVendor.id
            ? {
                ...vendor,
                ...formData,
                updated_at: new Date().toISOString()
              }
            : vendor
        );
        setVendors(updatedVendors);
        toast.success('Vendor updated successfully!');
      } else {
        // Create new vendor
        const newVendor = {
          id: Date.now(),
          ...formData,
          status: 'active',
          items_count: 0,
          total_orders: 0,
          last_order_date: null,
          created_at: new Date().toISOString()
        };
        setVendors([...vendors, newVendor]);
        toast.success('Vendor added successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = APP_CONSTANTS.VENDOR_CATEGORIES.find(c => c.value === category) || { value: category, label: category };
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {categoryConfig.label}
      </span>
    );
  };

  // Filter vendors based on search and category
  const filteredVendors = vendors.filter(vendor => {
    if (categoryFilter !== 'all' && vendor.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        vendor.name.toLowerCase().includes(query) ||
        vendor.email.toLowerCase().includes(query) ||
        vendor.phoneNumbers?.some(phone => phone.number.includes(query)) ||
        vendor.address.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage your supplier relationships</p>
        </div>
        {hasPermission('vendors_create') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Add Vendor</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Vendors
            </button>
            {APP_CONSTANTS.VENDOR_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === category.value
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{vendor.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getCategoryBadge(vendor.category)}
                  <span className="text-sm text-gray-500">ID: {vendor.id}</span>
                </div>
              </div>
              {hasPermission('vendors_edit') && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(vendor)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiMail} className="h-4 w-4 mr-2 flex-shrink-0" />
                <a href={`mailto:${vendor.email}`} className="hover:text-primary-600">
                  {vendor.email}
                </a>
              </div>
              
              <div>
                <PhoneNumberDisplay phoneNumbers={vendor.phoneNumbers} />
              </div>
              
              <div className="flex items-start text-gray-600">
                <SafeIcon icon={FiIcons.FiMapPin} className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{vendor.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Items</p>
                  <p className="font-medium text-gray-900">{vendor.items_count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Orders</p>
                  <p className="font-medium text-gray-900">{vendor.total_orders}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Order</p>
                  <p className="font-medium text-gray-900">
                    {vendor.last_order_date ? new Date(vendor.last_order_date).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/vendors/${vendor.id}`)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
              >
                View Details
              </button>
              <button
                onClick={() => navigate('/purchase-orders/new', { state: { vendor: { id: vendor.id, name: vendor.name } } })}
                className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
              >
                Create Order
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <SafeIcon icon={FiIcons.FiTruck} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600">
            {searchQuery || categoryFilter !== 'all'
              ? 'No vendors match your search criteria'
              : 'Add your first vendor to get started'}
          </p>
        </div>
      )}

      {/* Add/Edit Vendor Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="HVAC Supply Co."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {APP_CONSTANTS.VENDOR_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="COD">COD</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="orders@vendor.com"
            />
          </div>

          <PhoneNumberManager
            phoneNumbers={formData.phoneNumbers}
            onChange={(phoneNumbers) => setFormData({ ...formData, phoneNumbers })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="123 Business Ave, City, ST 12345"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="www.vendor.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID (Optional)</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="12-3456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes about this vendor..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              {editingVendor ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;