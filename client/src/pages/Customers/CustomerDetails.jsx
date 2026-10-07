import React from 'react';
import Modal from '../../components/common/Modal';

export const CustomerDetails = ({ isOpen, onClose, customer }) => {
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
          <span className="team3-detail-value">{customer.address}</span>
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
            {customer.totalSpent || '₹ 0'}
          </span>
        </div>
      </div>

      {/* Purchase History Section UI */}
      <div className="team3-history-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0 }}>🛍️ Customer Purchase History</h4>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            GET /api/customers/{customer.id}/history (Mock Data)
          </span>
        </div>

        {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
          <div className="team3-table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="team3-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Invoice / Purchase ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {customer.purchaseHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.invoiceNo || item.id}</strong>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.itemsCount || 1} item(s)</td>
                    <td>₹ {Number(item.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`team3-badge ${item.paymentStatus === 'Paid' ? 'team3-badge-active' : 'team3-badge-inactive'}`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            No purchase history found for this customer yet.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomerDetails;
