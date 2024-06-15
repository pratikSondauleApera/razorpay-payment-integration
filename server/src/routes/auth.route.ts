import { Router } from "express";
import { signIn, signUpAsUser, signUpAsVendor } from "../controllers/auth.controller";

const router = Router()

router.post('/signup/user', signUpAsUser)

router.post('/signin', signIn)

export default router