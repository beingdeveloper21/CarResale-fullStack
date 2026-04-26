// import React from 'react';
// import { motion } from 'motion/react';

// const fadeUp = (delay = 0) => ({
//   initial: { opacity: 0, y: 25 },
//   whileInView: { opacity: 1, y: 0 },
//   transition: { duration: 0.6, delay, ease: "easeOut" },
//   viewport: { once: true, amount: 0.3 },
// });

// const Newsletter = () => {
//   return (
//     <motion.div
//       {...fadeUp(0)}
//       className="flex flex-col items-center justify-center text-center max-md:px-4 my-16 mb-40 bg-gradient-to-br from-gray-50 to-blue-50 py-16 rounded-3xl mx-6"
//     >
//       <motion.h1
//         {...fadeUp(0.2)}
//         className="md:text-5xl text-3xl font-bold text-gray-900 leading-tight"
//       >
//         Never Miss a Good Listing!
//       </motion.h1>

//       <motion.p
//         {...fadeUp(0.3)}
//         className="md:text-xl text-gray-600 pb-10 max-w-2xl leading-relaxed font-medium"
//       >
//         Subscribe to get new arrivals, price drops, and buyer tips delivered to your inbox
//       </motion.p>

//       <motion.form
//         {...fadeUp(0.4)}
//         className="flex items-center max-w-2xl w-full md:h-16 h-14 shadow-xl rounded-full overflow-hidden border border-gray-200 bg-white"
//       >
//         <input
//           className="h-full w-full px-6 outline-none text-gray-700 placeholder-gray-400 text-lg focus:ring-2 focus:ring-primary/20 transition"
//           type="email"
//           placeholder="Enter your email address"
//           required
//         />

//         <button
//           type="submit"
//           className="md:px-10 px-8 h-full bg-primary hover:bg-primary-dull transition-all text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl"
//         >
//           Subscribe
//         </button>
//       </motion.form>
//     </motion.div>
//   );
// };

// export default Newsletter;
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
  viewport: { once: true, amount: 0.3 },
});

const Newsletter = () => {

  const { axios } = useAppContext();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) return toast.error("Enter email");

    try {
      setLoading(true);

      const { data } = await axios.post("/api/newsletter/subscribe", {
        email,
      });

      if (data.success) {
        toast.success("Subscribed successfully 🎉");
        setEmail(""); // clear input
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...fadeUp(0)}
      className="flex flex-col items-center justify-center text-center max-md:px-4 my-16 mb-40 bg-gradient-to-br from-gray-50 to-blue-50 py-16 rounded-3xl mx-6"
    >

      <motion.h1 {...fadeUp(0.2)}
        className="md:text-5xl text-3xl font-bold text-gray-900">
        Never Miss a Good Listing!
      </motion.h1>

      <motion.p {...fadeUp(0.3)}
        className="md:text-xl text-gray-600 pb-10 max-w-2xl">
        Subscribe to get new arrivals, price drops, and buyer tips
      </motion.p>

      {/* ✅ FIXED FORM */}
      <motion.form
        onSubmit={handleSubscribe}
        {...fadeUp(0.4)}
        className="flex items-center max-w-2xl w-full md:h-16 h-14 shadow-xl rounded-full overflow-hidden border bg-white"
      >

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-full w-full px-6 outline-none text-gray-700"
          type="email"
          placeholder="Enter your email address"
          required
        />

        <button
          disabled={loading}
          className="md:px-10 px-8 h-full bg-primary text-white font-semibold rounded-full"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>

      </motion.form>

    </motion.div>
  );
};

export default Newsletter;