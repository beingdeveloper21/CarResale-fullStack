import 'dotenv/config'
import bcrypt from 'bcryptjs'
import connectDB from './configs/db.js'
import User from './models/User.js'
import Car from './models/Car.js'
import Booking from './models/Booking.js'

const createSampleData = async () => {
  await connectDB()

  console.log('Seeding database with realistic inventory...')

  await User.deleteMany({})
  await Car.deleteMany({})
  await Booking.deleteMany({})

  const ownerPassword = await bcrypt.hash('Owner@1234', 10)
  const buyerPassword = await bcrypt.hash('Buyer@1234', 10)

  const owner = await User.create({
    name: 'Premier Auto Deals',
    email: 'seller@example.com',
    password: ownerPassword,
    role: 'owner'
  })

  const buyer = await User.create({
    name: 'Alex Johnson',
    email: 'buyer@example.com',
    password: buyerPassword,
    role: 'user'
  })

  const sampleCars = [
    {
      owner: owner._id,
      brand: 'Toyota',
      model: 'Camry',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
      year: 2021,
      category: 'sedan',
      seating_capacity: 5,
      fuel_type: 'gas',
      transmission: 'automatic',
      price: 22800,
      mileage: 34000,
      condition: 'excellent',
      title_status: 'clean',
      cylinders: '4 cylinders',
      paint_color: 'silver',
      location: 'Los Angeles',
      description: 'Single owner 2021 Toyota Camry SE in pristine condition with complete dealer service records.',
      isAvailable: true,
      isSold: false
    },
    {
      owner: owner._id,
      brand: 'Honda',
      model: 'Civic',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      year: 2020,
      category: 'sedan',
      seating_capacity: 5,
      fuel_type: 'gas',
      transmission: 'automatic',
      price: 19500,
      mileage: 42000,
      condition: 'good',
      title_status: 'clean',
      cylinders: '4 cylinders',
      paint_color: 'white',
      location: 'New York',
      description: 'Reliable Honda Civic EX with lane assist, sunroof, and Apple CarPlay. Great commuter vehicle.',
      isAvailable: true,
      isSold: false
    },
    {
      owner: owner._id,
      brand: 'Ford',
      model: 'F-150',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
      year: 2022,
      category: 'truck',
      seating_capacity: 6,
      fuel_type: 'gas',
      transmission: 'automatic',
      price: 36500,
      mileage: 28000,
      condition: 'excellent',
      title_status: 'clean',
      cylinders: '6 cylinders',
      paint_color: 'black',
      location: 'Houston',
      description: 'Ford F-150 SuperCrew 4x4. Heavy duty tow package, bedliner, and premium interior.',
      isAvailable: true,
      isSold: false
    },
    {
      owner: owner._id,
      brand: 'BMW',
      model: '3 Series',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      year: 2019,
      category: 'sedan',
      seating_capacity: 5,
      fuel_type: 'gas',
      transmission: 'automatic',
      price: 24900,
      mileage: 48000,
      condition: 'good',
      title_status: 'clean',
      cylinders: '4 cylinders',
      paint_color: 'blue',
      location: 'Chicago',
      description: 'BMW 330i xDrive with M Sport steering wheel, heated leather seats, and Harman Kardon sound.',
      isAvailable: true,
      isSold: false
    },
    {
      owner: owner._id,
      brand: 'Tesla',
      model: 'Model 3',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
      year: 2022,
      category: 'sedan',
      seating_capacity: 5,
      fuel_type: 'electric',
      transmission: 'automatic',
      price: 31200,
      mileage: 29000,
      condition: 'excellent',
      title_status: 'clean',
      cylinders: 'unknown',
      paint_color: 'gray',
      location: 'San Francisco',
      description: 'Long Range Dual Motor All-Wheel Drive. Autopilot enabled with premium connectivity.',
      isAvailable: true,
      isSold: false
    },
    {
      owner: owner._id,
      brand: 'Jeep',
      model: 'Wrangler',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      year: 2021,
      category: 'suv',
      seating_capacity: 5,
      fuel_type: 'gas',
      transmission: 'automatic',
      price: 33800,
      mileage: 31000,
      condition: 'excellent',
      title_status: 'clean',
      cylinders: '6 cylinders',
      paint_color: 'red',
      location: 'Denver',
      description: 'Jeep Wrangler Unlimited Sahara 4x4. Removable hardtop, off-road package, and navigation.',
      isAvailable: true,
      isSold: false
    }
  ]

  const createdCars = await Car.insertMany(sampleCars)

  await Booking.create({
    car: createdCars[0]._id,
    user: buyer._id,
    owner: owner._id,
    contactPhone: '+1-555-0199',
    message: 'Hello, I am interested in inspecting the vehicle tomorrow morning.',
    offerPrice: 22000,
    price: createdCars[0].price,
    status: 'pending'
  })

  console.log(`Successfully seeded ${createdCars.length} vehicles, 2 accounts (seller & buyer), and 1 sample inquiry!`)
  console.log('Demo Seller login: seller@example.com / Owner@1234')
  console.log('Demo Buyer login:  buyer@example.com  / Buyer@1234')
  process.exit(0)
}

createSampleData().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
