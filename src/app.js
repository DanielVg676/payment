import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoute.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api/payments", paymentRoutes);

// Archivos estáticos
app.use(express.static(path.resolve("./src/public")));

export default app;
