import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../services/PropertiesService';
import toast from 'react-hot-toast';

const Properties = () => {
  const { userProfile, hasPermission } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'commercial',
    size: '',
    contact_person: '',
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    loadProperties();
  }, [userProfile]);

  const loadProperties = async () => {
    if (!userProfile?.tenant_id) return;
    setLoading(true);
    try {
      // Using mock data for faster loading
      setProperties([
        {
          id: 1,
          name: 'Downtown Office Complex',
          address: '123 Business Ave, City, ST 12345',
          type: 'commercial',
          size: 50000,
          contact_person: 'John Smith',
          contact_phone: '(555) 123-4567',
          contact_email: 'john@company.com',
          tenant_id: userProfile.tenant_id,
          created_at: new Date().toISOString(),
          hvac_units_count: 5
        },
        {
          id: 2,
          name: 'Manufacturing Facility',
          address: '456 Industrial Blvd, City, ST 12345',
          type: 'industrial',
          size: 120000,
          contact_person: 'Sarah Johnson',
          contact_phone: '(555) 987-6543',
          contact_email: 'sarah@example.com',
          tenant_id: userProfile.tenant_id,
          created_at: new Date().toISOString(),
          hvac_units_count: 12
        },
        {
          id: 3,
          name: 'Tech Park Building A',
          address: '789 Innovation Way, City, ST 12345',
          type: 'commercial',
          size: 75000,
          contact_person: 'Robert Chen',
          contact_phone: '(555) 555-5555',
          contact_email: 'robert@example.com',
          tenant_id: userProfile.tenant_id,
          created_at: new Date().toISOString(),
          hvac_units_count: 8
        }
      ]);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        type: property.type,
        size: property.size?.toString(),
        contact_person: property.contact_person,
        contact_phone: property.contact_phone,
        contact_email: property.contact_email
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        type: 'commercial',
        size: '',
        contact_person: '',
        contact_phone: '',
        contact_email: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Wait for animation to complete before resetting form
    setTimeout(() => {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        type: 'commercial',
        size: '',
        contact_person: '',
        contact_phone: '',
        contact_email: ''
      });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const propertyData = {
        ...formData,
        tenant_id: userProfile?.tenant_id,
        size: parseInt(formData.size)
      };

      if (editingProperty) {
        // Update existing property (mock implementation)
        const updatedProperties = properties.map(p => 
          p.id === editingProperty.id ? { ...p, ...propertyData, id: editingProperty.id } : p
        );
        setProperties(updatedProperties);
        toast.success('Property updated successfully!');
      } else {
        // Create new property (mock implementation)
        const newProperty = {
          ...propertyData,
          id: Date.now(), // Generate a fake ID
          created_at: new Date().toISOString(),
          hvac_units_count: 0
        };
        setProperties([...properties, newProperty]);
        toast.success('Property created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      // Mock implementation
      const filteredProperties = properties.filter(p => p.id !== propertyId);
      setProperties(filteredProperties);
      toast.success('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property portfolio</p>
        </div>
        
        {hasPermission('properties_create') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Add Property</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiHome} className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      property.type === 'commercial'
                        ? 'bg-blue-100 text-blue-800'
                        : property.type === 'industrial'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {property.type}
                  </span>
                </div>
              </div>
              
              {hasPermission('properties_edit') && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(property)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                  </button>
                  
                  {hasPermission('properties_delete') && (
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiMapPin} className="h-4 w-4 mr-2" />
                {property.address}
              </div>
              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiSquare} className="h-4 w-4 mr-2" />
                {property.size?.toLocaleString()} sq ft
              </div>
              <div className="flex items-center text-gray-600">
                <SafeIcon icon={FiIcons.FiWind} className="h-4 w-4 mr-2" />
                {property.hvac_units_count || 0} HVAC Units
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{property.contact_person}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <SafeIcon icon={FiIcons.FiHome} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Add your first property to get started</p>
        </div>
      )}

      {/* Property Modal - Using the reusable Modal component */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        title={editingProperty ? 'Edit Property' : 'Add New Property'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows="2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                <input
                  type="number"
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
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
              {editingProperty ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Properties;