
import mongoose from "mongoose";

const productCollection = () => {
    return mongoose.connection.collection("products");
};

/**
 * Find products that do not exist in Team 2's Product collection.
 *
 * @param {string[]} productIds - Product IDs from purchase items
 * @returns {Promise<string[]>} - IDs of products that are missing
 */
export const findMissingProducts = async (productIds) => {
    const ids = [...new Set(productIds.map(String))];

    // Check for invalid MongoDB ObjectIds
    const invalidIds = ids.filter(
        (id) => !mongoose.isValidObjectId(id)
    );

    if (invalidIds.length > 0) {
        return invalidIds;
    }

    const objectIds = ids.map(
        (id) => new mongoose.Types.ObjectId(id)
    );

    // Find products that actually exist
    const existingProducts = await productCollection()
        .find(
            {
                _id: {
                    $in: objectIds
                }
            },
            {
                projection: {
                    _id: 1
                }
            }
        )
        .toArray();

    const existingIds = new Set(
        existingProducts.map(
            (product) => product._id.toString()
        )
    );

    // Return only product IDs that were not found
    return ids.filter(
        (id) => !existingIds.has(id)
    );
};

/**
 * Increase stock quantity for purchased products.
 *
 * @param {Array} items - Purchase items containing productId and quantity
 * @returns {Promise<boolean>} - True when stock is successfully updated
 */
export const increaseStock = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Purchase items are required for stock update");
    }

    // Combine quantities if the same product appears more than once.
    const quantityMap = new Map();

    for (const item of items) {
        const productId = String(item.productId);
        const quantity = Number(item.quantity);

        if (!mongoose.isValidObjectId(productId)) {
            throw new Error(`Invalid product ID: ${productId}`);
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(
                `Invalid quantity for product ${productId}`
            );
        }

        const currentQuantity = quantityMap.get(productId) || 0;

        quantityMap.set(
            productId,
            currentQuantity + quantity
        );
    }

    const operations = [];

    for (const [productId, quantity] of quantityMap.entries()) {
        operations.push({
            updateOne: {
                filter: {
                    _id: new mongoose.Types.ObjectId(productId)
                },
                update: {
                    $inc: {
                        stockQuantity: quantity
                    }
                }
            }
        });
    }

    const result = await productCollection().bulkWrite(
        operations,
        {
            ordered: true
        }
    );

    if (result.modifiedCount !== operations.length) {
        throw new Error(
            "One or more products could not be updated in inventory"
        );
    }

    console.log(
        `[inventory] Stock increased for ${operations.length} product(s)`
    );

    return true;
};