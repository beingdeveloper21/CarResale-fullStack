import 'dotenv/config'
import bcrypt from 'bcrypt'
import connectDB from './configs/db.js'
import User from './models/User.js'
import Car from './models/Car.js'
import Booking from './models/Booking.js'

const createSampleData = async () => {
  await connectDB()

  console.log('Seeding database...')

  await User.deleteMany({})
  await Car.deleteMany({})
  await Booking.deleteMany({})

  const ownerPassword = await bcrypt.hash('ownerpassword', 10)
  const buyerPassword = await bcrypt.hash('buyerpassword', 10)

  const owner = await User.create({
    name: 'Sample Seller',
    email: 'seller@example.com',
    password: ownerPassword,
    role: 'owner'
  })

  const buyer = await User.create({
    name: 'Sample Buyer',
    email: 'buyer@example.com',
    password: buyerPassword,
    role: 'user'
  })

  const car = await Car.create({
    owner: owner._id,
    brand: 'Toyota',
    model: 'Camry',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    year: 2019,
    category: 'Sedan',
    seating_capacity: 5,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    price: 17999,
    mileage: 45000,
    condition: 'Excellent',
    title_status: 'Clean',
    cylinders: '4 cylinders',
    paint_color: 'Silver',
    location: 'Los Angeles',
    description: 'Well-maintained Toyota Camry with complete service history and one owner. Ready for resale.',
    isAvailable: true
  })

  await Booking.create({
    car: car._id,
    user: buyer._id,
    owner: owner._id,
    contactPhone: '+1-555-123-4567',
    message: 'I am interested in this car and would like to schedule a viewing.',
    offerPrice: 16999,
    price: car.price
  })

  console.log('Seed data created successfully.')
  process.exit(0)
}

createSampleData().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
