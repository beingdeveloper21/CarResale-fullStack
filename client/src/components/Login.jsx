// import React from 'react'
// import { useAppContext } from '../context/AppContext';
// import toast from 'react-hot-toast';

// const Login = () => {

//     const { setShowLogin, axios, setToken, navigate } = useAppContext()

//     const [state, setState] = React.useState("login");
//     const [name, setName] = React.useState("");
//     const [email, setEmail] = React.useState("");
//     const [password, setPassword] = React.useState("");
//     const [role, setRole] = React.useState("user"); // ✅ ONLY FOR REGISTER

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();

//         try {
//             const payload = state === "register"
//                 ? { name, email, password, role }
//                 : { email, password }; // ❌ NO ROLE IN LOGIN

//             const { data } = await axios.post(`/api/user/${state}`, payload);

//             if (data.success) {
//                 localStorage.setItem("token", data.token);
//                 axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//                 setToken(data.token);

//                 navigate('/');
//                 setShowLogin(false);
//             } else {
//                 toast.error(data.message);
//             }

//         } catch (error) {
//             toast.error(error.response?.data?.message || error.message);
//         }
//     };

//     return (
//         <div onClick={() => setShowLogin(false)} className='fixed inset-0 flex items-center bg-black/50'>

//             <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()}
//                 className="flex flex-col gap-4 m-auto p-8 w-80 bg-white rounded-lg">

//                 <h2 className="text-xl text-center">
//                     {state === "login" ? "Login" : "Register"}
//                 </h2>

//                 {/* ✅ ROLE ONLY FOR REGISTER */}
//                 {state === "register" && (
//                     <div className="flex gap-2">
//                         <button type="button"
//                             onClick={() => setRole("user")}
//                             className={`w-full py-2 rounded ${role === "user" ? "bg-primary text-white" : "border"}`}>
//                             User
//                         </button>

//                         <button type="button"
//                             onClick={() => setRole("owner")}
//                             className={`w-full py-2 rounded ${role === "owner" ? "bg-primary text-white" : "border"}`}>
//                             Owner
//                         </button>
//                     </div>
//                 )}

//                 {state === "register" && (
//                     <input value={name} onChange={(e) => setName(e.target.value)}
//                         placeholder="Name" className="border p-2 rounded" required />
//                 )}

//                 <input value={email} onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email" type="email" className="border p-2 rounded" required />

//                 <input value={password} onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Password" type="password" className="border p-2 rounded" required />

//                 <button className="bg-primary text-white py-2 rounded">
//                     {state === "login" ? "Login" : "Register"}
//                 </button>

//                 <p className="text-sm text-center">
//                     {state === "login" ? "No account?" : "Already have account?"}
//                     <span onClick={() => setState(state === "login" ? "register" : "login")}
//                         className="text-primary cursor-pointer ml-1">
//                         {state === "login" ? "Register" : "Login"}
//                     </span>
//                 </p>

//             </form>
//         </div>
//     )
// }

// export default Login
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const { setShowLogin, axios, setToken, navigate } = useAppContext();

  const [state, setState] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // 👁️ toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 🔐 PASSWORD VALIDATION FUNCTION
  const validatePassword = (pass) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return regex.test(pass);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      // ================= LOGIN / REGISTER =================
      if (state === "login" || state === "register") {

        // 🔥 VALIDATIONS FOR REGISTER
        if (state === "register") {
          if (!validatePassword(password)) {
            return toast.error(
              "Password must be 8+ chars with letter, number & symbol"
            );
          }

          if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
          }
        }

        const payload =
          state === "register"
            ? { name, email, password, role }
            : { email, password };

        const { data } = await axios.post(`/api/user/${state}`, payload);

        if (data.success) {
          localStorage.setItem("token", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          setToken(data.token);

          navigate("/");
          setShowLogin(false);
        } else {
          toast.error(data.message);
        }
      }

      // ================= SEND OTP =================
      if (state === "forgot") {
        const { data } = await axios.post("/api/user/send-otp", { email });

        if (data.success) {
          toast.success("OTP sent to email");
          setState("reset");
        } else {
          toast.error(data.message);
        }
      }

      // ================= RESET PASSWORD =================
      if (state === "reset") {

        if (!validatePassword(newPassword)) {
          return toast.error(
            "Password must be 8+ chars with letter, number & symbol"
          );
        }

        if (newPassword !== confirmNewPassword) {
          return toast.error("Passwords do not match");
        }

        const { data } = await axios.post("/api/user/reset-password", {
          email,
          otp,
          newPassword,
        });

        if (data.success) {
          toast.success("Password reset successful");
          setState("login");
        } else {
          toast.error(data.message);
        }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 flex items-center bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto p-8 w-80 bg-white rounded-lg"
      >
        <h2 className="text-xl text-center capitalize">{state}</h2>

        {/* REGISTER */}
        {state === "register" && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`w-full py-2 rounded ${
                  role === "user" ? "bg-primary text-white" : "border"
                }`}
              >
                User
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`w-full py-2 rounded ${
                  role === "owner" ? "bg-primary text-white" : "border"
                }`}
              >
                Owner
              </button>
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="border p-2 rounded"
              required
            />
          </>
        )}

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="border p-2 rounded"
          required
        />

        {/* PASSWORD */}
        {(state === "login" || state === "register") && (
          <>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className="border p-2 rounded w-full pr-10"
                required
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 cursor-pointer text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {/* 🔁 CONFIRM PASSWORD */}
            {state === "register" && (
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                type="password"
                className="border p-2 rounded"
                required
              />
            )}

            {state === "register" && (
              <p className="text-xs text-gray-400">
                Must be 8+ chars with letter, number & symbol
              </p>
            )}
          </>
        )}

        {/* RESET */}
        {state === "reset" && (
          <>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="border p-2 rounded"
              required
            />

            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                type={showNewPassword ? "text" : "password"}
                className="border p-2 rounded w-full pr-10"
                required
              />

              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2 cursor-pointer text-sm"
              >
                {showNewPassword ? "Hide" : "Show"}
              </span>
            </div>

            <input
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm New Password"
              type="password"
              className="border p-2 rounded"
              required
            />
          </>
        )}

        <button className="bg-primary text-white py-2 rounded">
          {state === "login" && "Login"}
          {state === "register" && "Register"}
          {state === "forgot" && "Send OTP"}
          {state === "reset" && "Reset Password"}
        </button>

        {/* NAV */}
        <p className="text-sm text-center">
          {state === "login" && (
            <>
              No account?
              <span
                onClick={() => setState("register")}
                className="text-primary cursor-pointer ml-1"
              >
                Register
              </span>
            </>
          )}

          {state === "register" && (
            <>
              Already have account?
              <span
                onClick={() => setState("login")}
                className="text-primary cursor-pointer ml-1"
              >
                Login
              </span>
            </>
          )}
        </p>

        {state === "login" && (
          <p
            onClick={() => setState("forgot")}
            className="text-sm text-center text-primary cursor-pointer"
          >
            Forgot Password?
          </p>
        )}

        {(state === "forgot" || state === "reset") && (
          <p
            onClick={() => setState("login")}
            className="text-sm text-center text-gray-400 cursor-pointer"
          >
            Back to Login
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;