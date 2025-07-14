import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const FuelUsageChart = ({ vehicles }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [chartReady, setChartReady] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [totalFuelCost, setTotalFuelCost] = useState(0);
  const [averageMPG, setAverageMPG] = useState(0);
  
  // Extract all fuel history
  useEffect(() => {
    // Simulate chart loading
    const timer = setTimeout(() => {
      setChartReady(true);
      
      // Calculate total fuel cost
      let totalCost = 0;
      let totalGallons = 0;
      let totalMiles = 0;
      let previousMileage = {};
      
      vehicles.forEach(vehicle => {
        if (!vehicle.fuel_history || vehicle.fuel_history.length === 0) return;
        
        // Sort fuel history by date
        const sortedHistory = [...vehicle.fuel_history].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        sortedHistory.forEach((entry, index) => {
          totalCost += entry.cost;
          totalGallons += entry.gallons;
          
          // Calculate miles driven if we have a previous mileage reading
          if (previousMileage[vehicle.id] && entry.mileage > previousMileage[vehicle.id]) {
            totalMiles += (entry.mileage - previousMileage[vehicle.id]);
          }
          
          previousMileage[vehicle.id] = entry.mileage;
        });
      });
      
      setTotalFuelCost(totalCost);
      
      // Calculate average MPG
      if (totalGallons > 0 && totalMiles > 0) {
        setAverageMPG(totalMiles / totalGallons);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [vehicles, selectedVehicle, timeRange]);
  
  if (!chartReady) {
    return (
      <div className="h-64 flex items-center justify-center">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 ml-3">Generating fuel usage analytics...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle
          </label>
          <select
            id="vehicle-select"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Fuel Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalFuelCost.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiDollarSign} className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Average MPG</p>
              <p className="text-2xl font-bold text-gray-900">{averageMPG.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiActivity} className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Carbon Footprint</p>
              <p className="text-2xl font-bold text-gray-900">2.4 tons</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiCloud} className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="h-64 relative">
          {/* This is a mock chart - in a real app, you would use a charting library */}
          <div className="absolute inset-0">
            {/* Mock chart bars - in a real app this would be a proper chart */}
            <div className="h-full flex items-end justify-around px-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                <div key={month} className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${Math.random() * 100 + 50}px` }}
                    ></div>
                    <div 
                      className="w-8 bg-green-500 rounded-t"
                      style={{ height: `${Math.random() * 100 + 30}px` }}
                    ></div>
                  </div>
                  <div className="text-xs mt-2 text-gray-600">{month}</div>
                </div>
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-4">
              <div className="text-xs text-gray-500">$400</div>
              <div className="text-xs text-gray-500">$300</div>
              <div className="text-xs text-gray-500">$200</div>
              <div className="text-xs text-gray-500">$100</div>
              <div className="text-xs text-gray-500">$0</div>
            </div>
            
            {/* Chart legend */}
            <div className="absolute top-0 right-0 flex items-center space-x-4 p-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">Fuel Cost</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">MPG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fuel Efficiency Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fuel Efficiency Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performing Vehicles</h4>
            <div className="space-y-3">
              {vehicles.slice(0, 3).map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </p>
                    <p className="text-xs text-gray-500">
                      {(Math.random() * 5 + 15).toFixed(1)} MPG Average
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    +{(Math.random() * 10).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Efficiency Recommendations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-sm font-medium text-gray-900">
                  <SafeIcon icon={FiIcons.FiAlertCircle} className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Maintenance Reminder
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Schedule tire pressure check for all vehicles to improve fuel efficiency.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="text-sm font-medium text-gray-900">
                  <SafeIcon icon={FiIcons.FiTrendingUp} className="h-4 w-4 inline mr-1 text-green-500" />
                  Route Optimization
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Optimizing technician routes could save up to 12% in fuel costs.
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                <p className="text-sm font-medium text-gray-900">
                  <SafeIcon icon={FiIcons.FiTruck} className="h-4 w-4 inline mr-1 text-red-500" />
                  Vehicle Alert
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Nissan NV200 (HVC-3456) shows 15% decrease in fuel efficiency. Inspection recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4 inline mr-2" />
          Export Report
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          <SafeIcon icon={FiIcons.FiPrinter} className="h-4 w-4 inline mr-2" />
          Print
        </button>
      </div>
    </div>
  );
};

export default FuelUsageChart;