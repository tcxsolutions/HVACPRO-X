import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const PhoneNumberDisplay = ({ phoneNumbers = [], showTypes = true, showPrimary = true }) => {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return <span className="text-gray-500">No phone numbers</span>;
  }

  const getPhoneIcon = (type) => {
    switch (type) {
      case 'mobile':
        return FiIcons.FiSmartphone;
      case 'home':
        return FiIcons.FiHome;
      case 'fax':
        return FiIcons.FiPrinter;
      case 'emergency':
        return FiIcons.FiAlertCircle;
      default:
        return FiIcons.FiPhone;
    }
  };

  const getTypeColor = (type, isPrimary) => {
    if (isPrimary) return 'text-primary-600';
    switch (type) {
      case 'mobile':
        return 'text-blue-600';
      case 'home':
        return 'text-green-600';
      case 'fax':
        return 'text-purple-600';
      case 'emergency':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatPhoneType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-1">
      {phoneNumbers.map((phone, index) => (
        <div key={index} className="flex items-center space-x-2">
          <SafeIcon 
            icon={getPhoneIcon(phone.type)} 
            className={`h-4 w-4 ${getTypeColor(phone.type, phone.isPrimary)}`} 
          />
          <a 
            href={`tel:${phone.number}`} 
            className={`hover:underline ${getTypeColor(phone.type, phone.isPrimary)}`}
          >
            {phone.number}
          </a>
          {showTypes && (
            <span className="text-xs text-gray-500">
              ({formatPhoneType(phone.type)})
            </span>
          )}
          {showPrimary && phone.isPrimary && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Primary
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhoneNumberDisplay;