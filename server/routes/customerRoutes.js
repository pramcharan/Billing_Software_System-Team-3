import express from "express";
import { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, toggleCustomerStatus } from "../controllers/customerController.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.patch("/:id/status", toggleCustomerStatus);

export default router;