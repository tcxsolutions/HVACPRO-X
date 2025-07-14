import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import PhoneNumberManager from '../components/common/PhoneNumberManager';
import PhoneNumberDisplay from '../components/common/PhoneNumberDisplay';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Technicians = () => {
  const { hasPermission } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTechnician, setEditingTechnician] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
    role: 'technician',
    specializations: [],
    status: 'available',
    certification: '',
    notes: ''
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = () => {
    // Mock data for demo with multiple phone numbers
    setTimeout(() => {
      setTechnicians([
        {
          id: 1,
          name: 'Mike Wilson',
          email: 'mike.wilson@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 123-7890', type: 'work', isPrimary: true },
            { number: '(555) 123-7891', type: 'mobile', isPrimary: false }
          ],
          role: 'senior',
          specializations: ['commercial', 'refrigeration'],
          status: 'active',
          current_location: '123 Business Ave, City, ST',
          work_orders_completed: 128,
          work_orders_in_progress: 3,
          certification: 'HVAC Master Technician',
          hired_date: '2020-03-15',
          avatar: null
        },
        {
          id: 2,
          name: 'Jennifer Lee',
          email: 'jennifer.lee@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 456-7890', type: 'work', isPrimary: true },
            { number: '(555) 456-7891', type: 'mobile', isPrimary: false },
            { number: '(555) 456-7892', type: 'emergency', isPrimary: false }
          ],
          role: 'technician',
          specializations: ['residential', 'installation'],
          status: 'on_job',
          current_location: '456 Industrial Blvd, City, ST',
          work_orders_completed: 95,
          work_orders_in_progress: 2,
          certification: 'HVAC Certified Technician',
          hired_date: '2021-06-10',
          avatar: null
        },
        {
          id: 3,
          name: 'David Rodriguez',
          email: 'david.rodriguez@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 789-1234', type: 'work', isPrimary: true }
          ],
          role: 'apprentice',
          specializations: ['maintenance'],
          status: 'available',
          current_location: 'Office',
          work_orders_completed: 42,
          work_orders_in_progress: 0,
          certification: 'HVAC Apprentice',
          hired_date: '2022-09-05',
          avatar: null
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTechnician) {
        // Update existing technician
        const updatedTechnicians = technicians.map(tech =>
          tech.id === editingTechnician.id
            ? {
                ...tech,
                ...formData,
                updated_at: new Date().toISOString()
              }
            : tech
        );
        setTechnicians(updatedTechnicians);
        toast.success('Technician updated successfully!');
      } else {
        // Create new technician
        const newTechnician = {
          id: Date.now(), // Generate a fake ID
          ...formData,
          work_orders_completed: 0,
          work_orders_in_progress: 0,
          hired_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        setTechnicians([...technicians, newTechnician]);
        toast.success('Technician added successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving technician:', error);
      toast.error('Failed to save technician');
    }
  };

  const handleOpenModal = (technician = null) => {
    if (technician) {
      setEditingTechnician(technician);
      setFormData({
        name: technician.name,
        email: technician.email,
        phoneNumbers: technician.phoneNumbers || [{ number: '', type: 'work', isPrimary: true }],
        role: technician.role,
        specializations: [...technician.specializations],
        status: technician.status,
        certification: technician.certification,
        notes: technician.notes || ''
      });
    } else {
      setEditingTechnician(null);
      setFormData({
        name: '',
        email: '',
        phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
        role: 'technician',
        specializations: [],
        status: 'available',
        certification: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTechnician(null);
    setFormData({
      name: '',
      email: '',
      phoneNumbers: [{ number: '', type: 'work', isPrimary: true }],
      role: 'technician',
      specializations: [],
      status: 'available',
      certification: '',
      notes: ''
    });
  };

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => {
      const specializations = prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization];
      return { ...prev, specializations };
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      on_job: { color: 'bg-blue-100 text-blue-800', label: 'On Job' },
      on_break: { color: 'bg-yellow-100 text-yellow-800', label: 'On Break' },
      off_duty: { color: 'bg-gray-100 text-gray-800', label: 'Off Duty' },
      available: { color: 'bg-emerald-100 text-emerald-800', label: 'Available' }
    };
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      senior: { color: 'bg-purple-100 text-purple-800', label: 'Senior Technician' },
      technician: { color: 'bg-blue-100 text-blue-800', label: 'Technician' },
      apprentice: { color: 'bg-green-100 text-green-800', label: 'Apprentice' }
    };
    const config = roleConfig[role] || roleConfig.technician;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredTechnicians = technicians.filter(technician => {
    // Filter by status
    if (statusFilter !== 'all' && technician.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        technician.name.toLowerCase().includes(query) ||
        technician.email.toLowerCase().includes(query) ||
        technician.phoneNumbers?.some(phone => phone.number.includes(query)) ||
        technician.certification.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
          <p className="text-gray-600">Manage your technician team and assignments</p>
        </div>
        {hasPermission('technicians_create') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Add Technician</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Technicians' },
              { key: 'available', label: 'Available' },
              { key: 'on_job', label: 'On Job' },
              { key: 'active', label: 'Active' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search technicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTechnicians.map((technician, index) => (
          <motion.div
            key={technician.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">
                    {technician.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{technician.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(technician.status)}
                    {getRoleBadge(technician.role)}
                  </div>
                </div>
              </div>
              {hasPermission('technicians_edit') && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(technician)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{technician.email}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Phone Numbers</p>
                <PhoneNumberDisplay phoneNumbers={technician.phoneNumbers} />
              </div>
              
              <div>
                <p className="text-gray-500">Certification</p>
                <p className="font-medium text-gray-900">{technician.certification}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Hired Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(technician.hired_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-500">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {technician.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                  >
                    {spec.charAt(0).toUpperCase() + spec.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Work Orders</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center">
                      <SafeIcon icon={FiIcons.FiCheck} className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">{technician.work_orders_completed}</span>
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiIcons.FiClock} className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">{technician.work_orders_in_progress}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 flex items-center space-x-1">
                    <SafeIcon icon={FiIcons.FiPhone} className="h-3 w-3" />
                    <span>Call</span>
                  </button>
                  <button className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700">
                    Assign Work
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiIcons.FiUsers} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No technicians match the search "${searchQuery}"`
              : statusFilter !== 'all'
              ? `No technicians with status "${statusFilter}" found`
              : 'No technicians have been added yet'}
          </p>
        </div>
      )}

      {/* Add/Edit Technician Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTechnician ? 'Edit Technician' : 'Add New Technician'}
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

          <PhoneNumberManager
            phoneNumbers={formData.phoneNumbers}
            onChange={(phoneNumbers) => setFormData({ ...formData, phoneNumbers })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="senior">Senior Technician</option>
                <option value="technician">Technician</option>
                <option value="apprentice">Apprentice</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="available">Available</option>
                <option value="active">Active</option>
                <option value="on_job">On Job</option>
                <option value="on_break">On Break</option>
                <option value="off_duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Certification</label>
            <input
              type="text"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., HVAC Master Technician"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
            <div className="space-y-2">
              {['commercial', 'residential', 'industrial', 'refrigeration', 'installation', 'maintenance'].map(
                (spec) => (
                  <label key={spec} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(spec)}
                      onChange={() => handleSpecializationChange(spec)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes about the technician..."
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
              {editingTechnician ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Technicians;