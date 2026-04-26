// import { assets, cityList } from '../assets/assets'
// import { useAppContext } from '../context/AppContext'
// import {motion} from 'motion/react'

// const Hero = () => {

//     const {searchLocation, setSearchLocation, searchQuery, setSearchQuery, navigate} = useAppContext()

//     const handleSearch = (e)=>{
//         e.preventDefault()
//         const params = new URLSearchParams()
//         if(searchLocation) params.set('location', searchLocation)
//         if(searchQuery) params.set('query', searchQuery)
//         navigate(`/cars${params.toString() ? `?${params.toString()}` : ''}`)
//     }

//   return (
//     <motion.div 
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     transition={{ duration: 0.8 }}
//     className='min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-12 bg-gradient-to-br from-slate-50 to-blue-50 text-center px-6'>

//         <motion.h1 initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//         className='text-4xl md:text-6xl font-bold text-gray-900 leading-tight'>Find Your Perfect Used Car</motion.h1>
      
//       <motion.form
//       initial={{ scale: 0.95, opacity: 0, y: 50 }}
//       animate={{ scale: 1, opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, delay: 0.4 }}

//        onSubmit={handleSearch} className='flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-2xl md:rounded-full w-full max-w-4xl bg-white shadow-2xl border border-gray-100'>

//         <div className='flex flex-col md:flex-row items-start md:items-center gap-8 min-md:ml-8'>
//             <div className='flex flex-col items-start gap-2'>
//                 <label className='text-sm font-medium text-gray-700'>Location</label>
//                 <select value={searchLocation} onChange={(e)=>setSearchLocation(e.target.value)} className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'>
//                     <option value="">Any Location</option>
//                     {cityList.map((city)=> <option key={city} value={city}>{city}</option>)}
//                 </select>
//             </div>
//             <div className='flex flex-col items-start gap-2 w-full md:w-80'>
//                 <label htmlFor='car-search' className='text-sm font-medium text-gray-700'>Make, Model, or Type</label>
//                 <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} type="text" id="car-search" placeholder='Honda City, SUV, hybrid...' className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'/>
//             </div>
            
//         </div>
//             <motion.button 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className='px-8 py-3 bg-primary hover:bg-primary-dull transition-all text-white font-semibold rounded-full shadow-lg hover:shadow-xl'>Search Cars</motion.button>
//         </motion.form>

//       <motion.img 
//         initial={{ y: 100, opacity: 0 }}
//        animate={{ y: 0, opacity: 1 }}
//        transition={{ duration: 0.8, delay: 0.6 }}
//       src={assets.main_car} alt="car" className='max-h-74'/>
//     </motion.div>
//   )
// }

// export default Hero
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const Hero = () => {

  const {
    searchLocation,
    setSearchLocation,
    searchQuery,
    setSearchQuery
  } = useAppContext()

  const handleSearch = (e) => {
    e.preventDefault()
    // ✅ Nothing else needed
    // Filtering happens automatically in FeaturedSection
  }

  return (
    <motion.div 
      className='min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-12 px-6'
    >

      <h1 className='text-4xl md:text-6xl font-bold'>
        Find Your Perfect Used Car
      </h1>

      <form
        onSubmit={handleSearch}
        className='flex flex-col md:flex-row gap-4 p-6 bg-white rounded-xl shadow'
      >

        {/* Location */}
        <select
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        >
          <option value="">Any Location</option>
          {cityList.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Search */}
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cars..."
        />

        {/* Button */}
        <button type="submit">
          Search
        </button>

      </form>

      <img src={assets.main_car} alt="car" />

    </motion.div>
  )
}

export default Hero