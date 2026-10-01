import React from 'react';
import Modal from '../../components/common/Modal';

const SupplierDetails = ({ isOpen, onClose, supplier }) => {
  if (!supplier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Profile"
      footer={
        <button className="team3-btn team3-btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="team3-detail-grid">
        <div className="team3-detail-item">
          <span className="team3-detail-label">Supplier ID</span>
          <span className="team3-detail-value" style={{ color: '#4f46e5', fontWeight: 700 }}>
            {supplier.id}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Status</span>
          <span
            className={`team3-badge ${supplier.status === 'Active' ? 'team3-badge-active' : 'team3-badge-inactive'}`}
          >
            {supplier.status}
          </span>
        </div>

        <div className="team3-detail-item full-width">
          <span className="team3-detail-label">Company Name</span>
          <span className="team3-detail-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {supplier.companyName}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Contact Person</span>
          <span className="team3-detail-value">{supplier.contactPerson}</span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Phone</span>
          <span className="team3-detail-value">{supplier.phone}</span>
        </div>

        <div className="team3-detail-item full-width">
          <span className="team3-detail-label">Email</span>
          <span className="team3-detail-value">{supplier.email || 'N/A'}</span>
        </div>

        <div className="team3-detail-item full-width">
          <span className="team3-detail-label">Address</span>
          <span className="team3-detail-value">{supplier.address}</span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">GST Number</span>
          <span className="team3-detail-value">
            {supplier.gstNumber ? (
              <code style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                {supplier.gstNumber}
              </code>
            ) : (
              'Not Provided'
            )}
          </span>
        </div>

        <div className="team3-detail-item">
          <span className="team3-detail-label">Member Since</span>
          <span className="team3-detail-value">{supplier.createdAt || '—'}</span>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierDetails;
