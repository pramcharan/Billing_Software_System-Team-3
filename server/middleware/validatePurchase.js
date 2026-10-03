const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const PAYMENT_STATUSES = ["paid", "pending", "partial", "unpaid"];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

export const validatePurchase = (req, res, next) => {
    const body = req.body || {};
    const errors = [];

    const { purchaseId, supplierId, customerId, purchaseDate, items,
            subtotal, discount, tax, totalAmount, paymentStatus } = body;

    // Required fields
    if (typeof purchaseId !== "string" || !purchaseId.trim())
        errors.push("purchaseId is required");
    else if (purchaseId.trim().length > 50)
        errors.push("purchaseId must be at most 50 characters");

    if (!supplierId) errors.push("supplierId is required");
    else if (typeof supplierId !== "string" || !OBJECT_ID.test(supplierId))
        errors.push("supplierId is not a valid ID");

    if (customerId !== undefined && customerId !== null &&
        (typeof customerId !== "string" || !OBJECT_ID.test(customerId)))
        errors.push("customerId is not a valid ID");

    // Date
    if (!purchaseDate) errors.push("purchaseDate is required");
    else {
        const d = new Date(purchaseDate);
        if (Number.isNaN(d.getTime())) errors.push("purchaseDate is not a valid date");
        else if (d.getTime() > Date.now() + 24 * 60 * 60 * 1000)
            errors.push("purchaseDate cannot be in the future");
    }

    // Items
    if (!Array.isArray(items) || items.length === 0) {
        errors.push("items must be a non-empty array");
    } else {
        const seen = new Set();
        items.forEach((it, i) => {
            if (!it || typeof it !== "object") {
                errors.push(`items[${i}] must be an object`);
                return;
            }
            if (!it.productId) errors.push(`items[${i}].productId is required`);
            else if (typeof it.productId !== "string" || !OBJECT_ID.test(it.productId))
                errors.push(`items[${i}].productId is not a valid ID`);
            else if (seen.has(it.productId))
                errors.push(`items[${i}].productId is duplicated in this purchase`);
            else seen.add(it.productId);

            if (!isNum(it.quantity) || it.quantity <= 0)
                errors.push(`items[${i}].quantity must be a number greater than 0`);
            if (!isNum(it.purchasePrice) || it.purchasePrice < 0)
                errors.push(`items[${i}].purchasePrice must be a number >= 0`);
            if (it.tax !== undefined && (!isNum(it.tax) || it.tax < 0))
                errors.push(`items[${i}].tax must be a number >= 0`);
        });
    }

    // Totals
    if (!isNum(subtotal) || subtotal < 0) errors.push("subtotal must be a number >= 0");
    if (!isNum(totalAmount) || totalAmount < 0) errors.push("totalAmount must be a number >= 0");
    if (discount !== undefined && (!isNum(discount) || discount < 0))
        errors.push("discount must be a number >= 0");
    if (tax !== undefined && (!isNum(tax) || tax < 0))
        errors.push("tax must be a number >= 0");
    if (isNum(subtotal) && isNum(discount) && discount > subtotal)
        errors.push("discount cannot be greater than subtotal");

    // Payment status
    if (typeof paymentStatus !== "string" || !paymentStatus.trim())
        errors.push("paymentStatus is required");
    else if (!PAYMENT_STATUSES.includes(paymentStatus.trim().toLowerCase()))
        errors.push(`paymentStatus must be one of: ${PAYMENT_STATUSES.join(", ")}`);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};