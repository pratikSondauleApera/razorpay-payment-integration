import { Router } from "express";
import { addProduct } from "../controllers/product.controller";

const router = Router()

router.post('/add', addProduct)


export default router