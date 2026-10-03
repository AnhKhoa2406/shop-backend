import express from 'express'
import { placeOrder, userOrders, allOrders, updateStatus } from '../controllers/orderController.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Cho user
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/userorders', authUser, userOrders)

// Cho Admin (nên thêm middleware xác thực admin vào trước hàm xử lý)
orderRouter.post('/list', allOrders)
orderRouter.post('/status', updateStatus)

export default orderRouter