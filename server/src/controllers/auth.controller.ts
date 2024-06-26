import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Razorpay from "razorpay";

const prisma = new PrismaClient()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export const signUpAsUser: RequestHandler = async (req, res) => {
    const name = (req.body as { name: string }).name
    const contact = (req.body as { contact: string }).contact
    const email = (req.body as { email: string }).email
    const addressLine1 = (req.body as { addressLine1: string }).addressLine1
    const addressLine2 = (req.body as { addressLine2: string }).addressLine2
    const country = (req.body as { country: string }).country
    const state = (req.body as { state: string }).state
    const city = (req.body as { city: string }).city
    const pincode = (req.body as { pincode: string }).pincode
    const password = (req.body as { password: string }).password

    if (!name || !contact || !email || !password || !addressLine1 || !addressLine2 || !country || !state || !city || !pincode) {
        return res.status(400).json({ error: "Please fill the required details" })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (existingUser) {
        return res.status(503).json({ error: "User already exist" })
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10)

        const userData = {
            name,
            contact,
            email,
            addressLine1,
            addressLine2,
            country,
            state,
            city,
            pincode,
            password: hashedPassword
        }

        const registerUser = await prisma.user.create({
            data: userData
        })

        return res.status(201).json({ msg: "User registered successfully", registerUser })
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong while registering a user", error })
    }
}

export const signIn: RequestHandler = async (req, res) => {
    const email = (req.body as { email: string }).email
    const password = (req.body as { password: string }).password

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" })
    }

    try {

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            res.status(404).json({ error: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user!.password);

        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" })
        }

        const payload = {
            id: user?.id,
        }

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "7d"
        });

        return res.status(200).json({ msg: "Login successfully", token })

    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong while login", error })
    }
}