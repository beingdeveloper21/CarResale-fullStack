import express from 'express'
import { createCheckoutSession, completePayment } from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const paymentRouter = express.Router()

// ✅ Match frontend URL
paymentRouter.post('/create-checkout-session', protect, createCheckoutSession)

// ✅ Match frontend URL
paymentRouter.post('/complete', protect, completePayment)

export default paymentRouter