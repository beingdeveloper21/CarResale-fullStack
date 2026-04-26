
import React from 'react'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';


const NavbarOwner = () => {

    const {user} = useAppContext()
    const navigate = useNavigate()
    const toggleTheme = () => {
  document.documentElement.classList.toggle("dark");
};

  return (
    <div className='flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor relative transition-all'>
      
      {/* LOGO → already goes home */}
      <Link to='/' className='text-lg font-semibold text-gray-900'>
        Car Resale Marketplace
      </Link>

      <div className='flex items-center gap-4'>
        <p>Welcome, {user?.name || "Owner"}</p>

        {/* 🔥 ADD THIS */}
        <button
          onClick={() => navigate('/')}
          className='text-sm text-primary hover:underline'
        >
          Home
        </button>
        <button
  onClick={toggleTheme}
  className='text-sm border px-2 py-1 rounded'
>
  🌙
</button>
      </div>
    </div>
  )
}

export default NavbarOwner