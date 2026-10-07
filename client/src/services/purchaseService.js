import { apiRequest } from './api';

const formatStatus = (status = '') =>
  status
    ? status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    : '';

const normalizePurchase = (purchase) => {
  const populatedSupplier =
    purchase.supplierId &&
    typeof purchase.supplierId === 'object'
      ? purchase.supplierId
      : null;

  return {
    ...purchase,
    id: purchase._id,
    purchaseId: purchase.purchaseId,

    supplierId:
      populatedSupplier?._id ||
      purchase.supplierId ||
      '',

    supplierName:
      populatedSupplier?.companyName ||
      purchase.supplierName ||
      '',

    purchaseDate: purchase.purchaseDate
      ? purchase.purchaseDate.split('T')[0]
      : '',

    paymentStatus: formatStatus(
      purchase.paymentStatus
    ),

    grandTotal:
      purchase.totalAmount ?? 0,

    taxAmount:
      purchase.tax ?? 0,

    discountAmount:
      purchase.discount ?? 0,

    items: (purchase.items || []).map(
      (item) => ({
        ...item,

        productId:
          typeof item.productId === 'object'
            ? item.productId._id
            : item.productId,
      })
    ),
  };
};

export const generatePurchaseId = (
  purchases = []
) => {
  const maxNumber = purchases.reduce(
    (max, purchase) => {
      const match = String(
        purchase.purchaseId || ''
      ).match(/PUR-(\d+)/i);

      const number = match
        ? Number(match[1])
        : 0;

      return Math.max(max, number);
    },
    0
  );

  return `PUR-${String(
    maxNumber + 1
  ).padStart(3, '0')}`;
};

export const purchaseService = {
  getPurchases: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.from) {
      params.append('from', filters.from);
    }

    if (filters.to) {
      params.append('to', filters.to);
    }

    if (filters.supplier) {
      params.append('supplier', filters.supplier);
    }

    const query = params.toString();

    const result = await apiRequest(
      `/purchases${query ? `?${query}` : ''}`
    );

    return (result.data || []).map(
      normalizePurchase
    );
  },

  getPurchaseById: async (id) => {
    const result = await apiRequest(
      `/purchases/${id}`
    );

    return normalizePurchase(
      result.data
    );
  },

  createPurchase: async (purchaseData) => {
    const payload = {
      purchaseId:
        purchaseData.purchaseId,

      supplierId:
        purchaseData.supplierId,

      ...(purchaseData.customerId
        ? {
            customerId:
              purchaseData.customerId,
          }
        : {}),

      purchaseDate:
        purchaseData.purchaseDate,

      items: (
        purchaseData.items || []
      ).map((item) => ({
        productId:
          item.productId,

        quantity: Number(
          item.quantity
        ),

        purchasePrice: Number(
          item.purchasePrice
        ),

        tax: Number(
          item.tax || 0
        ),
      })),

      subtotal: Number(
        purchaseData.subtotal || 0
      ),

      discount: Number(
        purchaseData.discount || 0
      ),

      tax: Number(
        purchaseData.tax || 0
      ),

      totalAmount: Number(
        purchaseData.totalAmount || 0
      ),

      paymentStatus:
        purchaseData.paymentStatus?.toLowerCase(),
    };

    const result = await apiRequest(
      '/purchases',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return normalizePurchase(
      result.data
    );
  },
};

export default purchaseService;