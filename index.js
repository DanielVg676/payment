import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT_EXPRESS || 3005; // Valor por defecto
const PAYPAL_CLIENT = process.env.PAYPAL_API_CLIENT;
const PAYPAL_SECRET = process.env.PAYPAL_API_SECRET;

app.listen(PORT, () => {
    console.log(`Servicio en el puerto http://localhost:${PORT}`);
});