import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONSTANTS } from '../config/constants';
import toast from 'react-hot-toast';

const WorkOrders = () => {
  const location = useLocation();
  const { userProfile, hasPermission } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [properties, setProperties] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [hvacUnits, setHvacUnits] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_id: '',
    hvac_unit_id: '',
    technician_id: '',
    priority: 'medium',
    status: 'pending',
    scheduled_date: '',
    estimated_hours: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [userProfile]);

  // Handle automatic modal opening when navigated from HVAC Units
  useEffect(() => {
    if (location.state?.createWorkOrder && location.state?.hvacUnit) {
      const hvacUnit = location.state.hvacUnit;
      setFormData(prev => ({
        ...prev,
        property_id: hvacUnit.property.id.toString(),
        hvac_unit_id: hvacUnit.id.toString(),
        title: `Maintenance for ${hvacUnit.name}`,
        description: `Service work order for ${hvacUnit.name} (${hvacUnit.model}) at ${hvacUnit.property.name}`
      }));
      setShowModal(true);
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Mock data for properties
      const mockProperties = [
        { id: 1, name: 'Downtown Office Complex' },
        { id: 2, name: 'Manufacturing Facility' },
        { id: 3, name: 'Tech Park Building A' }
      ];
      setProperties(mockProperties);

      // Mock data for technicians
      const mockTechnicians = [
        { id: 1, name: 'Mike Wilson', role: 'senior', status: 'available' },
        { id: 2, name: 'Jennifer Lee', role: 'technician', status: 'on_job' },
        { id: 3, name: 'David Rodriguez', role: 'apprentice', status: 'available' }
      ];
      setTechnicians(mockTechnicians);

      // Mock data for HVAC units
      const mockHvacUnits = [
        { 
          id: 1, 
          name: 'Rooftop Unit 1',
          model: 'AC-5000X',
          property_id: 1,
          property: { id: 1, name: 'Downtown Office Complex' }
        },
        {
          id: 2,
          name: 'Main Floor Unit',
          model: 'HV-8000',
          property_id: 2,
          property: { id: 2, name: 'Manufacturing Facility' }
        }
      ];
      setHvacUnits(mockHvacUnits);

      // Mock data for work orders
      const mockWorkOrders = [
        {
          id: 'WO-2024-001',
          title: 'Annual Maintenance',
          description: 'Perform annual maintenance check on rooftop unit',
          property_id: 1,
          property: { id: 1, name: 'Downtown Office Complex' },
          hvac_unit_id: 1,
          hvac_unit: { id: 1, name: 'Rooftop Unit 1', model: 'AC-5000X' },
          technician_id: 1,
          technician: { id: 1, name: 'Mike Wilson' },
          status: 'in_progress',
          priority: 'medium',
          scheduled_date: '2024-03-20',
          created_at: '2024-03-15',
          estimated_hours: 4,
          completed_percentage: 60,
          notes: 'Filter replacement needed'
        },
        {
          id: 'WO-2024-002',
          title: 'Emergency Repair',
          description: 'Unit not cooling properly, urgent inspection needed',
          property_id: 2,
          property: { id: 2, name: 'Manufacturing Facility' },
          hvac_unit_id: 2,
          hvac_unit: { id: 2, name: 'Main Floor Unit', model: 'HV-8000' },
          technician_id: null,
          technician: null,
          status: 'pending',
          priority: 'high',
          scheduled_date: '2024-03-18',
          created_at: '2024-03-17',
          estimated_hours: 2,
          completed_percentage: 0,
          notes: 'Customer reported unusual noise'
        }
      ];
      setWorkOrders(mockWorkOrders);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const property = properties.find(p => p.id.toString() === formData.property_id);
      const hvacUnit = hvacUnits.find(u => u.id.toString() === formData.hvac_unit_id);
      const technician = technicians.find(t => t.id.toString() === formData.technician_id);

      const workOrderData = {
        ...formData,
        id: editingOrder ? editingOrder.id : `WO-${Date.now()}`,
        property,
        hvac_unit: hvacUnit,
        technician,
        created_at: editingOrder ? editingOrder.created_at : new Date().toISOString(),
        completed_percentage: editingOrder ? editingOrder.completed_percentage : 0
      };

      if (editingOrder) {
        // Update existing work order
        const updatedOrders = workOrders.map(order =>
          order.id === editingOrder.id ? workOrderData : order
        );
        setWorkOrders(updatedOrders);
        toast.success('Work order updated successfully!');
      } else {
        // Create new work order
        setWorkOrders([workOrderData, ...workOrders]);
        toast.success('Work order created successfully!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving work order:', error);
      toast.error('Failed to save work order');
    }
  };

  const handleOpenModal = (order = null) => {
    if (location.state?.createWorkOrder) {
      // Clear the location state to prevent reopening
      window.history.replaceState({}, document.title);
    }

    if (order) {
      setEditingOrder(order);
      setFormData({
        title: order.title,
        description: order.description,
        property_id: order.property_id.toString(),
        hvac_unit_id: order.hvac_unit_id.toString(),
        technician_id: order.technician_id?.toString() || '',
        priority: order.priority,
        status: order.status,
        scheduled_date: order.scheduled_date,
        estimated_hours: order.estimated_hours.toString(),
        notes: order.notes || ''
      });
    } else if (!location.state?.createWorkOrder) {
      setEditingOrder(null);
      setFormData({
        title: '',
        description: '',
        property_id: '',
        hvac_unit_id: '',
        technician_id: '',
        priority: 'medium',
        status: 'pending',
        scheduled_date: '',
        estimated_hours: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      title: '',
      description: '',
      property_id: '',
      hvac_unit_id: '',
      technician_id: '',
      priority: 'medium',
      status: 'pending',
      scheduled_date: '',
      estimated_hours: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.title.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.property.name.toLowerCase().includes(query) ||
        order.hvac_unit.name.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Manage and track maintenance work orders</p>
        </div>
        {hasPermission('work_orders_create') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Create Work Order</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <SafeIcon
              icon={FiIcons.FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWorkOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{order.title}</h3>
                  <span className="text-sm text-gray-500">{order.id}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(order.status)}
                  {getPriorityBadge(order.priority)}
                  {order.completed_percentage > 0 && (
                    <span className="text-xs text-gray-500">
                      {order.completed_percentage}% Complete
                    </span>
                  )}
                </div>
              </div>
              
              {hasPermission('work_orders_edit') && (
                <button
                  onClick={() => handleOpenModal(order)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="text-gray-600 mb-4">{order.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Property</p>
                <p className="font-medium text-gray-900">{order.property.name}</p>
              </div>
              <div>
                <p className="text-gray-500">HVAC Unit</p>
                <p className="font-medium text-gray-900">
                  {order.hvac_unit.name} ({order.hvac_unit.model})
                </p>
              </div>
              <div>
                <p className="text-gray-500">Technician</p>
                <p className="font-medium text-gray-900">
                  {order.technician ? order.technician.name : 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Scheduled Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.scheduled_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                {order.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Created: {new Date(order.created_at).toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200">
                  View Details
                </button>
                {order.status !== 'completed' && (
                  <button className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700">
                    {order.technician ? 'Update Progress' : 'Assign Technician'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredWorkOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <SafeIcon icon={FiIcons.FiFileText} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No work orders match your current filters'
                : 'No work orders have been created yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Work Order Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingOrder ? 'Edit Work Order' : 'Create Work Order'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select
                required
                value={formData.property_id}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    property_id: e.target.value,
                    hvac_unit_id: '' // Reset HVAC unit when property changes
                  });
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">HVAC Unit</label>
              <select
                required
                value={formData.hvac_unit_id}
                onChange={(e) => setFormData({ ...formData, hvac_unit_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select HVAC Unit</option>
                {hvacUnits
                  .filter(
                    unit =>
                      !formData.property_id || unit.property_id.toString() === formData.property_id
                  )
                  .map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.model})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
              <input
                type="number"
                required
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Technician</label>
            <select
              value={formData.technician_id}
              onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Unassigned</option>
              {technicians
                .filter((tech) => tech.status === 'available')
                .map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.role})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes or instructions..."
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
              {editingOrder ? 'Update Work Order' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrders;