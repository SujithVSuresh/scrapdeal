import express from 'express'
import orderControllers from '../controllers/order.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware(["buyer"]), orderControllers.placeOrder);
orderRouter.put('/cancel/:id', authMiddleware(["buyer"]), orderControllers.cancelOrder);
orderRouter.put('/confirm/:id', authMiddleware(["seller"]), orderControllers.confirmOrder);
orderRouter.get('/buyer/orders', authMiddleware(["buyer"]), orderControllers.getOrdersByBuyer);
orderRouter.get('/product/:productId', authMiddleware(["seller"]), orderControllers.getProductOrders);


export default orderRouter