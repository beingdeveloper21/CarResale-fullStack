import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const CarCard = ({ car }) => {

  const currency = import.meta.env.VITE_CURRENCY
  const navigate = useNavigate()
  const price = car.price || 0

  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

  return (
    <div
      onClick={() => { navigate(`/car-details/${car._id}`); scrollTo(0, 0) }}
      className='group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer bg-white border border-gray-100'
    >

      <div className='relative h-52 overflow-hidden'>

        <img
          src={
            car.image?.startsWith("http")
              ? car.image
              : `${BASE_URL}${car.image}`
          }
          alt="Car"
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
        />

        {car.isAvailable && (
          <div className='absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg'>
            For Sale
          </div>
        )}

        <div className='absolute bottom-4 right-4 bg-black/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20'>
          <span className='font-bold text-lg'>
            {currency} {Number(price).toLocaleString()}
          </span>
        </div>
      </div>

      <div className='p-5'>
        <div className='flex justify-between items-start mb-3'>
          <div>
            <h3 className='text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors'>
              {car.brand} {car.model}
            </h3>
            <p className='text-gray-600 text-sm font-medium'>
              {car.category} • {car.year}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-y-3 text-gray-600'>
          <div className='flex items-center text-sm'>
            <img src={assets.users_icon} alt="" className='h-4 mr-2 opacity-70' />
            <span className='font-medium'>{car.seating_capacity} Seats</span>
          </div>

          <div className='flex items-center text-sm'>
            <img src={assets.fuel_icon} alt="" className='h-4 mr-2 opacity-70' />
            <span className='font-medium'>{car.fuel_type}</span>
          </div>

          <div className='flex items-center text-sm'>
            <img src={assets.car_icon} alt="" className='h-4 mr-2 opacity-70' />
            <span className='font-medium'>
              {car.mileage
                ? `${Number(car.mileage).toLocaleString()} km`
                : car.transmission}
            </span>
          </div>

          <div className='flex items-center text-sm'>
            <img src={assets.location_icon} alt="" className='h-4 mr-2 opacity-70' />
            <span className='font-medium'>{car.location}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default CarCard