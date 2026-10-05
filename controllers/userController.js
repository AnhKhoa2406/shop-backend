import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../model/userModel.js"

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Danh sách tài khoản admin được phép đăng nhập.
// Thêm admin mới: chỉ cần thêm ADMIN_EMAIL_3 / ADMIN_PASSWORD_3, ... vào .env
// rồi thêm 1 dòng tương ứng vào mảng bên dưới.
const getAdminAccounts = () => {
    const accounts = [
        {
            email: String(process.env.ADMIN_EMAIL || "").trim(),
            password: String(process.env.ADMIN_PASSWORD || "").trim(),
        },
        {
            email: String(process.env.ADMIN_EMAIL_2 || "").trim(),
            password: String(process.env.ADMIN_PASSWORD_2 || "").trim(),
        },
    ]

    // Bỏ qua các slot admin chưa cấu hình (email hoặc password rỗng)
    return accounts.filter((acc) => acc.email && acc.password)
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

        const admins = getAdminAccounts()

        if (admins.length === 0) {
            console.log("CẢNH BÁO: chưa cấu hình tài khoản admin nào trong .env")
            return res.json({ success: false, message: "Server chưa cấu hình tài khoản admin" })
        }

        const matchedAdmin = admins.find(
            (acc) => acc.email === email && acc.password === password
        )

        if (matchedAdmin) {
            // Giữ nguyên cách ký cũ (payload = email + password) để adminAuth
            // middleware hiện tại vẫn verify đúng, không cần đổi middleware
            const token = jwt.sign(
                matchedAdmin.email + matchedAdmin.password,
                process.env.JWT_SECRET
            )
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