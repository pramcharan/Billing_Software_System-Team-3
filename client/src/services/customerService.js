// API-Ready Customer Service for Team 3 - Customer Management
// Currently uses in-memory React state only. NO localStorage.
// Replace mock implementations with axios/fetch calls when backend APIs (/api/customers) are available.

// In-memory store (session only — resets on page refresh, as required)
let _customers = [];
let _counter = 0;

/**
 * Generates a unique Customer ID (e.g. CUST-001, CUST-002) that never repeats
 * within the current session, even if customers are deleted.
 */
export const generateCustomerId = (customers = []) => {
  // Safeguard: find max numeric index from any existing customer IDs
  const maxExisting = customers.reduce((max, c) => {
    const custIdStr = c.customerId || c.id || '';
    const match = custIdStr.match(/CUST-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);

  let nextNum = Math.max(_counter, maxExisting) + 1;

  // Ensure nextNum is unique and never matches an existing customer ID
  while (
    customers.some(
      c =>
        c.id === `CUST-${String(nextNum).padStart(3, '0')}` ||
        c.customerId === `CUST-${String(nextNum).padStart(3, '0')}`
    )
  ) {
    nextNum++;
  }

  _counter = nextNum;
  return `CUST-${String(nextNum).padStart(3, '0')}`;
};

export const customerService = {
  // GET /api/customers
  getCustomers: async () => {
    return [..._customers];
  },

  // POST /api/customers
  createCustomer: async (customerData) => {
    const newId = generateCustomerId(_customers);
    const newCustomer = {
      id: newId,
      customerId: newId,
      name: customerData.name.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email ? customerData.email.trim() : '',
      address: customerData.address.trim(),
      gstNumber: customerData.gstNumber ? customerData.gstNumber.trim().toUpperCase() : '',
      status: customerData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: '₹ 0',
      purchaseHistory: []
    };
    _customers = [..._customers, newCustomer];
    return newCustomer;
  },

  // PUT /api/customers/:id
  updateCustomer: async (id, updatedData) => {
    _customers = _customers.map(c => {
      if (c.id === id || c.customerId === id) {
        return {
          ...c,
          name: updatedData.name.trim(),
          phone: updatedData.phone.trim(),
          email: updatedData.email ? updatedData.email.trim() : '',
          address: updatedData.address.trim(),
          gstNumber: updatedData.gstNumber ? updatedData.gstNumber.trim().toUpperCase() : '',
          status: updatedData.status || c.status
        };
      }
      return c;
    });
    return _customers.find(c => c.id === id || c.customerId === id);
  },

  // DELETE /api/customers/:id
  deleteCustomer: async (id) => {
    _customers = _customers.filter(c => c.id !== id && c.customerId !== id);
    return { success: true, id };
  },

  // PATCH /api/customers/:id/toggle-status
  toggleCustomerStatus: async (id) => {
    _customers = _customers.map(c => {
      if (c.id === id || c.customerId === id) {
        return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return c;
    });
    return _customers.find(c => c.id === id || c.customerId === id);
  },

  // GET /api/customers/:id/history
  getCustomerHistory: async (id) => {
    const customer = _customers.find(c => c.id === id || c.customerId === id);
    return customer ? (customer.purchaseHistory || []) : [];
  }
};

export default customerService;
