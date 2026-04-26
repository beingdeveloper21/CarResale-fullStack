import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const carSchema = new mongoose.Schema({
    owner: {type: ObjectId, ref: 'User'},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    image: {type: String, required: true},
    year: {type: Number, required: true},
    category: {type: String, required: true},
    seating_capacity: {type: Number, required: true},
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, default: 0 },
    condition: { type: String, default: "Good" },
    title_status: { type: String, default: "Clean" },
    cylinders: { type: String, default: "" },
    paint_color: { type: String, default: "" },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: {type: Boolean, default: true},
    isSold: { type: Boolean, default: false }
},{timestamps: true})

carSchema.pre('validate', function(next){
    if(this.price == null){
        return next(new Error('Price is required for resale listings'))
    }
    next();
})

const Car = mongoose.model('Car', carSchema)

export default Car
