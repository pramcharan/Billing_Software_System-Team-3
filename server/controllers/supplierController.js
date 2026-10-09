import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";

export const createSupplier = async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            phone,
            email,
            address,
            gstNumber,
            status
        } = req.body;

        if (!companyName || !companyName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company name is required"
            });
        }

        const supplier = await Supplier.create({
            companyName,
            contactPerson,
            phone,
            email,
            address,
            gstNumber,
            status: status || "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });
    } catch (error) {
        console.error("Create supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create supplier"
        });
    }
};

export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });
    } catch (error) {
        console.error("Get suppliers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch suppliers"
        });
    }
};

export const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        console.error("Get supplier by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch supplier"
        });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }

        const {
            companyName,
            contactPerson,
            phone,
            email,
            address,
            gstNumber,
            status
        } = req.body;

        if (!companyName || !companyName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company name is required"
            });
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        supplier.companyName = companyName;
        supplier.contactPerson = contactPerson;
        supplier.phone = phone;
        supplier.email = email;
        supplier.address = address;
        supplier.gstNumber = gstNumber;
        if (status) supplier.status = status;

        const updatedSupplier = await supplier.save();

        return res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: updatedSupplier
        });
    } catch (error) {
        console.error("Update supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update supplier"
        });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        await Supplier.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Supplier deleted successfully"
        });
    } catch (error) {
        console.error("Delete supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete supplier"
        });
    }
};

export const toggleSupplierStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID"
            });
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        supplier.status = supplier.status === "Active" ? "Inactive" : "Active";
        const updatedSupplier = await supplier.save();

        return res.status(200).json({
            success: true,
            message: `Supplier status changed to ${updatedSupplier.status}`,
            data: updatedSupplier
        });
    } catch (error) {
        console.error("Toggle supplier status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update supplier status"
        });
    }
};