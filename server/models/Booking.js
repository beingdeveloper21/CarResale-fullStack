import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const inquirySchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    contactPhone: {type: String, default: ""},
    message: {type: String, default: ""},
    offerPrice: {type: Number, required: true},
    status: {type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending"},
    price: {type: Number, required: true},
    paymentIntentId: { type: String, default: '' },
    paymentStatus: { type: String, default: 'pending' }
},{timestamps: true})

const Booking = mongoose.model('Inquiry', inquirySchema)

export default Booking
