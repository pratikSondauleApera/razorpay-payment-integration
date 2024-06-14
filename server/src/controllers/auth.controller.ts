import { RequestHandler } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Razorpay from "razorpay";

const prisma = new PrismaClient()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

const createRazorpayCustomer = async (userId: string, customerId: string) => {
    try {
        const customerData = {
            userId,
            customerId
        }

        const razorpayCustomer = await prisma.razorpayCustomer.create({
            data: customerData
        })

        return {
            statusCode: 201,
            data: razorpayCustomer,
            msg: 'Created customer successfully',
        };
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            msg: "Something went wrong while creatin customer"
        }
    }
}

const createRazorpayCustomerIdentifiers = async (customerIdentifierId: string, description: string | undefined, userId: string) => {
    try {
        const customerIdentifierData = {
            customerIdentifierId,
            description,
            userId
        }

        const razorpayCustomerIdentifier = await prisma.razorpayCustomerIdentifier.create({
            data: customerIdentifierData
        })

        return {
            statusCode: 201,
            data: razorpayCustomerIdentifier,
            msg: 'Created customer identifier successfully',
        };
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            msg: "Something went wrong while creatin customer identifier"
        }
    }
}

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
            role: Role.USER,
            password: hashedPassword
        }

        const registerUser = await prisma.user.create({
            data: userData
        })

        if (registerUser) {

            const customer = await razorpay.customers.create({
                name: registerUser.name,
                contact: registerUser.contact,
                email: registerUser.email,
                fail_existing: 0
            })

            await createRazorpayCustomer(
                registerUser.id,
                customer.id
            )

            return res.status(201).json({ msg: "User registered successfully", registerUser })
        }
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong while registering a user", error })
    }
}

export const signUpAsVendor: RequestHandler = async (req, res) => {
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
    const accountNumber = (req.body as { accountNumber: string }).accountNumber
    const ifscCode = (req.body as { ifscCode: string }).ifscCode


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
            role: Role.VENDOR,
            password: hashedPassword
        }

        const registerUser = await prisma.user.create({
            data: userData
        })

        if (registerUser) {

            const vendorData = {
                accountNumber,
                ifscCode,
                userId: registerUser.id
            }

            await prisma.vendor.create({
                data: vendorData
            })

            const customer = await razorpay.customers.create({
                name: registerUser.name,
                contact: registerUser.contact,
                email: registerUser.email,
                fail_existing: 0
            })

            await createRazorpayCustomer(
                registerUser.id,
                customer.id
            )

            const virtualAccount = await razorpay.virtualAccounts.create({
                receivers: {
                    types: [
                        "bank_account"
                    ]
                },
                customer_id: customer.id
            })

            await createRazorpayCustomerIdentifiers(
                virtualAccount.id,
                virtualAccount.description,
                registerUser.id,
            )

            return res.status(201).json({ msg: "Vendor registered successfully", registerUser })
        }
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong while registering a vendor", error })
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