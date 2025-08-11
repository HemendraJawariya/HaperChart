import axios from 'axios'
import React, { useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { serverUrl } from '../App'

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [inputClicked, setInputClicked] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmNewPassword: false,
  })
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStep1 = async () => {
    setLoading(true)
    setErr("")
    setSuccess("")
    try {
      const result = await axios.post(`${serverUrl}/api/auth/sendOtp`, { email }, { withCredentials: true })
      console.log(result.data)
      setStep(2)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "Something went wrong")
    }
  }

  const handleStep2 = async () => {
    setLoading(true)
    setErr("")
    setSuccess("")
    try {
      const result = await axios.post(`${serverUrl}/api/auth/verifyOtp`, { email, otp }, { withCredentials: true })
      console.log(result.data)
      setStep(3)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "Something went wrong")
    }
  }

  const handleStep3 = async () => {
    if (newPassword !== confirmNewPassword) {
      return setErr("Passwords do not match")
    }
    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return setErr("Password must be at least 6 characters, include uppercase and number")
    }

    setErr("")
    setSuccess("")
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/resetPassword`, {
        email,
        password: newPassword,
      }, { withCredentials: true })
      console.log(result.data)
      setSuccess("Password reset successfully. You can now log in.")
      setLoading(false)
      setStep(4)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div className='w-full h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center'>
      {step === 1 && (
        <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
          <h2 className='text-[30px] font-semibold'>Forgot Password</h2>
          <div className='relative flex items-center mt-[30px] w-[90%] h-[50px] rounded-2xl border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, email: true })}>
            <label htmlFor='email' className={`text-gray-700 absolute left-[20px] p-[5px] bg-white text-[15px] ${inputClicked.email ? "top-[-15px]" : ""}`}>Enter Email</label>
            <input type="email" id='email' className='w-full h-full rounded-2xl px-[20px] outline-none border-0' required onChange={(e) => setEmail(e.target.value)} value={email} />
          </div>
          {err && <p className='text-red-500 mt-2'>{err}</p>}
          <button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] rounded-2xl mt-[30px]' disabled={loading} onClick={handleStep1}>
            {loading ? <ClipLoader size={30} color='white' /> : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
          <h2 className='text-[30px] font-semibold'>Verify OTP</h2>
          <div className='relative flex items-center mt-[30px] w-[90%] h-[50px] rounded-2xl border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, otp: true })}>
            <label htmlFor='otp' className={`text-gray-700 absolute left-[20px] p-[5px] bg-white text-[15px] ${inputClicked.otp ? "top-[-15px]" : ""}`}>Enter OTP</label>
            <input type="text" id='otp' className='w-full h-full rounded-2xl px-[20px] outline-none border-0' required onChange={(e) => setOtp(e.target.value)} value={otp} />
          </div>
          {err && <p className='text-red-500 mt-2'>{err}</p>}
          <button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] rounded-2xl mt-[30px]' disabled={loading} onClick={handleStep2}>
            {loading ? <ClipLoader size={30} color='white' /> : "Verify OTP"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
          <h2 className='text-[30px] font-semibold'>Reset Password</h2>
          <div className='relative flex items-center mt-[30px] w-[90%] h-[50px] rounded-2xl border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, newPassword: true })}>
            <label htmlFor='newPassword' className={`text-gray-700 absolute left-[20px] p-[5px] bg-white text-[15px] ${inputClicked.newPassword ? "top-[-15px]" : ""}`}>Enter New Password</label>
            <input type="password" id='newPassword' className='w-full h-full rounded-2xl px-[20px] outline-none border-0' required onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
          </div>
          <div className='relative flex items-center mt-[30px] w-[90%] h-[50px] rounded-2xl border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, confirmNewPassword: true })}>
            <label htmlFor='confirmNewPassword' className={`text-gray-700 absolute left-[20px] p-[5px] bg-white text-[15px] ${inputClicked.confirmNewPassword ? "top-[-15px]" : ""}`}>Confirm New Password</label>
            <input type="password" id='confirmNewPassword' className='w-full h-full rounded-2xl px-[20px] outline-none border-0' required onChange={(e) => setConfirmNewPassword(e.target.value)} value={confirmNewPassword} />
          </div>
          {err && <p className='text-red-500 mt-2'>{err}</p>}
          <button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] rounded-2xl mt-[30px]' disabled={loading} onClick={handleStep3}>
            {loading ? <ClipLoader size={30} color='white' /> : "Reset Password"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className='w-[90%] max-w-[500px] h-[300px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
          <h2 className='text-[30px] font-semibold text-green-600'>Success!</h2>
          <p className='text-[18px] text-center px-4 mt-4'>{success || "Your password has been reset successfully."}</p>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
