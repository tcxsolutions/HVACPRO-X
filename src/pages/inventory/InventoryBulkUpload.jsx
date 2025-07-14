import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const InventoryBulkUpload = ({ onClose, onSuccess, tenantId }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [csvContent, setCsvContent] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCsvContent(content);
      parseCSV(content);
    };
    
    reader.readAsText(file);
  };

  // Parse CSV content
  const parseCSV = (content) => {
    try {
      // Split by lines
      const lines = content.split('\n').filter(line => line.trim());
      
      // Get headers (first line)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      // Validate required headers
      const requiredHeaders = ['name', 'category', 'quantity'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setValidationErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
        return;
      }
      
      // Parse data rows
      const items = [];
      const errors = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Skip empty lines
        if (!lines[i].trim()) continue;
        
        // Split the line by commas, handling quoted values
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        
        // Clean the values (remove quotes)
        const cleanValues = values.map(v => v.replace(/"/g, '').trim());
        
        // Create item object based on headers
        const item = {};
        headers.forEach((header, index) => {
          if (index < cleanValues.length) {
            item[header] = cleanValues[index];
          } else {
            item[header] = '';
          }
        });
        
        // Validate item
        if (!item.name) {
          errors.push(`Row ${i}: Missing name`);
          continue;
        }
        
        if (!item.category) {
          errors.push(`Row ${i}: Missing category`);
          continue;
        }
        
        if (isNaN(parseInt(item.quantity))) {
          errors.push(`Row ${i}: Invalid quantity`);
          continue;
        }
        
        // Add item to parsed items
        items.push({
          name: item.name,
          description: item.description || '',
          category: item.category,
          sku: item.sku || '',
          manufacturer: item.manufacturer || '',
          model: item.model || '',
          unit_price: parseFloat(item.unit_price) || null,
          quantity: parseInt(item.quantity) || 0,
          min_quantity: parseInt(item.min_quantity) || 0,
          location: item.location || '',
        });
      }
      
      setParsedItems(items);
      setValidationErrors(errors);
      
      if (errors.length === 0 && items.length > 0) {
        setStep(2);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setValidationErrors(['Invalid CSV format. Please check your file.']);
    }
  };

  // Process the upload to Supabase
  const processUpload = async () => {
    if (parsedItems.length === 0) {
      toast.error('No valid items to upload');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Process items in batches of 10
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < parsedItems.length; i += batchSize) {
        const batch = parsedItems.slice(i, i + batchSize);
        
        // Prepare batch with item_number and tenant_id
        const batchWithMetadata = batch.map(item => {
          const timestamp = new Date().getTime().toString().slice(-5);
          const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          
          return {
            ...item,
            item_number: `ITEM-${timestamp}${randomSuffix}`,
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
        
        // Insert batch
        const { data, error } = await supabase
          .from('inventory_items_hvac2024')
          .insert(batchWithMetadata);
        
        if (error) {
          console.error('Error uploading batch:', error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + batch.length) / parsedItems.length) * 100));
      }
      
      if (errorCount > 0) {
        toast.error(`Uploaded ${successCount} items, but ${errorCount} items failed.`);
      } else {
        toast.success(`Successfully uploaded ${successCount} items.`);
        setTimeout(() => onSuccess(), 1500);
      }
      
      setStep(3);
    } catch (error) {
      console.error('Error processing upload:', error);
      toast.error('Failed to upload items');
    } finally {
      setLoading(false);
      setUploadProgress(100);
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const headers = 'Name,Description,Category,SKU,Manufacturer,Model,Unit_Price,Quantity,Min_Quantity,Location';
    const sampleData = [
      '"Air Filter","High-efficiency filter","parts","AF-1001","FilterPro","HEPA500","24.99","35","10","Warehouse A, Shelf B5"',
      '"Refrigerant R-410A","Environmentally friendly refrigerant","supplies","R410-20","CoolGas","R410A-20LB","89.99","8","5","Warehouse A, Cold Storage"'
    ].join('\n');
    
    const csvContent = `${headers}\n${sampleData}`;
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={true}
      onClose={loading ? null : onClose}
      title="Bulk Upload Inventory Items"
    >
      <div className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {['Upload File', 'Review', 'Complete'].map((stepName, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-primary-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {step > index + 1 ? <SafeIcon icon={FiIcons.FiCheck} className="h-5 w-5" /> : index + 1}
              </div>
              <span className="mt-1 text-xs text-gray-600">{stepName}</span>
            </div>
          ))}
        </div>
        
        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <SafeIcon icon={FiIcons.FiUploadCloud} className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Upload a CSV file containing inventory items
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>The CSV file should have the following columns:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Required:</strong> Name, Category, Quantity</li>
                <li><strong>Optional:</strong> Description, SKU, Manufacturer, Model, Unit_Price, Min_Quantity, Location</li>
              </ul>
              <button
                onClick={downloadSampleCSV}
                className="mt-3 text-primary-600 hover:text-primary-700 flex items-center"
              >
                <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4 mr-1" />
                <span>Download sample CSV</span>
              </button>
            </div>
            
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-start">
                  <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Validation errors</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Review the {parsedItems.length} items that will be uploaded:
            </p>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedItems.slice(0, 20).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${item.unit_price || '0.00'}</td>
                      </tr>
                    ))}
                    {parsedItems.length > 20 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-2 text-sm text-gray-500 text-center">
                          ... and {parsedItems.length - 20} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex">
                <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 text-blue-400 mr-2" />
                <p className="text-sm text-blue-700">
                  Item numbers will be automatically generated for each item. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <SafeIcon icon={FiIcons.FiCheckCircle} className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900">Upload Complete</h3>
            <p className="text-gray-600">
              Successfully uploaded {parsedItems.length} inventory items to your database.
            </p>
          </div>
        )}
        
        {/* Progress bar */}
        {loading && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}% complete</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          {step < 3 && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          
          {step === 1 && csvContent && validationErrors.length === 0 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Continue
            </button>
          )}
          
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={processUpload}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {loading && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />}
                <span>Upload Items</span>
              </button>
            </>
          )}
          
          {step === 3 && (
            <button
              type="button"
              onClick={onSuccess}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InventoryBulkUpload;