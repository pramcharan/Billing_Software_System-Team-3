// API-Ready Customer Service for Team 3 - Customer Management
// Currently uses local mock state. Replace mock implementations with axios/fetch calls when backend APIs (/api/customers) are available.

const INITIAL_MOCK_CUSTOMERS = [];

const STORAGE_KEY = 'team3_customer_data_v4';
const COUNTER_KEY = 'team3_customer_sequence_v4';

const getStoredCustomers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading customer storage:", e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CUSTOMERS));
  return INITIAL_MOCK_CUSTOMERS;
};

const saveStoredCustomers = (customers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error("Error saving customer storage:", e);
  }
};

const getStoredCounter = () => {
  try {
    const saved = localStorage.getItem(COUNTER_KEY);
    if (saved !== null) return parseInt(saved, 10) || 0;
  } catch (e) {
    console.error("Error reading customer sequence counter:", e);
  }
  return 0;
};

const saveStoredCounter = (counter) => {
  try {
    localStorage.setItem(COUNTER_KEY, counter.toString());
  } catch (e) {
    console.error("Error saving customer sequence counter:", e);
  }
};

/**
 * Generates a unique Customer ID (e.g. CUST-001, CUST-002) that never repeats,
 * even if customers are deleted or deactivated.
 */
export const generateCustomerId = (customers = []) => {
  let counter = getStoredCounter();

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

  let nextNum = Math.max(counter, maxExisting) + 1;

  // Ensure nextNum is unique and never matches an existing customer ID
  while (
    customers.some(
      c =>
        c.id === `CUST-${String(nextNum).padStart(3, "0")}` ||
        c.customerId === `CUST-${String(nextNum).padStart(3, "0")}`
    )
  ) {
    nextNum++;
  }

  saveStoredCounter(nextNum);
  return `CUST-${String(nextNum).padStart(3, "0")}`;
};

export const customerService = {
  // GET /api/customers
  getCustomers: async () => {
    return getStoredCustomers();
  },

  // POST /api/customers
  createCustomer: async (customerData) => {
    const customers = getStoredCustomers();
    const newId = generateCustomerId(customers);
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
    const updated = [...customers, newCustomer];
    saveStoredCustomers(updated);
    return newCustomer;
  },

  // PUT /api/customers/:id
  updateCustomer: async (id, updatedData) => {
    const customers = getStoredCustomers();
    const updated = customers.map(c => {
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
    saveStoredCustomers(updated);
    return updated.find(c => c.id === id || c.customerId === id);
  },

  // DELETE /api/customers/:id
  deleteCustomer: async (id) => {
    const customers = getStoredCustomers();
    const updated = customers.filter(c => c.id !== id && c.customerId !== id);
    saveStoredCustomers(updated);
    return { success: true, id };
  },

  // PATCH /api/customers/:id/toggle-status
  toggleCustomerStatus: async (id) => {
    const customers = getStoredCustomers();
    const updated = customers.map(c => {
      if (c.id === id || c.customerId === id) {
        return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return c;
    });
    saveStoredCustomers(updated);
    return updated.find(c => c.id === id || c.customerId === id);
  },

  // GET /api/customers/:id/history
  getCustomerHistory: async (id) => {
    const customers = getStoredCustomers();
    const customer = customers.find(c => c.id === id || c.customerId === id);
    return customer ? (customer.purchaseHistory || []) : [];
  }
};

export default customerService;
