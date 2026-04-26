
import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets, cityList } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const Cars = () => {

  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''
  const query = searchParams.get('query') || ''

  const { cars } = useAppContext()

  const [input, setInput] = useState(query)
  const [selectedLocation, setSelectedLocation] = useState(location)
  const [filteredCars, setFilteredCars] = useState([])

  const applyFilter = () => {

    const normalizedInput = input.trim().toLowerCase()

    const filtered = cars.filter((car) => {

      // ✅ Hide unavailable cars
      if (!car.isAvailable) return false

      const matchesLocation =
        !selectedLocation || car.location === selectedLocation

      const matchesSearch =
        !normalizedInput ||
        car.brand?.toLowerCase().includes(normalizedInput) ||
        car.model?.toLowerCase().includes(normalizedInput) ||
        car.category?.toLowerCase().includes(normalizedInput) ||
        car.transmission?.toLowerCase().includes(normalizedInput) ||
        car.fuel_type?.toLowerCase().includes(normalizedInput) ||
        car.condition?.toLowerCase().includes(normalizedInput)

      return matchesLocation && matchesSearch
    })

    setFilteredCars(filtered)
  }

  useEffect(() => {
    applyFilter()
  }, [input, selectedLocation, cars])

  return (
    <div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
      >
        <Title
          title='Used Cars for Sale'
          subTitle='Browse verified listings and compare fair asking prices before you enquire.'
        />

        <div className='flex flex-col sm:flex-row items-center gap-3 bg-white px-4 py-3 mt-6 max-w-180 w-full rounded-2xl sm:rounded-full shadow'>

          <img src={assets.search_icon} alt="" className='w-4 h-4' />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder='Search by make, model, fuel, or condition'
            className='w-full h-10 outline-none text-gray-500'
          />

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className='w-full sm:w-48 h-10 outline-none text-gray-500 bg-transparent'
          >
            <option value="">All locations</option>
            {cityList.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'
      >
        <p className='text-gray-500 max-w-7xl mx-auto'>
          Showing {filteredCars.length} cars for sale
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 max-w-7xl mx-auto'>

          {filteredCars.map((car) => (
            <motion.div key={car._id}>
              <CarCard car={car} />
            </motion.div>
          ))}

        </div>
      </motion.div>

    </div>
  )
}

export default Cars