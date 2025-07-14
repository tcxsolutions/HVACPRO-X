import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { hasFeature } = useSubscription();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('workOrders');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Mock chart data for demonstration
  const workOrdersData = {
    byStatus: [
      { status: 'completed', count: 45 },
      { status: 'in_progress', count: 18 },
      { status: 'pending', count: 8 },
      { status: 'cancelled', count: 4 }
    ],
    byMonth: [
      { month: 'Jan', completed: 12, created: 15 },
      { month: 'Feb', completed: 15, created: 18 },
      { month: 'Mar', completed: 18, created: 20 },
      { month: 'Apr', completed: 22, created: 25 },
      { month: 'May', completed: 20, created: 22 },
      { month: 'Jun', completed: 25, created: 28 }
    ]
  };

  const revenueData = {
    byMonth: [
      { month: 'Jan', revenue: 32000, expenses: 25000, profit: 7000 },
      { month: 'Feb', revenue: 28000, expenses: 22000, profit: 6000 },
      { month: 'Mar', revenue: 41000, expenses: 30000, profit: 11000 },
      { month: 'Apr', revenue: 48000, expenses: 35000, profit: 13000 },
      { month: 'May', revenue: 52000, expenses: 38000, profit: 14000 },
      { month: 'Jun', revenue: 68000, expenses: 45000, profit: 23000 }
    ]
  };

  const maintenanceData = {
    scheduled: 96,
    emergency: 32,
    preventive: 64,
    upcoming: 12
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  const isAdvancedReporting = hasFeature('advanced_reports');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analyze your HVAC operations and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
            <span>Export</span>
          </button>
          {hasPermission('reports_create') && (
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Custom Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Selection and Date Range */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'workOrders', label: 'Work Orders', icon: FiIcons.FiClipboard },
              { key: 'hvacPerformance', label: 'HVAC Performance', icon: FiIcons.FiActivity },
              { key: 'revenue', label: 'Revenue', icon: FiIcons.FiDollarSign, advanced: true },
              { key: 'maintenance', label: 'Maintenance', icon: FiIcons.FiTool }
            ]
              .filter(report => !report.advanced || isAdvancedReporting)
              .map((report) => (
                <button
                  key={report.key}
                  onClick={() => setSelectedReport(report.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedReport === report.key
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <SafeIcon icon={report.icon} className="h-4 w-4" />
                  <span>{report.label}</span>
                </button>
              ))}
          </div>
          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'workOrders' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Work Orders', value: '75', icon: FiIcons.FiClipboard, color: 'bg-blue-500' },
              { title: 'Completed', value: '45', icon: FiIcons.FiCheckCircle, color: 'bg-green-500' },
              { title: 'In Progress', value: '18', icon: FiIcons.FiTool, color: 'bg-yellow-500' },
              { title: 'Average Completion Time', value: '48h', icon: FiIcons.FiClock, color: 'bg-purple-500' }
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

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders by Status</h3>
              <div className="space-y-3">
                {workOrdersData.byStatus.map((item, index) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in_progress' ? 'bg-yellow-500' :
                        item.status === 'pending' ? 'bg-gray-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders Over Time</h3>
              <div className="space-y-3">
                {workOrdersData.byMonth.map((item, index) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">{item.completed}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">{item.created}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Revenue', value: '$45,320', icon: FiIcons.FiDollarSign, color: 'bg-blue-500' },
              { title: 'Expenses', value: '$28,450', icon: FiIcons.FiCreditCard, color: 'bg-red-500' },
              { title: 'Profit', value: '$16,870', icon: FiIcons.FiTrendingUp, color: 'bg-green-500' },
              { title: 'Avg. Work Order Value', value: '$604', icon: FiIcons.FiFileText, color: 'bg-purple-500' }
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

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue, Expenses & Profit</h3>
            <div className="space-y-4">
              {revenueData.byMonth.map((item, index) => (
                <div key={item.month} className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-900">{item.month}</span>
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">${(item.revenue / 1000)}k</span>
                    <span className="text-gray-500 ml-1">Revenue</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-red-600 font-medium">${(item.expenses / 1000)}k</span>
                    <span className="text-gray-500 ml-1">Expenses</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">${(item.profit / 1000)}k</span>
                    <span className="text-gray-500 ml-1">Profit</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {selectedReport === 'maintenance' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Maintenance', value: '128', icon: FiIcons.FiTool, color: 'bg-blue-500' },
              { title: 'Scheduled', value: '96', icon: FiIcons.FiCalendar, color: 'bg-green-500' },
              { title: 'Emergency Repairs', value: '32', icon: FiIcons.FiAlertTriangle, color: 'bg-red-500' },
              { title: 'Upcoming', value: '12', icon: FiIcons.FiClock, color: 'bg-yellow-500' }
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

          {/* Maintenance Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">By Type</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scheduled</span>
                    <span className="text-sm font-medium">{maintenanceData.scheduled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Emergency</span>
                    <span className="text-sm font-medium">{maintenanceData.emergency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preventive</span>
                    <span className="text-sm font-medium">{maintenanceData.preventive}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Upcoming Tasks</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Filter Replacement</p>
                    <p className="text-xs text-yellow-600">Due in 3 days</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">System Inspection</p>
                    <p className="text-xs text-blue-600">Due in 5 days</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium">2.4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <span className="text-sm font-medium text-green-600">4.8/5</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedReport === 'hvacPerformance' && (
        <div>
          {/* HVAC Performance would be implemented here */}
          <div className="text-center py-12">
            <SafeIcon icon={FiIcons.FiActivity} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">HVAC Performance Report</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Detailed HVAC performance metrics showing efficiency, energy usage, and operational status over time.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.2%</div>
                  <div className="text-sm text-gray-600">System Uptime</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-gray-600">Energy Efficiency</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">72°F</div>
                  <div className="text-sm text-gray-600">Avg Temperature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA for non-advanced users */}
      {!isAdvancedReporting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary-50 border border-primary-200 rounded-lg p-6"
        >
          <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-primary-900">Unlock Advanced Reporting</h3>
              <p className="text-primary-700">Upgrade to Professional or Enterprise plan for detailed analytics and custom reports.</p>
            </div>
            <a
              href="#/billing"
              className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Upgrade Now
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;