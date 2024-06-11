import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.route'
import orderRouter from './routes/order.route'
import cors from 'cors'

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(cors())
app.use('/auth', authRouter)
app.use('/razorpay', orderRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})