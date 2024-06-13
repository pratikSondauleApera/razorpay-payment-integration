import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const addProduct: RequestHandler = async (req, res) => {
    const name = (req.body as { name: string }).name
    const description = (req.body as { description: string }).description
    const amount = (req.body as { amount: number }).amount

    if (!name || !description || !amount) {
        return res.status(400).json({ error: "Please fill the required details" })
    }

    try {
        const productData = {
            name,
            description,
            amount
        }

        const addProduct = await prisma.product.create({
            data: productData
        })

        return res.status(201).json({ msg: "Product added successfully", addProduct })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Something went wrong while adding product", error })
    }
}