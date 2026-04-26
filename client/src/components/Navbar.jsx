import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const Navbar = () => {

    const { setShowLogin, user, logout, isOwner } = useAppContext()

    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative ${location.pathname === "/" && "bg-light"}`}
        >

            {/* Logo */}
            <div className="text-xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
                Car Resale
            </div>

            {/* Links */}
            <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 bg-white ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>

                {menuLinks.map((link, index) => (
                    <Link key={index} to={link.path}>
                        {link.name}
                    </Link>
                ))}

                {/* Search (optional UI) */}
                {/* <div className='hidden lg:flex items-center text-sm gap-2 border px-3 rounded-full max-w-56'>
                    <input
                        type="text"
                        className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                        placeholder="Search listings"
                    />
                    <img src={assets.search_icon} alt="search" />
                </div> */}

                {/* Actions */}
                <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>

                    {/* OWNER ONLY */}
                    {user && isOwner && (
                        <button
                            onClick={() => navigate('/owner')}
                            className="cursor-pointer font-medium text-primary"
                        >
                            Dashboard
                        </button>
                    )}


                    {/* LOGIN / LOGOUT */}
                    <button
                        onClick={() => user ? logout() : setShowLogin(true)}
                        className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg"
                    >
                        {user ? 'Logout' : 'Login'}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button
                className='sm:hidden cursor-pointer'
                onClick={() => setOpen(!open)}
            >
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
            </button>

        </motion.div>
    )
}

export default Navbar