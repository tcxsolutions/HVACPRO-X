import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const RouteOptimizationPanel = ({ enabled, level, onToggle, onLevelChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <SafeIcon 
            icon={FiIcons.FiNavigation} 
            className={`h-6 w-6 ${enabled ? 'text-primary-600' : 'text-gray-400'}`} 
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Technician Route Optimization</h3>
            <p className="text-sm text-gray-500">
              {enabled 
                ? 'Optimizing routes to reduce travel time and fuel consumption' 
                : 'Enable to automatically optimize technician travel routes'}
            </p>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-0 flex items-center space-x-4">
          {enabled && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Optimization Level:</span>
              <select
                value={level}
                onChange={(e) => onLevelChange(e.target.value)}
                className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="efficient">Efficient (Prioritize Fuel)</option>
                <option value="balanced">Balanced</option>
                <option value="responsive">Responsive (Prioritize Time)</option>
              </select>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              enabled ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span className="sr-only">
              {enabled ? 'Disable route optimization' : 'Enable route optimization'}
            </span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      
      {enabled && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiClock} className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Time Saved Today</span>
              </div>
              <span className="text-lg font-bold text-green-600">2.5 hrs</span>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiMap} className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Distance Saved</span>
              </div>
              <span className="text-lg font-bold text-blue-600">47 mi</span>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiDollarSign} className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Fuel Cost Reduction</span>
              </div>
              <span className="text-lg font-bold text-purple-600">$32.40</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimizationPanel;