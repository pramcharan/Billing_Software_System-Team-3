import React, { useState, useEffect } from 'react';
import supplierService from '../../services/supplierService';
import SupplierForm from './SupplierForm';
import SupplierDetails from './SupplierDetails';
import ConfirmModal from '../../components/common/ConfirmModal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen]           = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen]       = useState(false);
  const [detailsSupplier, setDetailsSupplier]   = useState(null);

  const [isDeleteOpen, setIsDeleteOpen]         = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);


  const loadSuppliers = async () => {
    const data = await supplierService.getSuppliers();
    setSuppliers(data);
  };

  useEffect(() => { loadSuppliers(); }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const totalCount    = suppliers.length;
  const activeCount   = suppliers.filter(s => s.status === 'Active').length;
  const inactiveCount = suppliers.filter(s => s.status === 'Inactive').length;

  // Filtering: Supplier ID, Company Name, Contact Person, Phone, Email
  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.supplierId || s.id || '').toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (supplier) => {
    setDetailsSupplier(supplier);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (supplier) => {
    await supplierService.toggleSupplierStatus(supplier.id);
    await loadSuppliers();
    const newStatus = supplier.status === 'Active' ? 'Inactive' : 'Active';
    showToast(`✅ Supplier status changed to ${newStatus}`);
  };

  const handleSaveSupplier = async (formData) => {
    if (selectedSupplier) {
      await supplierService.updateSupplier(selectedSupplier.id, formData);
      showToast(`✅ Supplier "${formData.companyName}" updated successfully!`);
    } else {
      await supplierService.createSupplier(formData);
      showToast(`✅ Supplier "${formData.companyName}" added successfully!`);
    }
    setIsFormOpen(false);
    await loadSuppliers();
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await supplierService.deleteSupplier(supplierToDelete.id);
      showToast(`🗑️ Supplier "${supplierToDelete.companyName}" deleted.`);
    }
    setIsDeleteOpen(false);
    setSupplierToDelete(null);
    await loadSuppliers();
  };

  return (
    <div className="team3-customer-module">
      {/* Toast */}
      {toastMessage && (
        <div className="team3-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="team3-page-header">
        <div className="team3-title-group">
          <h1>Supplier Management</h1>
          <p>View, create, edit, search, and manage supplier master data.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="team3-stats-grid">
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Total Suppliers</span>
            <h3>{totalCount}</h3>
          </div>
          <div className="team3-stat-icon total">🚚</div>
        </div>
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Active Suppliers</span>
            <h3>{activeCount}</h3>
          </div>
          <div className="team3-stat-icon active">✅</div>
        </div>
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Inactive Suppliers</span>
            <h3>{inactiveCount}</h3>
          </div>
          <div className="team3-stat-icon inactive">⚠️</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="team3-card">
        {/* Controls */}
        <div className="team3-control-bar">
          <div className="team3-search-box">
            <span className="team3-search-icon">🔍</span>
            <input
              type="text"
              id="supplier-search"
              placeholder="Search by ID, company, contact, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="team3-search-input"
            />
          </div>

          <div className="team3-actions-group">
            <select
              id="supplier-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="team3-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            <button
              id="supplier-add-btn"
              className="team3-btn team3-btn-primary"
              onClick={handleOpenAdd}
            >
              <span>+</span> Add Supplier
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="team3-table-wrapper">
          <table className="team3-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>GST Number</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <strong style={{ color: '#4f46e5' }}>{supplier.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{supplier.companyName}</div>
                    </td>
                    <td>{supplier.contactPerson}</td>
                    <td>{supplier.phone}</td>
                    <td>
                      <div style={{
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {supplier.email || '—'}
                      </div>
                    </td>
                    <td>
                      {supplier.gstNumber ? (
                        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {supplier.gstNumber}
                        </code>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`team3-badge ${supplier.status === 'Active' ? 'team3-badge-active' : 'team3-badge-inactive'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="team3-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="team3-action-btn view"
                          title="View Supplier Details"
                          onClick={() => handleOpenDetails(supplier)}
                        >
                          👁️
                        </button>
                        <button
                          className="team3-action-btn edit"
                          title="Edit Supplier"
                          onClick={() => handleOpenEdit(supplier)}
                        >
                          ✏️
                        </button>
                        <button
                          className="team3-action-btn toggle"
                          title={supplier.status === 'Active' ? 'Deactivate Supplier' : 'Activate Supplier'}
                          onClick={() => handleToggleStatus(supplier)}
                        >
                          {supplier.status === 'Active' ? '🚫' : '✔️'}
                        </button>
                        <button
                          className="team3-action-btn delete"
                          title="Delete Supplier"
                          onClick={() => handleOpenDelete(supplier)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="team3-empty-state">
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {searchQuery || statusFilter !== 'All' ? '🔍' : '🚚'}
                      </div>
                      <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>
                        {searchQuery || statusFilter !== 'All'
                          ? 'No matching suppliers found'
                          : 'No suppliers yet'}
                      </p>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                        {searchQuery || statusFilter !== 'All'
                          ? 'Try refining your search or filter.'
                          : 'Click "Add Supplier" to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
      />

      {/* Details Modal */}
      <SupplierDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        supplier={detailsSupplier}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplierToDelete ? supplierToDelete.companyName : ''}"?`}
      />
    </div>
  );
};

export default Suppliers;
