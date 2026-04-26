import React from "react";
import Title from "./Title";
import { assets } from "../assets/assets";
import { motion } from "motion/react";

const Testimonial = () => {
  const testimonials = [
    {
      name: "Aarav Sharma",
      location: "Mumbai, India",
      testimonial:
        "I found a clean, fairly priced sedan and connected with the seller the same day.",
    },
    {
      name: "Priya Iyer",
      location: "Chennai, India",
      testimonial:
        "The listing details made comparison easy. Mileage, condition, and asking price were all clear.",
    },
    {
      name: "Rohit Verma",
      location: "Delhi, India",
      testimonial:
        "I listed my SUV in minutes and started receiving sensible enquiries from buyers.",
    },
  ];

  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">

      <Title
        title="What Our Customers Say"
        subTitle="See why buyers and sellers use the marketplace for smoother used-car deals."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
        {testimonials.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
              ease: "easeOut",
            }}
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {item.name.charAt(0)}
                </span>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                <p className="text-gray-500 text-sm">{item.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <img key={i} src={assets.star_icon} alt="star-icon" className="h-5 w-5" />
                ))}
            </div>

            <p className="text-gray-600 mt-4 font-medium leading-relaxed">
              "{item.testimonial}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
