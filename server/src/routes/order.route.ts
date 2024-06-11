import { Router } from "express";
import { createOrder, validateOrder } from "../controllers/order.controller";

const router = Router()

router.post('/order', createOrder)
router.post('/order/validate', validateOrder)

export default router