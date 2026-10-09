import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        purchasePrice: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { _id: false }
);

const purchaseSchema = new mongoose.Schema(
    {
        purchaseId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },

        purchaseDate: {
            type: Date,
            required: true
        },

        items: {
            type: [purchaseItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Purchase must contain at least one product"
            }
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            required: true,
            trim: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },

        stockUpdated: {
            type: Boolean,
            default: false
        },

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;