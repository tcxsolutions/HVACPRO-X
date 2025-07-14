import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const WorkOrderCalendarWeek = ({ 
  currentDate, 
  workOrders, 
  technicians, 
  onOrderClick, 
  onDateClick,
  onOrderDrop,
  filters 
}) => {
  const [weekDays, setWeekDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    generateWeekDays();
    generateTimeSlots();
  }, [currentDate]);

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    setWeekDays(days);
  };

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

  const getOrdersForDateTime = (date, hour) => {
    return workOrders.filter(order => {
      const orderDate = new Date(order.scheduled_date);
      const orderHour = parseInt(order.scheduled_time.split(':')[0]);
      
      return (
        orderDate.toDateString() === date.toDateString() &&
        orderHour === hour &&
        matchesFilters(order)
      );
    });
  };

  const matchesFilters = (order) => {
    if (filters.technician !== 'all' && order.technician_id?.toString() !== filters.technician) return false;
    if (filters.priority !== 'all' && order.priority !== filters.priority) return false;
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.property !== 'all' && order.property_id?.toString() !== filters.property) return false;
    return true;
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

  const getPriorityBorder = (priority) => {
    const priorityBorders = {
      low: 'border-l-green-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-red-500',
      urgent: 'border-l-red-600'
    };
    return priorityBorders[priority] || 'border-l-gray-500';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, date, hour) => {
    e.preventDefault();
    const orderData = JSON.parse(e.dataTransfer.getData('application/json'));
    const newDateTime = new Date(date);
    newDateTime.setHours(hour, 0, 0, 0);
    
    onOrderDrop(orderData, newDateTime);
  };

  const handleDragStart = (e, order) => {
    e.dataTransfer.setData('application/json', JSON.stringify(order));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
        <div className="p-3 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-700">Time</span>
        </div>
        {weekDays.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={index} className="p-3 text-center border-r border-gray-200">
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {date.toLocaleDateString('default', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Body */}
      <div className="max-h-[600px] overflow-y-auto">
        {timeSlots.map((slot) => (
          <div key={slot.time} className="grid grid-cols-8 border-b border-gray-100">
            {/* Time Column */}
            <div className="p-2 border-r border-gray-200 text-xs text-gray-500 text-center bg-gray-50">
              {slot.time}
            </div>
            
            {/* Day Columns */}
            {weekDays.map((date, dayIndex) => {
              const orders = getOrdersForDateTime(date, slot.hour);
              
              return (
                <div
                  key={dayIndex}
                  className="min-h-[60px] p-1 border-r border-gray-200 hover:bg-gray-50 cursor-pointer relative"
                  onClick={() => onDateClick(date, slot.hour)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date, slot.hour)}
                >
                  {orders.map((order, orderIndex) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-xs p-1 mb-1 rounded cursor-pointer border-l-2 ${getPriorityBorder(order.priority)} bg-white shadow-sm hover:shadow-md transition-shadow relative`}
                      style={{ 
                        backgroundColor: order.technician?.color + '15',
                        height: `${Math.min(order.estimated_duration * 15, 45)}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderClick(order);
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate text-xs">{order.title}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status)}`}></div>
                      </div>
                      
                      {order.estimated_duration > 1 && (
                        <div className="text-gray-600 truncate text-xs">
                          {order.property.name}
                        </div>
                      )}
                      
                      {order.technician && order.estimated_duration > 2 && (
                        <div className="text-gray-600 truncate text-xs">
                          {order.technician.name}
                        </div>
                      )}
                      
                      {/* Duration indicator */}
                      <div className="absolute right-1 bottom-1 text-xs text-gray-400">
                        {order.estimated_duration}h
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkOrderCalendarWeek;