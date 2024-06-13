import { Router } from "express";
import { createInvoice } from "../controllers/inovice.controller";

const router = Router()

router.post('/add/:userId/:productId', createInvoice)


export default router