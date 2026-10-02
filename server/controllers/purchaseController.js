import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";

export const createPurchase = async (req, res) => {
    try {
        const {
            purchaseId,
            supplierId,
            purchaseDate,
            items,
            subtotal,
            discount,
            tax,
            totalAmount,
            paymentStatus
        } = req.body;

        if (!purchaseId || !purchaseId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Purchase ID is required"
            });
        }

        if (!supplierId) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID is required"
            });
        }

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }

        if (!purchaseDate) {
            return res.status(400).json({
                success: false,
                message: "Purchase date is required"
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Purchase must contain at least one product"
            });
        }

        const supplier = await Supplier.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        for (const item of items) {
            if (!item.productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required for every purchase item"
                });
            }

            if (!mongoose.isValidObjectId(item.productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            if (
                item.quantity === undefined ||
                item.quantity === null ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than zero"
                });
            }

            if (
                item.purchasePrice === undefined ||
                item.purchasePrice === null ||
                item.purchasePrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Purchase price cannot be negative"
                });
            }

            if (item.tax !== undefined && item.tax < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tax cannot be negative"
                });
            }
        }

        const purchase = await Purchase.create({
            purchaseId,
            supplierId,
            purchaseDate,
            items,
            subtotal,
            discount,
            tax,
            totalAmount,
            paymentStatus
        });

        return res.status(201).json({
            success: true,
            message: "Purchase created successfully",
            data: purchase
        });
    } catch (error) {
        console.error("Create purchase error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create purchase"
        });
    }
};

export const getPurchases = async (req, res) => {
    try {
        const { from, to, supplier } = req.query;

        const filter = {};

        if (supplier) {
            if (!mongoose.isValidObjectId(supplier)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid supplier ID"
                });
            }

            filter.supplierId = supplier;
        }

        if (from || to) {
            filter.purchaseDate = {};

            if (from) {
                const fromDate = new Date(from);

                if (Number.isNaN(fromDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid from date"
                    });
                }

                filter.purchaseDate.$gte = fromDate;
            }

            if (to) {
                const toDate = new Date(to);

                if (Number.isNaN(toDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date"
                    });
                }

                filter.purchaseDate.$lte = toDate;
            }
        }

        const purchases = await Purchase.find(filter)
            .populate("supplierId", "companyName contactPerson")
            .sort({ purchaseDate: -1 });

        return res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });
    } catch (error) {
        console.error("Get purchases error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch purchases"
        });
    }
};

export const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase ID"
            });
        }

        const purchase = await Purchase.findById(id)
            .populate("supplierId", "companyName contactPerson");

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        console.error("Get purchase by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch purchase"
        });
    }
};