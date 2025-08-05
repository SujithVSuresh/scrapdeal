import express from 'express'
import productControllers from '../controllers/product.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const productRouter = express.Router();

productRouter.post('/list', authMiddleware(["seller"]), upload.single('image'), productControllers.listProduct);
productRouter.get('/my-products', authMiddleware(["seller"]), productControllers.getSellerProducts);
productRouter.get('/products/:id', authMiddleware(["seller", "buyer"]), productControllers.getProductById);
productRouter.get('/available-products', authMiddleware(["buyer"]), productControllers.getAllAvailableProducts);
productRouter.delete('/:id', authMiddleware(["seller"]), productControllers.deleteProduct);

export default productRouter