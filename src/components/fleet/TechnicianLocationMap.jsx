import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

// This is a mock map component since we can't integrate actual maps directly
// In a real application, you would use libraries like Google Maps, Mapbox, or Leaflet
const TechnicianLocationMap = ({ technicians, vehicles }) => {
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!mapReady) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }
  
  // In a real application, this would render an actual map with markers
  return (
    <div className="relative h-full bg-gray-100 overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.0060,40.7128,11,0/1200x600?access_token=pk.mock')] bg-cover bg-center opacity-60"></div>
      
      {/* Interactive Overlay */}
      <div className="absolute inset-0">
        {/* Technician Markers */}
        {technicians.map(tech => {
          const vehicle = vehicles.find(v => v.id === tech.assigned_vehicle_id);
          const statusColor = 
            tech.status === 'active' ? 'bg-green-500' : 
            tech.status === 'on_job' ? 'bg-yellow-500' : 
            'bg-red-500';
            
          // Calculate position based on lat/lng (in a real map, this would be handled by the mapping library)
          const left = `${((tech.current_location.lng + 74.01) * 200) % 90 + 5}%`;
          const top = `${((tech.current_location.lat - 40.7) * 500) % 80 + 10}%`;
          
          return (
            <div 
              key={tech.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left, top }}
              onClick={() => setSelectedTechnician(tech)}
            >
              <div className={`w-5 h-5 rounded-full ${statusColor} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold`}>
                {tech.id}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                {tech.name}
              </div>
            </div>
          );
        })}
        
        {/* Vehicle Markers (for unassigned vehicles) */}
        {vehicles.filter(v => !technicians.some(t => t.assigned_vehicle_id === v.id) && v.current_location).map(vehicle => {
          // Calculate position based on lat/lng
          const left = `${((vehicle.current_location.lng + 74.02) * 200) % 85 + 10}%`;
          const top = `${((vehicle.current_location.lat - 40.71) * 500) % 75 + 15}%`;
          
          return (
            <div 
              key={`vehicle-${vehicle.id}`}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
            >
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiTruck} className="h-3 w-3 text-white" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                {vehicle.license_plate}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Technician Info Panel */}
      {selectedTechnician && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 z-20">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <span className="text-primary-700 font-medium">{selectedTechnician.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <h4 className="font-medium">{selectedTechnician.name}</h4>
                <p className="text-xs text-gray-600">{selectedTechnician.role}</p>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedTechnician(null)}
            >
              <SafeIcon icon={FiIcons.FiX} className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-3 text-sm">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-gray-500">Current Stop:</span>
                <p className="font-medium">{selectedTechnician.current_route.current_stop.address}</p>
                <p className="text-xs text-gray-500">Arrived: {selectedTechnician.current_route.current_stop.arrival_time}</p>
              </div>
              <div>
                <span className="text-gray-500">Next Stop:</span>
                <p className="font-medium">{selectedTechnician.current_route.next_stop.address}</p>
                <p className="text-xs text-gray-500">ETA: {selectedTechnician.current_route.next_stop.estimated_arrival}</p>
              </div>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
              <span>Remaining stops: {selectedTechnician.current_route.remaining_stops}</span>
              <button className="text-primary-600 text-sm hover:text-primary-800">
                View Route
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between">
            <button className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">
              <SafeIcon icon={FiIcons.FiPhone} className="h-3 w-3 inline mr-1" />
              Call
            </button>
            <button className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">
              <SafeIcon icon={FiIcons.FiMessageSquare} className="h-3 w-3 inline mr-1" />
              Message
            </button>
            <button className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">
              <SafeIcon icon={FiIcons.FiCalendar} className="h-3 w-3 inline mr-1" />
              Schedule
            </button>
            <button className="px-2 py-1 bg-primary-100 rounded text-xs text-primary-700 hover:bg-primary-200">
              <SafeIcon icon={FiIcons.FiNavigation} className="h-3 w-3 inline mr-1" />
              Navigate
            </button>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 z-10">
        <button className="p-2 hover:bg-gray-100 rounded">
          <SafeIcon icon={FiIcons.FiPlus} className="h-5 w-5 text-gray-700" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <SafeIcon icon={FiIcons.FiMinus} className="h-5 w-5 text-gray-700" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <SafeIcon icon={FiIcons.FiCrosshair} className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
        <div className="text-xs font-medium mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs">Active Technician</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-xs">On Job</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs">Unassigned Vehicle</span>
          </div>
        </div>
      </div>
      
      {/* Map Attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-600 bg-white bg-opacity-75 px-1 rounded">
        Map data © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default TechnicianLocationMap;