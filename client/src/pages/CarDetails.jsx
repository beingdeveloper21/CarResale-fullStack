import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { cars, axios, user, setShowLogin, currency } = useAppContext()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [valuationData, setValuationData] = useState(null)
  const [estimatedLoading, setEstimatedLoading] = useState(false)

  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

  // Get Car
  useEffect(() => {
    const foundCar = cars.find((c) => c._id === id)
    setCar(foundCar || null)
  }, [cars, id])

  // Get ML Estimated Price & Valuation Grade
  useEffect(() => {
    if (!car) return

    const fetchEstimatedPrice = async () => {
      setEstimatedLoading(true)
      try {
        const { data } = await axios.post('/api/user/predict-price', {
          manufacturer: car.brand,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          condition: car.condition,
          cylinders: car.cylinders,
          fuel: car.fuel_type,
          title_status: car.title_status,
          transmission: car.transmission,
          type: car.category,
          paint_color: car.paint_color,
          state: car.location,
          askingPrice: car.price,
        })

        if (data.success && data.predictedPrice) {
          setEstimatedPrice(data.predictedPrice)
          setValuationData(data)
        }
      } catch (error) {
        console.warn("ML price prediction unavailable:", error.message)
      } finally {
        setEstimatedLoading(false)
      }
    }

    fetchEstimatedPrice()
  }, [car, axios])

  // Buy Now via Stripe Checkout
  const handleBuyNow = async () => {
    try {
      if (!user) {
        setShowLogin(true)
        toast.error("Please login to proceed with checkout")
        return
      }

      if (loading) return
      setLoading(true)

      const { data } = await axios.post('/api/payment/create-checkout-session', {
        carId: id,
      })

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Failed to initiate payment")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment checkout failed")
    } finally {
      setLoading(false)
    }
  }

  if (!car) return <Loader />

  const listingPrice = car.price || 0
  const isAvailable = !car.isSold && car.isAvailable

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-12 max-w-7xl mx-auto'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-8 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer text-sm font-medium'
      >
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65 w-3.5 h-3.5' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start'>
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='lg:col-span-2'
        >
          <div className='relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-gray-50 mb-8'>
            <img
              src={
                car.image?.startsWith("http")
                  ? car.image
                  : `${BASE_URL}${car.image}`
              }
              alt={`${car.brand} ${car.model}`}
              className='w-full h-80 sm:h-96 md:h-[420px] object-cover'
            />
            {car.isSold && (
              <div className='absolute top-4 left-4 bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-md'>
                Sold Out
              </div>
            )}
          </div>

          <div className='space-y-6'>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-extrabold text-gray-900'>
                  {car.brand} {car.model}
                </h1>
                <span className='px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 capitalize'>
                  {car.condition || 'Good'}
                </span>
              </div>
              <p className='text-gray-500 text-base mt-1 capitalize'>
                {car.year} &bull; {car.category} &bull; {car.location}
              </p>
            </div>

            <hr className='border-gray-100' />

            {/* Key Specs */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { label: 'Seats', value: `${car.seating_capacity || 5} Seats`, icon: assets.users_icon },
                { label: 'Fuel Type', value: car.fuel_type || 'Gas', icon: assets.fuel_icon },
                {
                  label: 'Mileage',
                  value: car.mileage ? `${Number(car.mileage).toLocaleString()} mi` : 'N/A',
                  icon: assets.car_icon,
                },
                { label: 'Location', value: car.location || 'USA', icon: assets.location_icon },
              ].map(({ label, value, icon }) => (
                <div key={label} className='flex flex-col items-center bg-gray-50/80 border border-gray-100 p-4 rounded-xl text-center'>
                  <img src={icon} alt="" className='h-5 mb-1.5 opacity-70' />
                  <span className='text-xs text-gray-400'>{label}</span>
                  <span className='text-sm font-semibold text-gray-800 capitalize'>{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-2'>Vehicle Overview</h2>
              <p className='text-gray-600 leading-relaxed text-sm whitespace-pre-line'>
                {car.description || 'No description provided by the seller.'}
              </p>
            </div>

            {/* Technical Details */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-3'>Listing Details</h2>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                {[
                  `Transmission: ${car.transmission || 'Automatic'}`,
                  `Title Status: ${car.title_status || 'Clean'}`,
                  `Exterior Color: ${car.paint_color || 'Standard'}`,
                  `Engine Cylinders: ${car.cylinders || 'Standard'}`,
                ].map((item) => (
                  <li key={item} className='flex items-center text-gray-600 capitalize bg-gray-50/50 p-2.5 rounded-lg'>
                    <img src={assets.check_icon} className='h-4 mr-2.5' alt="" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Pricing & AI Valuation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 p-6 space-y-6 sticky top-20'
        >
          {/* Price Header */}
          <div>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Listing Asking Price
              </span>
              {valuationData?.valuationGrade && (
                <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                  {valuationData.valuationGrade}
                </span>
              )}
            </div>
            <div className='flex items-baseline gap-2 mt-1'>
              <span className='text-3xl font-extrabold text-gray-900'>
                {currency} {Number(listingPrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* AI Valuation Box */}
          <div className='p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/80 space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-blue-900 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-blue-600 animate-pulse'></span>
                AI Valuation Engine
              </span>
              <span className='text-[10px] font-mono text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-100/60'>
                92%+ R² Accuracy
              </span>
            </div>

            {estimatedLoading ? (
              <p className='text-xs text-blue-600 animate-pulse'>Analyzing market trends & specs...</p>
            ) : estimatedPrice ? (
              <>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs text-gray-600'>Estimated Fair Value:</span>
                  <span className='text-base font-bold text-gray-900'>
                    {currency} {Number(estimatedPrice).toLocaleString()}
                  </span>
                </div>
                {valuationData?.priceRange && (
                  <p className='text-[11px] text-gray-500'>
                    Fair Market Band: {currency} {Number(valuationData.priceRange.min).toLocaleString()} &ndash;{' '}
                    {currency} {Number(valuationData.priceRange.max).toLocaleString()}
                  </p>
                )}
                {valuationData?.breakdown && (
                  <div className='text-[10px] text-gray-500 pt-1 flex justify-between border-t border-blue-100/60'>
                    <span>LightGBM: {currency}{Number(valuationData.breakdown.lightgbm).toLocaleString()}</span>
                    <span>CatBoost: {currency}{Number(valuationData.breakdown.catboost).toLocaleString()}</span>
                  </div>
                )}
              </>
            ) : (
              <p className='text-xs text-gray-500'>Valuation estimate currently unavailable.</p>
            )}
          </div>

          <hr className='border-gray-100' />

          {/* Buy Now Button */}
          {isAvailable ? (
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className={`w-full py-3.5 font-semibold text-white rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                  </svg>
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <span>Buy Now with Stripe</span>
              )}
            </button>
          ) : (
            <button
              disabled
              className='w-full bg-gray-200 py-3.5 text-gray-500 font-semibold rounded-xl cursor-not-allowed text-center'
            >
              Vehicle Sold Out
            </button>
          )}

          <div className='text-center space-y-1'>
            <p className='text-xs text-gray-400'>
              Direct purchase protected with 256-bit Stripe encryption
            </p>
            <p className='text-[11px] text-gray-400'>
              Instant purchase receipt sent to your registered email
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CarDetails