import express from "express";
import { createPurchase, getPurchases, getPurchaseById } from "../controllers/purchaseController.js";
import { validatePurchase } from "../middleware/validatePurchase.js";

const router = express.Router();

router.post("/", validatePurchase, createPurchase);
router.get("/", getPurchases);
router.get("/:id", getPurchaseById);

export default router;