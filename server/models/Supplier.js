import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true
        },

        contactPerson: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            trim: true
        },

        gstNumber: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;