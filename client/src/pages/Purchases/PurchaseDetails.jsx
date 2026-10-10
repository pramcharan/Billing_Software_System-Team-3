import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSearch, FaEdit, FaShoppingCart } from 'react-icons/fa';
import purchaseService from '../../services/purchaseService';

const fmt = (v) =>
  `₹ ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const paymentBadgeClass = (status) => {
  if (status === 'Paid') return 'team3-badge-active';
  if (status === 'Pending') return 'team3-badge-pending';
  if (status === 'Partial') return 'team3-badge-partial';
  if (status === 'Cancelled') return 'team3-badge-inactive';
  return '';
};

const PurchaseDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    purchaseService.getPurchaseById(id).then((data) => {
      if (data) {
        setPurchase(data);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="team3-customer-module">
        <div className="team3-empty-state" style={{ minHeight: '60vh', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><FaSearch /></div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151' }}>Purchase Not Found</p>
          <p style={{ color: '#6b7280' }}>The purchase you're looking for doesn't exist or may have been deleted.</p>
          <button
            className="team3-btn team3-btn-primary"
            style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/purchases')}
          >
            ← Back to Purchases
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!purchase) {
    return (
      <div className="team3-customer-module">
        <div className="team3-empty-state" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading purchase details...</p>
        </div>
      </div>
    );
  }

  const items = purchase.items || [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="team3-customer-module">
      {/* Page Header */}
      <div className="team3-page-header purch-details-header">
        <div className="team3-title-group">
          <h1>Purchase Details</h1>
          <p>Invoice-style view for purchase order {purchase.purchaseId || purchase.id}</p>
        </div>
        <div className="team3-actions-group">
          <button
            className="team3-btn team3-btn-secondary"
            onClick={() => navigate('/purchases')}
          >
            ← Back
          </button>
          <button
            className="team3-btn team3-btn-primary"
            onClick={() => navigate(`/purchases/${purchase.id}/edit`)}
          >
            <FaEdit style={{marginRight: '6px'}} /> Edit
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="team3-card purch-invoice-card">
        {/* Invoice Header */}
        <div className="purch-invoice-header">
          <div className="purch-invoice-brand">
            <div className="purch-invoice-brand-icon"><FaShoppingCart /></div>
            <div>
              <h2>Purchase Order</h2>
              <p>Billing Software — Purchase Management</p>
            </div>
          </div>
          <div className="purch-invoice-meta">
            <div className="purch-invoice-id-block">
              <span className="purch-invoice-id-label">Purchase ID</span>
              <span className="purch-invoice-id-value">
                {purchase.purchaseId || purchase.id}
              </span>
            </div>
            <span className={`team3-badge ${paymentBadgeClass(purchase.paymentStatus)}`} style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
              {purchase.paymentStatus}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="purch-invoice-info-grid">
          <div className="purch-invoice-info-block">
            <span className="purch-info-label">Purchase Date</span>
            <span className="purch-info-value">{purchase.purchaseDate || '—'}</span>
          </div>
          <div className="purch-invoice-info-block">
            <span className="purch-info-label">Supplier</span>
            <span className="purch-info-value" style={{ fontWeight: 700 }}>
              {purchase.supplierName || '—'}
            </span>
            {purchase.supplierId && (
              <span className="purch-info-sub">{purchase.supplierId}</span>
            )}
          </div>
          <div className="purch-invoice-info-block">
            <span className="purch-info-label">Total Items</span>
            <span className="purch-info-value">{items.length} item(s)</span>
          </div>
          <div className="purch-invoice-info-block">
            <span className="purch-info-label">Created At</span>
            <span className="purch-info-value">
              {purchase.createdAt
                ? new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                : '—'}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="purch-invoice-items">
          <h3 className="purch-invoice-section-title">Purchase Items</h3>
          <div className="team3-table-wrapper">
            <table className="team3-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Tax (%)</th>
                  <th>Discount (%)</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#6b7280', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {item.productName || '—'}
                        </div>
                        {item.productId && (
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{item.productId}</div>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.purchasePrice)}</td>
                      <td>{Number(item.tax || 0).toFixed(1)}%</td>
                      <td>{Number(item.discount || 0).toFixed(1)}%</td>
                      <td>{fmt(item.subtotal)}</td>
                      <td><strong>{fmt(item.total)}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="team3-empty-state" style={{ padding: '1.5rem' }}>
                        <p>No items in this purchase.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="purch-invoice-footer">
          {purchase.notes && (
            <div className="purch-invoice-notes">
              <span className="purch-info-label">Notes</span>
              <p className="purch-invoice-notes-text">{purchase.notes}</p>
            </div>
          )}

          <div className="purch-invoice-totals">
            <div className="purch-total-row">
              <span className="purch-total-label">Subtotal</span>
              <span className="purch-total-value">{fmt(purchase.subtotal)}</span>
            </div>
            <div className="purch-total-row">
              <span className="purch-total-label">Tax Amount</span>
              <span className="purch-total-value purch-total-tax">+ {fmt(purchase.taxAmount)}</span>
            </div>
            <div className="purch-total-row">
              <span className="purch-total-label">Discount Amount</span>
              <span className="purch-total-value purch-total-discount">− {fmt(purchase.discountAmount)}</span>
            </div>
            <div className="purch-total-row purch-grand-total-row">
              <span className="purch-total-label">Grand Total</span>
              <span className="purch-total-value purch-grand-total">{fmt(purchase.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;
