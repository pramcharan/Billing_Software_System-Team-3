import React, { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import customerService from '../../services/customerService';

export const CustomerDetails = ({ isOpen, onClose, customer }) => {
  const [history, setHistory] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && customer?.id) {
      setLoading(true);
      setError(null);

      customerService
        .getCustomerHistory(customer.id)
        .then((res) => {
          setHistory(res.purchases || []);
          setTotalSpent(res.totalAmount || 0);
          setHistoryCount(res.count || 0);
        })
        .catch((err) => {
          console.error('Failed to load customer history:', err);
          setError('Failed to fetch purchase history.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setHistory([]);
      setTotalSpent(0);
      setHistoryCount(0);
      setError(null);
    }
  }, [isOpen, customer?.id]);

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Profile & Purchase History"
      footer={
        <button className="team3-btn team3-btn-secondary" onClick={onClose}>
          Close Profile
        </button>
      }
    >
      <div className="team3-detail-grid">
        <div className="team3-detail-item">
          <span className="team3-detail-label">Customer ID</span>
          <span className="team3-detail-value" style={{ color: '#4f46e5', fontWeight: 700 }}>
            {customer.id}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Status</span>
          <span className={`team3-badge ${customer.status === 'Active' ? 'team3-badge-active' : 'team3-badge-inactive'}`}>
            {customer.status}
          </span>
        </div>

        <div className="team3-detail-item full-width">
          <span className="team3-detail-label">Full Name</span>
          <span className="team3-detail-value" style={{ fontSize: '1.15rem', fontWeight: 600 }}>
            {customer.name}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Phone</span>
          <span className="team3-detail-value">{customer.phone}</span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Email</span>
          <span className="team3-detail-value">{customer.email || 'N/A'}</span>
        </div>

        <div className="team3-detail-item full-width">
          <span className="team3-detail-label">Address</span>
          <span className="team3-detail-value">{customer.address || 'N/A'}</span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">GST Number</span>
          <span className="team3-detail-value">
            {customer.gstNumber ? (
              <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                {customer.gstNumber}
              </code>
            ) : (
              'Not Provided (Consumer)'
            )}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Total Spend</span>
          <span className="team3-detail-value" style={{ color: '#10b981', fontWeight: 700, fontSize: '1.05rem' }}>
            {loading ? 'Calculating...' : `₹ ${totalSpent.toLocaleString('en-IN')}`}
          </span>
        </div>
      </div>

      {/* Purchase History Section UI */}
      <div className="team3-history-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShoppingCart /> Customer Purchase History
            <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' }}>
              {historyCount} record{historyCount === 1 ? '' : 's'}
            </span>
          </h4>
        </div>

        {loading ? (
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            Loading purchase history...
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        ) : history.length > 0 ? (
          <div className="team3-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="team3-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Purchase ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>
                      <strong style={{ color: '#4f46e5' }}>{item.purchaseId || item.id}</strong>
                    </td>
                    <td>{item.purchaseDate || 'N/A'}</td>
                    <td>{item.items?.length || 1} item(s)</td>
                    <td style={{ fontWeight: 600 }}>₹ {Number(item.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`team3-badge ${item.paymentStatus === 'Paid' ? 'team3-badge-active' : 'team3-badge-inactive'}`}>
                        {item.paymentStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            No purchase history found for this customer yet.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomerDetails;