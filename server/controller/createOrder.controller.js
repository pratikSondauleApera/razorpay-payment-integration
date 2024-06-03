const Razorpay = require('razorpay')
const crypto = require("crypto")

const createOrder = async (req, res) => {

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const options = req.body

        if (!options.amount || !options.currency || !options.receipt) {
            return res.status(400).send({ error: "Missing required fields: amount, currency, and receipt" });
        }

        console.log("Options ", options)

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

const validateOrder = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    //order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
        return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    res.json({
        msg: "success",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    });
}

module.exports = {
    createOrder,
    validateOrder
}