import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../model/userModel.js"

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({ success: false, message: "Please enter email and password" })
        }

        const user = await userModel.findOne({ email: email.trim() })

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // check required fields
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill in all fields" })
        }

        // validate email format & strong password (before hitting the DB)
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // check user already exists
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim()
        const password = String(req.body.password || "").trim()

        const adminEmail = String(process.env.ADMIN_EMAIL || "").trim()
        const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim()

        // DEBUG: xóa 3 dòng này sau khi chạy được
        console.log("Nhận được:", JSON.stringify(email), JSON.stringify(password))
        console.log("Trong env:", JSON.stringify(adminEmail), JSON.stringify(adminPassword))
        if (!adminEmail || !adminPassword) console.log("CẢNH BÁO: .env chưa được nạp!")

        if (email === adminEmail && password === adminPassword) {
            // Giữ nguyên cách ký cũ để middleware adminAuth hiện tại vẫn chạy
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin }