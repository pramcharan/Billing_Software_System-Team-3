import express from "express";
import { createPurchase, getPurchases, getPurchaseById } from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", createPurchase);
router.get("/", getPurchases);
router.get("/:id", getPurchaseById);

export default router;