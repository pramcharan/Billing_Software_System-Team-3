import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';

export const CustomerForm = ({ isOpen, onClose, onSave, customer }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        gstNumber: customer.gstNumber || '',
        status: customer.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstNumber: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

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
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'Add New Customer'}
      footer={
        <>
          <button className="team3-btn team3-btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="team3-btn team3-btn-primary" onClick={handleSubmit} type="button">
            {customer ? 'Update Customer' : 'Save Customer'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="team3-form-grid" noValidate>
        {/* Customer Name */}
        <div className="team3-form-group full-width">
          <label htmlFor="name">
            Customer Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ravi Kumar"
            className={`team3-form-input ${errors.name ? 'invalid' : ''}`}
          />
          {errors.name && <span className="team3-error-text">{errors.name}</span>}
        </div>

        {/* Phone */}
        <div className="team3-form-group">
          <label htmlFor="phone">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={`team3-form-input ${errors.phone ? 'invalid' : ''}`}
          />
          {errors.phone && <span className="team3-error-text">{errors.phone}</span>}
        </div>

        {/* Email */}
        <div className="team3-form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ravi@gmail.com"
            className={`team3-form-input ${errors.email ? 'invalid' : ''}`}
          />
          {errors.email && <span className="team3-error-text">{errors.email}</span>}
        </div>

        {/* Address */}
        <div className="team3-form-group full-width">
          <label htmlFor="address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House/Street, Area, City, State"
            className={`team3-form-textarea ${errors.address ? 'invalid' : ''}`}
            rows="3"
          />
          {errors.address && <span className="team3-error-text">{errors.address}</span>}
        </div>

        {/* GST Number */}
        <div className="team3-form-group">
          <label htmlFor="gstNumber">GST Number (Optional)</label>
          <input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="36ABCDE1234F1Z5"
            className={`team3-form-input ${errors.gstNumber ? 'invalid' : ''}`}
          />
          {errors.gstNumber && <span className="team3-error-text">{errors.gstNumber}</span>}
        </div>

        {/* Account Status */}
        <div className="team3-form-group">
          <label htmlFor="status">Account Status</label>
          <select
            id="status"
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

export default CustomerForm;
