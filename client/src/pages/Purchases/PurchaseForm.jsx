import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import purchaseService, { generatePurchaseId } from '../../services/purchaseService';

// ---------------------------------------------------------------------------
// Temporary sample data — isolated here so they can be removed easily once
// the Product and Supplier APIs are available.
// ---------------------------------------------------------------------------
// TODO: Replace with GET /api/suppliers when backend is ready
const TEMP_SUPPLIERS = [
  // { id: 'SUP-001', companyName: 'Sample Supplier' }
];

// TODO: Replace with GET /api/products when backend is ready
const TEMP_PRODUCTS = [
  // { id: 'PRD-001', name: 'Sample Product', price: 0 }
];

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Partial', 'Cancelled'];

const EMPTY_ITEM = {
  productId: '',
  productName: '',
  quantity: 1,
  purchasePrice: '',
  tax: 0,
  discount: 0,
  subtotal: 0,
  total: 0,
};

// ── Calculation helpers ─────────────────────────────────────────────────────
const calcItemSubtotal = (item) => {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.purchasePrice) || 0;
  return qty * price;
};

const calcItemTotal = (item) => {
  const subtotal = calcItemSubtotal(item);
  const taxAmt = subtotal * (Number(item.tax) || 0) / 100;
  const discAmt = subtotal * (Number(item.discount) || 0) / 100;
  return subtotal + taxAmt - discAmt;
};

const recalcItem = (item) => ({
  ...item,
  subtotal: calcItemSubtotal(item),
  total: calcItemTotal(item),
});

const calcTotals = (items) => {
  const subtotal = items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0);
  const taxAmount = items.reduce((s, i) => {
    const sub = Number(i.subtotal) || 0;
    return s + sub * (Number(i.tax) || 0) / 100;
  }, 0);
  const discountAmount = items.reduce((s, i) => {
    const sub = Number(i.subtotal) || 0;
    return s + sub * (Number(i.discount) || 0) / 100;
  }, 0);
  const grandTotal = subtotal + taxAmount - discountAmount;
  return { subtotal, taxAmount, discountAmount, grandTotal };
};

