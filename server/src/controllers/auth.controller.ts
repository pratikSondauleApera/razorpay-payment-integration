import { RequestHandler } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export const signUp: RequestHandler = async (req, res) => {
    const name = (req.body as { name: string }).name
    const contact = (req.body as { contact: string }).contact
    const email = (req.body as { email: string }).email
    const password = (req.body as { password: string }).password

    if (!name || !contact || !email || !password) {
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
            role: Role.USER,
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
            role: user?.role
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
