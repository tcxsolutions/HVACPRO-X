import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const MaintenanceScheduleTable = ({ maintenanceSchedule }) => {
  const [sortField, setSortField] = useState('due_date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sort the maintenance schedule
  const sortedSchedule = [...maintenanceSchedule].sort((a, b) => {
    if (sortField === 'due_date') {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'vehicle_name') {
      return sortDirection === 'asc' 
        ? a.vehicle_name.localeCompare(b.vehicle_name)
        : b.vehicle_name.localeCompare(a.vehicle_name);
    } else if (sortField === 'service_type') {
      return sortDirection === 'asc'
        ? a.service_type.localeCompare(b.service_type)
        : b.service_type.localeCompare(a.service_type);
    }
    return 0;
  });

  // Paginate the maintenance schedule
  const totalPages = Math.ceil(sortedSchedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedule = sortedSchedule.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isDueSoon = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('vehicle_name')}
              >
                <div className="flex items-center">
                  <span>Vehicle</span>
                  {sortField === 'vehicle_name' && (
                    <SafeIcon 
                      icon={sortDirection === 'asc' ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} 
                      className="ml-1 h-4 w-4" 
                    />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('service_type')}
              >
                <div className="flex items-center">
                  <span>Service Type</span>
                  {sortField === 'service_type' && (
                    <SafeIcon 
                      icon={sortDirection === 'asc' ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} 
                      className="ml-1 h-4 w-4" 
                    />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center">
                  <span>Due Date</span>
                  {sortField === 'due_date' && (
                    <SafeIcon 
                      icon={sortDirection === 'asc' ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} 
                      className="ml-1 h-4 w-4" 
                    />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSchedule.length > 0 ? (
              paginatedSchedule.map((maintenance) => (
                <tr key={maintenance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{maintenance.vehicle_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{maintenance.service_type}</div>
                    <div className="text-xs text-gray-500">{maintenance.assigned_to}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      maintenance.status === 'overdue' 
                        ? 'text-red-600 font-medium' 
                        : isDueSoon(maintenance.due_date) 
                          ? 'text-yellow-600 font-medium' 
                          : 'text-gray-900'
                    }`}>
                      {new Date(maintenance.due_date).toLocaleDateString()}
                    </div>
                    {isDueSoon(maintenance.due_date) && maintenance.status !== 'overdue' && (
                      <div className="text-xs text-yellow-600">Due soon</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{maintenance.estimated_duration}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(maintenance.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Details
                      </button>
                      {maintenance.status !== 'completed' && (
                        <button className="text-green-600 hover:text-green-900">
                          {maintenance.status === 'scheduled' ? 'Start' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No maintenance scheduled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, sortedSchedule.length)}
                </span>{' '}
                of <span className="font-medium">{sortedSchedule.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <SafeIcon icon={FiIcons.FiChevronLeft} className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center border ${
                      currentPage === i + 1
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } px-4 py-2 text-sm font-medium focus:z-20`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <SafeIcon icon={FiIcons.FiChevronRight} className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4 inline mr-2" />
          Export Schedule
        </button>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 inline mr-2" />
          Schedule Maintenance
        </button>
      </div>
    </div>
  );
};

export default MaintenanceScheduleTable;