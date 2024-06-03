const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const createOrder = require('./routes/createOrder.route')

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use('/razorpay', createOrder)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})