import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const PhoneNumberManager = ({ phoneNumbers = [], onChange, label = "Phone Numbers" }) => {
  const [phones, setPhones] = useState(
    phoneNumbers.length > 0 
      ? phoneNumbers 
      : [{ number: '', type: 'work', isPrimary: true }]
  );

  const phoneTypes = [
    { value: 'work', label: 'Work' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'home', label: 'Home' },
    { value: 'fax', label: 'Fax' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' }
  ];

  const addPhone = () => {
    const newPhones = [...phones, { number: '', type: 'work', isPrimary: false }];
    setPhones(newPhones);
    onChange(newPhones);
  };

  const removePhone = (index) => {
    if (phones.length === 1) return; // Keep at least one phone
    const newPhones = phones.filter((_, i) => i !== index);
    // If removing primary, make first one primary
    if (phones[index].isPrimary && newPhones.length > 0) {
      newPhones[0].isPrimary = true;
    }
    setPhones(newPhones);
    onChange(newPhones);
  };

  const updatePhone = (index, field, value) => {
    const newPhones = [...phones];
    
    if (field === 'isPrimary' && value) {
      // Only one can be primary
      newPhones.forEach((phone, i) => {
        phone.isPrimary = i === index;
      });
    } else {
      newPhones[index][field] = value;
    }
    
    setPhones(newPhones);
    onChange(newPhones);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-3">
        {phones.map((phone, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="tel"
                required
                value={phone.number}
                onChange={(e) => updatePhone(index, 'number', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="w-24">
              <select
                value={phone.type}
                onChange={(e) => updatePhone(index, 'type', e.target.value)}
                className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                {phoneTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="primaryPhone"
                checked={phone.isPrimary}
                onChange={(e) => updatePhone(index, 'isPrimary', e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <label className="ml-1 text-xs text-gray-500">Primary</label>
            </div>
            {phones.length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(index)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPhone}
          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
          <span>Add Phone Number</span>
        </button>
      </div>
    </div>
  );
};

export default PhoneNumberManager;