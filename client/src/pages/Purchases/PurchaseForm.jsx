import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import purchaseService, {
  generatePurchaseId,
} from '../../services/purchaseService';
import supplierService from '../../services/supplierService';

// ---------------------------------------------------------
// TEMPORARY PRODUCTS
// ---------------------------------------------------------
// IMPORTANT:
// Team 2's Product API is not connected yet.
// The backend requires a real productId (MongoDB ObjectId).
//
// For now, products are kept empty.
// Once Team 2 gives us the Product API, we will connect it here.
// ---------------------------------------------------------
const TEMP_PRODUCTS = [];

// ---------------------------------------------------------
// PAYMENT STATUS
// ---------------------------------------------------------
const PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Partial',
  'Unpaid',
];

// ---------------------------------------------------------
// EMPTY ITEM
// ---------------------------------------------------------
const createEmptyItem = () => ({
  productId: '',
  productName: '',
  quantity: 1,
  purchasePrice: 0,
  tax: 0,
  discount: 0,
});

// ---------------------------------------------------------
// PURCHASE FORM
// ---------------------------------------------------------
const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  // -------------------------------------------------------
  // FORM STATE
  // -------------------------------------------------------
  const [purchaseId, setPurchaseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [items, setItems] = useState([createEmptyItem()]);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [paymentStatus, setPaymentStatus] = useState('Pending');

  const [notes, setNotes] = useState('');

  // -------------------------------------------------------
  // SUPPLIER STATE
  // -------------------------------------------------------
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // -------------------------------------------------------
  // GENERAL STATE
  // -------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // -------------------------------------------------------
  // LOAD SUPPLIERS
  // -------------------------------------------------------
  const loadSuppliers = useCallback(async () => {
    try {
      setLoadingSuppliers(true);
      setError('');

      const data = await supplierService.getSuppliers();

      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);

      setError(
        err.message ||
          'Unable to load suppliers. Please make sure the backend is running.'
      );
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  // -------------------------------------------------------
  // LOAD PURCHASE WHEN EDITING
  // -------------------------------------------------------
  const loadPurchase = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingPurchase(true);
      setError('');

      const purchase = await purchaseService.getPurchaseById(id);

      setPurchaseId(purchase.purchaseId || '');

      setSupplierId(
        typeof purchase.supplierId === 'object'
          ? purchase.supplierId?._id
          : purchase.supplierId || ''
      );

      setPurchaseDate(
        purchase.purchaseDate ||
          new Date().toISOString().split('T')[0]
      );

      setPaymentStatus(
        purchase.paymentStatus || 'Pending'
      );

      setDiscountAmount(
        Number(purchase.discountAmount || 0)
      );

      setTaxAmount(
        Number(purchase.taxAmount || 0)
      );

      const loadedItems = (purchase.items || []).map((item) => ({
        productId:
          typeof item.productId === 'object'
            ? item.productId?._id || ''
            : item.productId || '',
        productName:
          item.productName || '',
        quantity: Number(item.quantity || 1),
        purchasePrice: Number(item.purchasePrice || 0),
        tax: Number(item.tax || 0),
        discount: Number(item.discount || 0),
      }));

      setItems(
        loadedItems.length > 0
          ? loadedItems
          : [createEmptyItem()]
      );
    } catch (err) {
      console.error('Failed to load purchase:', err);

      setError(
        err.message ||
          'Unable to load purchase details.'
      );
    } finally {
      setLoadingPurchase(false);
    }
  }, [id]);

  // -------------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------------
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    if (isEditMode) {
      loadPurchase();
    } else {
      setPurchaseId('');
      setItems([createEmptyItem()]);
    }
  }, [isEditMode, loadPurchase]);

  // -------------------------------------------------------
  // GENERATE PURCHASE ID
  // -------------------------------------------------------
  useEffect(() => {
    const generateId = async () => {
      if (isEditMode) return;

      try {
        const purchases = await purchaseService.getPurchases();

        const newId = generatePurchaseId(purchases);

        setPurchaseId(newId);
      } catch (err) {
        console.error(
          'Unable to generate purchase ID:',
          err
        );

        setPurchaseId(
          `PUR-${Date.now()}`
        );
      }
    };

    generateId();
  }, [isEditMode]);

  // -------------------------------------------------------
  // ITEM CALCULATIONS
  // -------------------------------------------------------
  const calculateItemSubtotal = (item) => {
    const quantity = Number(item.quantity || 0);
    const purchasePrice = Number(
      item.purchasePrice || 0
    );

    return quantity * purchasePrice;
  };

  const calculateItemTax = (item) => {
    const subtotal = calculateItemSubtotal(item);
    const taxRate = Number(item.tax || 0);

    return (subtotal * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    const subtotal = calculateItemSubtotal(item);
    const tax = calculateItemTax(item);

    return subtotal + tax;
  };

  // -------------------------------------------------------
  // TOTALS
  // -------------------------------------------------------
  const subtotal = items.reduce(
    (total, item) =>
      total + calculateItemSubtotal(item),
    0
  );

  const calculatedItemTax = items.reduce(
    (total, item) =>
      total + calculateItemTax(item),
    0
  );

  const finalTax =
    Number(taxAmount || 0) > 0
      ? Number(taxAmount)
      : calculatedItemTax;

  const discount =
    Number(discountAmount || 0);

  const grandTotal =
    Math.max(
      0,
      subtotal - discount + finalTax
    );

  // -------------------------------------------------------
  // HANDLE ITEM CHANGE
  // -------------------------------------------------------
  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // -------------------------------------------------------
  // ADD ITEM
  // -------------------------------------------------------
  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  };

  // -------------------------------------------------------
  // REMOVE ITEM
  // -------------------------------------------------------
  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // -------------------------------------------------------
  // SELECT PRODUCT
  // -------------------------------------------------------
  const handleProductChange = (
    index,
    productId
  ) => {
    const selectedProduct =
      TEMP_PRODUCTS.find(
        (product) =>
          product.id === productId
      );

    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              productName:
                selectedProduct?.name || '',
              purchasePrice:
                selectedProduct?.purchasePrice || 0,
            }
          : item
      )
    );
  };

  // -------------------------------------------------------
  // VALIDATE FORM
  // -------------------------------------------------------
  const validateForm = () => {
    if (!purchaseId.trim()) {
      return 'Purchase ID is required.';
    }

    if (!supplierId) {
      return 'Please select a supplier.';
    }

    if (!purchaseDate) {
      return 'Purchase date is required.';
    }

    if (!items.length) {
      return 'At least one purchase item is required.';
    }

    // Backend requires a real Team 2 productId.
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.productId) {
        return `Product is required for item ${index + 1}.`;
      }

      if (
        Number(item.quantity) <= 0 ||
        !item.quantity
      ) {
        return `Quantity must be greater than 0 for item ${
          index + 1
        }.`;
      }

      if (
        Number(item.purchasePrice) < 0 ||
        item.purchasePrice === ''
      ) {
        return `Purchase price cannot be negative for item ${
          index + 1
        }.`;
      }

      if (Number(item.tax || 0) < 0) {
        return `Tax cannot be negative for item ${
          index + 1
        }.`;
      }
    }

    if (discount < 0) {
      return 'Discount cannot be negative.';
    }

    if (discount > subtotal) {
      return 'Discount cannot be greater than subtotal.';
    }

    if (finalTax < 0) {
      return 'Tax cannot be negative.';
    }

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return 'Please select a valid payment status.';
    }

    return '';
  };

  // -------------------------------------------------------
  // SUBMIT PURCHASE
  // -------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    // -----------------------------------------------------
    // PURCHASE EDIT IS NOT SUPPORTED BY CURRENT BACKEND
    // -----------------------------------------------------
    if (isEditMode) {
      setError(
        'Purchase editing is currently not supported by the Team 3 backend. Please create a new purchase instead.'
      );
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------------
      // CONVERT FRONTEND ITEMS TO BACKEND FORMAT
      // ---------------------------------------------------
      const backendItems = items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        purchasePrice: Number(
          item.purchasePrice
        ),
        tax: Number(item.tax || 0),
      }));

      // ---------------------------------------------------
      // BACKEND PAYLOAD
      // ---------------------------------------------------
      const payload = {
        purchaseId: purchaseId.trim(),

        supplierId,

        purchaseDate,

        items: backendItems,

        subtotal: Number(
          subtotal.toFixed(2)
        ),

        discount: Number(
          discount.toFixed(2)
        ),

        tax: Number(
          finalTax.toFixed(2)
        ),

        totalAmount: Number(
          grandTotal.toFixed(2)
        ),

        paymentStatus:
          paymentStatus.toLowerCase(),
      };

      console.log(
        'Creating purchase:',
        payload
      );

      // ---------------------------------------------------
      // SEND TO BACKEND
      // ---------------------------------------------------
      const createdPurchase =
        await purchaseService.createPurchase(
          payload
        );

      console.log(
        'Purchase created successfully:',
        createdPurchase
      );

      setSuccessMessage(
        'Purchase created successfully.'
      );

      // ---------------------------------------------------
      // GO TO PURCHASE LIST
      // ---------------------------------------------------
      setTimeout(() => {
        navigate('/purchases');
      }, 1000);
    } catch (err) {
      console.error(
        'Failed to create purchase:',
        err
      );

      // Backend validation errors
      if (
        err.errors &&
        Array.isArray(err.errors) &&
        err.errors.length > 0
      ) {
        setError(
          err.errors
            .map(
              (errorItem) =>
                errorItem.message ||
                errorItem.msg ||
                String(errorItem)
            )
            .join(' ')
        );
      } else {
        setError(
          err.message ||
            'Failed to create purchase. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // CANCEL
  // -------------------------------------------------------
  const handleCancel = () => {
    navigate('/purchases');
  };

  // -------------------------------------------------------
  // LOADING PURCHASE
  // -------------------------------------------------------
  if (loadingPurchase) {
    return (
      <div
        style={{
          padding: '30px',
          textAlign: 'center',
        }}
      >
        <h3>Loading purchase...</h3>
      </div>
    );
  }

  // -------------------------------------------------------
  // PAGE
  // -------------------------------------------------------
  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* ------------------------------------------------- */}
      {/* HEADER */}
      {/* ------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: '6px',
            }}
          >
            {isEditMode
              ? 'Edit Purchase'
              : 'Create Purchase'}
          </h1>

          <p
            style={{
              margin: 0,
              color: '#666',
            }}
          >
            Manage purchase information and items
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '10px 18px',
            border: '1px solid #ccc',
            background: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>

      {/* ------------------------------------------------- */}
      {/* ERROR */}
      {/* ------------------------------------------------- */}
      {error && (
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #f5b5b5',
            color: '#b00020',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* ------------------------------------------------- */}
      {/* SUCCESS */}
      {/* ------------------------------------------------- */}
      {successMessage && (
        <div
          style={{
            background: '#eaf8ea',
            border: '1px solid #a8d8a8',
            color: '#176b17',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ------------------------------------------------- */}
      {/* EDIT MODE WARNING */}
      {/* ------------------------------------------------- */}
      {isEditMode && (
        <div
          style={{
            background: '#fff8e1',
            border: '1px solid #f0d98c',
            color: '#725900',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          Purchase editing is not available because the
          current backend does not provide a PUT purchase
          endpoint.
        </div>
      )}

      {/* ------------------------------------------------- */}
      {/* FORM */}
      {/* ------------------------------------------------- */}
      <form onSubmit={handleSubmit}>
        {/* ----------------------------------------------- */}
        {/* BASIC INFORMATION */}
        {/* ----------------------------------------------- */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Purchase Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {/* PURCHASE ID */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                Purchase ID
              </label>

              <input
                type="text"
                value={purchaseId}
                onChange={(event) =>
                  setPurchaseId(
                    event.target.value
                  )
                }
                disabled={isEditMode}
                placeholder="PUR-001"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* SUPPLIER */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                Supplier *
              </label>

              <select
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value
                  )
                }
                disabled={loadingSuppliers}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                <option value="">
                  {loadingSuppliers
                    ? 'Loading suppliers...'
                    : 'Select Supplier'}
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={
                      supplier.id ||
                      supplier._id
                    }
                    value={
                      supplier.id ||
                      supplier._id
                    }
                  >
                    {supplier.companyName}
                  </option>
                ))}
              </select>

              {!loadingSuppliers &&
                suppliers.length === 0 && (
                  <small
                    style={{
                      display: 'block',
                      marginTop: '6px',
                      color: '#b00020',
                    }}
                  >
                    No suppliers found. Please
                    create a supplier first.
                  </small>
                )}
            </div>

            {/* PURCHASE DATE */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                Purchase Date *
              </label>

              <input
                type="date"
                value={purchaseDate}
                onChange={(event) =>
                  setPurchaseDate(
                    event.target.value
                  )
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* PRODUCTS / ITEMS */}
        {/* ----------------------------------------------- */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  marginBottom: '5px',
                }}
              >
                Purchase Items
              </h2>

              <small
                style={{
                  color: '#666',
                }}
              >
                Products must come from Team 2
                inventory.
              </small>
            </div>

            <button
              type="button"
              onClick={addItem}
              style={{
                padding: '9px 15px',
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              + Add Item
            </button>
          </div>

          {/* TEAM 2 PRODUCT NOTICE */}
          {TEMP_PRODUCTS.length === 0 && (
            <div
              style={{
                background: '#fff8e1',
                border:
                  '1px solid #f0d98c',
                color: '#725900',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            >
              <strong>
                Team 2 Product API required:
              </strong>{' '}
              The purchase backend requires a
              real Product ID. The product dropdown
              will be connected to Team 2 inventory
              once their Product API is available.
            </div>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e2e2e2',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '14px',
              }}
            >
              {/* ITEM HEADER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}
              >
                <strong>
                  Item {index + 1}
                </strong>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    style={{
                      border: 'none',
                      background:
                        '#ffecec',
                      color: '#b00020',
                      padding:
                        '7px 10px',
                      borderRadius:
                        '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '2fr 1fr 1fr 1fr',
                  gap: '14px',
                }}
              >
                {/* PRODUCT */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '6px',
                      fontWeight: 600,
                    }}
                  >
                    Product *
                  </label>

                  {TEMP_PRODUCTS.length > 0 ? (
                    <select
                      value={
                        item.productId
                      }
                      onChange={(
                        event
                      ) =>
                        handleProductChange(
                          index,
                          event.target
                            .value
                        )
                      }
                      style={{
                        width: '100%',
                        padding:
                          '10px',
                        border:
                          '1px solid #ccc',
                        borderRadius:
                          '6px',
                        boxSizing:
                          'border-box',
                        background:
                          '#fff',
                      }}
                    >
                      <option value="">
                        Select Product
                      </option>

                      {TEMP_PRODUCTS.map(
                        (product) => (
                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                          >
                            {
                              product.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={
                        item.productName
                      }
                      disabled
                      placeholder="Waiting for Team 2 Product API"
                      style={{
                        width:
                          '100%',
                        padding:
                          '10px',
                        border:
                          '1px solid #ccc',
                        borderRadius:
                          '6px',
                        boxSizing:
                          'border-box',
                        background:
                          '#f5f5f5',
                      }}
                    />
                  )}
                </div>

                {/* QUANTITY */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '6px',
                      fontWeight: 600,
                    }}
                  >
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      item.quantity
                    }
                    onChange={(
                      event
                    ) =>
                      handleItemChange(
                        index,
                        'quantity',
                        event.target
                          .value
                      )
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #ccc',
                      borderRadius:
                        '6px',
                      boxSizing:
                        'border-box',
                    }}
                  />
                </div>

                {/* PURCHASE PRICE */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '6px',
                      fontWeight: 600,
                    }}
                  >
                    Purchase Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      item.purchasePrice
                    }
                    onChange={(
                      event
                    ) =>
                      handleItemChange(
                        index,
                        'purchasePrice',
                        event.target
                          .value
                      )
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #ccc',
                      borderRadius:
                        '6px',
                      boxSizing:
                        'border-box',
                    }}
                  />
                </div>

                {/* TAX */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '6px',
                      fontWeight: 600,
                    }}
                  >
                    Tax %
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      item.tax
                    }
                    onChange={(
                      event
                    ) =>
                      handleItemChange(
                        index,
                        'tax',
                        event.target
                          .value
                      )
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #ccc',
                      borderRadius:
                        '6px',
                      boxSizing:
                        'border-box',
                    }}
                  />
                </div>
              </div>

              {/* ITEM TOTAL */}
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '12px',
                  color: '#444',
                }}
              >
                Item Total:{' '}
                <strong>
                  ₹
                  {calculateItemTotal(
                    item
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* ----------------------------------------------- */}
        {/* PAYMENT + NOTES */}
        {/* ----------------------------------------------- */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Payment Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {/* DISCOUNT */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom:
                    '6px',
                  fontWeight: 600,
                }}
              >
                Discount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  discountAmount
                }
                onChange={(
                  event
                ) =>
                  setDiscountAmount(
                    event.target
                      .value
                  )
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border:
                    '1px solid #ccc',
                  borderRadius:
                    '6px',
                  boxSizing:
                    'border-box',
                }}
              />
            </div>

            {/* TAX */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom:
                    '6px',
                  fontWeight: 600,
                }}
              >
                Total Tax
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  taxAmount
                }
                onChange={(
                  event
                ) =>
                  setTaxAmount(
                    event.target
                      .value
                  )
                }
                placeholder="Leave 0 to calculate from items"
                style={{
                  width: '100%',
                  padding: '10px',
                  border:
                    '1px solid #ccc',
                  borderRadius:
                    '6px',
                  boxSizing:
                    'border-box',
                }}
              />
            </div>

            {/* PAYMENT STATUS */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom:
                    '6px',
                  fontWeight: 600,
                }}
              >
                Payment Status *
              </label>

              <select
                value={
                  paymentStatus
                }
                onChange={(
                  event
                ) =>
                  setPaymentStatus(
                    event.target
                      .value
                  )
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border:
                    '1px solid #ccc',
                  borderRadius:
                    '6px',
                  boxSizing:
                    'border-box',
                  background:
                    '#fff',
                }}
              >
                {PAYMENT_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* NOTES */}
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom:
                  '6px',
                fontWeight: 600,
              }}
            >
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              rows="3"
              placeholder="Optional notes"
              style={{
                width: '100%',
                padding: '10px',
                border:
                  '1px solid #ccc',
                borderRadius:
                  '6px',
                boxSizing:
                  'border-box',
                resize: 'vertical',
              }}
            />

            <small
              style={{
                color: '#777',
              }}
            >
              Note: Notes are currently
              displayed in the form but are not
              stored because the current backend
              Purchase model does not have a notes
              field.
            </small>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* TOTAL SUMMARY */}
        {/* ----------------------------------------------- */}
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '18px',
            }}
          >
            Purchase Summary
          </h2>

          <div
            style={{
              maxWidth: '400px',
              marginLeft: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '10px',
              }}
            >
              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '10px',
              }}
            >
              <span>
                Discount
              </span>

              <strong>
                - ₹{discount.toFixed(2)}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '10px',
              }}
            >
              <span>
                Tax
              </span>

              <strong>
                ₹{finalTax.toFixed(2)}
              </strong>
            </div>

            <hr />

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                fontSize: '20px',
                marginTop: '14px',
              }}
            >
              <strong>
                Grand Total
              </strong>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* BUTTONS */}
        {/* ----------------------------------------------- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '30px',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '11px 20px',
              border:
                '1px solid #ccc',
              background: '#fff',
              borderRadius:
                '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              loadingSuppliers ||
              isEditMode
            }
            style={{
              padding: '11px 22px',
              border: 'none',
              background:
                loading ||
                loadingSuppliers ||
                isEditMode
                  ? '#999'
                  : '#2563eb',
              color: '#fff',
              borderRadius:
                '6px',
              cursor:
                loading ||
                loadingSuppliers ||
                isEditMode
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: 600,
            }}
          >
            {loading
              ? 'Saving...'
              : 'Create Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;