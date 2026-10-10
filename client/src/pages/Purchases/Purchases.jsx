import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaCheckCircle, FaClock, FaDollarSign, FaTimes, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';

import purchaseService from '../../services/purchaseService';
import supplierService from '../../services/supplierService';

// ---------------------------------------------------------------------------
// Payment status options
// ---------------------------------------------------------------------------
const PAYMENT_STATUS_OPTIONS = [
  'All',
  'Paid',
  'Pending',
  'Partial',
  'Unpaid',
];

// ---------------------------------------------------------------------------
// Currency formatter
// ---------------------------------------------------------------------------
const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------
const Purchases = () => {
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState('All');

  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] =
    useState(true);

  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  // -------------------------------------------------------------------------
  // Load purchases from backend
  // -------------------------------------------------------------------------
  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError('');

      const data =
        await purchaseService.getPurchases();

      setPurchases(data || []);
    } catch (err) {
      console.error(
        'Failed to load purchases:',
        err
      );

      setError(
        err.message ||
          'Unable to load purchases. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Load suppliers from backend
  // -------------------------------------------------------------------------
  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);

      const data =
        await supplierService.getSuppliers();

      setSuppliers(data || []);
    } catch (err) {
      console.error(
        'Failed to load suppliers:',
        err
      );

      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // -------------------------------------------------------------------------
  // Initial data loading
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadPurchases();
    loadSuppliers();
  }, []);

  // -------------------------------------------------------------------------
  // Toast
  // -------------------------------------------------------------------------
  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------
  const filteredPurchases = purchases.filter(
    (purchase) => {
      const q = searchQuery
        .toLowerCase()
        .trim();

      const matchesSearch =
        !q ||
        String(
          purchase.purchaseId ||
            purchase.id ||
            ''
        )
          .toLowerCase()
          .includes(q) ||
        String(
          purchase.supplierName || ''
        )
          .toLowerCase()
          .includes(q);

      const matchesPayment =
        paymentStatusFilter === 'All' ||
        purchase.paymentStatus ===
          paymentStatusFilter;

      const matchesSupplier =
        !supplierFilter ||
        purchase.supplierId ===
          supplierFilter ||
        purchase.supplierName ===
          supplierFilter;

      const matchesFrom =
        !dateFrom ||
        (purchase.purchaseDate &&
          purchase.purchaseDate >=
            dateFrom);

      const matchesTo =
        !dateTo ||
        (purchase.purchaseDate &&
          purchase.purchaseDate <=
            dateTo);

      return (
        matchesSearch &&
        matchesPayment &&
        matchesSupplier &&
        matchesFrom &&
        matchesTo
      );
    }
  );

  // -------------------------------------------------------------------------
  // Metrics
  // -------------------------------------------------------------------------
  const totalCount =
    purchases.length;

  const pendingCount =
    purchases.filter(
      (purchase) =>
        purchase.paymentStatus ===
        'Pending'
    ).length;

  const paidCount =
    purchases.filter(
      (purchase) =>
        purchase.paymentStatus ===
        'Paid'
    ).length;

  const totalValue =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.grandTotal || 0
        ),
      0
    );

  // -------------------------------------------------------------------------
  // Clear filters
  // -------------------------------------------------------------------------
  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSupplierFilter('');
    setPaymentStatusFilter('All');

    showToast('Filters cleared');
  };

  // -------------------------------------------------------------------------
  // Payment badge
  // -------------------------------------------------------------------------
  const paymentBadgeClass = (
    status
  ) => {
    if (status === 'Paid') {
      return 'team3-badge-active';
    }

    if (status === 'Pending') {
      return 'team3-badge-pending';
    }

    if (status === 'Partial') {
      return 'team3-badge-partial';
    }

    if (status === 'Unpaid') {
      return 'team3-badge-inactive';
    }

    return '';
  };

  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------
  const handleRefresh = async () => {
    await loadPurchases();
    await loadSuppliers();

    showToast(
      'Purchase data refreshed'
    );
  };

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  const handleOpenDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (purchaseToDelete) {
      try {
        await purchaseService.deletePurchase(purchaseToDelete.id);
        showToast('Purchase deleted successfully');
        await loadPurchases();
      } catch (err) {
        setError(err.message || 'Failed to delete purchase');
      }
    }
    setIsDeleteOpen(false);
    setPurchaseToDelete(null);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="team3-customer-module">

      {/* ------------------------------------------------------------------- */}
      {/* Toast */}
      {/* ------------------------------------------------------------------- */}
      {toastMessage && (
        <div className="team3-toast">
          <span>
            <FaCheckCircle style={{marginRight: '6px'}} /> {toastMessage}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Error */}
      {/* ------------------------------------------------------------------- */}
      {error && (
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #f5b5b5',
            color: '#b00020',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ------------------------------------------------------------------- */}
      <div className="team3-page-header">
        <div className="team3-title-group">
          <h1>
            Purchase Management
          </h1>

          <p>
            View, create, and manage
            purchase orders and payment
            records.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Metric Cards */}
      {/* ------------------------------------------------------------------- */}
      <div className="team3-stats-grid">

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>
              Total Purchases
            </span>

            <h3>
              {totalCount}
            </h3>
          </div>

          <div className="team3-stat-icon total">
            <FaShoppingCart />
          </div>
        </div>

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>
              Paid
            </span>

            <h3>
              {paidCount}
            </h3>
          </div>

          <div className="team3-stat-icon active">
            <FaCheckCircle />
          </div>
        </div>

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>
              Pending
            </span>

            <h3>
              {pendingCount}
            </h3>
          </div>

          <div className="team3-stat-icon inactive">
            <FaClock />
          </div>
        </div>

        <div className="team3-stat-card">
          <div className="team3-stat-info">
            <span>
              Total Value
            </span>

            <h3
              style={{
                fontSize: '1.25rem',
              }}
            >
              {formatCurrency(
                totalValue
              )}
            </h3>
          </div>

          <div className="team3-stat-icon total">
            <FaDollarSign />
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main Table Card */}
      {/* ------------------------------------------------------------------- */}
      <div className="team3-card">

        {/* ----------------------------------------------------------------- */}
        {/* Filter Bar */}
        {/* ----------------------------------------------------------------- */}
        <div className="team3-filter-bar">

          {/* Row 1 */}
          <div className="team3-filter-row">

            <div
              className="team3-search-box"
              style={{
                maxWidth: '380px',
              }}
            >
              <span className="team3-search-icon">
                <FaSearch />
              </span>

              <input
                type="text"
                id="purchase-search"
                placeholder="Search by Purchase ID or Supplier..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                className="team3-search-input"
              />
            </div>

            <div className="team3-actions-group">

              {(searchQuery ||
                dateFrom ||
                dateTo ||
                supplierFilter ||
                paymentStatusFilter !==
                  'All') && (
                <button
                  type="button"
                  className="team3-btn team3-btn-secondary"
                  onClick={
                    handleClearFilters
                  }
                >
                  <FaTimes style={{marginRight: '6px'}} /> Clear Filters
                </button>
              )}

              <button
                type="button"
                className="team3-btn team3-btn-secondary"
                onClick={
                  handleRefresh
                }
                disabled={loading}
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                id="purchase-create-btn"
                className="team3-btn team3-btn-primary"
                onClick={() =>
                  navigate(
                    '/purchases/new'
                  )
                }
              >
                <span>
                  +
                </span>{' '}
                Create Purchase
              </button>

            </div>
          </div>

          {/* Row 2 */}
          <div className="team3-filter-row team3-filter-row--secondary">

            {/* From Date */}
            <div className="purch-filter-group">
              <label htmlFor="purch-date-from">
                From Date
              </label>

              <input
                type="date"
                id="purch-date-from"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(
                    event.target.value
                  )
                }
                className="team3-filter-input"
              />
            </div>

            {/* To Date */}
            <div className="purch-filter-group">
              <label htmlFor="purch-date-to">
                To Date
              </label>

              <input
                type="date"
                id="purch-date-to"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(
                    event.target.value
                  )
                }
                className="team3-filter-input"
              />
            </div>

            {/* Supplier */}
            <div className="purch-filter-group">
              <label htmlFor="purch-supplier-filter">
                Supplier
              </label>

              <select
                id="purch-supplier-filter"
                value={
                  supplierFilter
                }
                onChange={(event) =>
                  setSupplierFilter(
                    event.target.value
                  )
                }
                className="team3-filter-select"
                disabled={
                  loadingSuppliers
                }
              >
                <option value="">
                  {loadingSuppliers
                    ? 'Loading suppliers...'
                    : 'All Suppliers'}
                </option>

                {suppliers.map(
                  (supplier) => (
                    <option
                      key={
                        supplier.id ||
                        supplier._id
                      }
                      value={
                        supplier.id ||
                        supplier._id
                      }
                    >
                      {
                        supplier.companyName
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Payment Status */}
            <div className="purch-filter-group">
              <label htmlFor="purch-payment-filter">
                Payment Status
              </label>

              <select
                id="purch-payment-filter"
                value={
                  paymentStatusFilter
                }
                onChange={(event) =>
                  setPaymentStatusFilter(
                    event.target.value
                  )
                }
                className="team3-filter-select"
              >
                {PAYMENT_STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Loading */}
        {/* ----------------------------------------------------------------- */}
        {loading ? (
          <div
            style={{
              padding: '50px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: '10px',
              }}
            >
              <FaClock />
            </div>

            <p>
              Loading purchases...
            </p>
          </div>
        ) : (
          /* --------------------------------------------------------------- */
          /* Table */
          /* --------------------------------------------------------------- */
          <div className="team3-table-wrapper">
            <table className="team3-table">

              <thead>
                <tr>
                  <th>
                    Purchase ID
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Subtotal
                  </th>

                  <th>
                    Tax
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment Status
                  </th>

                  <th
                    style={{
                      textAlign:
                        'right',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredPurchases.length >
                0 ? (
                  filteredPurchases.map(
                    (purchase) => (
                      <tr
                        key={
                          purchase.id
                        }
                      >

                        {/* Purchase ID */}
                        <td>
                          <strong
                            style={{
                              color:
                                '#4f46e5',
                            }}
                          >
                            {purchase.purchaseId ||
                              purchase.id}
                          </strong>
                        </td>

                        {/* Date */}
                        <td>
                          {purchase.purchaseDate ||
                            '—'}
                        </td>

                        {/* Supplier */}
                        <td>
                          <div
                            style={{
                              fontWeight: 600,
                              color:
                                '#111827',
                            }}
                          >
                            {purchase.supplierName ||
                              '—'}
                          </div>
                        </td>

                        {/* Items */}
                        <td>
                          <span
                            style={{
                              background:
                                '#f3f4f6',
                              padding:
                                '2px 8px',
                              borderRadius:
                                '12px',
                              fontSize:
                                '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            {(
                              purchase.items ||
                              []
                            ).length}{' '}
                            item(s)
                          </span>
                        </td>

                        {/* Subtotal */}
                        <td>
                          {formatCurrency(
                            purchase.subtotal
                          )}
                        </td>

                        {/* Tax */}
                        <td>
                          {formatCurrency(
                            purchase.taxAmount
                          )}
                        </td>

                        {/* Discount */}
                        <td>
                          {formatCurrency(
                            purchase.discountAmount
                          )}
                        </td>

                        {/* Total */}
                        <td>
                          <strong
                            style={{
                              color:
                                '#111827',
                            }}
                          >
                            {formatCurrency(
                              purchase.grandTotal
                            )}
                          </strong>
                        </td>

                        {/* Payment Status */}
                        <td>
                          <span
                            className={`team3-badge ${paymentBadgeClass(
                              purchase.paymentStatus
                            )}`}
                          >
                            {
                              purchase.paymentStatus
                            }
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div
                            className="team3-row-actions"
                            style={{
                              justifyContent:
                                'flex-end',
                            }}
                          >
                            <button
                              type="button"
                              className="team3-action-btn view"
                              title="View Purchase Details"
                              onClick={() =>
                                navigate(
                                  `/purchases/${purchase.id}`
                                )
                              }
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="team3-action-btn edit"
                              title="Edit Purchase"
                              onClick={() =>
                                navigate(
                                  `/purchases/${purchase.id}/edit`
                                )
                              }
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="team3-action-btn delete"
                              title="Delete Purchase"
                              onClick={() => handleOpenDelete(purchase)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                    >
                      <div className="team3-empty-state">

                        <div
                          style={{
                            fontSize:
                              '2.5rem',
                            marginBottom:
                              '0.5rem',
                          }}
                        >
                          {searchQuery ||
                          dateFrom ||
                          dateTo ||
                          supplierFilter ||
                          paymentStatusFilter !==
                            'All'
                            ? <FaSearch />
                            : <FaShoppingCart />}
                        </div>

                        <p
                          style={{
                            fontWeight: 600,
                            color:
                              '#374151',
                            margin:
                              '0 0 0.25rem',
                          }}
                        >
                          {searchQuery ||
                          dateFrom ||
                          dateTo ||
                          supplierFilter ||
                          paymentStatusFilter !==
                            'All'
                            ? 'No matching purchases found'
                            : 'No purchases yet'}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color:
                              '#6b7280',
                          }}
                        >
                          {searchQuery ||
                          dateFrom ||
                          dateTo ||
                          supplierFilter ||
                          paymentStatusFilter !==
                            'All'
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
        )}

      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Purchase"
        message={`Are you sure you want to delete purchase "${purchaseToDelete ? (purchaseToDelete.purchaseId || purchaseToDelete.id) : ''}"?`}
      />
    </div>
  );
};

export default Purchases;