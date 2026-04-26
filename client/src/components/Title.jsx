import React from 'react'

const Title = ({ title, subTitle, align }) => {
  return (
    <div className={`flex flex-col justify-center items-center text-center ${align === "left" && " md:items-start md:text-left"}`}>
      <h1 className='font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight'>{title}</h1>
      <p className='text-base md:text-lg text-gray-600 mt-4 max-w-2xl leading-relaxed font-medium'>{subTitle}</p>
      <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-dull rounded-full mt-6"></div>
    </div>
  )
}

export default Title
