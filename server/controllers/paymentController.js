import Stripe from "stripe";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { sendEmail } from "../configs/sendEmail.js";

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: "2022-11-15",
  });
};

// ==============================
// ✅ CREATE CHECKOUT SESSION
// ==============================
export const createCheckoutSession = async (req, res) => {
  try {
    const { _id, email } = req.user;
    const { carId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ success: false, message: "Invalid Car ID" });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (car.isSold) {
      return res.status(400).json({ success: false, message: "Car is already sold" });
    }

    if (!car.isAvailable) {
      return res.status(400).json({ success: false, message: "Car is not available" });
    }

    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe payment service is not configured",
      });
    }

    const currency = (process.env.PAYMENT_CURRENCY || "usd").toLowerCase();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${car.brand} ${car.model} (${car.year})`,
              description: car.description || `${car.category} in ${car.condition} condition`,
            },
            unit_amount: Math.round(car.price * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        carId: car._id.toString(),
        userId: _id.toString(),
      },
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/car-details/${carId}`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Create Session Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ COMPLETE PAYMENT
// ==============================
export const completePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { _id, email } = req.user;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ success: false, message: "Stripe service is not configured" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment was not completed" });
    }

    const carId = session.metadata?.carId;
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ success: false, message: "Invalid car metadata in session" });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    // Prevent duplicate booking entry
    const existingBooking = await Booking.findOne({ paymentIntentId });
    if (existingBooking) {
      return res.json({ success: true, message: "Payment already processed" });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (car.isSold) {
      return res.json({ success: true, message: "Car is already marked as sold" });
    }

    // Mark car as sold and unavailable
    car.isSold = true;
    car.isAvailable = false;
    await car.save();

    const price = Math.round(session.amount_total / 100);
    const currency = (session.currency || process.env.PAYMENT_CURRENCY || "usd").toUpperCase();

    await Booking.create({
      car: car._id,
      owner: car.owner,
      user: _id,
      price,
      offerPrice: price,
      status: "accepted",
      paymentIntentId,
      paymentStatus: session.payment_status,
      contactPhone: session.customer_details?.phone || "N/A",
      message: "Purchased securely via Stripe",
    });

    // Send confirmation receipt email
    try {
      await sendEmail({
        to: email,
        subject: "Payment Confirmed - Car Purchase Successful 🎉",
        html: `
          <h2>Payment Confirmed</h2>
          <p>Your vehicle purchase was completed successfully.</p>
          <p><strong>Vehicle:</strong> ${car.brand} ${car.model} (${car.year})</p>
          <p><strong>Amount Paid:</strong> ${currency} ${price.toLocaleString()}</p>
          <p><strong>Transaction ID:</strong> ${paymentIntentId || session.id}</p>
          <br/>
          <p>Thank you for choosing Car Resale.</p>
        `,
      });
    } catch (mailErr) {
      console.warn("Payment email receipt failed:", mailErr.message);
    }

    res.json({
      success: true,
      message: "Payment verified successfully. Car marked as sold.",
    });
  } catch (error) {
    console.error("Complete Payment Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};