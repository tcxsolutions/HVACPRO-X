import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONSTANTS } from '../config/constants';
import toast from 'react-hot-toast';

const HVACUnits = () => {
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  const [hvacUnits, setHvacUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serial_number: '',
    type: 'rooftop',
    manufacturer: '',
    installation_date: '',
    location: '',
    capacity: '',
    refrigerant_type: '',
    property_id: '',
    status: 'operational',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock properties data
      const mockProperties = [
        { id: 1, name: 'Downtown Office Complex' },
        { id: 2, name: 'Manufacturing Facility' },
        { id: 3, name: 'Tech Park Building A' },
        { id: 4, name: 'Retail Center North' }
      ];
      setProperties(mockProperties);

      // Mock HVAC units data
      const mockHvacUnits = [
        {
          id: 1,
          name: 'Rooftop Unit 1',
          model: 'AC-5000X',
          serial_number: 'SN123456789',
          type: 'rooftop',
          manufacturer: 'Carrier',
          installation_date: '2020-03-15',
          location: 'Building A - Rooftop',
          capacity: '50000',
          refrigerant_type: 'R-410A',
          property_id: 1,
          property: { id: 1, name: 'Downtown Office Complex' },
          status: 'operational',
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-04-15',
          notes: 'Regular maintenance unit, high efficiency',
          work_orders_count: 5,
          maintenance_due: false
        },
        {
          id: 2,
          name: 'Main Floor Unit',
          model: 'HV-8000',
          serial_number: 'SN987654321',
          type: 'split_system',
          manufacturer: 'Trane',
          installation_date: '2019-08-22',
          location: 'Main Floor - East Wing',
          capacity: '75000',
          refrigerant_type: 'R-410A',
          property_id: 2,
          property: { id: 2, name: 'Manufacturing Facility' },
          status: 'needs_maintenance',
          last_maintenance: '2023-11-20',
          next_maintenance: '2024-02-20',
          notes: 'Requires filter replacement',
          work_orders_count: 12,
          maintenance_due: true
        },
        {
          id: 3,
          name: 'Office Area Unit',
          model: 'MC-3500',
          serial_number: 'SN456789123',
          type: 'mini_split',
          manufacturer: 'Mitsubishi',
          installation_date: '2021-06-10',
          location: 'Office Area - 2nd Floor',
          capacity: '24000',
          refrigerant_type: 'R-32',
          property_id: 3,
          property: { id: 3, name: 'Tech Park Building A' },
          status: 'operational',
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-07-10',
          notes: 'Energy efficient unit, newer installation',
          work_orders_count: 2,
          maintenance_due: false
        },
        {
          id: 4,
          name: 'Server Room Unit',
          model: 'PC-2000',
          serial_number: 'SN789123456',
          type: 'precision',
          manufacturer: 'Liebert',
          installation_date: '2022-01-15',
          location: 'Server Room - Basement',
          capacity: '15000',
          refrigerant_type: 'R-410A',
          property_id: 3,
          property: { id: 3, name: 'Tech Park Building A' },
          status: 'out_of_service',
          last_maintenance: '2023-12-05',
          next_maintenance: '2024-03-05',
          notes: 'Critical cooling for server equipment - requires immediate attention',
          work_orders_count: 8,
          maintenance_due: true
        }
      ];
      setHvacUnits(mockHvacUnits);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load HVAC units');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = (unit) => {
    // Navigate to work orders page with state
    navigate('/work-orders', {
      state: {
        createWorkOrder: true,
        hvacUnit: {
          id: unit.id,
          name: unit.name,
          model: unit.model,
          property: {
            id: unit.property.id,
            name: unit.property.name
          }
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get property reference
      const property = properties.find(p => p.id.toString() === formData.property_id);
      
      const unitData = {
        ...formData,
        property,
        capacity: parseInt(formData.capacity),
        property_id: parseInt(formData.property_id)
      };

      if (editingUnit) {
        // Update existing unit
        const updatedUnits = hvacUnits.map(unit => 
          unit.id === editingUnit.id ? 
            { ...unitData, id: editingUnit.id, work_orders_count: editingUnit.work_orders_count } : 
            unit
        );
        setHvacUnits(updatedUnits);
        toast.success('HVAC unit updated successfully!');
      } else {
        // Create new unit
        const newUnit = {
          ...unitData,
          id: Date.now(),
          work_orders_count: 0,
          maintenance_due: false,
          last_maintenance: null,
          next_maintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
        };
        setHvacUnits([...hvacUnits, newUnit]);
        toast.success('HVAC unit created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving HVAC unit:', error);
      toast.error('Failed to save HVAC unit');
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      model: unit.model,
      serial_number: unit.serial_number,
      type: unit.type,
      manufacturer: unit.manufacturer,
      installation_date: unit.installation_date,
      location: unit.location,
      capacity: unit.capacity.toString(),
      refrigerant_type: unit.refrigerant_type,
      property_id: unit.property_id.toString(),
      status: unit.status,
      notes: unit.notes || ''
    });
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      model: '',
      serial_number: '',
      type: 'rooftop',
      manufacturer: '',
      installation_date: '',
      location: '',
      capacity: '',
      refrigerant_type: '',
      property_id: '',
      status: 'operational',
      notes: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Wait for animation to complete before resetting state
    setTimeout(() => {
      setEditingUnit(null);
      setFormData({
        name: '',
        model: '',
        serial_number: '',
        type: 'rooftop',
        manufacturer: '',
        installation_date: '',
        location: '',
        capacity: '',
        refrigerant_type: '',
        property_id: '',
        status: 'operational',
        notes: ''
      });
    }, 300);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      operational: { color: 'bg-green-100 text-green-800', label: 'Operational' },
      needs_maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Maintenance' },
      out_of_service: { color: 'bg-red-100 text-red-800', label: 'Out of Service' },
      under_maintenance: { color: 'bg-blue-100 text-blue-800', label: 'Under Maintenance' }
    };
    const config = statusConfig[status] || statusConfig.operational;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = APP_CONSTANTS.HVAC_UNIT_TYPES.find(t => t.value === type);
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {typeConfig?.label || type}
      </span>
    );
  };

  // Filter units based on search and filters
  const filteredUnits = hvacUnits.filter(unit => {
    // Property filter
    if (selectedProperty !== 'all' && unit.property_id.toString() !== selectedProperty) {
      return false;
    }
    
    // Status filter
    if (selectedStatus !== 'all' && unit.status !== selectedStatus) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        unit.name.toLowerCase().includes(query) ||
        unit.model.toLowerCase().includes(query) ||
        unit.manufacturer.toLowerCase().includes(query) ||
        unit.location.toLowerCase().includes(query) ||
        unit.serial_number.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold text-gray-900">HVAC Units</h1>
          <p className="text-gray-600">Monitor and manage your HVAC equipment</p>
        </div>
        
        {hasPermission('hvac_units_create') && (
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Add HVAC Unit</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Units',
            value: hvacUnits.length.toString(),
            icon: FiIcons.FiWind,
            color: 'bg-blue-500'
          },
          {
            title: 'Operational',
            value: hvacUnits.filter(u => u.status === 'operational').length.toString(),
            icon: FiIcons.FiCheckCircle,
            color: 'bg-green-500'
          },
          {
            title: 'Need Maintenance',
            value: hvacUnits.filter(u => u.status === 'needs_maintenance').length.toString(),
            icon: FiIcons.FiAlertTriangle,
            color: 'bg-yellow-500'
          },
          {
            title: 'Out of Service',
            value: hvacUnits.filter(u => u.status === 'out_of_service').length.toString(),
            icon: FiIcons.FiXCircle,
            color: 'bg-red-500'
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
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id.toString()}>
                  {property.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="needs_maintenance">Needs Maintenance</option>
              <option value="out_of_service">Out of Service</option>
              <option value="under_maintenance">Under Maintenance</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search HVAC units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* HVAC Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUnits.map((unit, index) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{unit.name}</h3>
                <p className="text-sm text-gray-600">{unit.model} • {unit.manufacturer}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(unit.status)}
                  {getTypeBadge(unit.type)}
                  {unit.maintenance_due && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                      Maintenance Due
                    </span>
                  )}
                </div>
              </div>
              
              {hasPermission('hvac_units_edit') && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Property</p>
                <p className="font-medium text-gray-900">{unit.property.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{unit.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Capacity</p>
                <p className="font-medium text-gray-900">{unit.capacity} BTU/hr</p>
              </div>
              <div>
                <p className="text-gray-500">Refrigerant</p>
                <p className="font-medium text-gray-900">{unit.refrigerant_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Installation Date</p>
                <p className="font-medium text-gray-900">{new Date(unit.installation_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Work Orders</p>
                <p className="font-medium text-gray-900">{unit.work_orders_count}</p>
              </div>
            </div>
            
            {unit.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                {unit.notes}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {unit.last_maintenance ? (
                  `Last maintenance: ${new Date(unit.last_maintenance).toLocaleDateString()}`
                ) : (
                  'No maintenance recorded'
                )}
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleCreateWorkOrder(unit)}
                  className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
                >
                  Create Work Order
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiIcons.FiWind} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No HVAC units found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedProperty !== 'all' || selectedStatus !== 'all'
              ? 'No HVAC units match your current filters.'
              : 'No HVAC units have been added yet.'}
          </p>
        </div>
      )}

      {/* Add/Edit HVAC Unit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUnit ? 'Edit HVAC Unit' : 'Add New HVAC Unit'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input
                  type="text"
                  required
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {APP_CONSTANTS.HVAC_UNIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="operational">Operational</option>
                  <option value="needs_maintenance">Needs Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select
                required
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Rooftop, Main Floor, Building A"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity (BTU/hr)</label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Refrigerant Type</label>
                <input
                  type="text"
                  value={formData.refrigerant_type}
                  onChange={(e) => setFormData({ ...formData, refrigerant_type: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., R-410A, R-32"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Installation Date</label>
                <input
                  type="date"
                  required
                  value={formData.installation_date}
                  onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Additional notes about this unit..."
              />
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
              {editingUnit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HVACUnits;