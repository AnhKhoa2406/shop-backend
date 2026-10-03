import orderModel from '../model/orderModel.js'
import userModel from '../model/userModel.js'

// Đặt hàng (Hỗ trợ cả COD và Banking)
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.json({ success: false, message: 'Giỏ hàng trống' })
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: paymentMethod || 'COD', // Nhận phương thức thanh toán từ client gửi lên
      payment: false, // Mặc định chưa thanh toán, chờ admin duyệt hoặc xác nhận chuyển khoản
      date: Date.now(),
    }

    const newOrder = new orderModel(orderData)
    await newOrder.save()

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await userModel.findByIdAndUpdate(userId, { cartData: {} })

    res.json({ success: true, message: 'Đặt hàng thành công' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Lấy danh sách đơn hàng của User
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ userId }).sort({ date: -1 })
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Lấy tất cả đơn hàng (cho Admin)
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 })
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Cập nhật trạng thái đơn hàng (cho Admin)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body
    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({ success: true, message: 'Đã cập nhật trạng thái' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { placeOrder, userOrders, allOrders, updateStatus }