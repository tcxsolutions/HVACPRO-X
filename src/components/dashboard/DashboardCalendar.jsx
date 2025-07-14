import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const DashboardCalendar = ({ workOrders, maintenance }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [events, setEvents] = useState([]);

  // Get days for the current month view
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    
    // Create calendar days array
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ day: i, date });
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  // Combine work orders and maintenance events
  useEffect(() => {
    const allEvents = [
      ...workOrders.map(wo => ({
        id: wo.id,
        title: wo.title,
        date: new Date(wo.scheduled_date),
        type: 'workOrder',
        status: wo.status,
        priority: wo.priority
      })),
      ...maintenance.map(m => ({
        id: `m-${m.id}`,
        title: m.maintenance_type,
        date: new Date(m.due_date),
        type: 'maintenance',
        unit: m.unit_name
      }))
    ];
    
    setEvents(allEvents);
  }, [workOrders, maintenance]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a day has events
  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Format date for display
  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Get CSS classes for day cell
  const getDayClasses = (day, date) => {
    if (!date) return 'bg-gray-50 text-gray-400';
    
    const isToday = new Date().toDateString() === date.toDateString();
    const dayEvents = getEventsForDay(date);
    const hasEvents = dayEvents.length > 0;
    
    let classes = 'relative hover:bg-gray-50 cursor-pointer';
    
    if (isToday) {
      classes += ' bg-blue-50';
    }
    
    if (hasEvents) {
      const hasHighPriority = dayEvents.some(e => e.priority === 'high' || e.priority === 'urgent');
      if (hasHighPriority) {
        classes += ' font-medium';
      }
    }
    
    return classes;
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <SafeIcon icon={FiIcons.FiChevronLeft} className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="text-sm font-medium text-gray-900">
          {formatMonthYear(currentDate)}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <SafeIcon icon={FiIcons.FiChevronRight} className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="py-1 font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 mt-1 text-center text-xs">
        {calendarDays.map((item, i) => {
          const dayEvents = getEventsForDay(item.date);
          return (
            <div 
              key={i}
              className={getDayClasses(item.day, item.date)}
            >
              {item.day && (
                <>
                  <div className="py-1">
                    {item.day}
                  </div>
                  
                  {/* Event indicators */}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
                      {dayEvents.length <= 2 ? (
                        <div className="flex space-x-1">
                          {dayEvents.map((event, idx) => (
                            <div 
                              key={idx} 
                              className={`h-1.5 w-1.5 rounded-full ${
                                event.type === 'workOrder' 
                                  ? event.priority === 'high' 
                                    ? 'bg-red-500' 
                                    : event.priority === 'medium' 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                            ></div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                          <span className="text-[10px] text-gray-500">+{dayEvents.length}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCalendar;