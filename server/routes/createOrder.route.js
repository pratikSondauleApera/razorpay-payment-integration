const express = require('express')
const { createOrder, validateOrder } = require('../controller/createOrder.controller')

const router = express.Router()

router.post('/order', createOrder)
router.post('/order/validate', validateOrder)

module.exports = router