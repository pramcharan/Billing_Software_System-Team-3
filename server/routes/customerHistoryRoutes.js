import express from "express";
import { getCustomerHistory } from "../controllers/customerHistoryController.js";

const router = express.Router();

router.get("/:id/history", getCustomerHistory);

export default router;