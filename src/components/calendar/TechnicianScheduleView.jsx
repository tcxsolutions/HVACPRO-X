import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const TechnicianScheduleView = ({ 
  workOrders, 
  technicians, 
  currentDate,
  onOrderClick,
  onOrderDrop
}) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    generateTimeSlots();
    organizeScheduleData();
  }, [workOrders, technicians, currentDate]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 20; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
    setTimeSlots(slots);
  };

  const organizeScheduleData = () => {
    const today = currentDate.toDateString();
    
    const scheduleByTechnician = technicians.map(technician => {
      const techOrders = workOrders.filter(order => 
        order.technician_id === technician.id &&
        new Date(order.scheduled_date).toDateString() === today
      );
      
      return {
        technician,
        orders: techOrders,
        workload: techOrders.reduce((total, order) => total + order.estimated_duration, 0)
      };
    });

    setScheduleData(scheduleByTechnician);
  };

  const getOrdersForTechnicianAtTime = (technicianId, hour) => {
    return workOrders.filter(order => {
      const orderDate = new Date(order.scheduled_date);
      const orderHour = parseInt(order.scheduled_time.split(':')[0]);
      
      return (
        order.technician_id === technicianId &&
        orderDate.toDateString() === currentDate.toDateString() &&
        orderHour <= hour &&
        orderHour + order.estimated_duration > hour
      );
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getWorkloadColor = (workload) => {
    if (workload <= 4) return 'text-green-600';
    if (workload <= 6) return 'text-yellow-600';
    if (workload <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, technicianId, hour) => {
    e.preventDefault();
    const orderData = JSON.parse(e.dataTransfer.getData('application/json'));
    const newDateTime = new Date(currentDate);
    newDateTime.setHours(hour, 0, 0, 0);
    
    // Update technician assignment
    onOrderDrop({
      ...orderData,
      technician_id: technicianId
    }, newDateTime);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Technician Schedule - {currentDate.toLocaleDateString('default', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="text-sm text-gray-600">
            Total Technicians: {technicians.length}
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        {scheduleData.map((techData) => (
          <motion.div
            key={techData.technician.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Technician Header */}
            <div 
              className="p-3 text-white font-medium"
              style={{ backgroundColor: techData.technician.color }}
            >
              <div className="flex items-center justify-between">
                <span>{techData.technician.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full bg-white bg-opacity-20`}>
                    {techData.orders.length} orders
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-white bg-opacity-20`}>
                    {techData.workload}h
                  </span>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => {
                const ordersAtTime = getOrdersForTechnicianAtTime(techData.technician.id, slot.hour);
                
                return (
                  <div
                    key={slot.time}
                    className="flex border-b border-gray-100 min-h-[50px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, techData.technician.id, slot.hour)}
                  >
                    {/* Time Column */}
                    <div className="w-16 p-2 bg-gray-50 text-xs text-gray-500 text-center border-r border-gray-200">
                      {slot.time}
                    </div>
                    
                    {/* Orders Column */}
                    <div className="flex-1 p-2 hover:bg-gray-50">
                      {ordersAtTime.map((order) => (
                        <div
                          key={order.id}
                          className="mb-1 p-2 rounded border-l-2 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          style={{ 
                            borderLeftColor: techData.technician.color,
                            backgroundColor: techData.technician.color + '10'
                          }}
                          onClick={() => onOrderClick(order)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900 truncate">
                              {order.title}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                          </div>
                          
                          <div className="text-xs text-gray-600 truncate">
                            {order.property.name}
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {order.scheduled_time} - {order.estimated_duration}h
                            </span>
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              order.priority === 'high' || order.priority === 'urgent' 
                                ? 'bg-red-100 text-red-700'
                                : order.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {order.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {ordersAtTime.length === 0 && (
                        <div className="text-xs text-gray-400 italic p-2">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Technician Summary */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Daily Workload:</span>
                <span className={`font-medium ${getWorkloadColor(techData.workload)}`}>
                  {techData.workload}/8 hours
                </span>
              </div>
              
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    techData.workload <= 4 ? 'bg-green-500' :
                    techData.workload <= 6 ? 'bg-yellow-500' :
                    techData.workload <= 8 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((techData.workload / 8) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unassigned Orders */}
      {workOrders.filter(order => !order.technician_id && 
        new Date(order.scheduled_date).toDateString() === currentDate.toDateString()
      ).length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Unassigned Work Orders</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {workOrders
              .filter(order => !order.technician_id && 
                new Date(order.scheduled_date).toDateString() === currentDate.toDateString()
              )
              .map((order) => (
                <div
                  key={order.id}
                  className="p-2 border border-gray-200 rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => onOrderClick(order)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(order));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {order.title}
                    </span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      order.priority === 'high' || order.priority === 'urgent' 
                        ? 'bg-red-100 text-red-700'
                        : order.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {order.scheduled_time} - {order.estimated_duration}h
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianScheduleView;