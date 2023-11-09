const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const stripe = require('stripe')('sk_test_51M5vv4CLTcmkmHRYZkWtQyNXEjCP43tttOJZXjfQz5PoCOpXZK6cuZOtKR91YWnidNeWZasoQVI9DUxdmkg5nliB00Nh97yLKB'); // here is my test SK , modify this with your own SK.
const requestIp = require('request-ip');
const axios = require('axios');
app.use(requestIp.mw());


const port = process.env.PORT || 4242;

//middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        message: `Server is running`
    })
})

app.post('/create-subscription', async (req, res) => {
    const { userName, userEmail, unitPrice, interval, productName } = req.body;
    console.log(typeof (unitPrice))

    try {
        // Step 1: Create a customer
        const customer = await stripe.customers.create({
            email: userEmail,
        });

        // Step 2: Create a product and a price
        const product = await stripe.products.create({
            name: productName,
            type: 'service', // You can adjust this based on your product type
        });

        const priceData = {
            product: product.id,
            unit_amount: Math.floor(unitPrice * 1000) / 1000 * 100, // Price in cents (multiply by 100)
            currency: 'usd', // You can adjust the currency
        };

        if (interval) {
            priceData.recurring = { interval: interval };
        }

        // Define the 'price' variable before using it
        const price = await stripe.prices.create(priceData);

        // Step 3: Create a checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            meta_data: [

            ],
            mode: 'subscription',
            success_url: 'https://your-success-url.com',
            cancel_url: 'https://your-cancel-url.com',
        });

        res.json({ checkoutUrl: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});




app.listen(port, () => {
    console.log(`Server is running at ${port}`); // server will run at http://localhost:4242s
})
