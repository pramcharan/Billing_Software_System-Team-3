import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaClipboardList } from 'react-icons/fa';
import purchaseService from '../../services/purchaseService';

import supplierService from '../../services/supplierService';

const fmt = (v) =>
  `₹ ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const paymentBadgeClass = (status) => {
  if (status === 'Paid') return 'team3-badge-active';
  if (status === 'Pending') return 'team3-badge-pending';
  if (status === 'Partial') return 'team3-badge-partial';
  if (status === 'Cancelled') return 'team3-badge-inactive';
  return '';
};

const PurchaseHistory = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // ── Load purchases from in-memory service at mount ─────────────────────
  const [historyPurchases, setHistoryPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  React.useEffect(() => {
    purchaseService.getPurchases().then(setHistoryPurchases);
    supplierService.getSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = historyPurchases.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.purchaseId || p.id || '').toLowerCase().includes(q) ||
      (p.supplierName || '').toLowerCase().includes(q);

    const matchesSupplier =
      !supplierFilter || p.supplierId === supplierFilter || p.supplierName === supplierFilter;

    const matchesFrom = !dateFrom || (p.purchaseDate && p.purchaseDate >= dateFrom);
    const matchesTo = !dateTo || (p.purchaseDate && p.purchaseDate <= dateTo);

    const matchesPayment =
      paymentStatusFilter === 'All' || p.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesSupplier && matchesFrom && matchesTo && matchesPayment;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery('');
    setSupplierFilter('');
    setDateFrom('');
    setDateTo('');
    setPaymentStatusFilter('All');
  };

  const totalValue = filtered.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
  const hasFilters = searchQuery || supplierFilter || dateFrom || dateTo || paymentStatusFilter !== 'All';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="team3-customer-module">
      {/* Page Header */}
      <div className="team3-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="team3-title-group">
          <h1>Purchase History</h1>
          <p>View and filter all historical purchase orders.</p>
        </div>
        <button
          className="team3-btn team3-btn-primary"
          onClick={() => navigate('/purchases/new')}
        >
          <span>+</span> New Purchase
        </button>
      </div>

      {/* Summary Row */}
      {historyPurchases.length > 0 && (
        <div className="purch-history-summary">
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{historyPurchases.length}</strong> purchases
          </span>
          {filtered.length > 0 && (
            <span className="purch-history-total-value">
              Filtered Total: <strong>{fmt(totalValue)}</strong>
            </span>
          )}
        </div>
      )}

      {/* Filter Card */}
      <div className="team3-card purch-history-filter-card">
        <div className="purch-history-filters">
          {/* Search */}
          <div className="team3-search-box" style={{ maxWidth: '300px' }}>
            <span className="team3-search-icon"><FaSearch /></span>
            <input
              type="text"
              id="history-search"
              placeholder="Search by ID or Supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="team3-search-input"
            />
          </div>

          {/* Supplier */}
          <div className="purch-filter-group">
            <label htmlFor="hist-supplier">Supplier</label>
            <select
              id="hist-supplier"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="team3-filter-select"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>{s.companyName}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="purch-filter-group">
            <label htmlFor="hist-from">From Date</label>
            <input
              type="date"
              id="hist-from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="team3-filter-input"
            />
          </div>

          {/* To Date */}
          <div className="purch-filter-group">
            <label htmlFor="hist-to">To Date</label>
            <input
              type="date"
              id="hist-to"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="team3-filter-input"
            />
          </div>

          {/* Payment Status */}
          <div className="purch-filter-group">
            <label htmlFor="hist-payment">Payment Status</label>
            <select
              id="hist-payment"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="team3-filter-select"
            >
              {['All', 'Paid', 'Pending', 'Partial', 'Cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button className="team3-btn team3-btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="team3-card" style={{ marginTop: '1rem' }}>
        <div className="team3-table-wrapper">
          <table className="team3-table">
            <thead>
              <tr>
                <th>Purchase ID</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: '#4f46e5' }}>{p.purchaseId || p.id}</strong>
                    </td>
                    <td>{p.purchaseDate || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {p.supplierName || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {(p.items || []).length} item(s)
                      </span>
                    </td>
                    <td>
                      <strong>{fmt(p.grandTotal)}</strong>
                    </td>
                    <td>
                      <span className={`team3-badge ${paymentBadgeClass(p.paymentStatus)}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="team3-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="team3-action-btn view"
                          title="View Purchase Details"
                          onClick={() => navigate(`/purchases/${p.id}`)}
                        >
                          <FaEye /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="team3-empty-state">
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {hasFilters ? <FaSearch /> : <FaClipboardList />}
                      </div>
                      <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>
                        {hasFilters
                          ? 'No matching purchases found'
                          : 'No purchase history yet'}
                      </p>
                      <p style={{ margin: 0, color: '#6b7280' }}>
                        {hasFilters
                          ? 'Try adjusting the filters above.'
                          : 'Purchases will appear here once they are created.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
