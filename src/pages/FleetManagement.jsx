import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TechnicianLocationMap from '../components/fleet/TechnicianLocationMap';
import VehicleDetailsCard from '../components/fleet/VehicleDetailsCard';
import MaintenanceScheduleTable from '../components/fleet/MaintenanceScheduleTable';
import FuelUsageChart from '../components/fleet/FuelUsageChart';
import RouteOptimizationPanel from '../components/fleet/RouteOptimizationPanel';

const FleetManagement = () => {
  const { userProfile, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFormData, setVehicleFormData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    status: 'active',
    fuel_type: 'gasoline',
    last_serviced_date: '',
    next_service_due: '',
    mileage: '',
    notes: ''
  });
  const [assignFormData, setAssignFormData] = useState({
    vehicle_id: '',
    technician_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [routeOptimization, setRouteOptimization] = useState({
    enabled: false,
    optimizationLevel: 'balanced'
  });

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data for vehicles
      const mockVehicles = [
        {
          id: 1,
          make: 'Ford',
          model: 'Transit',
          year: '2022',
          license_plate: 'HVC-1234',
          vin: '1FTBF2B69NEA01234',
          status: 'active',
          fuel_type: 'gasoline',
          last_serviced_date: '2024-02-15',
          next_service_due: '2024-05-15',
          mileage: 12500,
          current_location: { lat: 40.7128, lng: -74.0060 },
          fuel_level: 75,
          assigned_to: 1,
          technician: {
            id: 1,
            name: 'Mike Wilson'
          },
          maintenance_history: [
            { date: '2024-02-15', type: 'Oil Change', mileage: 10000, cost: 85.50 },
            { date: '2023-11-10', type: 'Tire Rotation', mileage: 7500, cost: 60.00 }
          ],
          fuel_history: [
            { date: '2024-03-10', gallons: 15.5, cost: 52.70, mileage: 12000 },
            { date: '2024-02-25', gallons: 14.8, cost: 50.32, mileage: 11500 }
          ]
        },
        {
          id: 2,
          make: 'Chevrolet',
          model: 'Express',
          year: '2021',
          license_plate: 'HVC-5678',
          vin: '1GCWGBFG7M1234567',
          status: 'maintenance',
          fuel_type: 'diesel',
          last_serviced_date: '2024-01-20',
          next_service_due: '2024-04-20',
          mileage: 18750,
          current_location: { lat: 40.7306, lng: -73.9352 },
          fuel_level: 45,
          assigned_to: 2,
          technician: {
            id: 2,
            name: 'Jennifer Lee'
          },
          maintenance_history: [
            { date: '2024-01-20', type: 'Brake Service', mileage: 17500, cost: 225.00 },
            { date: '2023-10-05', type: 'Oil Change', mileage: 15000, cost: 95.00 }
          ],
          fuel_history: [
            { date: '2024-03-05', gallons: 18.2, cost: 73.90, mileage: 18500 },
            { date: '2024-02-15', gallons: 17.5, cost: 71.05, mileage: 17800 }
          ]
        },
        {
          id: 3,
          make: 'Ram',
          model: 'ProMaster',
          year: '2023',
          license_plate: 'HVC-9012',
          vin: '3C6TRVDG7PE123456',
          status: 'active',
          fuel_type: 'gasoline',
          last_serviced_date: '2024-03-01',
          next_service_due: '2024-06-01',
          mileage: 5800,
          current_location: { lat: 40.6782, lng: -73.9442 },
          fuel_level: 85,
          assigned_to: 3,
          technician: {
            id: 3,
            name: 'David Rodriguez'
          },
          maintenance_history: [
            { date: '2024-03-01', type: 'Initial Service', mileage: 5000, cost: 150.00 }
          ],
          fuel_history: [
            { date: '2024-03-12', gallons: 16.2, cost: 55.08, mileage: 5700 },
            { date: '2024-02-28', gallons: 15.8, cost: 53.72, mileage: 5200 }
          ]
        },
        {
          id: 4,
          make: 'Nissan',
          model: 'NV200',
          year: '2020',
          license_plate: 'HVC-3456',
          vin: '1N6BF0KM8LN123456',
          status: 'inactive',
          fuel_type: 'gasoline',
          last_serviced_date: '2023-12-15',
          next_service_due: '2024-03-15',
          mileage: 32500,
          current_location: null,
          fuel_level: 25,
          assigned_to: null,
          technician: null,
          maintenance_history: [
            { date: '2023-12-15', type: 'Transmission Service', mileage: 30000, cost: 320.00 },
            { date: '2023-09-20', type: 'Oil Change', mileage: 27500, cost: 85.00 }
          ],
          fuel_history: [
            { date: '2024-01-10', gallons: 12.5, cost: 42.50, mileage: 32000 },
            { date: '2023-12-20', gallons: 13.2, cost: 44.88, mileage: 31000 }
          ]
        }
      ];
      setVehicles(mockVehicles);

      // Mock technicians - using the ones from the existing system
      const mockTechnicians = [
        {
          id: 1,
          name: 'Mike Wilson',
          email: 'mike.wilson@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 123-7890', type: 'work', isPrimary: true },
            { number: '(555) 123-7891', type: 'mobile', isPrimary: false }
          ],
          role: 'senior',
          status: 'active',
          current_location: { lat: 40.7128, lng: -74.0060 },
          assigned_vehicle_id: 1,
          current_route: {
            current_stop: { address: '123 Business Ave, New York, NY', arrival_time: '10:30 AM' },
            next_stop: { address: '456 Commerce St, New York, NY', estimated_arrival: '11:15 AM' },
            remaining_stops: 3
          }
        },
        {
          id: 2,
          name: 'Jennifer Lee',
          email: 'jennifer.lee@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 456-7890', type: 'work', isPrimary: true },
            { number: '(555) 456-7891', type: 'mobile', isPrimary: false }
          ],
          role: 'technician',
          status: 'on_job',
          current_location: { lat: 40.7306, lng: -73.9352 },
          assigned_vehicle_id: 2,
          current_route: {
            current_stop: { address: '789 Industrial Pkwy, Brooklyn, NY', arrival_time: '9:45 AM' },
            next_stop: { address: '321 Factory Rd, Brooklyn, NY', estimated_arrival: '11:30 AM' },
            remaining_stops: 2
          }
        },
        {
          id: 3,
          name: 'David Rodriguez',
          email: 'david.rodriguez@hvacpro.com',
          phoneNumbers: [
            { number: '(555) 789-1234', type: 'work', isPrimary: true }
          ],
          role: 'apprentice',
          status: 'available',
          current_location: { lat: 40.6782, lng: -73.9442 },
          assigned_vehicle_id: 3,
          current_route: {
            current_stop: { address: '555 Tech Park, Queens, NY', arrival_time: '10:15 AM' },
            next_stop: { address: '777 Innovation Way, Queens, NY', estimated_arrival: '12:00 PM' },
            remaining_stops: 1
          }
        }
      ];
      setTechnicians(mockTechnicians);

      // Mock maintenance schedule
      const mockMaintenanceSchedule = [
        {
          id: 1,
          vehicle_id: 1,
          vehicle_name: 'Ford Transit (HVC-1234)',
          service_type: 'Oil Change',
          due_date: '2024-05-15',
          estimated_duration: 1,
          status: 'scheduled',
          assigned_to: 'Service Center A'
        },
        {
          id: 2,
          vehicle_id: 2,
          vehicle_name: 'Chevrolet Express (HVC-5678)',
          service_type: 'Brake Inspection',
          due_date: '2024-04-20',
          estimated_duration: 2,
          status: 'scheduled',
          assigned_to: 'Service Center B'
        },
        {
          id: 3,
          vehicle_id: 3,
          vehicle_name: 'Ram ProMaster (HVC-9012)',
          service_type: 'Tire Rotation',
          due_date: '2024-05-01',
          estimated_duration: 1,
          status: 'scheduled',
          assigned_to: 'Service Center A'
        },
        {
          id: 4,
          vehicle_id: 4,
          vehicle_name: 'Nissan NV200 (HVC-3456)',
          service_type: 'Full Inspection',
          due_date: '2024-03-15',
          estimated_duration: 3,
          status: 'overdue',
          assigned_to: 'Service Center C'
        }
      ];
      setMaintenanceSchedule(mockMaintenanceSchedule);

    } catch (error) {
      console.error('Error loading fleet data:', error);
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setVehicleFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vin: vehicle.vin,
        status: vehicle.status,
        fuel_type: vehicle.fuel_type,
        last_serviced_date: vehicle.last_serviced_date,
        next_service_due: vehicle.next_service_due,
        mileage: vehicle.mileage.toString(),
        notes: vehicle.notes || ''
      });
    } else {
      setSelectedVehicle(null);
      setVehicleFormData({
        make: '',
        model: '',
        year: '',
        license_plate: '',
        vin: '',
        status: 'active',
        fuel_type: 'gasoline',
        last_serviced_date: '',
        next_service_due: '',
        mileage: '',
        notes: ''
      });
    }
    setShowVehicleModal(true);
  };

  const handleOpenAssignModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setAssignFormData({
        vehicle_id: vehicle.id,
        technician_id: vehicle.assigned_to || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
    } else {
      setAssignFormData({
        vehicle_id: '',
        technician_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
    }
    setShowAssignModal(true);
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const vehicleData = {
        ...vehicleFormData,
        mileage: parseInt(vehicleFormData.mileage)
      };

      if (selectedVehicle) {
        // Update existing vehicle
        const updatedVehicles = vehicles.map(v => 
          v.id === selectedVehicle.id ? { ...v, ...vehicleData } : v
        );
        setVehicles(updatedVehicles);
        toast.success('Vehicle updated successfully!');
      } else {
        // Create new vehicle
        const newVehicle = {
          id: Date.now(),
          ...vehicleData,
          current_location: null,
          fuel_level: 100,
          assigned_to: null,
          technician: null,
          maintenance_history: [],
          fuel_history: []
        };
        setVehicles([...vehicles, newVehicle]);
        toast.success('Vehicle added successfully!');
      }
      setShowVehicleModal(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { vehicle_id, technician_id } = assignFormData;
      
      // Update vehicle assignment
      const updatedVehicles = vehicles.map(vehicle => {
        if (vehicle.id === parseInt(vehicle_id)) {
          const assignedTech = technician_id 
            ? technicians.find(t => t.id === parseInt(technician_id)) 
            : null;
            
          return {
            ...vehicle,
            assigned_to: technician_id ? parseInt(technician_id) : null,
            technician: assignedTech ? {
              id: assignedTech.id,
              name: assignedTech.name
            } : null
          };
        }
        return vehicle;
      });
      
      // Update technician vehicle assignment
      const updatedTechnicians = technicians.map(tech => {
        if (tech.id === parseInt(technician_id)) {
          return {
            ...tech,
            assigned_vehicle_id: parseInt(vehicle_id)
          };
        } else if (tech.assigned_vehicle_id === parseInt(vehicle_id)) {
          // Remove assignment from any technician that had this vehicle
          return {
            ...tech,
            assigned_vehicle_id: null
          };
        }
        return tech;
      });
      
      setVehicles(updatedVehicles);
      setTechnicians(updatedTechnicians);
      
      toast.success('Vehicle assignment updated successfully!');
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast.error('Failed to assign vehicle');
    } finally {
      setLoading(false);
    }
  };

  const toggleRouteOptimization = () => {
    setRouteOptimization(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    
    toast.success(
      routeOptimization.enabled 
        ? 'Route optimization disabled' 
        : 'Route optimization enabled'
    );
  };

  const changeOptimizationLevel = (level) => {
    setRouteOptimization(prev => ({
      ...prev,
      optimizationLevel: level
    }));
    
    toast.success(`Optimization level set to ${level}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'In Maintenance' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive' },
      transit: { color: 'bg-blue-100 text-blue-800', label: 'In Transit' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter vehicles based on search and status filter
  const filteredVehicles = vehicles.filter(vehicle => {
    if (filterStatus !== 'all' && vehicle.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.license_plate.toLowerCase().includes(query) ||
        vehicle.vin.toLowerCase().includes(query) ||
        (vehicle.technician && vehicle.technician.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (loading && vehicles.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Track and manage your vehicle fleet and technician locations</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <SafeIcon icon={viewMode === 'list' ? FiIcons.FiMap : FiIcons.FiList} className="h-4 w-4" />
            <span>{viewMode === 'list' ? 'Map View' : 'List View'}</span>
          </button>
          {hasPermission('fleet_management_create') && (
            <button
              onClick={() => handleOpenVehicleModal()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Vehicles', value: vehicles.length.toString(), icon: FiIcons.FiTruck, color: 'bg-blue-500' },
          { title: 'Active', value: vehicles.filter(v => v.status === 'active').length.toString(), icon: FiIcons.FiCheckCircle, color: 'bg-green-500' },
          { title: 'In Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length.toString(), icon: FiIcons.FiTool, color: 'bg-yellow-500' },
          { title: 'Unassigned', value: vehicles.filter(v => !v.assigned_to).length.toString(), icon: FiIcons.FiAlertCircle, color: 'bg-purple-500' }
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('maintenance')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              In Maintenance
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Inactive
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Route Optimization Panel */}
      <RouteOptimizationPanel 
        enabled={routeOptimization.enabled}
        level={routeOptimization.optimizationLevel}
        onToggle={toggleRouteOptimization}
        onLevelChange={changeOptimizationLevel}
      />

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <h3 className="text-lg font-medium text-gray-900">Technician & Vehicle Locations</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">On Job</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
          <div className="h-[600px]">
            <TechnicianLocationMap 
              technicians={technicians} 
              vehicles={vehicles}
            />
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiIcons.FiTruck} className="h-6 w-6 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(vehicle.status)}
                    <span className="text-sm text-gray-500">License: {vehicle.license_plate}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3 md:mt-0">
                  <button
                    onClick={() => handleOpenAssignModal(vehicle)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiIcons.FiUser} className="h-4 w-4" />
                    <span>{vehicle.technician ? 'Reassign' : 'Assign'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenVehicleModal(vehicle)}
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

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 mb-3 md:mb-0">
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
                  <div className="text-xs text-gray-500">
                    {vehicle.current_location ? 'GPS Active' : 'GPS Inactive'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      // In a real app, navigate to detailed view or show modal with detailed info
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      // In a real app, navigate to maintenance history
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                  >
                    Maintenance History
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      // In a real app, schedule maintenance
                    }}
                    className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
                  >
                    Schedule Service
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <SafeIcon icon={FiIcons.FiTruck} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all'
                  ? 'No vehicles match your search criteria'
                  : 'No vehicles have been added yet'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Schedule Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Vehicle Maintenance Schedule</h3>
        </div>
        <div className="p-6">
          <MaintenanceScheduleTable 
            maintenanceSchedule={maintenanceSchedule} 
          />
        </div>
      </div>

      {/* Fuel Usage Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fuel Usage Analytics</h3>
        </div>
        <div className="p-6">
          <FuelUsageChart vehicles={vehicles} />
        </div>
      </div>

      {/* Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <form onSubmit={handleVehicleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Make</label>
              <input
                type="text"
                required
                value={vehicleFormData.make}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, make: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                required
                value={vehicleFormData.model}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="text"
                required
                value={vehicleFormData.year}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License Plate</label>
              <input
                type="text"
                required
                value={vehicleFormData.license_plate}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, license_plate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">VIN</label>
            <input
              type="text"
              required
              value={vehicleFormData.vin}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, vin: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                required
                value={vehicleFormData.status}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, status: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="active">Active</option>
                <option value="maintenance">In Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="transit">In Transit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <select
                required
                value={vehicleFormData.fuel_type}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, fuel_type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Serviced Date</label>
              <input
                type="date"
                value={vehicleFormData.last_serviced_date}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, last_serviced_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Next Service Due</label>
              <input
                type="date"
                value={vehicleFormData.next_service_due}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, next_service_due: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mileage</label>
            <input
              type="number"
              required
              value={vehicleFormData.mileage}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, mileage: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows="3"
              value={vehicleFormData.notes}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, notes: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowVehicleModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
              <span>{selectedVehicle ? 'Update' : 'Add'} Vehicle</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Vehicle to Technician"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              required
              value={assignFormData.vehicle_id}
              onChange={(e) => setAssignFormData({ ...assignFormData, vehicle_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={!!selectedVehicle}
            >
              <option value="">Select Vehicle</option>
              {vehicles
                .filter(v => v.status === 'active')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} ({v.license_plate})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Technician</label>
            <select
              value={assignFormData.technician_id}
              onChange={(e) => setAssignFormData({ ...assignFormData, technician_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Unassigned</option>
              {technicians
                .filter(t => t.status !== 'inactive')
                .map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.role})
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                required
                value={assignFormData.start_date}
                onChange={(e) => setAssignFormData({ ...assignFormData, start_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input
                type="date"
                value={assignFormData.end_date}
                onChange={(e) => setAssignFormData({ ...assignFormData, end_date: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows="3"
              value={assignFormData.notes}
              onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes about this assignment..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
              <span>{assignFormData.technician_id ? 'Assign' : 'Unassign'} Vehicle</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FleetManagement;