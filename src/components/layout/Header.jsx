import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { userProfile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = () => {
    if (!userProfile) return 'U';
    
    const firstName = userProfile.first_name || '';
    const lastName = userProfile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={onMenuClick} 
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <SafeIcon icon={FiIcons.FiMenu} className="h-6 w-6" />
            </button>
            
            {/* Breadcrumb or page title could go here */}
            <div className="hidden lg:block ml-4">
              <h1 className="text-lg font-medium text-gray-900">
                HVAC Management System
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 text-gray-400 hover:text-gray-500 relative focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <SafeIcon icon={FiIcons.FiBell} className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="py-1 divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">Notifications</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Low inventory alert</p>
                            <p className="text-sm text-gray-500">5 items are below minimum stock level</p>
                            <p className="mt-1 text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <SafeIcon icon={FiIcons.FiCheckCircle} className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Work order completed</p>
                            <p className="text-sm text-gray-500">WO-1234 was completed by Mike Wilson</p>
                            <p className="mt-1 text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-center">
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-primary-200 transition-colors"
              >
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={`${userProfile.first_name} ${userProfile.last_name}`} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-primary-600">{getInitials()}</span>
                )}
              </button>
              
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="py-1">
                    {userProfile && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile.first_name} {userProfile.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userProfile.role?.charAt(0).toUpperCase() + userProfile.role?.slice(1)}
                        </p>
                      </div>
                    )}
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;