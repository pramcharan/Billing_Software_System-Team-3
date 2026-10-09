import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";
import Customer from "../models/Customer.js";
import { findMissingProducts, increaseStock } from "../services/inventoryService.js";

const parseDate = (value, endOfDay = false) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) d.setUTCHours(23, 59, 59, 999);
    return d;
};

export const createPurchase = async (req, res) => {
    try {
        // Body is already validated by validatePurchase middleware
        const { supplierId,
            customerId,
            purchaseDate,
            items,
            subtotal,
            discount,
            tax,
            totalAmount,
            notes }
                  = req.body;
        const purchaseId = req.body.purchaseId.trim();
        const paymentStatus = req.body.paymentStatus.trim().toLowerCase();

        if (await Purchase.exists({ purchaseId })) {
            return res.status(400).json({ success: false, message: "Purchase ID already exists" });
        }

        if (!(await Supplier.exists({ _id: supplierId }))) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        if (customerId && !(await Customer.exists({ _id: customerId }))) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const missing = await findMissingProducts(items.map((i) => i.productId));
        if (missing.length > 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                missingProducts: missing
            });
        }

        const purchase = await Purchase.create({
            purchaseId, supplierId, customerId, purchaseDate, items,
            subtotal, discount, tax, totalAmount, paymentStatus, notes
        });

        // Purchase -> Inventory integration
        try {
            const updated = await increaseStock(purchase.items);
            if (updated) {
                purchase.stockUpdated = true;
                await purchase.save();
            }
        } catch (stockError) {
            console.error("Stock update failed, rolling back purchase:", stockError);
            await Purchase.findByIdAndDelete(purchase._id);
            return res.status(500).json({
                success: false,
                message: "Failed to update inventory. Purchase was not saved."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Purchase created successfully",
            data: purchase
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, message: "Purchase ID already exists" });
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Create purchase error:", error);
        return res.status(500).json({ success: false, message: "Failed to create purchase" });
    }
};

export const getPurchases = async (req, res) => {
    try {
        const { from, to, supplier } = req.query;
        const filter = {};

        if (supplier) {
            if (!mongoose.isValidObjectId(supplier)) {
                return res.status(400).json({ success: false, message: "Invalid supplier ID" });
            }
            filter.supplierId = supplier;
        }

        let fromDate, toDate;
        if (from) {
            fromDate = parseDate(from);
            if (!fromDate) return res.status(400).json({ success: false, message: "Invalid from date" });
        }
        if (to) {
            toDate = parseDate(to, true);
            if (!toDate) return res.status(400).json({ success: false, message: "Invalid to date" });
        }
        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({ success: false, message: "from date cannot be after to date" });
        }
        if (fromDate || toDate) {
            filter.purchaseDate = {};
            if (fromDate) filter.purchaseDate.$gte = fromDate;
            if (toDate) filter.purchaseDate.$lte = toDate;
        }

        const purchases = await Purchase.find(filter)
            .populate("supplierId", "companyName contactPerson")
            .sort({ purchaseDate: -1 });

        return res.status(200).json({ success: true, count: purchases.length, data: purchases });
    } catch (error) {
        console.error("Get purchases error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch purchases" });
    }
};

export const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid purchase ID" });
        }

        const purchase = await Purchase.findById(id)
            .populate("supplierId", "companyName contactPerson");

        if (!purchase) {
            return res.status(404).json({ success: false, message: "Purchase not found" });
        }

        return res.status(200).json({ success: true, data: purchase });
    } catch (error) {
        console.error("Get purchase by ID error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch purchase" });
    }
};

export const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid purchase ID" });
        }

        const purchase = await Purchase.findById(id);

        if (!purchase) {
            return res.status(404).json({ success: false, message: "Purchase not found" });
        }

        const {
            supplierId,
            customerId,
            purchaseDate,
            items,
            subtotal,
            discount,
            tax,
            totalAmount,
            paymentStatus,
            notes
        } = req.body;

        if (supplierId && !(await Supplier.exists({ _id: supplierId }))) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        if (customerId && !(await Customer.exists({ _id: customerId }))) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Validate products if items are being updated
        if (items && items.length > 0) {
            const missing = await findMissingProducts(items.map((i) => i.productId));
            if (missing.length > 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                    missingProducts: missing
                });
            }
            purchase.items = items;
        }

        if (supplierId) purchase.supplierId = supplierId;
        if (customerId !== undefined) purchase.customerId = customerId || null;
        if (purchaseDate) purchase.purchaseDate = purchaseDate;
        if (subtotal !== undefined) purchase.subtotal = subtotal;
        if (discount !== undefined) purchase.discount = discount;
        if (tax !== undefined) purchase.tax = tax;
        if (totalAmount !== undefined) purchase.totalAmount = totalAmount;
        if (paymentStatus) purchase.paymentStatus = paymentStatus.trim().toLowerCase();
        if (notes !== undefined) purchase.notes = notes;

        const updatedPurchase = await purchase.save();

        const populated = await Purchase.findById(updatedPurchase._id)
            .populate("supplierId", "companyName contactPerson");

        return res.status(200).json({
            success: true,
            message: "Purchase updated successfully",
            data: populated
        });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Update purchase error:", error);
        return res.status(500).json({ success: false, message: "Failed to update purchase" });
    }
};

export const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid purchase ID" });
        }

        const purchase = await Purchase.findById(id);

        if (!purchase) {
            return res.status(404).json({ success: false, message: "Purchase not found" });
        }

        await Purchase.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Purchase deleted successfully"
        });
    } catch (error) {
        console.error("Delete purchase error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete purchase" });
    }
};