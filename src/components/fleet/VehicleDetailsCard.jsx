import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const VehicleDetailsCard = ({ vehicle, onEdit, onAssign }) => {
  if (!vehicle) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
      transit: 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || statusColors.active;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: 'Active',
      maintenance: 'In Maintenance',
      inactive: 'Inactive',
      transit: 'In Transit'
    };
    return statusLabels[status] || 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
              {getStatusLabel(vehicle.status)}
            </span>
            <span className="text-sm text-gray-500">License: {vehicle.license_plate}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAssign(vehicle)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiUser} className="h-4 w-4" />
            <span>{vehicle.technician ? 'Reassign' : 'Assign'}</span>
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">Assignment</p>
          <p className="font-medium text-gray-900">
            {vehicle.technician ? vehicle.technician.name : 'Unassigned'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">VIN</p>
          <p className="font-medium text-gray-900">{vehicle.vin}</p>
        </div>
        <div>
          <p className="text-gray-500">Mileage</p>
          <p className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} mi</p>
        </div>
        <div>
          <p className="text-gray-500">Next Service</p>
          <p className="font-medium text-gray-900">{vehicle.next_service_due}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fuel History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {vehicle.fuel_history?.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-gray-900">{entry.gallons} gal</span>
                    <span className="text-gray-500 ml-2">${entry.cost.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900">{entry.mileage.toLocaleString()} mi</span>
                    <span className="text-gray-500 ml-2">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Maintenance History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {vehicle.maintenance_history?.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-gray-900">{entry.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900">${entry.cost.toFixed(2)}</span>
                    <span className="text-gray-500 ml-2">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                vehicle.fuel_level > 70 ? 'bg-green-500' : 
                vehicle.fuel_level > 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} 
              style={{ width: `${vehicle.fuel_level}%` }}
            />
          </div>
          <span className="ml-2 text-xs text-gray-500">Fuel: {vehicle.fuel_level}%</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
          >
            <SafeIcon icon={FiIcons.FiClipboard} className="h-3 w-3 inline mr-1" />
            Inspection Report
          </button>
          <button
            className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
          >
            <SafeIcon icon={FiIcons.FiCalendar} className="h-3 w-3 inline mr-1" />
            Schedule Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsCard;