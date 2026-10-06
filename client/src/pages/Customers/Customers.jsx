import React, { useState, useEffect } from 'react';
import { FaSearch, FaUsers, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import customerService from '../../services/customerService';
import CustomerForm from './CustomerForm';
import CustomerDetails from './CustomerDetails';
import ConfirmModal from '../../components/common/ConfirmModal';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCustomer, setDetailsCustomer] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Load customer data from customerService
  const loadCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const totalCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;

  // Real-time filtering by Name, Phone, or Email
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (customer) => {
    setDetailsCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (customer) => {
    await customerService.toggleCustomerStatus(customer.id);
    await loadCustomers();
    showToast(`Customer status updated to ${customer.status === 'Active' ? 'Inactive' : 'Active'}`);
  };

  const handleSaveCustomer = async (formData) => {
    if (selectedCustomer) {
      await customerService.updateCustomer(selectedCustomer.id, formData);
      showToast(`Customer "${formData.name}" updated successfully!`);
    } else {
      await customerService.createCustomer(formData);
      showToast(`Customer "${formData.name}" created successfully!`);
    }
    setIsFormOpen(false);
    await loadCustomers();
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await customerService.deleteCustomer(customerToDelete.id);
      showToast(`Customer "${customerToDelete.name}" deleted.`);
    }
    setIsDeleteOpen(false);
    setCustomerToDelete(null);
    await loadCustomers();
  };

  return (
    <div className="team3-customer-module">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="team3-toast">
          <span>✅ {toastMessage}</span>
        </div>
      )}

      {/* Module Title Header */}
      <div className="team3-page-header">
        <div className="team3-title-group">
          <h1>Customer Management</h1>
          <p>View, create, edit, search, and manage customer master data & purchase history.</p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="team3-stats-grid">
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Total Customers</span>
            <h3>{totalCount}</h3>
          </div>
          <div className="team3-stat-icon total"><FaUsers /></div>
        </div>

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Active Accounts</span>
            <h3>{activeCount}</h3>
          </div>
          <div className="team3-stat-icon active"><FaCheckCircle /></div>
        </div>

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Inactive / Deactivated</span>
            <h3>{inactiveCount}</h3>
          </div>
          <div className="team3-stat-icon inactive"><FaExclamationTriangle /></div>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="team3-card">
        {/* Controls Bar (Search & Actions) */}
        <div className="team3-control-bar">
          <div className="team3-search-box">
            <span className="team3-search-icon"><FaSearch /></span>
            <input
              type="text"
              placeholder="Search by customer name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="team3-search-input"
            />
          </div>

          <div className="team3-actions-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="team3-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            <button className="team3-btn team3-btn-primary" onClick={handleOpenAdd}>
              <span>+</span> Add Customer
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="team3-table-wrapper">
          <table className="team3-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>GST Number</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong style={{ color: '#4f46e5' }}>{customer.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{customer.name}</div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '220px'
                        }}
                      >
                        {customer.address}
                      </div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || '—'}</td>
                    <td>
                      {customer.gstNumber ? (
                        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {customer.gstNumber}
                        </code>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`team3-badge ${customer.status === 'Active' ? 'team3-badge-active' : 'team3-badge-inactive'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <div className="team3-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="team3-action-btn view"
                          title="View Details & Purchase History"
                          onClick={() => handleOpenDetails(customer)}
                        >
                          👁️
                        </button>
                        <button
                          className="team3-action-btn edit"
                          title="Edit Customer"
                          onClick={() => handleOpenEdit(customer)}
                        >
                          ✏️
                        </button>
                        <button
                          className="team3-action-btn toggle"
                          title={customer.status === 'Active' ? 'Deactivate Customer' : 'Activate Customer'}
                          onClick={() => handleToggleStatus(customer)}
                        >
                          {customer.status === 'Active' ? '🚫' : '✔️'}
                        </button>
                        <button
                          className="team3-action-btn delete"
                          title="Delete Customer"
                          onClick={() => handleOpenDelete(customer)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="team3-empty-state">
                      <div style={{ fontSize: '2rem' }}><FaSearch /></div>
                      <p style={{ fontWeight: 600, color: '#374151' }}>No matching customers found</p>
                      <p>Try refining your search terms or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* View Details Modal */}
      <CustomerDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        customer={detailsCustomer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete ? customerToDelete.name : ''}"?`}
      />
    </div>
  );
};

export default Customers;
