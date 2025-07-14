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

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
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
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockCustomer = {
        id: parseInt(customerId),
        name: 'Acme Corporation',
        type: 'commercial',
        address: '123 Business Ave, City, ST 12345',
        billing_address: '123 Business Ave, City, ST 12345',
        phone: '(555) 123-4567',
        email: 'info@acme.com',
        website: 'www.acmecorp.com',
        tax_id: '12-3456789',
        status: 'active',
        credit_limit: 10000,
        payment_terms: 'Net 30',
        created_at: '2023-01-15T10:00:00Z',
        notes: 'Key account, requires special handling',
        account_manager_id: 1,
        account_manager: {
          id: 1,
          name: 'John Smith'
        }
      };
      
      setCustomer(mockCustomer);
      
      const mockContacts = [
        {
          id: 1,
          customer_id: parseInt(customerId),
          name: 'Jane Doe',
          title: 'Facility Manager',
          email: 'jane.doe@acme.com',
          phone: '(555) 987-6543',
          is_primary: true,
          created_at: '2023-01-15T10:00:00Z'
        },
        {
          id: 2,
          customer_id: parseInt(customerId),
          name: 'Bob Smith',
          title: 'Maintenance Supervisor',
          email: 'bob.smith@acme.com',
          phone: '(555) 456-7890',
          is_primary: false,
          created_at: '2023-02-10T14:30:00Z'
        }
      ];
      
      setContacts(mockContacts);
      
      const mockProperties = [
        {
          id: 1,
          customer_id: parseInt(customerId),
          name: 'Acme Headquarters',
          address: '123 Business Ave, City, ST 12345',
          type: 'commercial',
          size: 50000,
          hvac_units_count: 5
        },
        {
          id: 2,
          customer_id: parseInt(customerId),
          name: 'Acme Warehouse',
          address: '456 Industrial Blvd, City, ST 12345',
          type: 'industrial',
          size: 120000,
          hvac_units_count: 8
        }
      ];
      
      setProperties(mockProperties);
      
      const mockWorkOrders = [
        {
          id: 'WO-2024-001',
          customer_id: parseInt(customerId),
          property_id: 1,
          property: { name: 'Acme Headquarters' },
          title: 'Annual Maintenance',
          status: 'completed',
          priority: 'medium',
          scheduled_date: '2024-02-15',
          completed_date: '2024-02-15',
          technician: { name: 'Mike Wilson' },
          total: 450.00
        },
        {
          id: 'WO-2024-008',
          customer_id: parseInt(customerId),
          property_id: 1,
          property: { name: 'Acme Headquarters' },
          title: 'AC Unit Repair',
          status: 'in_progress',
          priority: 'high',
          scheduled_date: '2024-03-20',
          completed_date: null,
          technician: { name: 'Jennifer Lee' },
          total: 0.00
        }
      ];
      
      setWorkOrders(mockWorkOrders);
      
      const mockInvoices = [
        {
          id: 'INV-2024-001',
          customer_id: parseInt(customerId),
          work_order_id: 'WO-2024-001',
          amount: 450.00,
          status: 'paid',
          issued_date: '2024-02-16',
          due_date: '2024-03-16',
          paid_date: '2024-02-28'
        }
      ];
      
      setInvoices(mockInvoices);
      
      const mockNotes = [
        {
          id: 1,
          customer_id: parseInt(customerId),
          content: 'Customer requested quarterly maintenance schedule for all units',
          type: 'general',
          created_by: { name: 'John Smith' },
          created_at: '2024-01-10T09:15:00Z'
        },
        {
          id: 2,
          customer_id: parseInt(customerId),
          content: 'Discussed potential upgrade for warehouse HVAC system',
          type: 'sales',
          created_by: { name: 'Sarah Johnson' },
          created_at: '2024-02-05T14:30:00Z'
        }
      ];
      
      setNotes(mockNotes);
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      toast.error('Failed to load customer data');
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
          customer_id: parseInt(customerId),
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
        customer_id: parseInt(customerId),
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
  
  const handleCreateWorkOrder = () => {
    navigate('/work-orders', { 
      state: { 
        createWorkOrder: true, 
        customer: { 
          id: customer.id, 
          name: customer.name 
        },
        properties: properties
      } 
    });
  };

  const getCustomerTypeBadge = (type) => {
    const typeConfig = APP_CONSTANTS.CUSTOMER_TYPES.find(t => t.value === type) || { value: type, label: type };
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {typeConfig.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiIcons.FiAlertCircle} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
        <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Customers
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
            onClick={() => navigate('/customers')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getCustomerTypeBadge(customer.type)}
              <span className="text-sm text-gray-500">Customer ID: {customer.id}</span>
            </div>
          </div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <button
            onClick={() => navigate(`/customers/${customerId}/edit`)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiEdit2} className="h-4 w-4" />
            <span>Edit</span>
          </button>
          
          <button
            onClick={handleCreateWorkOrder}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: FiIcons.FiHome },
            { key: 'contacts', label: 'Contacts', icon: FiIcons.FiUsers },
            { key: 'properties', label: 'Properties', icon: FiIcons.FiMapPin },
            { key: 'work_orders', label: 'Work Orders', icon: FiIcons.FiClipboard },
            { key: 'invoices', label: 'Invoices', icon: FiIcons.FiDollarSign },
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
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiPhone} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.phone}</span>
                      </div>
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiMail} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.email}</span>
                      </div>
                      {customer.website && (
                        <div className="flex">
                          <SafeIcon icon={FiIcons.FiGlobe} className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">{customer.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <div className="mt-2">
                      <div className="flex">
                        <SafeIcon icon={FiIcons.FiMapPin} className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  {customer.billing_address && customer.billing_address !== customer.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Billing Address</h4>
                      <div className="mt-2">
                        <div className="flex">
                          <SafeIcon icon={FiIcons.FiFileText} className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">{customer.billing_address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                    <div className="mt-2 space-y-2">
                      {customer.tax_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Tax ID:</span>
                          <span className="text-gray-900">{customer.tax_id}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account Status:</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Payment Terms:</span>
                        <span className="text-gray-900">{customer.payment_terms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Credit Limit:</span>
                        <span className="text-gray-900">${customer.credit_limit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account Manager:</span>
                        <span className="text-gray-900">{customer.account_manager.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Customer Since:</span>
                        <span className="text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {customer.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <div className="flex">
                    <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                      <p className="mt-1 text-sm text-gray-600">{customer.notes}</p>
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
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiHome} className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Work Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiClipboard} className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${invoices.reduce((sum, invoice) => sum + invoice.amount, 0).toLocaleString()}
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
                {/* Combine and sort work orders, invoices, and notes by date */}
                {[
                  ...workOrders.map(wo => ({
                    type: 'work_order',
                    date: wo.scheduled_date,
                    data: wo
                  })),
                  ...invoices.map(inv => ({
                    type: 'invoice',
                    date: inv.issued_date,
                    data: inv
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
                        {activity.type === 'work_order' && (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiTool} className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        {activity.type === 'invoice' && (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiFileText} className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'note' && (
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiMessageSquare} className="h-5 w-5 text-yellow-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        {activity.type === 'work_order' && (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              Work Order {activity.data.id} - {activity.data.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.data.status === 'completed'
                                ? `Completed on ${new Date(activity.data.completed_date).toLocaleDateString()}`
                                : `Scheduled for ${new Date(activity.data.scheduled_date).toLocaleDateString()}`}
                            </p>
                          </>
                        )}
                        {activity.type === 'invoice' && (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              Invoice {activity.data.id} - ${activity.data.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.data.status === 'paid'
                                ? `Paid on ${new Date(activity.data.paid_date).toLocaleDateString()}`
                                : `Due on ${new Date(activity.data.due_date).toLocaleDateString()}`}
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
                <p className="text-gray-500">Add contacts for this customer to get started</p>
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

      {activeTab === 'properties' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Properties</h3>
            <button
              onClick={() => navigate('/properties', { state: { customerId: customer.id } })}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Add Property</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.length === 0 ? (
              <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <SafeIcon icon={FiIcons.FiHome} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
                <p className="text-gray-500">Add properties for this customer to get started</p>
              </div>
            ) : (
              properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <SafeIcon icon={FiIcons.FiHome} className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          property.type === 'commercial'
                            ? 'bg-blue-100 text-blue-800'
                            : property.type === 'industrial'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => navigate(`/properties/${property.id}`)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <SafeIcon icon={FiIcons.FiMapPin} className="h-4 w-4 mr-2" />
                      {property.address}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <SafeIcon icon={FiIcons.FiSquare} className="h-4 w-4 mr-2" />
                      {property.size?.toLocaleString()} sq ft
                    </div>
                    <div className="flex items-center text-gray-600">
                      <SafeIcon icon={FiIcons.FiWind} className="h-4 w-4 mr-2" />
                      {property.hvac_units_count || 0} HVAC Units
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/work-orders', {
                        state: {
                          createWorkOrder: true,
                          customer: { id: customer.id, name: customer.name },
                          property: { id: property.id, name: property.name }
                        }
                      })}
                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
                    >
                      Create Work Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'work_orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Work Orders</h3>
            <button
              onClick={handleCreateWorkOrder}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Create Work Order</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {workOrders.length === 0 ? (
              <div className="p-6 text-center">
                <SafeIcon icon={FiIcons.FiClipboard} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No work orders found</h3>
                <p className="text-gray-500">Create a work order for this customer to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheduled Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          <div className="text-sm text-gray-500">{order.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.property.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.scheduled_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.technician ? order.technician.name : 'Unassigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${order.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/work-orders/${order.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
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

      {activeTab === 'invoices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
            <button
              onClick={() => navigate('/invoices', { state: { customerId: customer.id } })}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-6 text-center">
                <SafeIcon icon={FiIcons.FiFileText} className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
                <p className="text-gray-500">Create an invoice for this customer to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice.work_order_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.issued_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${invoice.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'partial_paid'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
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
              <p className="text-gray-500">Add notes for this customer to keep track of important information</p>
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
                        note.type === 'sales'
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
              <option value="service">Service</option>
              <option value="sales">Sales</option>
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

export default CustomerDetail;