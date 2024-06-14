import React from 'react'
import axios from 'axios'

const Product = () => {

    const paymentHandler = async (e) => {
        const amount = 200;
        const currency = "INR";

        try {
            const res = await axios.post("http://localhost:8000/razorpay/order", {
                amount: amount * 100,
                currency,
                receipt: 'demo_rc2'
            })

            if (res.status !== 200) {
                throw new Error('Failed to create order');
            }

            const order = res.data;
            console.log("Order ID ", order.id);

            var options = {
                key: "rzp_test_L0FN8ZLbARV0LP", // Enter the Key ID generated from the Dashboard
                amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 500 refers to 500 paise
                currency,
                name: "GKC Klinika",
                description: "Test transaction",
                image: "https://gkcklinica.com/_next/image?url=%2Flogo.png&w=256&q=75",
                order_id: order.id, // This is the correct way to get the order ID
                handler: async function (response) {
                    const body = {
                        ...response,
                    }

                    console.log("Response ", response)

                    const validateRes = await axios.post("http://localhost:8000/razorpay/order/validate", body)

                    const jsonRes = validateRes.data;
                    console.log(jsonRes);
                },
                prefill: {
                    name: "Pratik Sondaule",
                    email: "pratiksondaule@gmail.com",
                    contact: "9075180804"
                },
                notes: {
                    address: "Razorpay Corporate Office"
                },
                theme: {
                    "color": "#28282B"
                },
            };

            console.log("Payment Id", options.handler)

            var rzp = new Razorpay(options);
            rzp.on("payment.failed", function (response) {
                alert(response.error.code);
                alert(response.error.description);
                alert(response.error.source);
                alert(response.error.step);
                alert(response.error.reason);
                alert(response.error.metadata.order_id);
                alert(response.error.metadata.payment_id);
            })
            rzp.open();
            e.preventDefault()
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <>
            <div className="product">
                <h2>Tshirt</h2>
                <p>RRR Logo Minimal Yellow T-Shirt</p>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmnnpKa22QptBH7zIply9wnKXsWNRQShCGZPriLKpTOJoXNTbNYWrWbmR7S3kggMg71Vs&usqp=CAU" />
                <br />
                <strong>Rs 200</strong>
                <button onClick={paymentHandler}>Pay</button>
            </div>
        </>
    )
}

export default Product