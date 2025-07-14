import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import PhoneNumberManager from '../components/common/PhoneNumberManager';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONSTANTS } from '../config/constants';
import toast from 'react-hot-toast';

const WorkOrderCalendar = () => {
  const { userProfile, hasPermission } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [properties, setProperties] = useState([]);
  const [hvacUnits, setHvacUnits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [filters, setFilters] = useState({
    technician: 'all',
    priority: 'all',
    status: 'all',
    property: 'all'
  });
  const [draggedOrder, setDraggedOrder] = useState(null);

  // Form data for creating new work orders with phone numbers
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_id: '',
    hvac_unit_id: '',
    customer_id: '',
    customer_name: '',
    customer_company: '',
    customer_email: '',
    customer_phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
    technician_id: '',
    priority: 'medium',
    status: 'pending',
    scheduled_date: '',
    scheduled_time: '09:00',
    estimated_duration: 2,
    type: 'maintenance',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, viewMode]);

  const loadData = async () => {
    try {
      // Mock data for demonstration with phone numbers
      const mockTechnicians = [
        { id: 1, name: 'Mike Wilson', color: '#3b82f6' },
        { id: 2, name: 'Jennifer Lee', color: '#10b981' },
        { id: 3, name: 'David Rodriguez', color: '#f59e0b' },
        { id: 4, name: 'Sarah Johnson', color: '#8b5cf6' }
      ];
      setTechnicians(mockTechnicians);

      const mockProperties = [
        { id: 1, name: 'Downtown Office Complex' },
        { id: 2, name: 'Manufacturing Facility' },
        { id: 3, name: 'Tech Park Building A' },
        { id: 4, name: 'Retail Center North' }
      ];
      setProperties(mockProperties);

      const mockHvacUnits = [
        { id: 1, name: 'Rooftop Unit 1', model: 'AC-5000X', property_id: 1 },
        { id: 2, name: 'Main Floor Unit', model: 'HV-8000', property_id: 2 },
        { id: 3, name: 'Office Area Unit', model: 'MC-3500', property_id: 3 },
        { id: 4, name: 'Server Room Unit', model: 'PC-2000', property_id: 4 }
      ];
      setHvacUnits(mockHvacUnits);

      const mockCustomers = [
        {
          id: 1,
          name: 'Acme Corporation',
          phoneNumbers: [
            { number: '(555) 123-4567', type: 'work', isPrimary: true },
            { number: '(555) 123-4568', type: 'emergency', isPrimary: false }
          ]
        },
        {
          id: 2,
          name: 'Industrial Corp',
          phoneNumbers: [
            { number: '(555) 987-6543', type: 'work', isPrimary: true }
          ]
        },
        {
          id: 3,
          name: 'Tech Innovations',
          phoneNumbers: [
            { number: '(555) 234-5678', type: 'work', isPrimary: true },
            { number: '(555) 234-5679', type: 'mobile', isPrimary: false }
          ]
        },
        {
          id: 4,
          name: 'Retail Solutions',
          phoneNumbers: [
            { number: '(555) 345-6789', type: 'work', isPrimary: true }
          ]
        }
      ];
      setCustomers(mockCustomers);

      const mockWorkOrders = [
        {
          id: 'WO-2024-001',
          title: 'Annual Maintenance',
          description: 'Perform annual maintenance check on rooftop unit',
          property_id: 1,
          property: { id: 1, name: 'Downtown Office Complex' },
          technician_id: 1,
          technician: { id: 1, name: 'Mike Wilson', color: '#3b82f6' },
          customer_id: 1,
          customer: {
            id: 1,
            name: 'Acme Corporation',
            phoneNumbers: [
              { number: '(555) 123-4567', type: 'work', isPrimary: true },
              { number: '(555) 123-4568', type: 'emergency', isPrimary: false }
            ]
          },
          status: 'scheduled',
          priority: 'medium',
          scheduled_date: '2024-03-20',
          scheduled_time: '09:00',
          estimated_duration: 4,
          type: 'maintenance'
        },
        {
          id: 'WO-2024-002',
          title: 'Emergency Repair',
          description: 'Unit not cooling properly, urgent inspection needed',
          property_id: 2,
          property: { id: 2, name: 'Manufacturing Facility' },
          technician_id: 2,
          technician: { id: 2, name: 'Jennifer Lee', color: '#10b981' },
          customer_id: 2,
          customer: {
            id: 2,
            name: 'Industrial Corp',
            phoneNumbers: [
              { number: '(555) 987-6543', type: 'work', isPrimary: true }
            ]
          },
          status: 'in_progress',
          priority: 'high',
          scheduled_date: '2024-03-18',
          scheduled_time: '14:00',
          estimated_duration: 3,
          type: 'repair'
        }
      ];
      setWorkOrders(mockWorkOrders);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load calendar data');
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      const days = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: null, date: null, isOtherMonth: true });
      }

      // Add days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({ day: i, date, isOtherMonth: false });
      }

      setCalendarDays(days);
    } else if (viewMode === 'week') {
      // Generate week view days
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push({
          day: date.getDate(),
          date,
          isOtherMonth: date.getMonth() !== currentDate.getMonth()
        });
      }
      setCalendarDays(days);
    }
  };

  const getWorkOrdersForDate = (date) => {
    if (!date) return [];
    return workOrders.filter(order => {
      const orderDate = new Date(order.scheduled_date);
      return orderDate.toDateString() === date.toDateString() && matchesFilters(order);
    });
  };

  const matchesFilters = (order) => {
    if (filters.technician !== 'all' && order.technician_id?.toString() !== filters.technician) return false;
    if (filters.priority !== 'all' && order.priority !== filters.priority) return false;
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.property !== 'all' && order.property_id?.toString() !== filters.property) return false;
    return true;
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDateClick = (date, time = '09:00') => {
    if (hasPermission('work_orders_create')) {
      setSelectedDate(date);
      setSelectedTime(time);
      setFormData({
        ...formData,
        scheduled_date: date.toISOString().split('T')[0],
        scheduled_time: time
      });
      setShowCreateModal(true);
    }
  };

  const handleCreateWorkOrder = () => {
    const today = new Date();
    setSelectedDate(today);
    setFormData({
      title: '',
      description: '',
      property_id: '',
      hvac_unit_id: '',
      customer_id: '',
      customer_name: '',
      customer_company: '',
      customer_email: '',
      customer_phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
      technician_id: '',
      priority: 'medium',
      status: 'pending',
      scheduled_date: today.toISOString().split('T')[0],
      scheduled_time: '09:00',
      estimated_duration: 2,
      type: 'maintenance',
      notes: ''
    });
    setShowCreateModal(true);
  };

  const handleSubmitWorkOrder = async (e) => {
    e.preventDefault();
    
    try {
      const property = properties.find(p => p.id.toString() === formData.property_id);
      const hvacUnit = hvacUnits.find(u => u.id.toString() === formData.hvac_unit_id);
      const technician = technicians.find(t => t.id.toString() === formData.technician_id);
      
      let customer;
      if (formData.customer_id) {
        customer = customers.find(c => c.id.toString() === formData.customer_id);
      } else {
        // Create new customer if not selected from existing
        customer = {
          id: Date.now(),
          name: formData.customer_name,
          company: formData.customer_company,
          email: formData.customer_email,
          phoneNumbers: formData.customer_phoneNumbers
        };
      }

      const newWorkOrder = {
        id: `WO-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        property_id: parseInt(formData.property_id),
        property: property,
        hvac_unit_id: formData.hvac_unit_id ? parseInt(formData.hvac_unit_id) : null,
        hvac_unit: hvacUnit,
        technician_id: formData.technician_id ? parseInt(formData.technician_id) : null,
        technician: technician,
        customer_id: customer.id,
        customer: customer,
        priority: formData.priority,
        status: formData.status,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        estimated_duration: parseInt(formData.estimated_duration),
        type: formData.type,
        notes: formData.notes,
        created_at: new Date().toISOString()
      };

      setWorkOrders([...workOrders, newWorkOrder]);
      setShowCreateModal(false);
      toast.success('Work order created successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        property_id: '',
        hvac_unit_id: '',
        customer_id: '',
        customer_name: '',
        customer_company: '',
        customer_email: '',
        customer_phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
        technician_id: '',
        priority: 'medium',
        status: 'pending',
        scheduled_date: '',
        scheduled_time: '09:00',
        estimated_duration: 2,
        type: 'maintenance',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
    }
  };

  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    if (!draggedOrder || !targetDate) return;

    const updatedOrders = workOrders.map(order => {
      if (order.id === draggedOrder.id) {
        return {
          ...order,
          scheduled_date: targetDate.toISOString().split('T')[0]
        };
      }
      return order;
    });

    setWorkOrders(updatedOrders);
    setDraggedOrder(null);
    toast.success('Work order rescheduled successfully');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: 'border-l-green-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-red-500',
      urgent: 'border-l-red-600'
    };
    return priorityColors[priority] || 'border-l-gray-500';
  };

  const formatDate = (date) => {
    if (viewMode === 'month') {
      return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return date.toLocaleDateString();
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getAvailableHvacUnits = () => {
    if (!formData.property_id) return [];
    return hvacUnits.filter(unit => unit.property_id.toString() === formData.property_id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Order Calendar</h1>
          <p className="text-gray-600">Manage and schedule work orders with drag-and-drop functionality</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasPermission('work_orders_create') && (
            <button
              onClick={handleCreateWorkOrder}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>New Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
            <select
              value={filters.technician}
              onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select
              value={filters.property}
              onChange={(e) => setFilters({ ...filters, property: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id.toString()}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <SafeIcon icon={FiIcons.FiChevronLeft} className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <SafeIcon icon={FiIcons.FiChevronRight} className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {['month', 'week'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200 bg-gray-50">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((dayData, index) => {
            const dayOrders = getWorkOrdersForDate(dayData.date);
            const isToday = dayData.date && dayData.date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  dayData.isOtherMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => dayData.date && handleDateClick(dayData.date)}
                onDragOver={handleDragOver}
                onDrop={(e) => dayData.date && handleDrop(e, dayData.date)}
              >
                {dayData.day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayOrders.slice(0, 3).map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-xs p-1 rounded cursor-pointer border-l-2 ${getPriorityColor(
                            order.priority
                          )} bg-white shadow-sm hover:shadow-md transition-shadow relative`}
                          style={{
                            backgroundColor: order.technician?.color + '15',
                            height: `${Math.min(order.estimated_duration * 15, 45)}px`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order);
                          }}
                          draggable={hasPermission('work_orders_edit')}
                          onDragStart={(e) => handleDragStart(e, order)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate text-xs">{order.title}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status)}`}></div>
                          </div>
                          <div className="text-gray-600 truncate text-xs">{order.scheduled_time}</div>
                          {order.technician && (
                            <div className="text-gray-600 truncate text-xs">{order.technician.name}</div>
                          )}
                          {/* Duration indicator */}
                          <div className="absolute right-1 bottom-1 text-xs text-gray-400">
                            {order.estimated_duration}h
                          </div>
                        </motion.div>
                      ))}
                      {dayOrders.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">+{dayOrders.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          title="Work Order Details"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedOrder.title}</h3>
                <p className="text-sm text-gray-600">{selectedOrder.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedOrder.status === 'pending'
                      ? 'bg-gray-100 text-gray-800'
                      : selectedOrder.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedOrder.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedOrder.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedOrder.status.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedOrder.priority === 'low'
                      ? 'bg-green-100 text-green-800'
                      : selectedOrder.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedOrder.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Property:</span>
                <p className="font-medium">{selectedOrder.property.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Technician:</span>
                <p className="font-medium">{selectedOrder.technician?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-gray-500">Scheduled:</span>
                <p className="font-medium">
                  {new Date(selectedOrder.scheduled_date).toLocaleDateString()} at {selectedOrder.scheduled_time}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium">{selectedOrder.estimated_duration}h</p>
              </div>
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium">{selectedOrder.customer.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <div>
                  {selectedOrder.customer.phoneNumbers?.map((phone, index) => (
                    <p key={index} className="font-medium">
                      {phone.number} {phone.type !== 'work' && `(${phone.type})`}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">Description:</span>
              <p className="text-gray-900 mt-1">{selectedOrder.description}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {hasPermission('work_orders_edit') && (
                <button
                  onClick={() => {
                    // Navigate to edit work order
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Edit Work Order
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Work Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            title: '',
            description: '',
            property_id: '',
            hvac_unit_id: '',
            customer_id: '',
            customer_name: '',
            customer_company: '',
            customer_email: '',
            customer_phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
            technician_id: '',
            priority: 'medium',
            status: 'pending',
            scheduled_date: '',
            scheduled_time: '09:00',
            estimated_duration: 2,
            type: 'maintenance',
            notes: ''
          });
        }}
        title="Create New Work Order"
      >
        <form onSubmit={handleSubmitWorkOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Work order title"
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
              placeholder="Detailed description of the work to be performed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select
                required
                value={formData.property_id}
                onChange={(e) =>
                  setFormData({ ...formData, property_id: e.target.value, hvac_unit_id: '' })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id.toString()}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Existing Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!formData.customer_id && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Or Create New Customer</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Customer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={formData.customer_company}
                    onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="customer@email.com"
                />
              </div>

              <div className="mt-4">
                <PhoneNumberManager
                  phoneNumbers={formData.customer_phoneNumbers}
                  onChange={(phoneNumbers) => setFormData({ ...formData, customer_phoneNumbers: phoneNumbers })}
                  label="Customer Phone Numbers"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">HVAC Unit (Optional)</label>
            <select
              value={formData.hvac_unit_id}
              onChange={(e) => setFormData({ ...formData, hvac_unit_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select HVAC Unit</option>
              {getAvailableHvacUnits().map((unit) => (
                <option key={unit.id} value={unit.id.toString()}>
                  {unit.name} ({unit.model})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
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
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                required
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                required
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Technician (Optional)</label>
            <select
              value={formData.technician_id}
              onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Unassigned</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes or instructions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  title: '',
                  description: '',
                  property_id: '',
                  hvac_unit_id: '',
                  customer_id: '',
                  customer_name: '',
                  customer_company: '',
                  customer_email: '',
                  customer_phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
                  technician_id: '',
                  priority: 'medium',
                  status: 'pending',
                  scheduled_date: '',
                  scheduled_time: '09:00',
                  estimated_duration: 2,
                  type: 'maintenance',
                  notes: ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Work Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrderCalendar;