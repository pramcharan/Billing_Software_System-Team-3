// API-Ready Purchase Service for Team 3 - Purchase Management
// Currently uses in-memory React state only. NO localStorage.
// Replace mock implementations with axios/fetch calls when backend APIs (/api/purchases) are available.

// In-memory store (session only — resets on page refresh, as required)
let _purchases = [];
let _counter = 0;

/**
 * Generates unique Purchase IDs in format PUR-001, PUR-002, etc.
 * Uses an in-memory counter so deleted IDs are never reused within the session.
 */
export const generatePurchaseId = (purchases = []) => {
  const maxExisting = purchases.reduce((max, p) => {
    const idStr = p.purchaseId || p.id || '';
    const match = idStr.match(/PUR-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);

  let nextNum = Math.max(_counter, maxExisting) + 1;

  while (
    purchases.some(
      p =>
        p.id === `PUR-${String(nextNum).padStart(3, '0')}` ||
        p.purchaseId === `PUR-${String(nextNum).padStart(3, '0')}`
    )
  ) {
    nextNum++;
  }

  _counter = nextNum;
  return `PUR-${String(nextNum).padStart(3, '0')}`;
};

export const purchaseService = {
  // GET /api/purchases
  getPurchases: async () => {
    return [..._purchases];
  },

  // POST /api/purchases
  createPurchase: async (purchaseData) => {
    const newId = generatePurchaseId(_purchases);
    const newPurchase = {
      id: newId,
      purchaseId: newId,
      ...purchaseData,
      createdAt: new Date().toISOString()
    };
    _purchases = [..._purchases, newPurchase];
    return newPurchase;
  },

  // PUT /api/purchases/:id
  updatePurchase: async (id, updatedData) => {
    _purchases = _purchases.map(p => {
      if (p.id === id || p.purchaseId === id) {
        return { ...p, ...updatedData, id: p.id, purchaseId: p.purchaseId, createdAt: p.createdAt };
      }
      return p;
    });
    return _purchases.find(p => p.id === id || p.purchaseId === id);
  },

  // DELETE /api/purchases/:id
  deletePurchase: async (id) => {
    _purchases = _purchases.filter(p => p.id !== id && p.purchaseId !== id);
    return { success: true, id };
  },

  // GET /api/purchases/:id
  getPurchaseById: async (id) => {
    return _purchases.find(p => p.id === id || p.purchaseId === id) || null;
  }
};

export default purchaseService;
