import React from 'react'
import Title from './Title'
import CarCard from './CarCard'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const FeaturedSection = () => {
  const navigate = useNavigate()
  const { cars, searchQuery = '', searchLocation = '' } = useAppContext()

  const filteredCars = (cars || []).filter((car) => {
    // Hide unavailable cars
    if (!car.isAvailable) return false

    const q = searchQuery.trim().toLowerCase()

    const matchesSearch =
      !q ||
      car.brand?.toLowerCase().includes(q) ||
      car.model?.toLowerCase().includes(q) ||
      car.category?.toLowerCase().includes(q) ||
      car.fuel_type?.toLowerCase().includes(q) ||
      car.transmission?.toLowerCase().includes(q)

    const matchesLocation =
      !searchLocation ||
      car.location?.toLowerCase() === searchLocation.toLowerCase()

    return matchesSearch && matchesLocation
  })

  return (
    <motion.div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
      <Title
        title='Featured Listings'
        subTitle='Explore fresh used-car listings with clear specs and real-time AI valuation estimates.'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18 w-full max-w-7xl'>
        {filteredCars.length > 0 ? (
          filteredCars.slice(0, 6).map((car) => (
            <motion.div key={car._id}>
              <CarCard car={car} />
            </motion.div>
          ))
        ) : (
          <div className='col-span-full text-center py-12'>
            <p className='text-gray-400 text-lg'>No cars match your search criteria.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          navigate('/cars')
          window.scrollTo(0, 0)
        }}
        className='mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer'
      >
        Browse all cars
      </button>
    </motion.div>
  )
}

export default FeaturedSection