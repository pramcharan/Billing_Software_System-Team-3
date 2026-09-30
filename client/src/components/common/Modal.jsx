import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="team3-modal-backdrop" onClick={onClose}>
      <div className="team3-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="team3-modal-header">
          <h2>{title}</h2>
          <button className="team3-modal-close" onClick={onClose} aria-label="Close Modal">
            ✕
          </button>
        </div>
        <div className="team3-modal-body">
          {children}
        </div>
        {footer && (
          <div className="team3-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
