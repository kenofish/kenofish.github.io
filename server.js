require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Printful Configuration
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;
const PRINTFUL_API_URL = 'https://api.printful.com';

// Create Order Endpoint
app.post('/api/orders', async (req, res) => {
  try {
    // Validate input
    const { items, customerInfo } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    // Prepare Printful order
    const printfulOrder = {
      recipient: {
        name: customerInfo.name,
        email: customerInfo.email,
        address1: customerInfo.address,
        city: customerInfo.city,
        country_code: customerInfo.country || 'US',
        zip: customerInfo.zip
      },
      items: items.map(item => ({
        sync_variant_id: item.id, // Your Printful variant ID
        quantity: item.quantity,
        retail_price: item.price
      }))
    };

    // Create order in Printful
    const response = await axios.post(
      `${PRINTFUL_API_URL}/orders`,
      printfulOrder,
      {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`
        }
      }
    );

    // Return checkout URL
    res.json({
      success: true,
      checkout_url: response.data.result.exported_order.external_id ?
        `https://www.printful.com/checkout/${response.data.result.exported_order.external_id}` :
        'https://your-store.com/order-confirmation'
    });

  } catch (error) {
    console.error('Printful API error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.result?.message || 'Order processing failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
