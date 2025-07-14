import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

// Lazy load heavy components
const DashboardChart = React.lazy(() => import('../components/dashboard/DashboardChart'));
const DashboardCalendar = React.lazy(() => import('../components/dashboard/DashboardCalendar'));

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [timeRange, setTimeRange] = useState('month');

  // Memoize static data to prevent re-renders
  const stats = useMemo(() => ({
    properties: 45,
    hvacUnits: 128,
    activeWorkOrders: 18,
    completedWorkOrders: 254,
    revenue: 45320,
    upcomingMaintenance: 12,
    purchaseOrders: 5
  }), []);

  // Pre-loaded data for better performance
  const workOrders = useMemo(() => [
    {
      id: 'WO-001',
      title: 'AC Unit Maintenance',
      property: 'Downtown Office Complex',
      status: 'in_progress',
      priority: 'medium',
      technician: 'Mike Wilson',
      scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'WO-002',
      title: 'Emergency Repair',
      property: 'Manufacturing Facility',
      status: 'pending',
      priority: 'high',
      technician: null,
      scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'WO-003',
      title: 'Filter Replacement',
      property: 'Tech Park Building A',
      status: 'completed',
      priority: 'low',
      technician: 'Jennifer Lee',
      scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ], []);

  // Mock data for upcoming maintenance
  const upcomingMaintenance = useMemo(() => [
    {
      id: 1,
      unit_name: 'Rooftop Unit 1',
      property_name: 'Downtown Office Complex',
      maintenance_type: 'Filter Replacement',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      unit_name: 'Main Floor Unit',
      property_name: 'Tech Park Building A',
      maintenance_type: 'Annual Inspection',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ], []);

  // Memoized chart data
  const chartData = useMemo(() => ({
    revenue: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      revenue: [32000, 28000, 41000, 48000, 52000, 68000],
      expenses: [25000, 22000, 30000, 35000, 38000, 45000]
    },
    workOrdersByType: {
      labels: ['Maintenance', 'Repair', 'Installation', 'Inspection', 'Emergency'],
      data: [45, 30, 15, 8, 2]
    }
  }), []);

  // Simplified animation for better performance
  const containerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // In a real app, you would fetch new data based on the time range
  };

  const statCards = useMemo(() => [
    {
      title: 'Properties',
      value: stats.properties,
      icon: FiIcons.FiHome,
      color: 'bg-blue-500',
      change: '+12%',
      path: '/properties'
    },
    {
      title: 'HVAC Units',
      value: stats.hvacUnits,
      icon: FiIcons.FiWind,
      color: 'bg-green-500',
      change: '+8%',
      path: '/hvac-units'
    },
    {
      title: 'Active Work Orders',
      value: stats.activeWorkOrders,
      icon: FiIcons.FiTool,
      color: 'bg-orange-500',
      change: '-5%',
      path: '/work-orders'
    },
    {
      title: 'Purchase Orders',
      value: stats.purchaseOrders,
      icon: FiIcons.FiShoppingCart,
      color: 'bg-purple-500',
      change: '+2 new',
      path: '/purchase-orders',
      highlight: true
    }
  ], [stats]);

  const quickActions = useMemo(() => [
    {
      name: 'New Work Order',
      icon: FiIcons.FiClipboard,
      href: '/work-orders',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      name: 'Add Property',
      icon: FiIcons.FiHome,
      href: '/properties',
      color: 'bg-green-100 text-green-700'
    },
    {
      name: 'Add HVAC Unit',
      icon: FiIcons.FiWind,
      href: '/hvac-units',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      name: 'Add Customer',
      icon: FiIcons.FiUsers,
      href: '/customers',
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      name: 'Create PO',
      icon: FiIcons.FiShoppingCart,
      href: '/purchase-orders/new',
      color: 'bg-indigo-100 text-indigo-700',
      highlight: true
    },
    {
      name: 'View Reports',
      icon: FiIcons.FiBarChart2,
      href: '/reports',
      color: 'bg-red-100 text-red-700'
    }
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {userProfile?.first_name || 'User'}! Here's what's happening with your HVAC business.
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div {...containerAnimation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className={`bg-white rounded-lg shadow-sm border ${
              stat.highlight ? 'border-primary-300' : 'border-gray-200'
            } p-6 hover:shadow-md transition-shadow cursor-pointer ${
              stat.highlight ? 'bg-primary-50/30' : ''
            }`}
            onClick={() => handleNavigate(stat.path)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p
                  className={`text-sm ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...containerAnimation} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs. Expenses</h3>
          <React.Suspense fallback={<div className="h-64 flex items-center justify-center">Loading chart...</div>}>
            <DashboardChart
              type="bar"
              data={{
                labels: chartData.revenue.months,
                datasets: [
                  { label: 'Revenue', data: chartData.revenue.revenue, backgroundColor: '#3b82f6' },
                  { label: 'Expenses', data: chartData.revenue.expenses, backgroundColor: '#ef4444' }
                ]
              }}
            />
          </React.Suspense>
        </motion.div>

        <motion.div {...containerAnimation} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders by Type</h3>
          <React.Suspense fallback={<div className="h-64 flex items-center justify-center">Loading chart...</div>}>
            <DashboardChart
              type="doughnut"
              data={{
                labels: chartData.workOrdersByType.labels,
                datasets: [
                  {
                    data: chartData.workOrdersByType.data,
                    backgroundColor: [
                      '#3b82f6', // Blue
                      '#ef4444', // Red
                      '#10b981', // Green
                      '#f59e0b', // Yellow
                      '#6366f1'  // Indigo
                    ]
                  }
                ]
              }}
            />
          </React.Suspense>
        </motion.div>
      </div>

      {/* Work Orders & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <motion.div
          {...containerAnimation}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Work Orders</h3>
            <button
              onClick={() => handleNavigate('/work-orders')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {workOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleNavigate(`/work-orders/${order.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending'
                            ? 'bg-gray-100 text-gray-800'
                            : order.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.priority === 'low'
                            ? 'bg-green-100 text-green-800'
                            : order.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">{order.title}</p>
                    <p className="text-xs text-gray-500">{order.property}</p>
                    <div className="flex items-center mt-1">
                      <SafeIcon icon={FiIcons.FiCalendar} className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">
                        {new Date(order.scheduled_date).toLocaleDateString()}
                      </p>
                      {order.technician && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <SafeIcon icon={FiIcons.FiUser} className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{order.technician}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <SafeIcon icon={FiIcons.FiChevronRight} className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Calendar & Upcoming */}
        <motion.div
          {...containerAnimation}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Maintenance</h3>
          </div>
          <div className="p-4">
            <React.Suspense fallback={<div className="h-48 flex items-center justify-center">Loading calendar...</div>}>
              <DashboardCalendar workOrders={workOrders} maintenance={upcomingMaintenance} />
            </React.Suspense>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Due Soon</h4>
            <div className="space-y-3">
              {upcomingMaintenance.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className="mt-1">
                    <SafeIcon icon={FiIcons.FiCalendar} className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.maintenance_type}</p>
                    <p className="text-xs text-gray-600">
                      {item.unit_name} at {item.property_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(item.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div {...containerAnimation} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              className={`flex flex-col items-center p-4 rounded-lg hover:shadow-md transition-all ${action.color} ${
                action.highlight ? 'ring-2 ring-primary-300 shadow-sm' : ''
              }`}
              onClick={() => handleNavigate(action.href)}
            >
              <SafeIcon icon={action.icon} className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium text-center">{action.name}</span>
              {action.highlight && (
                <span className="mt-1 px-2 py-0.5 bg-white bg-opacity-70 rounded-full text-xs font-medium">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div {...containerAnimation} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Database', status: 'operational', uptime: '99.9%', icon: FiIcons.FiDatabase, color: 'text-green-500' },
            { name: 'API Services', status: 'operational', uptime: '99.8%', icon: FiIcons.FiServer, color: 'text-green-500' },
            { name: 'Notifications', status: 'operational', uptime: '100%', icon: FiIcons.FiBell, color: 'text-green-500' },
            { name: 'Mobile App', status: 'maintenance', uptime: '95.2%', icon: FiIcons.FiSmartphone, color: 'text-yellow-500' }
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={service.icon} className={`h-5 w-5 ${service.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm ${service.status === 'operational' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {service.status === 'operational' ? 'Operational' : 'Maintenance'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;