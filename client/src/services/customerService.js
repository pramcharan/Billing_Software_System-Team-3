import { apiRequest } from './api';

const normalizeCustomer = (customer) => ({
  ...customer,

  // Existing React screens use customer.id.
  id: customer._id,

  // Backend currently has no status field.
  // Until backend supports deactivation, existing records are treated as Active.
  status: customer.status || 'Active',

  createdAt: customer.createdAt
    ? customer.createdAt.split('T')[0]
    : '',
});

export const customerService = {
  // GET /api/customers
  getCustomers: async () => {
    const result = await apiRequest('/customers');

    return (result.data || []).map(normalizeCustomer);
  },

  // GET /api/customers/:id
  getCustomerById: async (id) => {
    const result = await apiRequest(`/customers/${id}`);

    return normalizeCustomer(result.data);
  },

  // POST /api/customers
  createCustomer: async (customerData) => {
    const payload = {
      name: customerData.name?.trim(),
      phone: customerData.phone?.trim(),
      email: customerData.email?.trim() || '',
      address: customerData.address?.trim() || '',
      gstNumber: customerData.gstNumber?.trim().toUpperCase() || '',
    };

    const result = await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeCustomer(result.data);
  },

  // PUT /api/customers/:id
  updateCustomer: async (id, customerData) => {
    const payload = {
      name: customerData.name?.trim(),
      phone: customerData.phone?.trim(),
      email: customerData.email?.trim() || '',
      address: customerData.address?.trim() || '',
      gstNumber: customerData.gstNumber?.trim().toUpperCase() || '',
    };

    const result = await apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeCustomer(result.data);
  },

  // DELETE /api/customers/:id
  deleteCustomer: async (id) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // GET /api/customers/:id/history
  getCustomerHistory: async (id) => {
    const result = await apiRequest(`/customers/${id}/history`);

    return {
      customer: result.customer,
      count: result.count || 0,
      totalAmount: result.totalAmount || 0,

      purchases: (result.data || []).map((purchase) => ({
        ...purchase,
        id: purchase._id,
        purchaseDate: purchase.purchaseDate
          ? purchase.purchaseDate.split('T')[0]
          : '',
        paymentStatus: formatStatus(purchase.paymentStatus),
      })),
    };
  },
};

const formatStatus = (status = '') =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : '';

export default customerService;