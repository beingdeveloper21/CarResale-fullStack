import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'

const Banner = () => {
  const {navigate} = useAppContext()

  return (
    <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className='flex flex-col md:flex-row md:items-start items-center justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden shadow-2xl'>

        <div className='text-white'>
            <h2 className='text-3xl md:text-4xl font-bold'>Ready to Sell Your Car?</h2>
            <p className='mt-3 text-lg'>List your vehicle and receive purchase enquiries from serious buyers.</p>
            <p className='max-w-lg mt-2 text-blue-100'>Add photos, mileage, condition, title status, and your asking price so buyers can compare confidently.</p>

            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={()=> navigate('/owner/add-car')}
            className='px-8 py-3 bg-white hover:bg-gray-100 transition-all text-blue-600 font-semibold rounded-full shadow-lg hover:shadow-xl mt-6 cursor-pointer'>Sell your car</motion.button>
        </div>

        <motion.img 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        src={assets.banner_car_image} alt="car" className='max-h-56 mt-10'/>
      
    </motion.div>
  )
}

export default Banner
