import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { APP_CONSTANTS } from '../../config/constants';

const InventoryFilterPanel = ({ 
  categoryFilter, 
  setCategoryFilter, 
  lowStockOnly, 
  setLowStockOnly,
  stockStatus,
  setStockStatus,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {APP_CONSTANTS.INVENTORY_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setCategoryFilter(category.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                categoryFilter === category.value ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
          
          <div className="border-l border-gray-300 mx-2"></div>
          
          <button
            onClick={() => setStockStatus('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              stockStatus === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockStatus('in_stock')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              stockStatus === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStockStatus('out_of_stock')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Out of Stock
          </button>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              lowStockOnly ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Low Stock Only
          </button>
        </div>
        
        <div className="relative w-full md:w-64">
          <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryFilterPanel;