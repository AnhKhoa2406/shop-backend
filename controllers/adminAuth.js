import jwt from "jsonwebtoken"

// =====================================================
// LẤY DANH SÁCH TÀI KHOẢN ADMIN TỪ ENVIRONMENT VARIABLES
// =====================================================
// Phải giống với danh sách admin trong userController.js
//
// Render cần có:
// ADMIN_EMAIL
// ADMIN_PASSWORD
// ADMIN_EMAIL_2
// ADMIN_PASSWORD_2
//
// Không log password/secret ra console.
// =====================================================

const getAdminAccounts = () => {
    // Kiểm tra Render có đọc được Environment Variables hay không.
    // Chỉ log true/false, KHÔNG log giá trị thật của password.
    console.log("========== ADMIN ENV CHECK ==========")
    console.log("ADMIN_EMAIL:", !!process.env.ADMIN_EMAIL)
    console.log("ADMIN_PASSWORD:", !!process.env.ADMIN_PASSWORD)
    console.log("ADMIN_EMAIL_2:", !!process.env.ADMIN_EMAIL_2)
    console.log("ADMIN_PASSWORD_2:", !!process.env.ADMIN_PASSWORD_2)
    console.log("JWT_SECRET:", !!process.env.JWT_SECRET)
    console.log("=====================================")

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

    // Chỉ lấy những tài khoản có đầy đủ email + password
    return accounts.filter((acc) => acc.email && acc.password)
}


// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

const adminAuth = async (req, res, next) => {
    try {
        // -------------------------------------------------
        // 1. LẤY TOKEN
        // -------------------------------------------------

        const { token } = req.headers

        if (!token) {
            return res.json({
                success: false,
                message: "Not Authorized. Login Again",
            })
        }


        // -------------------------------------------------
        // 2. KIỂM TRA JWT
        // -------------------------------------------------

        let token_decode

        try {
            // Kiểm tra JWT_SECRET có tồn tại không
            if (!process.env.JWT_SECRET) {
                console.log("❌ JWT_SECRET chưa được cấu hình trên server")

                return res.json({
                    success: false,
                    message: "Server chưa cấu hình JWT_SECRET",
                })
            }

            token_decode = jwt.verify(
                token,
                process.env.JWT_SECRET
            )

        } catch (verifyError) {
            console.log("❌ JWT VERIFY ERROR:", verifyError.message)

            return res.json({
                success: false,
                message: "Not Authorized. Login Again",
            })
        }


        // -------------------------------------------------
        // 3. LẤY DANH SÁCH ADMIN
        // -------------------------------------------------

        const admins = getAdminAccounts()


        // -------------------------------------------------
        // 4. KIỂM TRA ADMIN CÓ ĐƯỢC CẤU HÌNH KHÔNG
        // -------------------------------------------------

        if (admins.length === 0) {
            console.log("❌ CẢNH BÁO: chưa cấu hình tài khoản admin nào trong .env")

            return res.json({
                success: false,
                message: "Server chưa cấu hình tài khoản admin",
            })
        }

        console.log(
            `✅ Server đã nhận ${admins.length} tài khoản admin`
        )


        // -------------------------------------------------
        // 5. KIỂM TRA TOKEN CÓ THUỘC ADMIN HỢP LỆ KHÔNG
        // -------------------------------------------------

        const isValidAdmin =
            typeof token_decode === "string" &&
            admins.some(
                (acc) =>
                    token_decode ===
                    acc.email + acc.password
            )


        // -------------------------------------------------
        // 6. TOKEN KHÔNG PHẢI ADMIN
        // -------------------------------------------------

        if (!isValidAdmin) {
            console.log("❌ Token không thuộc tài khoản admin hợp lệ")

            return res.json({
                success: false,
                message: "Not Authorized. Login Again",
            })
        }


        // -------------------------------------------------
        // 7. ADMIN HỢP LỆ → CHO PHÉP ĐI TIẾP
        // -------------------------------------------------

        console.log("✅ Admin authentication thành công")

        next()

    } catch (error) {
        console.log("❌ ADMIN AUTH ERROR:", error)

        return res.json({
            success: false,
            message: error.message,
        })
    }
}


export default adminAuth