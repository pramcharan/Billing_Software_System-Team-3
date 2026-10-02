import mongoose from "mongoose";
import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, gstNumber } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required"
            });
        }

        const customer = await Customer.create({
            name,
            phone,
            email,
            address,
            gstNumber
        });

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });
    } catch (error) {
        console.error("Create customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create customer"
        });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        console.error("Get customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error("Get customer by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const { name, phone, email, address, gstNumber } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required"
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        customer.name = name;
        customer.phone = phone;
        customer.email = email;
        customer.address = address;
        customer.gstNumber = gstNumber;

        const updatedCustomer = await customer.save();

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: updatedCustomer
        });
    } catch (error) {
        console.error("Update customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update customer"
        });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await Customer.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });
    } catch (error) {
        console.error("Delete customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete customer"
        });
    }
};