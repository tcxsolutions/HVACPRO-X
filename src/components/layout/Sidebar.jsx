import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, hasPermission } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiIcons.FiHome },
    { name: 'Properties', href: '/properties', icon: FiIcons.FiMapPin },
    { name: 'HVAC Units', href: '/hvac-units', icon: FiIcons.FiWind },
    { name: 'Work Orders', href: '/work-orders', icon: FiIcons.FiClipboard },
    { name: 'Work Calendar', href: '/work-orders/calendar', icon: FiIcons.FiCalendar },
    { name: 'Customers', href: '/customers', icon: FiIcons.FiUsers },
    { name: 'Fleet Management', href: '/fleet', icon: FiIcons.FiTruck, highlight: true },
    { name: 'Technicians', href: '/technicians', icon: FiIcons.FiTool },
    { 
      name: 'Inventory', 
      href: '/inventory', 
      icon: FiIcons.FiBox, 
      highlight: true,
      submenu: [
        { name: 'Items', href: '/inventory', icon: FiIcons.FiBox },
        { name: 'Transactions', href: '/inventory/transactions', icon: FiIcons.FiRepeat }
      ]
    },
    { name: 'Vendors', href: '/vendors', icon: FiIcons.FiTruck, highlight: true },
    { 
      name: 'Purchase Orders', 
      href: '/purchase-orders', 
      icon: FiIcons.FiShoppingCart, 
      highlight: true
    },
    { 
      name: 'Billing', 
      href: '/billing/invoices', 
      icon: FiIcons.FiDollarSign, 
      submenu: [
        { name: 'Invoices', href: '/billing/invoices', icon: FiIcons.FiFileText },
        { name: 'Subscriptions', href: '/billing/subscriptions', icon: FiIcons.FiCreditCard }
      ]
    },
    { name: 'Reports', href: '/reports', icon: FiIcons.FiBarChart2 },
    { name: 'Settings', href: '/settings', icon: FiIcons.FiSettings }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (href) => {
    console.log('Navigating to:', href);
    navigate(href);
    if (onClose) onClose();
  };

  // Check if a route is active (exact match or submenu)
  const isActive = (item) => {
    if (location.pathname === item.href) return true;
    if (item.submenu && item.submenu.some(subItem => location.pathname === subItem.href)) return true;
    return item.href !== '/dashboard' && location.pathname.startsWith(item.href);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <SafeIcon icon={FiIcons.FiWind} className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">HVAC Pro</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiIcons.FiX} className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.name}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-left
                  ${active ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  ${item.highlight && !active ? 'border border-primary-200 bg-primary-50/30' : ''}
                  ${item.static ? 'cursor-pointer' : ''}
                `}
              >
                <SafeIcon
                  icon={item.icon}
                  className={`h-5 w-5 mr-3 flex-shrink-0 ${active ? 'text-primary-700' : item.highlight ? 'text-primary-600' : 'text-gray-400'}`}
                />
                <span className={`truncate ${item.highlight && !active ? 'text-primary-700 font-medium' : ''}`}>
                  {item.name}
                </span>
                {item.name === 'Purchase Orders' && (
                  <span className="ml-auto bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
                {item.name === 'Fleet Management' && (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    GPS
                  </span>
                )}
                {item.submenu && (
                  <SafeIcon
                    icon={active ? FiIcons.FiChevronUp : FiIcons.FiChevronDown}
                    className="h-4 w-4 ml-auto text-gray-400"
                  />
                )}
              </button>

              {/* Submenu items */}
              {item.submenu && active && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map(subItem => (
                    <button
                      key={subItem.name}
                      onClick={() => handleNavigation(subItem.href)}
                      className={`
                        w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-left
                        ${location.pathname === subItem.href ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                    >
                      <SafeIcon
                        icon={subItem.icon}
                        className={`h-4 w-4 mr-3 flex-shrink-0 ${location.pathname === subItem.href ? 'text-primary-700' : 'text-gray-400'}`}
                      />
                      <span className="truncate">{subItem.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <SafeIcon icon={FiIcons.FiLogOut} className="h-5 w-5 mr-3 text-gray-400" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;