// ── Format helpers ──────────────────────────────────────────────────────────
const fmt = (v) =>
  `₹ ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── PurchaseForm Component ──────────────────────────────────────────────────
const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);

  // ── Form state ────────────────────────────────────────────────────────────
  const [purchaseId, setPurchaseId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // ── Load existing purchase if editing ─────────────────────────────────────
  useEffect(() => {
    if (isEdit) {
      purchaseService.getPurchaseById(id).then((purchase) => {
        if (purchase) {
          setPurchaseId(purchase.purchaseId || purchase.id);
          setPurchaseDate(purchase.purchaseDate || '');
          setSupplierId(purchase.supplierId || '');
          setSupplierName(purchase.supplierName || '');
          setPaymentStatus(purchase.paymentStatus || 'Pending');
          setNotes(purchase.notes || '');
          setItems(
            purchase.items && purchase.items.length > 0
              ? purchase.items
              : [{ ...EMPTY_ITEM }]
          );
        } else {
          navigate('/purchases');
        }
      });
    } else {
      // Generate a preview ID for new purchases
      purchaseService.getPurchases().then((existing) => {
        setPurchaseId(generatePurchaseId(existing));
      });
    }
  }, [id, isEdit, navigate]);

  // ── Computed totals ───────────────────────────────────────────────────────
  const { subtotal, taxAmount, discountAmount, grandTotal } = calcTotals(items);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Item handlers ─────────────────────────────────────────────────────────
  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return; // keep at least one row
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = prev.map((item, i) => {
        if (i !== index) return item;
        const changed = { ...item, [field]: value };
        // If product selected from dropdown, fill name/price
        if (field === 'productId') {
          const product = TEMP_PRODUCTS.find((p) => p.id === value);
          if (product) {
            changed.productName = product.name;
            changed.purchasePrice = product.price;
          } else {
            changed.productName = '';
            changed.purchasePrice = '';
          }
        }
        return recalcItem(changed);
      });
      return updated;
    });
    // Clear item-level error
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`item_${index}_${field}`];
        return next;
      });
    }
  }, [errors]);

  // ── Supplier handler ──────────────────────────────────────────────────────
  const handleSupplierChange = (value) => {
    setSupplierId(value);
    const supplier = TEMP_SUPPLIERS.find((s) => s.id === value);
    setSupplierName(supplier ? supplier.companyName : '');
    if (errors.supplierId) setErrors((prev) => ({ ...prev, supplierId: '' }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!supplierId && !supplierName.trim()) {
      newErrors.supplierId = 'Supplier is required.';
    }
    if (!purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required.';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one purchase item is required.';
    }

    items.forEach((item, i) => {
      if (!item.productName && !item.productId) {
        newErrors[`item_${i}_productName`] = 'Product is required.';
      }
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        newErrors[`item_${i}_quantity`] = 'Quantity must be greater than 0.';
      }
      const price = Number(item.purchasePrice);
      if (item.purchasePrice === '' || item.purchasePrice === undefined) {
        newErrors[`item_${i}_purchasePrice`] = 'Purchase price is required.';
      } else if (price < 0) {
        newErrors[`item_${i}_purchasePrice`] = 'Purchase price cannot be negative.';
      }
      if (Number(item.tax) < 0) {
        newErrors[`item_${i}_tax`] = 'Tax cannot be negative.';
      }
      if (Number(item.discount) < 0) {
        newErrors[`item_${i}_discount`] = 'Discount cannot be negative.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      purchaseId,
      purchaseDate,
      supplierId,
      supplierName,
      paymentStatus,
      notes,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
    };

    if (isEdit) {
      await purchaseService.updatePurchase(id, payload);
      showToast(`Purchase "${id}" updated successfully!`);
      setTimeout(() => navigate(`/purchases/${id}`), 1200);
    } else {
      const created = await purchaseService.createPurchase(payload);
      showToast(`Purchase "${created.id}" created successfully!`);
      setTimeout(() => navigate('/purchases'), 1200);
    }
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
      <div className="team3-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="team3-title-group">
          <h1>{isEdit ? 'Edit Purchase' : 'Create Purchase'}</h1>
          <p>{isEdit ? `Editing purchase order ${id}` : 'Fill in the details to create a new purchase order.'}</p>
        </div>
        <button className="team3-btn team3-btn-secondary" onClick={() => navigate('/purchases')}>
          ← Back to Purchases
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Header Details Card ── */}
        <div className="team3-card purch-form-card">
          <div className="purch-form-section-header">
            <h2>Purchase Details</h2>
          </div>
          <div className="purch-form-body">
            <div className="team3-form-grid purch-header-grid">
              {/* Purchase ID */}
              <div className="team3-form-group">
                <label htmlFor="purch-id">Purchase ID</label>
                <input
                  type="text"
                  id="purch-id"
                  value={purchaseId}
                  readOnly
                  className="team3-form-input purch-readonly"
                  title="Auto-generated Purchase ID"
                />
              </div>

              {/* Purchase Date */}
              <div className="team3-form-group">
                <label htmlFor="purch-date">
                  Purchase Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="purch-date"
                  value={purchaseDate}
                  onChange={(e) => {
                    setPurchaseDate(e.target.value);
                    if (errors.purchaseDate) setErrors((prev) => ({ ...prev, purchaseDate: '' }));
                  }}
                  className={`team3-form-input ${errors.purchaseDate ? 'invalid' : ''}`}
                />
                {errors.purchaseDate && (
                  <span className="team3-error-text">{errors.purchaseDate}</span>
                )}
              </div>

              {/* Supplier */}
              <div className="team3-form-group">
                <label htmlFor="purch-supplier">
                  Supplier <span className="required">*</span>
                </label>
                {/* TODO: Replace with dynamic supplier dropdown from GET /api/suppliers */}
                {TEMP_SUPPLIERS.length > 0 ? (
                  <select
                    id="purch-supplier"
                    value={supplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className={`team3-form-select ${errors.supplierId ? 'invalid' : ''}`}
                  >
                    <option value="">— Select Supplier —</option>
                    {TEMP_SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="purch-supplier"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      if (errors.supplierId) setErrors((prev) => ({ ...prev, supplierId: '' }));
                    }}
                    placeholder="Enter supplier name"
                    className={`team3-form-input ${errors.supplierId ? 'invalid' : ''}`}
                  />
                )}
                {errors.supplierId && (
                  <span className="team3-error-text">{errors.supplierId}</span>
                )}
                {TEMP_SUPPLIERS.length === 0 && (
                  <span className="team3-hint-text">
                    Supplier dropdown will connect to API when available.
                  </span>
                )}
              </div>

              {/* Payment Status */}
              <div className="team3-form-group">
                <label htmlFor="purch-payment-status">Payment Status</label>
                <select
                  id="purch-payment-status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="team3-form-select"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="team3-form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="purch-notes">Notes (Optional)</label>
                <textarea
                  id="purch-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or remarks for this purchase..."
                  className="team3-form-textarea"
                  rows="2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Purchase Items Card ── */}
        <div className="team3-card purch-form-card" style={{ marginTop: '1.25rem' }}>
          <div className="purch-form-section-header">
            <h2>Purchase Items</h2>
            <button
              type="button"
              className="team3-btn team3-btn-primary"
              onClick={handleAddItem}
            >
              <span>+</span> Add Item
            </button>
          </div>

          {errors.items && (
            <div className="purch-form-items-error">
              <span className="team3-error-text">⚠ {errors.items}</span>
            </div>
          )}

          <div className="purch-items-table-wrapper">
            <table className="team3-table purch-items-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Product <span className="required">*</span></th>
                  <th style={{ minWidth: '100px' }}>Qty <span className="required">*</span></th>
                  <th style={{ minWidth: '140px' }}>Purchase Price <span className="required">*</span></th>
                  <th style={{ minWidth: '90px' }}>Tax (%)</th>
                  <th style={{ minWidth: '100px' }}>Discount (%)</th>
                  <th style={{ minWidth: '120px' }}>Subtotal</th>
                  <th style={{ minWidth: '120px' }}>Total</th>
                  <th style={{ minWidth: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="purch-item-row">
                    {/* Product */}
                    <td>
                      {TEMP_PRODUCTS.length > 0 ? (
                        <select
                          id={`item-product-${index}`}
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className={`team3-form-select purch-item-input ${errors[`item_${index}_productName`] ? 'invalid' : ''}`}
                        >
                          <option value="">— Select Product —</option>
                          {TEMP_PRODUCTS.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id={`item-product-${index}`}
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          placeholder="Product name"
                          className={`team3-form-input purch-item-input ${errors[`item_${index}_productName`] ? 'invalid' : ''}`}
                        />
                      )}
                      {errors[`item_${index}_productName`] && (
                        <span className="team3-error-text" style={{ fontSize: '0.75rem' }}>
                          {errors[`item_${index}_productName`]}
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td>
                      <input
                        type="number"
                        id={`item-qty-${index}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className={`team3-form-input purch-item-input purch-item-input--num ${errors[`item_${index}_quantity`] ? 'invalid' : ''}`}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <span className="team3-error-text" style={{ fontSize: '0.75rem' }}>
                          {errors[`item_${index}_quantity`]}
                        </span>
                      )}
                    </td>

                    {/* Purchase Price */}
                    <td>
                      <div className="purch-price-input-wrap">
                        <span className="purch-price-prefix">₹</span>
                        <input
                          type="number"
                          id={`item-price-${index}`}
                          value={item.purchasePrice}
                          onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={`team3-form-input purch-item-input purch-item-input--price ${errors[`item_${index}_purchasePrice`] ? 'invalid' : ''}`}
                        />
                      </div>
                      {errors[`item_${index}_purchasePrice`] && (
                        <span className="team3-error-text" style={{ fontSize: '0.75rem' }}>
                          {errors[`item_${index}_purchasePrice`]}
                        </span>
                      )}
                    </td>

                    {/* Tax % */}
                    <td>
                      <div className="purch-pct-input-wrap">
                        <input
                          type="number"
                          id={`item-tax-${index}`}
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          className={`team3-form-input purch-item-input purch-item-input--num ${errors[`item_${index}_tax`] ? 'invalid' : ''}`}
                        />
                        <span className="purch-pct-suffix">%</span>
                      </div>
                      {errors[`item_${index}_tax`] && (
                        <span className="team3-error-text" style={{ fontSize: '0.75rem' }}>
                          {errors[`item_${index}_tax`]}
                        </span>
                      )}
                    </td>

                    {/* Discount % */}
                    <td>
                      <div className="purch-pct-input-wrap">
                        <input
                          type="number"
                          id={`item-discount-${index}`}
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          className={`team3-form-input purch-item-input purch-item-input--num ${errors[`item_${index}_discount`] ? 'invalid' : ''}`}
                        />
                        <span className="purch-pct-suffix">%</span>
                      </div>
                      {errors[`item_${index}_discount`] && (
                        <span className="team3-error-text" style={{ fontSize: '0.75rem' }}>
                          {errors[`item_${index}_discount`]}
                        </span>
                      )}
                    </td>

                    {/* Subtotal (read-only) */}
                    <td>
                      <span className="purch-calc-value">{fmt(item.subtotal)}</span>
                    </td>

                    {/* Total (read-only) */}
                    <td>
                      <span className="purch-calc-value purch-calc-value--accent">{fmt(item.total)}</span>
                    </td>

                    {/* Remove */}
                    <td>
                      <button
                        type="button"
                        className="team3-action-btn delete"
                        onClick={() => handleRemoveItem(index)}
                        title="Remove item"
                        disabled={items.length === 1}
                        style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="purch-totals-section">
            <div className="purch-totals-grid">
              <div className="purch-total-row">
                <span className="purch-total-label">Items Subtotal</span>
                <span className="purch-total-value">{fmt(subtotal)}</span>
              </div>
              <div className="purch-total-row">
                <span className="purch-total-label">Tax Amount</span>
                <span className="purch-total-value purch-total-tax">+ {fmt(taxAmount)}</span>
              </div>
              <div className="purch-total-row">
                <span className="purch-total-label">Discount Amount</span>
                <span className="purch-total-value purch-total-discount">− {fmt(discountAmount)}</span>
              </div>
              <div className="purch-total-row purch-grand-total-row">
                <span className="purch-total-label">Grand Total</span>
                <span className="purch-total-value purch-grand-total">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Actions ── */}
        <div className="purch-form-actions">
          <button
            type="button"
            className="team3-btn team3-btn-secondary"
            onClick={() => navigate('/purchases')}
          >
            Cancel
          </button>
          <button type="submit" className="team3-btn team3-btn-primary">
            {isEdit ? '✔ Update Purchase' : '✔ Save Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
