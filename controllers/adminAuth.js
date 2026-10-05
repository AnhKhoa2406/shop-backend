import jwt from "jsonwebtoken"

// Phải giống hệt danh sách admin trong userController.js (adminLogin).
// Thêm admin mới ở cả 2 nơi: .env + mảng này.
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

    return accounts.filter((acc) => acc.email && acc.password)
}

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers

        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Login Again" })
        }

        // Giải mã token (sẽ ném lỗi nếu token sai, hết hạn, hoặc sai secret)
        let token_decode
        try {
            token_decode = jwt.verify(token, process.env.JWT_SECRET)
        } catch (verifyError) {
            return res.json({ success: false, message: "Not Authorized. Login Again" })
        }

        const admins = getAdminAccounts()

        if (admins.length === 0) {
            console.log("CẢNH BÁO: chưa cấu hình tài khoản admin nào trong .env")
            return res.json({ success: false, message: "Server chưa cấu hình tài khoản admin" })
        }

        // token_decode phải khớp email+password của MỘT trong các admin hợp lệ
        const isValidAdmin =
            typeof token_decode === "string" &&
            admins.some((acc) => token_decode === acc.email + acc.password)

        if (!isValidAdmin) {
            return res.json({ success: false, message: "Not Authorized. Login Again" })
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth