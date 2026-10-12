import { apiRequest } from './api';

const normalizeSupplier = (supplier) => ({
  ...supplier,
  id: supplier._id,
  supplierId: supplier._id,
  status: supplier.status || 'Active',
  createdAt: supplier.createdAt
    ? supplier.createdAt.split('T')[0]
    : '',
});

export const supplierService = {
  // GET /api/suppliers
  getSuppliers: async () => {
    const result = await apiRequest('/suppliers');
    return (result.data || []).map(normalizeSupplier);
  },

  // GET /api/suppliers/:id
  getSupplierById: async (id) => {
    const result = await apiRequest(`/suppliers/${id}`);
    return normalizeSupplier(result.data);
  },

  // POST /api/suppliers
  createSupplier: async (supplierData) => {
    const payload = {
      companyName: supplierData.companyName?.trim(),
      contactPerson: supplierData.contactPerson?.trim() || '',
      phone: supplierData.phone?.trim() || '',
      email: supplierData.email?.trim() || '',
      address: supplierData.address?.trim() || '',
      gstNumber: supplierData.gstNumber?.trim().toUpperCase() || '',
      status: supplierData.status || 'Active',
    };

    const result = await apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeSupplier(result.data);
  },

  // PUT /api/suppliers/:id
  updateSupplier: async (id, supplierData) => {
    const payload = {
      companyName: supplierData.companyName?.trim(),
      contactPerson: supplierData.contactPerson?.trim() || '',
      phone: supplierData.phone?.trim() || '',
      email: supplierData.email?.trim() || '',
      address: supplierData.address?.trim() || '',
      gstNumber: supplierData.gstNumber?.trim().toUpperCase() || '',
      status: supplierData.status || 'Active',
    };

    const result = await apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeSupplier(result.data);
  },

  // DELETE /api/suppliers/:id
  deleteSupplier: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },

  // PATCH /api/suppliers/:id/status — toggle Active <-> Inactive
  toggleSupplierStatus: async (id) => {
    const result = await apiRequest(`/suppliers/${id}/status`, {
      method: 'PATCH',
    });
    return normalizeSupplier(result.data);
  },
};

export default supplierService;