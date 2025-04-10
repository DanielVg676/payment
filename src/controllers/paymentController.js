import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/orderPayment.js";
import User from '../models/userModel.js';
import {paymentCreatedEvent} from '../services/rabbitService.js';

dotenv.config();
const PAYPAL_API = "https://api-m.sandbox.paypal.com";
const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
const HOST = "http://localhost:3005";

if (!PAYPAL_API_CLIENT || !PAYPAL_API_SECRET) {
  console.error("PAYPAL_API_CLIENT and PAYPAL_API_SECRET must be set in environment variables.");
  process.exit(1); // Detener la ejecución si faltan las credenciales
}

export const createOrder = async (req, res) => {
  const userId = req.body.userId;
  const amount = req.body.amount;
  const currency = req.body.currency;

  try {
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
      application_context: {
        brand_name: "Mi tienda",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${HOST}/api/payments/capture-order`,
        cancel_url: `${HOST}/api/payments/cancel-payment`,
      },
    };

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const {
      data: { access_token },
    } = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
        },
      }
    );

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      order,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const paypalOrder = response.data;

    await Order.create({
      paypal_order_id: paypalOrder.id,
      status: paypalOrder.status,
      user_id: userId,
      amount: amount,
      currency: currency,
    });

    return res.json(paypalOrder);
  } catch (error) {
    console.error("Error creating order:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "An error occurred while creating the order." });
  }
};


export const captureOrder = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required to capture the order." });
  }

  try {
    const order = await Order.findOne({ where: { paypal_order_id: token } });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
      {},
      {
        auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
        },
      }
    );

    const orderData = response.data;
    const newStatus = orderData.status;

    const payer = orderData.payer || {};
    const payerEmail = payer.email_address || null;
    const payerId = payer.payer_id || null;
    const countryCode = payer.address?.country_code || null;

    await Order.update(
      {
        status: newStatus,
        email: payerEmail,
        payer_id: payerId,
        country_code: countryCode,
      },
      {
        where: { paypal_order_id: token },
      }
    );

    const userId = order.user_id;
    const user = await User.findByPk(userId);
    const userEmail = user ? user.username : null;

    if (!userEmail) {
      return res.status(400).json({ message: "User email not found." });
    }

    console.log("Order captured:", orderData);

    const payment = {
      email: userEmail,
      subject: "Payment Confirmation",
      body: "Your payment has been successfully processed.",
    };

    await paymentCreatedEvent(payment);

    // Redirigir a payed.html con el paypal_order_id como parámetro
    res.redirect(`/payed.html?orderId=${token}`);
  } catch (error) {
    console.error(
      "Error capturing order:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({ message: "Internal Server Error while capturing order." });
  }
};


export const cancelPayment = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required to cancel the order." });
  }

  try {
    // Actualizar el estado de la orden a 'CANCELLED' si el pago fue cancelado
    await Order.update(
      { status: 'CANCELLED' },
      { where: { paypal_order_id: token } }
    );

    console.log("Payment cancelled, order status updated.");

    // Redirigir al inicio si se cancela el pago
    return res.redirect("/");
  } catch (error) {
    console.error("Error canceling payment:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Internal Server Error while canceling payment." });
  }
};

