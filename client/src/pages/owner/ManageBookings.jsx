// import React, { useEffect, useState } from 'react'
// import Title from '../../components/owner/Title'
// import { useAppContext } from '../../context/AppContext'
// import toast from 'react-hot-toast'

// const ManageBookings = () => {

//   const { currency, axios } = useAppContext()

//   const [inquiries, setInquiries] = useState([])

//   const fetchOwnerInquiries = async ()=>{
//     try {
//       const { data } = await axios.get('/api/inquiries/owner')
//       data.success ? setInquiries(data.bookings) : toast.error(data.message)
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const changeInquiryStatus = async (bookingId, status)=>{
//     try {
//       const { data } = await axios.post('/api/inquiries/change-status', {bookingId, status})
//       if(data.success){
//         toast.success(data.message)
//         fetchOwnerInquiries()
//       }else{
//         toast.error(data.message)
//       }
      
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(()=>{
//     fetchOwnerInquiries()
//   },[])

//   const statusClass = (status)=> status === 'accepted'
//     ? 'bg-green-100 text-green-600'
//     : status === 'pending'
//       ? 'bg-yellow-100 text-yellow-700'
//       : 'bg-red-100 text-red-500'

//   return (
//     <div className='px-4 pt-10 md:px-10 w-full'>
      
//       <Title title="Manage Enquiries" subTitle="Review buyer offers, contact details, and enquiry statuses for your listed cars."/>

//       <div className='max-w-5xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

//         <table className='w-full border-collapse text-left text-sm text-gray-600'>
//           <thead className='text-gray-500'>
//             <tr>
//               <th className="p-3 font-medium">Car</th>
//               <th className="p-3 font-medium max-md:hidden">Buyer</th>
//               <th className="p-3 font-medium">Offer</th>
//               <th className="p-3 font-medium max-md:hidden">Message</th>
//               <th className="p-3 font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inquiries.map((inquiry, index)=>(
//               <tr key={index} className='border-t border-borderColor text-gray-500'>

//                 <td className='p-3 flex items-center gap-3'>
//                   <img src={inquiry.car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover'/>
//                   <div className='max-md:hidden'>
//                     <p className='font-medium'>{inquiry.car.brand} {inquiry.car.model}</p>
//                     <p className='text-xs'>{inquiry.createdAt.split('T')[0]}</p>
//                   </div>
//                 </td>

//                 <td className='p-3 max-md:hidden'>
//                   <p>{inquiry.user?.name || 'Buyer'}</p>
//                   <p className='text-xs'>{inquiry.contactPhone}</p>
//                 </td>

//                 <td className='p-3'>
//                   <p>{currency}{Number(inquiry.offerPrice || 0).toLocaleString()}</p>
//                   <p className='text-xs text-gray-400'>Asking {currency}{Number(inquiry.price || 0).toLocaleString()}</p>
//                 </td>

//                 <td className='p-3 max-md:hidden max-w-64 truncate'>{inquiry.message || 'No message added'}</td>

//                 <td className='p-3'>
//                   {inquiry.status === 'pending' ? (
//                     <select onChange={e=> changeInquiryStatus(inquiry._id, e.target.value)} value={inquiry.status} className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'>
//                       <option value="pending">Pending</option>
//                       <option value="rejected">Rejected</option>
//                       <option value="accepted">Accepted</option>
//                     </select>
//                   ): (
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(inquiry.status)}`}>{inquiry.status}</span>
//                   )}
//                 </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>

//     </div>
//   )
// }

// export default ManageBookings
