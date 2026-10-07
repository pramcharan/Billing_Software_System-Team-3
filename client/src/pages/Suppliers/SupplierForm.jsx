import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';

const EMPTY_FORM = {
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  status: 'Active'
};

const SupplierForm = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Populate form when editing; reset for new supplier
  useEffect(() => {
    if (supplier) {
      setFormData({
        companyName:   supplier.companyName   || '',
        contactPerson: supplier.contactPerson || '',
        phone:         supplier.phone         || '',
        email:         supplier.email         || '',
        address:       supplier.address       || '',
        gstNumber:     supplier.gstNumber     || '',
        status:        supplier.status        || 'Active'
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [supplier, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim())
      newErrors.companyName = 'Company Name is required';

    if (!formData.contactPerson.trim())
      newErrors.contactPerson = 'Contact Person is required';

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (8–15 digits)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.address.trim())
      newErrors.address = 'Address is required';

    if (formData.gstNumber && formData.gstNumber.trim().length > 0) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstNumber.trim())) {
        newErrors.gstNumber = 'Format should be like 29AAAAA0000A1Z5';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'Add New Supplier'}
      footer={
        <>
          <button className="team3-btn team3-btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="team3-btn team3-btn-primary" onClick={handleSubmit} type="button">
            {supplier ? 'Update Supplier' : 'Save Supplier'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="team3-form-grid" noValidate>
        {/* Company Name */}
        <div className="team3-form-group full-width">
          <label htmlFor="sup-companyName">
            Company Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="sup-companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Sharma Traders Pvt Ltd"
            className={`team3-form-input ${errors.companyName ? 'invalid' : ''}`}
          />
          {errors.companyName && <span className="team3-error-text">{errors.companyName}</span>}
        </div>

        {/* Contact Person */}
        <div className="team3-form-group">
          <label htmlFor="sup-contactPerson">
            Contact Person <span className="required">*</span>
          </label>
          <input
            type="text"
            id="sup-contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="e.g. Ramesh Sharma"
            className={`team3-form-input ${errors.contactPerson ? 'invalid' : ''}`}
          />
          {errors.contactPerson && <span className="team3-error-text">{errors.contactPerson}</span>}
        </div>

        {/* Phone */}
        <div className="team3-form-group">
          <label htmlFor="sup-phone">
            Phone <span className="required">*</span>
          </label>
          <input
            type="text"
            id="sup-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={`team3-form-input ${errors.phone ? 'invalid' : ''}`}
          />
          {errors.phone && <span className="team3-error-text">{errors.phone}</span>}
        </div>

        {/* Email */}
        <div className="team3-form-group full-width">
          <label htmlFor="sup-email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="sup-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="supplier@company.com"
            className={`team3-form-input ${errors.email ? 'invalid' : ''}`}
          />
          {errors.email && <span className="team3-error-text">{errors.email}</span>}
        </div>

        {/* Address */}
        <div className="team3-form-group full-width">
          <label htmlFor="sup-address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="sup-address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street, Area, City, State, PIN"
            className={`team3-form-textarea ${errors.address ? 'invalid' : ''}`}
            rows="3"
          />
          {errors.address && <span className="team3-error-text">{errors.address}</span>}
        </div>

        {/* GST Number */}
        <div className="team3-form-group">
          <label htmlFor="sup-gstNumber">GST Number (Optional)</label>
          <input
            type="text"
            id="sup-gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="29AAAAA0000A1Z5"
            className={`team3-form-input ${errors.gstNumber ? 'invalid' : ''}`}
          />
          {errors.gstNumber && <span className="team3-error-text">{errors.gstNumber}</span>}
        </div>

        {/* Status */}
        <div className="team3-form-group">
          <label htmlFor="sup-status">Status</label>
          <select
            id="sup-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="team3-form-select"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierForm;
