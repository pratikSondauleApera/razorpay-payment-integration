import { RequestHandler } from "express";
import Razorpay from "razorpay";
import crypto from 'crypto'

export const createOrder: RequestHandler = async (req, res) => {

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!
        })

        const amount = (req.body as { amount: number }).amount
        const currency = (req.body as { currency: string }).currency
        const receipt = (req.body as { receipt: string }).receipt

        if (!amount || !currency || !receipt) {
            return res.status(400).send({ error: "Missing required fields: amount, currency, and receipt" });
        }

        const options = {
            amount,
            currency,
            receipt
        };

        console.log("Order Options", options)

        const order = await razorpay.orders.create(options)

        if (!order) {
            return res.status(500).send({ err: "Something went wrong" })
        }

        return res.status(200).send(order)
    } catch (err) {
        console.log(err)
        res.send("Error in creating order")
    }
}

export const validateOrder: RequestHandler = (req, res) => {

    try {
        const razorpay_order_id = (req.body as { razorpay_order_id: string }).razorpay_order_id
        const razorpay_payment_id = (req.body as { razorpay_payment_id: string }).razorpay_payment_id
        const razorpay_signature = (req.body as { razorpay_signature: string }).razorpay_signature

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ msg: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature" });
        }

        const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");

        if (digest !== razorpay_signature) {
            return res.status(400).json({ msg: "Transaction is not legit!" });
        }

        return res.json({
            msg: "success",
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });
    } catch (err) {
        console.error("Error validating order: ", err);
        return res.send("Error in validating order");
    }
}