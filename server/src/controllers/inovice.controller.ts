import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

const prisma = new PrismaClient()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export const createInvoice: RequestHandler = async (req, res) => {

    const { userId } = req.params
    const { productId } = req.params

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    const product = await prisma.product.findUnique({
        where: {
            id: productId
        }
    })

    if (!user) {
        return res.status(404).json({ msg: "User not found" })
    }

    if (!product) {
        return res.status(404).json({ msg: "Product not found" })
    }
    try {
        const invoice = await razorpay.invoices.create({
            type: 'invoice',
            customer: {
                name: user.name,
                email: user.email,
                contact: user.contact,
                billing_address: {
                    line1: user.addressLine1,
                    line2: user.addressLine2,
                    zipcode: user.pincode,
                    city: user.city,
                    state: user.state,
                    country: 'in'
                },
                shipping_address: {
                    line1: user.addressLine1,
                    line2: user.addressLine2,
                    zipcode: user.pincode,
                    city: user.city,
                    state: user.state,
                    country: 'in'
                }
            },
            line_items: [
                {
                    name: product.name,
                    description: product.description,
                    amount: product.amount * 100,
                    currency: 'INR',
                    quantity: 1
                }
            ]
        })

        if (!invoice) {
            return res.status(400).json({ msg: "Error in creating invoice", invoice })
        }

        return res.status(201).json({ msg: "Created invoice successfully", invoice })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Something went wrong while creating invoice", error })
    }
}