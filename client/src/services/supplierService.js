// API-Ready Supplier Service for Team 3 - Supplier Management
// Uses localStorage ('suppliers' key) as requested.
// Storage logic is decoupled so it can later be replaced by backend API endpoints (/api/suppliers).

const STORAGE_KEY = 'suppliers';
const COUNTER_KEY = 'suppliers_counter';

const getStoredSuppliers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading suppliers from localStorage:", e);
  }
  return [];
};

const saveStoredSuppliers = (suppliers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch (e) {
    console.error("Error saving suppliers to localStorage:", e);
  }
};

const getStoredCounter = () => {
  try {
    const saved = localStorage.getItem(COUNTER_KEY);
    if (saved !== null) return parseInt(saved, 10) || 0;
  } catch (e) {
    console.error("Error reading supplier counter:", e);
  }
  return 0;
};

const saveStoredCounter = (counter) => {
  try {
    localStorage.setItem(COUNTER_KEY, counter.toString());
  } catch (e) {
    console.error("Error saving supplier counter:", e);
  }
};

/**
 * Generates unique Supplier IDs in format SUP-001, SUP-002, SUP-003.
 * Uses a separate counter in localStorage to ensure deleted IDs are never reused.
 */
export const generateSupplierId = (suppliers = []) => {
  let counter = getStoredCounter();

  // Safeguard: find maximum numeric suffix among all existing supplier IDs
  const maxExisting = suppliers.reduce((max, s) => {
    const sIdStr = s.supplierId || s.id || '';
    const match = sIdStr.match(/SUP-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);

  let nextNum = Math.max(counter, maxExisting) + 1;

  // Ensure nextNum does not collide with any existing supplier ID
  while (
    suppliers.some(
      s =>
        s.id === `SUP-${String(nextNum).padStart(3, "0")}` ||
        s.supplierId === `SUP-${String(nextNum).padStart(3, "0")}`
    )
  ) {
    nextNum++;
  }

  saveStoredCounter(nextNum);
  return `SUP-${String(nextNum).padStart(3, "0")}`;
};

export const supplierService = {
  // GET /api/suppliers
  getSuppliers: async () => {
    return getStoredSuppliers();
  },

  // POST /api/suppliers
  createSupplier: async (supplierData) => {
    const suppliers = getStoredSuppliers();
    const newId = generateSupplierId(suppliers);
    const newSupplier = {
      id: newId,
      supplierId: newId,
      companyName: supplierData.companyName.trim(),
      contactPerson: supplierData.contactPerson.trim(),
      phone: supplierData.phone.trim(),
      email: supplierData.email.trim(),
      address: supplierData.address.trim(),
      gstNumber: supplierData.gstNumber ? supplierData.gstNumber.trim().toUpperCase() : '',
      status: supplierData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...suppliers, newSupplier];
    saveStoredSuppliers(updated);
    return newSupplier;
  },

  // PUT /api/suppliers/:id
  updateSupplier: async (id, updatedData) => {
    const suppliers = getStoredSuppliers();
    const updated = suppliers.map(s => {
      if (s.id === id || s.supplierId === id) {
        return {
          ...s,
          companyName: updatedData.companyName.trim(),
          contactPerson: updatedData.contactPerson.trim(),
          phone: updatedData.phone.trim(),
          email: updatedData.email.trim(),
          address: updatedData.address.trim(),
          gstNumber: updatedData.gstNumber ? updatedData.gstNumber.trim().toUpperCase() : '',
          status: updatedData.status || s.status
        };
      }
      return s;
    });
    saveStoredSuppliers(updated);
    return updated.find(s => s.id === id || s.supplierId === id);
  },

  // DELETE /api/suppliers/:id
  deleteSupplier: async (id) => {
    const suppliers = getStoredSuppliers();
    const updated = suppliers.filter(s => s.id !== id && s.supplierId !== id);
    saveStoredSuppliers(updated);
    return { success: true, id };
  },

  // PATCH /api/suppliers/:id/toggle-status
  toggleSupplierStatus: async (id) => {
    const suppliers = getStoredSuppliers();
    const updated = suppliers.map(s => {
      if (s.id === id || s.supplierId === id) {
        return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return s;
    });
    saveStoredSuppliers(updated);
    return updated.find(s => s.id === id || s.supplierId === id);
  }
};

export default supplierService;
