const express = require('express')
const { createOrder } = require('../controller/createOrder.controller')

const router = express.Router()

router.post('/order', createOrder)

module.exports = router