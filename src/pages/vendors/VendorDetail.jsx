import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONSTANTS } from '../../config/constants';
import toast from 'react-hot-toast';

const VendorDetail = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    is_primary: false
  });
  const [noteFormData, setNoteFormData] = useState({
    content: '',
    type: 'general'
  });

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockVendor = {
        id: parseInt(vendorId),
        name: 'HVAC Supply Co.',
        category: 'distributor',
        address: '789 Industrial Pkwy, City, ST 12345',
        phone: '(555) 987-6543',
        email: 'orders@hvacsupply.com',
        website: 'www.hvacsupply.com',
        tax_id: '98-7654321',
        status: 'active',
        payment_terms: 'Net 30',
        created_at: '2023-01-10T10:00:00Z',
        notes: 'Preferred vendor for Carrier products',
        account_number: 'VN-12345'
      };
      
      setVendor(mockVendor);
      
      const mockContacts = [
        {
          id: 1,
          vendor_id: parseInt(vendorId),
          name: 'Robert Johnson',
          title: 'Sales Representative',
          email: 'robert.johnson@hvacsupply.com',
          phone: '(555) 123-4567',
          is_primary: true,
          created_at: '2023-01-15T10:00:00Z'
        },
        {
          id: 2,
          vendor_id: parseInt(vendorId),
          name: 'Sarah Miller',
          title: 'Account Manager',
          email: 'sarah.miller@hvacsupply.com',
          phone: '(555) 456-7890',
          is_primary: false,
          created_at: '2023-02-10T14:30:00Z'
        }
      ];
      
      setContacts(mockContacts);
      
      const mockPurchaseOrders = [
        {
          id: 'PO-2024-001',
          vendor_id: parseInt(vendorId),
          status: 'received',
          ordered_date: '2024-01-15',
          expected_date: '2024-01-30',
          received_date: '2024-01-28',
          total: 2450.00,
          items_count: 5
        },
        {
          id: 'PO-2024-008',
          vendor_id: parseInt(vendorId),
          status: 'ordered',
          ordered_date: '2024-03-10',
          expected_date: '2024-03-25',
          received_date: null,
          total: 1850.00,
          items_count: 3
        }
      ];
      
      setPurchaseOrders(mockPurchaseOrders);
      
      const mockInventoryItems = [
        {
          id: 1,
          name: 'Air Filter',
          sku: 'AF-1001',
          category: 'parts',
          vendor_id: parseInt(vendorId),
          vendor_sku: 'VN-AF1001',
          unit_price: 24.99,
          quantity: 35,
          min_quantity: 10
        },
        {
          id: 2,
          name: 'Refrigerant R-410A',
          sku: 'R410-20',
          category: 'supplies',
          vendor_id: parseInt(vendorId),
          vendor_sku: 'VN-R410A',
          unit_price: 89.99,
          quantity: 8,
          min_quantity: 5
        }
      ];
      
      setInventoryItems(mockInventoryItems);
      
      const mockNotes = [
        {
          id: 1,
          vendor_id: parseInt(vendorId),
          content: 'Negotiated 2% discount for bulk orders over $1000',
          type: 'purchasing',
          created_by: { name: 'John Smith' },
          created_at: '2024-01-10T09:15:00Z'
        },
        {
          id: 2,
          vendor_id: parseInt(vendorId),
          content: 'Vendor will be closed for inventory from March 15-17',
          type: 'general',
          created_by: { name: 'Sarah Johnson' },
          created_at: '2024-02-05T14:30:00Z'
        }
      ];
      
      setNotes(mockNotes);
      
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        // Update existing contact
        const updatedContacts = contacts.map(contact => 
          contact.id === editingContact.id ? {...contact, ...contactFormData} : contact
        );
        setContacts(updatedContacts);
        toast.success('Contact updated successfully');
      } else {
        // Create new contact
        const newContact = {
          id: Date.now(),
          vendor_id: parseInt(vendorId),
          ...contactFormData,
          created_at: new Date().toISOString()
        };
        setContacts([...contacts, newContact]);
        toast.success('Contact added successfully');
      }
      handleCloseContactModal();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    }
  };
  
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const newNote = {
        id: Date.now(),
        vendor_id: parseInt(vendorId),
        ...noteFormData,
        created_by: { name: userProfile.first_name + ' ' + userProfile.last_name },
        created_at: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      handleCloseNoteModal();
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };
  
  const handleOpenContactModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setContactFormData({
        name: contact.name,
        title: contact.title,
        email: contact.email,
        phone: contact.phone,
        is_primary: contact.is_primary
      });
    } else {
      setEditingContact(null);
      setContactFormData({
        name: '',
        title: '',
        email: '',
        phone: '',
        is_primary: false
      });
    }
    setShowContactModal(true);
  };
  
  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setEditingContact(null);
  };
  
  const handleOpenNoteModal = () => {
    setNoteFormData({
      content: '',
      type: 'general'
    });
    setShowNoteModal(true);
  };
  
  const handleCloseNoteModal = () => {
    setShowNoteModal(false);
  };
  
  const handleCreatePurchaseOrder = () => {
    navigate('/purchase-orders', { 
      state: { 
        createPurchaseOrder: true, 
        vendor: { 
          id: vendor.id, 
          name: vendor.name 
        }
      } 
    });
  };

  const getVendorCategoryBadge = (category) => {
    const categoryConfig = APP_CONSTANTS.VENDOR_CATEGORIES.find(c => c.value === category) || { value: category, label: category };
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {categoryConfig.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiIcons.FiAlertCircle} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor not found</h3>
        <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/vendors')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/vendors')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getVendorCategoryBadge(vendor.category)}
              <span className="text-sm text-gray-500">Vendor ID: {vendor.id}</span>
            </div>
          </div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <button
            onClick={() => navigate(`/vendors/${vendorId}/edit`)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
            <span>Edit</span>
          </button>
          
          <button
            onClick={handleCreatePurchaseOrder}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: FiIcons.FiHome },
            { key: 'contacts', label: 'Contacts', icon: FiIcons.FiUsers },
            { key: 'purchase_orders', label: 'Purchase Orders', icon: FiIcons.FiShoppingCart },
            { key: 'items', label: 'Inventory Items', icon: FiIcons.FiBox },
            { key: 'notes', label: 'Notes', icon: FiIcons.FiMessageSquare }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Vendor Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vendor Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiPhone} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{vendor.phone}</span>
                      </div>
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiMail} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{vendor.email}</span>
                      </div>
                      {vendor.website && (
                        <div className="flex">
                          <SafeIcon icon={FiIcons.FiGlobe} className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">{vendor.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <div className="mt-2">
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiMapPin} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{vendor.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account Number:</span>
                        <span className="text-gray-900">{vendor.account_number}</span>
                      </div>
                      {vendor.tax_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Tax ID:</span>
                          <span className="text-gray-900">{vendor.tax_id}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Payment Terms:</span>
                        <span className="text-gray-900">{vendor.payment_terms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Relationship Since:</span>
                        <span className="text-gray-900">{new Date(vendor.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {vendor.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <div className="flex">
                    <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                      <p className="mt-1 text-sm text-gray-600">{vendor.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiShoppingCart} className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiBox} className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${purchaseOrders.reduce((sum, po) => sum + po.total, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiDollarSign} className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Combine and sort purchase orders and notes by date */}
                {[
                  ...purchaseOrders.map(po => ({
                    type: 'purchase_order',
                    date: po.ordered_date,
                    data: po
                  })),
                  ...notes.map(note => ({
                    type: 'note',
                    date: note.created_at,
                    data: note
                  }))
                ]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4">
                        {activity.type === 'purchase_order' && (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiShoppingCart} className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'note' && (
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiMessageSquare} className="h-5 w-5 text-yellow-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        {activity.type === 'purchase_order' && (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              Purchase Order {activity.data.id} - ${activity.data.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.data.status === 'received'
                                ? `Received on ${new Date(activity.data.received_date).toLocaleDateString()}`
                                : `Ordered on ${new Date(activity.data.ordered_date).toLocaleDateString()}`}
                            </p>
                          </>
                        )}
                        {activity.type === 'note' && (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.data.type.charAt(0).toUpperCase() + activity.data.type.slice(1)} Note
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.data.content.length > 100
                                ? activity.data.content.substring(0, 100) + '...'
                                : activity.data.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              By {activity.data.created_by.name} on {new Date(activity.data.created_at).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
            <button
              onClick={() => handleOpenContactModal()}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Contact</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {contacts.length === 0 ? (
              <div className="p-6 text-center">
                <SafeIcon icon={FiIcons.FiUsers} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts found</h3>
                <p className="text-gray-500">Add contacts for this vendor to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{contact.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.email}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.is_primary ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Primary
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Secondary
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenContactModal(contact)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'purchase_orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Purchase Orders</h3>
            <button
              onClick={handleCreatePurchaseOrder}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {purchaseOrders.length === 0 ? (
              <div className="p-6 text-center">
                <SafeIcon icon={FiIcons.FiShoppingCart} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No purchase orders found</h3>
                <p className="text-gray-500">Create a purchase order for this vendor to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.ordered_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Expected: {new Date(order.expected_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.items_count} items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${order.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'received'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'partial_received'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'ordered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/purchase-orders/${order.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'items' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
            <button
              onClick={() => navigate('/inventory', { state: { vendorId: vendor.id } })}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {inventoryItems.length === 0 ? (
              <div className="p-6 text-center">
                <SafeIcon icon={FiIcons.FiBox} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No inventory items found</h3>
                <p className="text-gray-500">Add inventory items for this vendor to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.sku}</div>
                          <div className="text-xs text-gray-500">Vendor SKU: {item.vendor_sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.category === 'parts'
                              ? 'bg-blue-100 text-blue-800'
                              : item.category === 'supplies'
                              ? 'bg-green-100 text-green-800'
                              : item.category === 'tools'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${item.unit_price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            item.quantity <= item.min_quantity ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {item.quantity}
                          </div>
                          <div className="text-xs text-gray-500">Min: {item.min_quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/inventory/${item.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate('/purchase-orders', {
                                state: {
                                  createPurchaseOrder: true,
                                  vendor: { id: vendor.id, name: vendor.name },
                                  items: [{ id: item.id, name: item.name }]
                                }
                              })}
                              className="text-green-600 hover:text-green-900"
                            >
                              Order
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'notes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Notes</h3>
            <button
              onClick={handleOpenNoteModal}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Note</span>
            </button>
          </div>
          
          {notes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <SafeIcon icon={FiIcons.FiMessageSquare} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notes found</h3>
              <p className="text-gray-500">Add notes for this vendor to keep track of important information</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        note.type === 'purchasing'
                          ? 'bg-blue-100 text-blue-800'
                          : note.type === 'service'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                  <div className="mt-3 text-sm text-gray-500">
                    Added by {note.created_by.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={handleCloseContactModal}
        title={editingContact ? "Edit Contact" : "Add New Contact"}
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={contactFormData.name}
              onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title/Position</label>
            <input
              type="text"
              value={contactFormData.title}
              onChange={(e) => setContactFormData({...contactFormData, title: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={contactFormData.email}
                onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                required
                value={contactFormData.phone}
                onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_primary"
              checked={contactFormData.is_primary}
              onChange={(e) => setContactFormData({...contactFormData, is_primary: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
              Primary Contact
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={handleCloseContactModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingContact ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={handleCloseNoteModal}
        title="Add Note"
      >
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Note Type</label>
            <select
              value={noteFormData.type}
              onChange={(e) => setNoteFormData({...noteFormData, type: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="general">General</option>
              <option value="purchasing">Purchasing</option>
              <option value="service">Service</option>
              <option value="billing">Billing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              required
              rows="5"
              value={noteFormData.content}
              onChange={(e) => setNoteFormData({...noteFormData, content: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter note content..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={handleCloseNoteModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorDetail;