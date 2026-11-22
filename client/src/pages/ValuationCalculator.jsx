import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import Title from '../components/Title'

const brandOptions = [
  'toyota', 'honda', 'ford', 'chevrolet', 'bmw',
  'mercedes-benz', 'audi', 'nissan', 'hyundai', 'subaru',
  'tesla', 'jeep', 'volkswagen', 'lexus', 'mazda',
]

const bodyTypes = ['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van', 'wagon', 'convertible']
const conditionOptions = ['new', 'like new', 'excellent', 'good', 'fair', 'salvage']
const fuelTypes = ['gas', 'hybrid', 'electric', 'diesel']
const titleOptions = ['clean', 'rebuilt', 'salvage', 'lien']

const ValuationCalculator = () => {
  const navigate = useNavigate()
  const { axios, currency } = useAppContext()

  const [formData, setFormData] = useState({
    brand: 'toyota',
    model: 'camry',
    year: '2021',
    mileage: '35000',
    category: 'sedan',
    condition: 'excellent',
    fuel_type: 'gas',
    transmission: 'automatic',
    title_status: 'clean',
    paint_color: 'silver',
    location: 'ca',
    askingPrice: '',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEstimate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        manufacturer: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        odometer: Number(formData.mileage),
        type: formData.category,
        condition: formData.condition,
        fuel: formData.fuel_type,
        transmission: formData.transmission,
        title_status: formData.title_status,
        paint_color: formData.paint_color,
        state: formData.location,
        askingPrice: formData.askingPrice ? Number(formData.askingPrice) : null,
      }

      const { data } = await axios.post('/api/user/predict-price', payload)

      if (data.success && data.predictedPrice) {
        setResult(data)
        toast.success('AI Valuation computed successfully!')
      } else {
        toast.error(data.message || 'Valuation failed. Please try again.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Prediction request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen py-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-gradient-to-b from-gray-50 via-white to-gray-50'>
      <div className='max-w-5xl mx-auto'>
        <Title
          title='AI Vehicle Valuation Engine'
          subTitle='Real-time, data-driven pricing estimates powered by CatBoost & LightGBM ensemble regression.'
        />

        <div className='mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
          {/* INPUT FORM */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='lg:col-span-7 bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-100/60'
          >
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <span className='w-2.5 h-6 bg-blue-600 rounded-full inline-block'></span>
              Vehicle Specifications
            </h3>

            <form onSubmit={handleEstimate} className='space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Brand / Make
                  </label>
                  <select
                    name='brand'
                    value={formData.brand}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white'
                  >
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Model
                  </label>
                  <input
                    type='text'
                    name='model'
                    required
                    placeholder='e.g. Camry, F-150, Model 3'
                    value={formData.model}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Year
                  </label>
                  <input
                    type='number'
                    name='year'
                    min='1990'
                    max='2026'
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Mileage (Miles)
                  </label>
                  <input
                    type='number'
                    name='mileage'
                    min='0'
                    max='500000'
                    required
                    value={formData.mileage}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Body Type
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white text-sm'
                  >
                    {bodyTypes.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Condition
                  </label>
                  <select
                    name='condition'
                    value={formData.condition}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white text-sm'
                  >
                    {conditionOptions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Fuel
                  </label>
                  <select
                    name='fuel_type'
                    value={formData.fuel_type}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white text-sm'
                  >
                    {fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Transmission
                  </label>
                  <select
                    name='transmission'
                    value={formData.transmission}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white text-sm'
                  >
                    <option value='automatic'>Automatic</option>
                    <option value='manual'>Manual</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    Title Status
                  </label>
                  <select
                    name='title_status'
                    value={formData.title_status}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 capitalize bg-white text-sm'
                  >
                    {titleOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                    State / Region
                  </label>
                  <input
                    type='text'
                    name='location'
                    maxLength='2'
                    placeholder='CA'
                    value={formData.location}
                    onChange={handleChange}
                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 uppercase text-sm'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                  Asking Price (Optional - for Deal Assessment)
                </label>
                <div className='relative'>
                  <span className='absolute left-4 top-2.5 text-gray-400 font-medium'>{currency}</span>
                  <input
                    type='number'
                    name='askingPrice'
                    placeholder='Optional: e.g. 24000'
                    value={formData.askingPrice}
                    onChange={handleChange}
                    className='w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full mt-4 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                    </svg>
                    <span>Calculating ML Valuation...</span>
                  </>
                ) : (
                  <span>Calculate AI Valuation</span>
                )}
              </button>
            </form>
          </motion.div>

          {/* VALUATION RESULT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='lg:col-span-5'
          >
            {result ? (
              <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-100/60 space-y-6'>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                    {result.valuationGrade || 'Fair Market Value'}
                  </span>
                  <span className='text-xs text-gray-400 font-mono'>
                    Confidence: {Math.round((result.confidenceScore || 0.95) * 100)}%
                  </span>
                </div>

                <div>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Estimated Fair Market Value
                  </p>
                  <p className='text-4xl font-extrabold text-gray-900 mt-1'>
                    {currency} {Number(result.predictedPrice).toLocaleString()}
                  </p>
                  {result.priceRange && (
                    <p className='text-sm text-gray-500 mt-1'>
                      Expected Range: {currency} {Number(result.priceRange.min).toLocaleString()} &ndash;{' '}
                      {currency} {Number(result.priceRange.max).toLocaleString()}
                    </p>
                  )}
                </div>

                {result.dealDelta != null && formData.askingPrice && (
                  <div className='p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-sm'>
                    <p className='font-semibold text-blue-900'>Deal Analysis</p>
                    <p className='text-blue-700 text-xs mt-0.5'>
                      Asking price is {currency} {Math.abs(result.dealDelta).toLocaleString()}{' '}
                      {result.dealDelta > 0 ? 'above' : 'below'} the AI valuation benchmark.
                    </p>
                  </div>
                )}

                {/* ENSEMBLE BREAKDOWN */}
                {result.breakdown && (
                  <div className='border-t border-gray-100 pt-5 space-y-3'>
                    <p className='text-xs font-bold text-gray-700 uppercase tracking-wider'>
                      Ensemble Model Estimates
                    </p>
                    <div className='grid grid-cols-2 gap-3 text-xs'>
                      <div className='p-3 bg-gray-50 rounded-xl'>
                        <span className='text-gray-500 block'>LightGBM</span>
                        <span className='font-bold text-gray-800 text-sm'>
                          {currency} {Number(result.breakdown.lightgbm).toLocaleString()}
                        </span>
                      </div>
                      <div className='p-3 bg-gray-50 rounded-xl'>
                        <span className='text-gray-500 block'>CatBoost</span>
                        <span className='font-bold text-gray-800 text-sm'>
                          {currency} {Number(result.breakdown.catboost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className='border-t border-gray-100 pt-5 text-xs text-gray-500 space-y-1.5'>
                  <div className='flex justify-between'>
                    <span>Model:</span>
                    <span className='font-medium text-gray-700'>{result.modelUsed}</span>
                  </div>
                  {result.metrics?.r2_percentage && (
                    <div className='flex justify-between'>
                      <span>Model R² Accuracy:</span>
                      <span className='font-medium text-emerald-600'>{result.metrics.r2_percentage}</span>
                    </div>
                  )}
                  {result.metrics?.mae && (
                    <div className='flex justify-between'>
                      <span>Mean Absolute Error:</span>
                      <span className='font-medium text-gray-700'>${result.metrics.mae}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/cars')}
                  className='w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all cursor-pointer'
                >
                  Browse Marketplace Listings &rarr;
                </button>
              </div>
            ) : (
              <div className='bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 rounded-2xl p-8 border border-blue-100/60 text-center space-y-4'>
                <div className='w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-2xl font-bold'>
                  AI
                </div>
                <h4 className='text-lg font-bold text-gray-900'>Automated Valuation Engine</h4>
                <p className='text-xs text-gray-600 leading-relaxed max-w-sm mx-auto'>
                  Enter your car details to generate an instantaneous, leak-free ensemble prediction
                  utilizing out-of-fold target encoding, CatBoost decision trees, and LightGBM gradient boosting.
                </p>
                <div className='pt-2 flex flex-wrap justify-center gap-2'>
                  <span className='px-2.5 py-1 rounded-md bg-white text-gray-600 text-xs shadow-sm font-medium'>
                    92%+ R² Accuracy
                  </span>
                  <span className='px-2.5 py-1 rounded-md bg-white text-gray-600 text-xs shadow-sm font-medium'>
                    Real-time Inference
                  </span>
                  <span className='px-2.5 py-1 rounded-md bg-white text-gray-600 text-xs shadow-sm font-medium'>
                    CatBoost & LightGBM
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ValuationCalculator
