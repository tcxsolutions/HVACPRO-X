import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const UserManagement = () => {
  const { hasPermission } = useAuth();
  const { tenantUsers, loading, addTenantUser, updateTenantUser, removeTenantUser } = useTenant();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'technician',
    permissions: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.user?.email || '',
        role: user.role || 'technician',
        permissions: user.permissions || []
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        role: 'technician',
        permissions: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        await updateTenantUser(editingUser.user_id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          permissions: formData.permissions
        });
        alert('User updated successfully!');
      } else {
        // Add new user
        await addTenantUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions
        });
        alert('User invited successfully!');
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    
    try {
      await removeTenantUser(userId);
      alert('User removed successfully!');
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user. Please try again.');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      manager: { color: 'bg-blue-100 text-blue-800', label: 'Manager' },
      technician: { color: 'bg-green-100 text-green-800', label: 'Technician' },
      customer: { color: 'bg-yellow-100 text-yellow-800', label: 'Customer' }
    };

    const config = roleConfig[role] || roleConfig.technician;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredUsers = tenantUsers.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.user?.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        {hasPermission('user_management') && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiUserPlus} className="h-4 w-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? `No users match the search "${searchQuery}"` : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.user?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.includes('all') ? (
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                            Full Access
                          </span>
                        ) : (
                          user.permissions?.slice(0, 3).map((permission) => (
                            <span key={permission} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                              {permission.replace('_', ' ')}
                            </span>
                          ))
                        )}
                        {user.permissions?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required={!editingUser}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={!!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="technician">Technician</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="all-permissions"
                          checked={formData.permissions.includes('all')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, permissions: ['all'] });
                            } else {
                              setFormData({ ...formData, permissions: [] });
                            }
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="all-permissions" className="ml-2 block text-sm text-gray-700">
                          Full Access (All Permissions)
                        </label>
                      </div>

                      {!formData.permissions.includes('all') && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { key: 'properties_view', label: 'View Properties' },
                            { key: 'properties_create', label: 'Create Properties' },
                            { key: 'hvac_units_view', label: 'View HVAC Units' },
                            { key: 'hvac_units_create', label: 'Create HVAC Units' },
                            { key: 'work_orders_view', label: 'View Work Orders' },
                            { key: 'work_orders_create', label: 'Create Work Orders' },
                            { key: 'technicians_view', label: 'View Technicians' },
                            { key: 'customers_view', label: 'View Customers' }
                          ].map((permission) => (
                            <div key={permission.key} className="flex items-center">
                              <input
                                type="checkbox"
                                id={permission.key}
                                checked={formData.permissions.includes(permission.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      permissions: [...formData.permissions, permission.key]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      permissions: formData.permissions.filter(p => p !== permission.key)
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <label htmlFor={permission.key} className="ml-2 block text-sm text-gray-700">
                                {permission.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingUser ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;