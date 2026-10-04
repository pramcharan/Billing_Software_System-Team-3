// API-Ready Supplier Service for Team 3 - Supplier Management
// Currently uses in-memory React state only. NO localStorage.
// Replace mock implementations with axios/fetch calls when backend APIs (/api/suppliers) are available.

// In-memory store (session only — resets on page refresh, as required)
let _suppliers = [];
let _counter = 0;

/**
 * Generates unique Supplier IDs in format SUP-001, SUP-002, SUP-003.
 * Uses an in-memory counter so deleted IDs are never reused within the session.
 */
export const generateSupplierId = (suppliers = []) => {
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

  let nextNum = Math.max(_counter, maxExisting) + 1;

  // Ensure nextNum does not collide with any existing supplier ID
  while (
    suppliers.some(
      s =>
        s.id === `SUP-${String(nextNum).padStart(3, '0')}` ||
        s.supplierId === `SUP-${String(nextNum).padStart(3, '0')}`
    )
  ) {
    nextNum++;
  }

  _counter = nextNum;
  return `SUP-${String(nextNum).padStart(3, '0')}`;
};

export const supplierService = {
  // GET /api/suppliers
  getSuppliers: async () => {
    return [..._suppliers];
  },

  // POST /api/suppliers
  createSupplier: async (supplierData) => {
    const newId = generateSupplierId(_suppliers);
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
    _suppliers = [..._suppliers, newSupplier];
    return newSupplier;
  },

  // PUT /api/suppliers/:id
  updateSupplier: async (id, updatedData) => {
    _suppliers = _suppliers.map(s => {
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
    return _suppliers.find(s => s.id === id || s.supplierId === id);
  },

  // DELETE /api/suppliers/:id
  deleteSupplier: async (id) => {
    _suppliers = _suppliers.filter(s => s.id !== id && s.supplierId !== id);
    return { success: true, id };
  },

  // PATCH /api/suppliers/:id/toggle-status
  toggleSupplierStatus: async (id) => {
    _suppliers = _suppliers.map(s => {
      if (s.id === id || s.supplierId === id) {
        return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return s;
    });
    return _suppliers.find(s => s.id === id || s.supplierId === id);
  }
};

export default supplierService;
