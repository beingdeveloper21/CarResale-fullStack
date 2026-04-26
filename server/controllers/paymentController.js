// import Stripe from "stripe";
// import mongoose from "mongoose";
// import Car from "../models/Car.js";
// import Booking from "../models/Booking.js";
// import { sendEmail } from "../configs/sendEmail.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2022-11-15",
// });


// // ==============================
// // ✅ CREATE CHECKOUT SESSION
// // ==============================
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { _id, email } = req.user;
//     const { carId } = req.body;

//     // ✅ Validate carId
//     if (!mongoose.Types.ObjectId.isValid(carId)) {
//       return res.json({ success: false, message: "Invalid Car ID" });
//     }

//     // ✅ Find car
//     const car = await Car.findById(carId);

//     if (!car) {
//       return res.json({ success: false, message: "Car not found" });
//     }

//     // ❌ Prevent buying sold car
//     if (car.isSold) {
//       return res.json({ success: false, message: "Car already sold" });
//     }

//     // ❌ Prevent buying hidden car (optional but good)
//     if (!car.isAvailable) {
//       return res.json({ success: false, message: "Car is not available" });
//     }

//     // ✅ Create Stripe session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",

//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: `${car.brand} ${car.model}`,
//               description: car.description,
//             },
//             unit_amount: Math.round(car.price * 100),
//           },
//           quantity: 1,
//         },
//       ],

//       customer_email: email,

//       metadata: {
//         carId: car._id.toString(),
//         userId: _id.toString(),
//       },

//       success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/car-details/${carId}`,
//     });

//     if (!session.url) {
//       throw new Error("Stripe session creation failed");
//     }

//     res.json({ success: true, url: session.url });

//   } catch (error) {
//     console.log("Create Session Error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };



// // ==============================
// // ✅ COMPLETE PAYMENT
// // ==============================
// export const completePayment = async (req, res) => {
//   try {
//     const { sessionId } = req.body;
//     const { _id } = req.user;

//     if (!sessionId) {
//       return res.json({
//         success: false,
//         message: "Session ID is required",
//       });
//     }

//     // ✅ Retrieve session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId, {
//       expand: ["payment_intent"],
//     });

//     if (!session || session.payment_status !== "paid") {
//       return res.json({
//         success: false,
//         message: "Payment not completed",
//       });
//     }

//     const carId = session.metadata?.carId;

//     if (!mongoose.Types.ObjectId.isValid(carId)) {
//       return res.json({
//         success: false,
//         message: "Invalid car in metadata",
//       });
//     }

//     // ✅ Extract paymentIntent ID safely
//     const paymentIntentId =
//       typeof session.payment_intent === "string"
//         ? session.payment_intent
//         : session.payment_intent.id;

//     // ✅ Prevent duplicate booking
//     const existingBooking = await Booking.findOne({
//       paymentIntentId: paymentIntentId,
//     });

//     if (existingBooking) {
//       return res.json({
//         success: true,
//         message: "Already processed",
//       });
//     }

//     // ✅ Get car
//     const car = await Car.findById(carId);

//     if (!car) {
//       return res.json({
//         success: false,
//         message: "Car not found",
//       });
//     }

//     // ❌ Prevent double purchase
//     if (car.isSold) {
//       return res.json({
//         success: false,
//         message: "Car already sold",
//       });
//     }

//     // ✅ Mark as SOLD (ONLY HERE)
//     await Car.findByIdAndUpdate(carId, {
//       isSold: true,
//     });

//     // ✅ Save booking
//     const price = Math.round(session.amount_total / 100);

//     await Booking.create({
//       car: car._id,
//       owner: car.owner,
//       user: _id,
//       price,
//       offerPrice: price,
//       status: "accepted",
//       paymentIntentId: paymentIntentId,
//       paymentStatus: session.payment_status,
//       contactPhone: session.customer_details?.phone || "N/A",
//       message: "Purchased via Stripe",
//     });

//     res.json({
//       success: true,
//       message: "Payment successful & car marked as sold",
//     });

//   } catch (error) {
//     console.log("Complete Payment Error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };
import Stripe from "stripe";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { sendEmail } from "../configs/sendEmail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// ==============================
// ✅ CREATE CHECKOUT SESSION
// ==============================
export const createCheckoutSession = async (req, res) => {
  try {
    const { _id, email } = req.user;
    const { carId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.json({ success: false, message: "Invalid Car ID" });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.isSold) {
      return res.json({ success: false, message: "Car already sold" });
    }

    if (!car.isAvailable) {
      return res.json({ success: false, message: "Car is not available" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${car.brand} ${car.model}`,
              description: car.description,
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

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/car-details/${carId}`,
    });

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.log("Create Session Error:", error);
    res.json({ success: false, message: error.message });
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
      return res.json({ success: false, message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session || session.payment_status !== "paid") {
      return res.json({ success: false, message: "Payment not completed" });
    }

    const carId = session.metadata?.carId;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.json({ success: false, message: "Invalid car in metadata" });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    // prevent duplicate
    const existingBooking = await Booking.findOne({ paymentIntentId });

    if (existingBooking) {
      return res.json({ success: true, message: "Already processed" });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.isSold) {
      return res.json({ success: false, message: "Car already sold" });
    }

    // ✅ MARK SOLD
    car.isSold = true;
    await car.save();

    const price = Math.round(session.amount_total / 100);

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
      message: "Purchased via Stripe",
    });

    // ==============================
    // 📧 SEND PAYMENT EMAIL
    // ==============================
    await sendEmail({
      to: email,
      subject: "Payment Successful 🎉",
      html: `
        <h2>Payment Confirmed</h2>
        <p>Your purchase was successful.</p>
        <p><strong>Car:</strong> ${car.brand} ${car.model}</p>
        <p><strong>Price:</strong> ₹${price}</p>
        <p>Thank you for using Car Resale 🚗</p>
      `,
    });

    res.json({
      success: true,
      message: "Payment successful & car marked as sold",
    });

  } catch (error) {
    console.log("Complete Payment Error:", error);
    res.json({ success: false, message: error.message });
  }
};