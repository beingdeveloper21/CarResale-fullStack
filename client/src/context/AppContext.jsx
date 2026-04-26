// import { createContext, useContext, useEffect, useState } from "react"
// import axios from "axios"
// import { useNavigate } from "react-router-dom"

// // ✅ Base URL
// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

// // ✅ Axios config
// axios.defaults.baseURL = BASE_URL

// // ✅ Attach token automatically
// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token")
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// export const AppContext = createContext()

// export const AppProvider = ({ children }) => {

//   const navigate = useNavigate()

//   const [token, setToken] = useState(null)
//   const [user, setUser] = useState(null)
//   const [isOwner, setIsOwner] = useState(false)
//   const [cars, setCars] = useState([])
//   const [showLogin, setShowLogin] = useState(false)

//   // ✅ Fetch user
//   const fetchUser = async () => {
//     try {
//       const { data } = await axios.get("/api/user/data")
//       if (data.success) {
//         setUser(data.user)
//         setIsOwner(data.user.role === "owner")
//       }
//     } catch {
//       logout()
//     }
//   }

//   // ✅ Fetch cars
//   const fetchCars = async () => {
//     try {
//       const { data } = await axios.get("/api/user/cars")
//       console.log("API Response:", data)
//       if (data.success) {
//         console.log("Cars from API:", data.cars)
//         setCars(data.cars)
//       }
//     } catch (error) {
//       console.error("Error fetching cars:", error.message);
//     }
//   }

//   // ✅ Logout
//   const logout = () => {
//     localStorage.removeItem("token")
//     setToken(null)
//     setUser(null)
//     setIsOwner(false)
//     navigate("/")
//   }

//   // ✅ Load token
//   useEffect(() => {
//     const savedToken = localStorage.getItem("token")
//     if (savedToken) setToken(savedToken)
//     fetchCars()
//   }, [])

//   // ✅ Fetch user after token
//   useEffect(() => {
//     if (token) fetchUser()
//   }, [token])

//   return (
//     <AppContext.Provider
//       value={{
//         axios,
//         BASE_URL, // ✅ now properly defined
//         token,
//         setToken,
//         user,
//         isOwner,
//         logout,
//         cars,
//         fetchCars,
//         showLogin,
//         setShowLogin,
//         navigate
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   )
// }

// export const useAppContext = () => useContext(AppContext)
import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// ✅ Base URL
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"
axios.defaults.baseURL = BASE_URL

// ✅ Attach token automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const navigate = useNavigate()

  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [cars, setCars] = useState([])
  const [showLogin, setShowLogin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
const [searchLocation, setSearchLocation] = useState('')

  // ✅ NEW: loading state (IMPORTANT)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Fetch user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data")

      if (data.success) {
        setUser(data.user)
        setIsOwner(data.user.role === "owner")
      }
    } catch (error) {
      console.log("User fetch failed:", error.message)
      // ❌ DON'T logout immediately (prevents flicker)
      setUser(null)
      setIsOwner(false)
    } finally {
      setIsLoading(false)   // ✅ VERY IMPORTANT
    }
  }

  // ✅ Fetch cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/user/cars")

      if (data.success) {
        setCars(data.cars)
      }
    } catch (error) {
      console.error("Error fetching cars:", error.message)
    }
  }

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setIsOwner(false)
    navigate("/")
  }

  // ✅ Load token + cars
  useEffect(() => {
    const savedToken = localStorage.getItem("token")

    if (savedToken) {
      setToken(savedToken)
    } else {
      setIsLoading(false) // no token → no need to wait
    }

    fetchCars()
  }, [])

  // ✅ Fetch user after token
  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token])

  return (
    <AppContext.Provider
      value={{
        axios,
        BASE_URL,
        token,
        setToken,
        user,
        isOwner,
        logout,
        cars,
        
        fetchCars,
        showLogin,
        setShowLogin,
        navigate,
        isLoading, searchQuery,
  setSearchQuery,
  searchLocation,
  setSearchLocation,  // ✅ expose this
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)