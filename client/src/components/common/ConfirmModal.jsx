import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      footer={
        <>
          <button className="team3-btn team3-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="team3-btn team3-btn-danger" onClick={onConfirm}>
            Yes, Confirm
          </button>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#ef4444' }}><FaExclamationTriangle /></div>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
          {message}
        </p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
