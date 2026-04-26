import Booking from "../models/Booking.js"
import Car from "../models/Car.js";

// API to search sale listings by location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location} = req.body
        const query = {isAvailable: true}
        if(location){
            query.location = location
        }

        const availableCars = await Car.find(query).sort({createdAt: -1})
        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to create a purchase enquiry
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {car, contactPhone, message, offerPrice} = req.body;

        if(!car || !contactPhone){
            return res.json({success: false, message: "Car and phone number are required"})
        }

        const carData = await Car.findById(car)
        if(!carData || !carData.isAvailable){
            return res.json({success: false, message: "This listing is not available"})
        }

        const price = carData.price;
        const enquiryOffer = Number(offerPrice) || price;

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            contactPhone,
            message,
            offerPrice: enquiryOffer,
            price
        })

        res.json({success: true, message: "Purchase enquiry sent"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to list user enquiries
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get seller enquiries

export const getOwnerBookings = async (req, res)=>{
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id}).populate('car user').select("-user.password").sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to change enquiry status
export const changeBookingStatus = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body

        const booking = await Booking.findById(bookingId)

        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized"})
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Enquiry status updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
