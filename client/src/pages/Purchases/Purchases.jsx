import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import purchaseService from '../../services/purchaseService';
import ConfirmModal from '../../components/common/ConfirmModal';

// ---------------------------------------------------------------------------
// Temporary sample supplier options — isolated here so they can be removed
// easily once the Suppliers API is available.
// ---------------------------------------------------------------------------
export const TEMP_SUPPLIER_OPTIONS = [
  { id: '', label: '— Select Supplier —' },
  // TODO: Replace with GET /api/suppliers when backend is ready
];

const PAYMENT_STATUS_OPTIONS = ['All', 'Paid', 'Pending', 'Partial', 'Cancelled'];

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Purchases = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  // ── Data Loader ───────────────────────────────────────────────────────────
  const loadPurchases = async () => {
    const data = await purchaseService.getPurchases();
    setPurchases(data);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredPurchases = purchases.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.purchaseId || p.id || '').toLowerCase().includes(q) ||
      (p.supplierName || '').toLowerCase().includes(q);

    const matchesPayment =
      paymentStatusFilter === 'All' || p.paymentStatus === paymentStatusFilter;

    const matchesSupplier =
      !supplierFilter || p.supplierId === supplierFilter || p.supplierName === supplierFilter;

    const matchesFrom = !dateFrom || (p.purchaseDate && p.purchaseDate >= dateFrom);
    const matchesTo = !dateTo || (p.purchaseDate && p.purchaseDate <= dateTo);

    return matchesSearch && matchesPayment && matchesSupplier && matchesFrom && matchesTo;
  });

  // ── Metrics ───────────────────────────────────────────────────────────────
  const totalCount = purchases.length;
  const pendingCount = purchases.filter((p) => p.paymentStatus === 'Pending').length;
  const paidCount = purchases.filter((p) => p.paymentStatus === 'Paid').length;
  const totalValue = purchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (purchaseToDelete) {
      await purchaseService.deletePurchase(purchaseToDelete.id);
      await loadPurchases();
      showToast(`Purchase "${purchaseToDelete.id}" deleted.`);
    }
    setIsDeleteOpen(false);
    setPurchaseToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSupplierFilter('');
    setPaymentStatusFilter('All');
  };

  const paymentBadgeClass = (status) => {
    if (status === 'Paid') return 'team3-badge-active';
    if (status === 'Pending') return 'team3-badge-pending';
    if (status === 'Partial') return 'team3-badge-partial';
    if (status === 'Cancelled') return 'team3-badge-inactive';
    return '';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="team3-customer-module">
      {/* Toast */}
      {toastMessage && (
        <div className="team3-toast">
          <span>✅ {toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="team3-page-header">
        <div className="team3-title-group">
          <h1>Purchase Management</h1>
          <p>View, create, edit, and manage all purchase orders and payment records.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="team3-stats-grid">
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Total Purchases</span>
            <h3>{totalCount}</h3>
          </div>
          <div className="team3-stat-icon total">🛒</div>
        </div>
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Paid</span>
            <h3>{paidCount}</h3>
          </div>
          <div className="team3-stat-icon active">✅</div>
        </div>
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Pending</span>
            <h3>{pendingCount}</h3>
          </div>
          <div className="team3-stat-icon inactive">⏳</div>
        </div>
        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>Total Value</span>
            <h3 style={{ fontSize: '1.25rem' }}>{formatCurrency(totalValue)}</h3>
          </div>
          <div className="team3-stat-icon total">💰</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="team3-card">
        {/* Filter Bar */}
        <div className="team3-filter-bar">
          {/* Row 1: Search + Create button */}
          <div className="team3-filter-row">
            <div className="team3-search-box" style={{ maxWidth: '380px' }}>
              <span className="team3-search-icon">🔍</span>
              <input
                type="text"
                id="purchase-search"
                placeholder="Search by Purchase ID or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="team3-search-input"
              />
            </div>
            <div className="team3-actions-group">
              {(searchQuery || dateFrom || dateTo || supplierFilter || paymentStatusFilter !== 'All') && (
                <button className="team3-btn team3-btn-secondary" onClick={handleClearFilters}>
                  ✕ Clear Filters
                </button>
              )}
              <button
                id="purchase-create-btn"
                className="team3-btn team3-btn-primary"
                onClick={() => navigate('/purchases/new')}
              >
                <span>+</span> Create Purchase
              </button>
            </div>
          </div>

          {/* Row 2: Date range + Supplier + Payment status filters */}
          <div className="team3-filter-row team3-filter-row--secondary">
            <div className="purch-filter-group">
              <label htmlFor="purch-date-from">From Date</label>
              <input
                type="date"
                id="purch-date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="team3-filter-input"
              />
            </div>
            <div className="purch-filter-group">
              <label htmlFor="purch-date-to">To Date</label>
              <input
                type="date"
                id="purch-date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="team3-filter-input"
              />
            </div>
            <div className="purch-filter-group">
              <label htmlFor="purch-supplier-filter">Supplier</label>
              {/* TODO: Replace options with dynamic supplier list from GET /api/suppliers */}
              <select
                id="purch-supplier-filter"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="team3-filter-select"
              >
                <option value="">All Suppliers</option>
                {TEMP_SUPPLIER_OPTIONS.filter((o) => o.id).map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="purch-filter-group">
              <label htmlFor="purch-payment-filter">Payment Status</label>
              <select
                id="purch-payment-filter"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="team3-filter-select"
              >
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="team3-table-wrapper">
          <table className="team3-table">
            <thead>
              <tr>
                <th>Purchase ID</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <strong style={{ color: '#4f46e5' }}>{purchase.id}</strong>
                    </td>
                    <td>{purchase.purchaseDate || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {purchase.supplierName || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {(purchase.items || []).length} item(s)
                      </span>
                    </td>
                    <td>{formatCurrency(purchase.subtotal)}</td>
                    <td>{formatCurrency(purchase.taxAmount)}</td>
                    <td>{formatCurrency(purchase.discountAmount)}</td>
                    <td>
                      <strong style={{ color: '#111827' }}>{formatCurrency(purchase.grandTotal)}</strong>
                    </td>
                    <td>
                      <span className={`team3-badge ${paymentBadgeClass(purchase.paymentStatus)}`}>
                        {purchase.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="team3-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="team3-action-btn view"
                          title="View Purchase Details"
                          onClick={() => navigate(`/purchases/${purchase.id}`)}
                        >
                          👁️
                        </button>
                        <button
                          className="team3-action-btn edit"
                          title="Edit Purchase"
                          onClick={() => navigate(`/purchases/${purchase.id}/edit`)}
                        >
                          ✏️
                        </button>
                        <button
                          className="team3-action-btn delete"
                          title="Delete Purchase"
                          onClick={() => handleOpenDelete(purchase)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">
                    <div className="team3-empty-state">
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {searchQuery || dateFrom || dateTo || supplierFilter || paymentStatusFilter !== 'All'
                          ? '🔍' : '🛒'}
                      </div>
                      <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>
                        {searchQuery || dateFrom || dateTo || supplierFilter || paymentStatusFilter !== 'All'
                          ? 'No matching purchases found'
                          : 'No purchases yet'}
                      </p>
                      <p style={{ margin: 0, color: '#6b7280' }}>
                        {searchQuery || dateFrom || dateTo || supplierFilter || paymentStatusFilter !== 'All'
                          ? 'Try refining your search or filters.'
                          : 'Click "Create Purchase" to add your first purchase order.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Purchase"
        message={`Are you sure you want to delete purchase "${purchaseToDelete ? purchaseToDelete.id : ''}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Purchases;
