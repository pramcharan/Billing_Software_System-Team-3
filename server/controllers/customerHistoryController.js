import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Purchase from "../models/Purchase.js";

export const getCustomerHistory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid customer ID" });
        }

        const customer = await Customer.findById(id).select("name phone email");
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const purchases = await Purchase.find({ customerId: id })
            .select("purchaseId purchaseDate totalAmount paymentStatus")
            .sort({ purchaseDate: -1 })
            .lean();

        const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

        return res.status(200).json({
            success: true,
            customer,
            count: purchases.length,
            totalAmount,
            data: purchases
        });
    } catch (error) {
        console.error("Customer history error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch customer history" });
    }
};