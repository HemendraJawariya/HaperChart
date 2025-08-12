// auth.controllers.js
import sendMail from "../config/Mail.js"
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export const signUp = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body
    const findByEmail = await User.findOne({ email })
    if (findByEmail) return res.status(400).json({ message: "Email already exists!" })

    const findByUserName = await User.findOne({ userName })
    if (findByUserName) return res.status(400).json({ message: "Username already exists!" })

    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({ name, userName, email, password: hashedPassword })

    const token = await genToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    })

    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json({ message: `signup error ${error}` })
  }
}

export const signIn = async (req, res) => {
  try {
    const { password, userName } = req.body
    const user = await User.findOne({ userName })
    if (!user) return res.status(400).json({ message: "User not found!" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: "Incorrect Password!" })

    const token = await genToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
     secure: true,
      sameSite: "None",
    })

  
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: `signin error ${error}` })
  }
}

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token")
    return res.status(200).json({ message: "Sign out successfully" })
  } catch (error) {
    return res.status(500).json({ message: `signout error ${error}` })
  }
}

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "User not found" })

    const otp = crypto.randomInt(100000, 999999).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)

    user.resetOtp = hashedOtp
    user.otpExpires = Date.now() + 5 * 60 * 1000
    user.isOtpVerified = false

    await user.save()
    await sendMail(email, otp)
    return res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    return res.status(500).json({ message: `send otp error ${error}` })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await User.findOne({ email })
    if (!user || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp)
    if (!isMatch) return res.status(400).json({ message: "Incorrect OTP" })

    user.isOtpVerified = true
    user.resetOtp = undefined
    user.otpExpires = undefined
    await user.save()

    return res.status(200).json({ message: "OTP verified" })
  } catch (error) {
    return res.status(500).json({ message: `verify otp error ${error}` })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" })
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: "Password must be strong (min 6 chars, include uppercase and number)" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.isOtpVerified = false
    await user.save()

    

    return res.status(200).json({ message: "Password reset successfully" })
  } catch (error) {
    return res.status(500).json({ message: `reset password error ${error}` })
  }
}

export const deleteStory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user.story) {
      return res.status(400).json({ message: "No story to delete" })
    }

    await Story.findByIdAndDelete(user.story)
    user.story = null
    await user.save()

    return res.status(200).json({ message: "Story deleted successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Story delete error" })
  }
}

