// import { useEffect, useState } from "react"
// import { useSearchParams, useNavigate } from "react-router-dom"
// import { useAppContext } from "../context/AppContext"
// import Loader from "../components/Loader"

// const PaymentSuccess = () => {

//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const sessionId = searchParams.get("session_id")

//   const { axios } = useAppContext()

//   const [loading, setLoading] = useState(true)
//   const [success, setSuccess] = useState(null)

//   const verifyPayment = async () => {
//     try {
//       const { data } = await axios.post("/api/payment/complete", {
//         sessionId,
//       })

//       setSuccess(data.success)
//     } catch (error) {
//       console.log(error)
//       setSuccess(false)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (sessionId) {
//       verifyPayment()
//     } else {
//       setLoading(false)
//       setSuccess(false)
//     }
//   }, [])

//   // ✅ SHOW LOADER FIRST (no flicker)
//   if (loading) return <Loader />

//   return (
//     <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
//       {success ? (
//         <>
//           <h1 className="text-2xl text-green-600 font-semibold">
//             Payment Successful 🎉
//           </h1>
//           <button
//             onClick={() => navigate("/")}
//             className="px-6 py-2 bg-primary text-white rounded"
//           >
//             Go Home
//           </button>
//         </>
//       ) : (
//         <>
//           <h1 className="text-2xl text-red-500 font-semibold">
//             Payment Failed ❌
//           </h1>
//           <button
//             onClick={() => navigate("/")}
//             className="px-6 py-2 bg-primary text-white rounded"
//           >
//             Go Home
//           </button>
//         </>
//       )}
//     </div>
//   )
// }

// export default PaymentSuccess
import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import Loader from "../components/Loader"

const PaymentSuccess = () => {

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get("session_id")

  // ✅ ADD fetchCars
  const { axios, fetchCars } = useAppContext()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)

  const verifyPayment = async () => {
    try {
      const { data } = await axios.post("/api/payment/complete", {
        sessionId,
      })

      if (data.success) {
        // 🔥 IMPORTANT: refresh cars globally
        await fetchCars()
        setSuccess(true)
      } else {
        setSuccess(false)
      }

    } catch (error) {
      console.log(error)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      verifyPayment()
    } else {
      setLoading(false)
      setSuccess(false)
    }
  }, [sessionId])

  // ✅ LOADER
  if (loading) return <Loader />

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      {success ? (
        <>
          <h1 className="text-2xl text-green-600 font-semibold">
            Payment Successful 🎉
          </h1>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-white rounded"
          >
            Go Home
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl text-red-500 font-semibold">
            Payment Failed ❌
          </h1>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-white rounded"
          >
            Go Home
          </button>
        </>
      )}
    </div>
  )
}

export default PaymentSuccess