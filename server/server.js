import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import customerHistoryRoutes from "./routes/customerHistoryRoutes.js"; 

const app = express();

const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/customers", customerHistoryRoutes);  

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Team 3 Backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});