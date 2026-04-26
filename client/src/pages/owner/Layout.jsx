import React from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet, Navigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {

  const { isOwner, user } = useAppContext()

  // ✅ PROPER PROTECTION (NO useEffect)
  if (!user || !isOwner) {
    return <Navigate to="/" />
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarOwner />
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout